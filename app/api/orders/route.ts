import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export type OrderItem = {
  itemId: string;
  itemTitle: string;
  price: number;
  quantity: number;
  accountInfo: string; // 購入したアカウント情報
};

export type CreateOrderRequest = {
  items: OrderItem[];
  totalAmount: number;
};

/**
 * 注文を作成し、購入したアカウント情報を保存
 * POST /api/orders
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== Order Creation Started ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
    }

    console.log("User authenticated:", user.id);

    const body: CreateOrderRequest = await request.json();
    const { items, totalAmount } = body;

    if (!items || items.length === 0 || !totalAmount || totalAmount < 0) {
      return NextResponse.json({ success: false, message: "注文内容が不正です" }, { status: 400 });
    }

    // 在庫チェックと確保
    const reservedAccounts: {
      item: OrderItem;
      accounts: { id: string; account_info: string }[];
    }[] = [];
    for (const item of items) {
      const { data: availableAccounts, error: stockError } = await supabaseAdmin
        .from("purchased_accounts")
        .select("id, account_info")
        .eq("item_id", item.itemId)
        .eq("is_purchased", false)
        .limit(item.quantity);

      if (stockError || availableAccounts.length < item.quantity) {
        return NextResponse.json(
          { success: false, message: `在庫不足です: ${item.itemTitle}` },
          { status: 400 },
        );
      }
      reservedAccounts.push({ item, accounts: availableAccounts });
    }

    // ユーザー残高チェック
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || (profile.credit_balance || 0) < totalAmount) {
      return NextResponse.json(
        { success: false, message: "残高が不足しています" },
        { status: 400 },
      );
    }

    // トランザクション的な処理を開始
    // 1. 注文を作成
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({ user_id: user.id, total: totalAmount, status: "completed" })
      .select()
      .single();

    if (orderError) {
      throw new Error(`注文の作成に失敗しました: ${orderError.message}`);
    }

    // 2. 注文アイテムの作成と在庫の更新
    const updatePromises = reservedAccounts.flatMap(({ item, accounts }) => {
      const orderItemPromise = supabaseAdmin.from("order_items").insert({
        order_id: order.id,
        item_id: item.itemId,
        quantity: item.quantity,
        price: item.price,
      });

      const accountUpdatePromise = supabaseAdmin
        .from("purchased_accounts")
        .update({ is_purchased: true, order_id: order.id, purchased_at: new Date().toISOString() })
        .in(
          "id",
          accounts.map((acc) => acc.id),
        );

      return [orderItemPromise, accountUpdatePromise];
    });

    const results = await Promise.all(updatePromises);
    const failedUpdates = results.filter((res) => res.error);
    if (failedUpdates.length > 0) {
      // 本来はここでロールバック処理が必要
      console.error("Failed to update order items or accounts:", failedUpdates);
      return NextResponse.json(
        { success: false, message: "注文処理中にエラーが発生しました。" },
        { status: 500 },
      );
    }

    // 3. ユーザー残高を更新 & 取引履歴を記録
    const balanceBefore = profile.credit_balance;
    const newBalance = balanceBefore - totalAmount;

    const { error: balanceError } = await supabaseAdmin
      .from("profiles")
      .update({ credit_balance: newBalance })
      .eq("id", user.id);

    if (balanceError) {
      // 本来はここでロールバック処理が必要
      console.error("Failed to update user balance:", balanceError);
    } else {
      // 残高更新が成功した場合のみ取引履歴を記録
      const { error: transactionError } = await supabaseAdmin.from("balance_transactions").insert({
        user_id: user.id,
        amount: -totalAmount,
        type: "purchase",
        order_id: order.id,
        balance_before: balanceBefore,
        balance_after: newBalance,
      });

      if (transactionError) {
        // こちらもロールバックが必要なシナリオ
        console.error("Failed to record balance transaction:", transactionError);
      }
    }

    const purchasedItems = reservedAccounts.flatMap(({ item, accounts }) =>
      accounts.map((acc) => ({
        itemTitle: item.itemTitle,
        accountInfo: acc.account_info,
      })),
    );

    console.log("=== Order Creation Completed Successfully ===");
    return NextResponse.json({
      success: true,
      orderId: order.id,
      purchasedItems: purchasedItems,
      message: "注文が完了しました",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("=== Order Creation Error ===", message);
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${message}` },
      { status: 500 },
    );
  }
}

interface OrderItemFromDB {
  id: string;
  item_id: string;
  quantity: number;
  price: number;
}

interface PurchasedAccountFromDB {
  id: string;
  item_id: string;
  account_info: string;
}

/**
 * ユーザーの注文履歴を取得
 * GET /api/orders
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // トークンからユーザー情報を取得
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
    }

    // ============================================
    // 注文履歴を取得（注文アイテムと購入アカウント情報を含む）
    // ============================================
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          item_id,
          quantity,
          price
        ),
        purchased_accounts (
          id,
          item_id,
          account_info
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Failed to fetch orders:", ordersError);
      return NextResponse.json(
        { success: false, message: "注文履歴の取得に失敗しました" },
        { status: 500 },
      );
    }

    // ============================================
    // 商品情報を取得してマージ
    // ============================================
    const itemIds = Array.from(
      new Set(
        orders.flatMap((order) => order.order_items.map((item: OrderItemFromDB) => item.item_id)),
      ),
    );

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("items")
      .select("id, title, image_url")
      .in("id", itemIds);

    if (itemsError) {
      console.error("Failed to fetch items:", itemsError);
    }

    // アイテム情報のマップを作成
    const itemsMap = new Map(items?.map((item) => [item.id, item]) || []);

    // 注文データを整形
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      totalAmount: order.total, // カラム名は 'total' (total_amount ではない)
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items.map((orderItem: OrderItemFromDB) => {
        const item = itemsMap.get(orderItem.item_id);
        const accounts = order.purchased_accounts
          .filter((acc: PurchasedAccountFromDB) => acc.item_id === orderItem.item_id)
          .map((acc: PurchasedAccountFromDB) => acc.account_info);

        return {
          id: orderItem.id,
          itemId: orderItem.item_id,
          title: item?.title || "不明な商品",
          imageUrl: item?.image_url || "",
          quantity: orderItem.quantity,
          price: orderItem.price,
          accounts: accounts,
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ success: false, message: "サーバーエラー" }, { status: 500 });
  }
}
