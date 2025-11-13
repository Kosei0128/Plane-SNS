import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

// Initialize Supabase Admin Client
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

export async function GET(request: NextRequest) {
  // 1. Check for admin authentication from HttpOnly cookie
  const token = request.cookies.get("admin-session")?.value;
  const admin = await verifyAdminSession(token);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // 2. Fetch all necessary data in parallel
    const [totalRevenueData, totalOrdersData, topItemsData, dailySalesData, totalUsersData, totalItemsData] = await Promise.all([
      supabaseAdmin.from("orders").select("total_amount"),
      supabaseAdmin.from("orders").select("id", { count: "exact" }),
      supabaseAdmin.rpc("get_top_selling_items", { limit_count: 5 }),
      supabaseAdmin.rpc("get_daily_sales", { days_count: 30 }),
      supabaseAdmin.from("profiles").select("id", { count: "exact" }),
      supabaseAdmin.from("items").select("id", { count: "exact" }),
    ]);

    // 3. Process the data
    const totalRevenue = totalRevenueData.data?.reduce((sum, order) => sum + order.total_amount, 0) ?? 0;
    const totalOrders = totalOrdersData.count ?? 0;
    const totalUsers = totalUsersData.count ?? 0;
    const totalItems = totalItemsData.count ?? 0;

    const topSellingItems = topItemsData.data ?? [];
    const dailySales = dailySalesData.data ?? [];

    // 4. Return the aggregated analytics data
    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalItems,
        topSellingItems,
        dailySales,
      },
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${errorMessage}` },
      { status: 500 },
    );
  }
}
