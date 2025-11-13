import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createOrderSchema } from "@/lib/validation/schemas";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type { CreateOrderRequest, CreateOrderResponse, ApiError } from "@/types/api";

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

/**
 * 注文を作成し、購入したアカウント情報を保存
 * POST /api/orders
 *
 * トランザクション処理により、データの整合性を保証します
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== Order Creation Started ===");

    // ============================================
    // 1. 認証チェック
    // ============================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json<ApiError>(
        { success: false, message: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json<ApiError>(
        { success: false, message: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 },
      );
    }

    console.log("User authenticated:", user.id);

    // ============================================
    // 2. リクエストボディの検証
    // ============================================
    const body: CreateOrderRequest = await request.json();

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => `${err.path.join(".")}: ${err.message}`);
      return NextResponse.json<ApiError>(
        {
          success: false,
          message: ERROR_MESSAGES.INVALID_INPUT,
          error: errors.join(", "),
        },
        { status: 400 },
      );
    }

    const { items, totalAmount } = validation.data;

    // ============================================
    // 3. ストアドプロシージャを使用してトランザクション処理
    // ============================================
    const itemsJson = items.map((item) => ({
      itemId: item.itemId,
      itemTitle: item.itemTitle,
      price: item.price,
      quantity: item.quantity,
    }));

    const { data: result, error: rpcError } = await supabaseAdmin.rpc("create_order_transaction", {
      p_user_id: user.id,
      p_items: itemsJson,
      p_total_amount: totalAmount,
    });

    if (rpcError) {
      console.error("Transaction error:", rpcError);

      // エラーメッセージから具体的な問題を判定
      if (rpcError.message.includes("残高が不足")) {
        return NextResponse.json<ApiError>(
          { success: false, message: ERROR_MESSAGES.INSUFFICIENT_BALANCE },
          { status: 400 },
        );
      }

      if (rpcError.message.includes("在庫不足")) {
        return NextResponse.json<ApiError>(
          { success: false, message: rpcError.message },
          { status: 400 },
        );
      }

      return NextResponse.json<ApiError>(
        { success: false, message: ERROR_MESSAGES.SERVER_ERROR, error: rpcError.message },
        { status: 500 },
      );
    }

    console.log("=== Order Creation Completed Successfully ===");

    return NextResponse.json<CreateOrderResponse>({
      success: true,
      orderId: result.orderId,
      purchasedItems: result.purchasedItems,
      message: SUCCESS_MESSAGES.ORDER_CREATED,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    console.error("=== Order Creation Error ===", message);
    return NextResponse.json<ApiError>(
      { success: false, message: ERROR_MESSAGES.SERVER_ERROR, error: message },
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
 *
 * ページネーションに対応しています
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. 認証チェック
    // ============================================
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json<ApiError>(
        { success: false, message: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json<ApiError>(
        { success: false, message: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 },
      );
    }

    // ============================================
    // 2. ページネーションパラメータの取得
    // ============================================
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // ============================================
    // 3. 注文履歴を取得（注文アイテムと購入アカウント情報を含む）
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      console.error("Failed to fetch orders:", ordersError);
      return NextResponse.json<ApiError>(
        { success: false, message: ERROR_MESSAGES.DATABASE_ERROR },
        { status: 500 },
      );
    }

    // ============================================
    // 4. 商品情報を取得してマージ
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
      totalAmount: order.total,
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
    return NextResponse.json<ApiError>(
      { success: false, message: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 },
    );
  }
}
