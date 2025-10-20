import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

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
 * GET /api/site-control-a4b7/orders
 * Fetches all orders for the admin dashboard.
 */
export async function GET(request: NextRequest) {
  // 1. Admin authentication
  const admin = await verifyAdminSession(request.cookies.get("admin-session")?.value);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch all orders with related user profiles, order items, and purchased accounts
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        total,
        status,
        created_at,
        user:profiles!user_id (id, email, full_name, avatar_url),
        order_items (id, item_id, quantity, price),
        purchased_accounts (id, item_id, account_info)
      `,
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Admin fetch orders error:", ordersError);
      return NextResponse.json({ error: "注文履歴の取得に失敗しました" }, { status: 500 });
    }

    // 3. Fetch related item details
    const itemIds = Array.from(
      new Set(orders.flatMap((o) => o.order_items.map((oi) => oi.item_id))),
    );
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("items")
      .select("id, title, image_url")
      .in("id", itemIds);

    if (itemsError) {
      console.error("Admin fetch items error:", itemsError);
      // Continue without item details if this fails, but log the error
    }

    const itemsMap = new Map(items?.map((item) => [item.id, item]) || []);

    // 4. Format the response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      totalAmount: order.total,
      status: order.status,
      createdAt: order.created_at,
      user: order.user || { id: "unknown", email: "不明なユーザー" },
      items: order.order_items.map((orderItem) => {
        const item = itemsMap.get(orderItem.item_id);
        const accounts = order.purchased_accounts
          .filter((acc) => acc.item_id === orderItem.item_id)
          .map((acc) => acc.account_info);

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

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
