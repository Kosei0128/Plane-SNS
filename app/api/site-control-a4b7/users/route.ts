import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

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

// Async authentication check using JWT from cookie
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get("admin-session")?.value;
  if (!token) return null;
  return await verifyAdminSession(token);
}

// Get user list
export async function GET(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }

  try {
    // Fetch all users from Supabase Auth
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Failed to fetch users:", usersError);
      return NextResponse.json(
        { success: false, message: "ユーザーの取得に失敗しました" },
        { status: 500 },
      );
    }

    // Fetch profiles (including balance) for all users
    const userIds = users.users.map((u) => u.id);
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, credit_balance")
      .in("id", userIds);

    if (profileError) {
      console.error("Failed to fetch profiles:", profileError);
      return NextResponse.json(
        { success: false, message: "ユーザープロファイルの取得に失敗しました" },
        { status: 500 },
      );
    }

    const userMap = new Map(users.users.map((u) => [u.id, u]));

    const usersWithBalance = profiles
      .map((profile) => {
        const user = userMap.get(profile.id);
        if (!user) {
          return null;
        }
        return {
          id: user.id,
          email: user.email || "",
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Unknown",
          balance: profile.credit_balance || 0,
          createdAt: user.created_at,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      users: usersWithBalance,
    });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ success: false, message: "サーバーエラー" }, { status: 500 });
  }
}

// Update balance
export async function PUT(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }

  // Ensure only full admins can update balances
  if (admin.role !== "admin") {
    return NextResponse.json({ success: false, message: "権限がありません" }, { status: 403 });
  }

  try {
    const { userId, balance } = await request.json();

    if (!userId || balance === undefined) {
      return NextResponse.json(
        { success: false, message: "userIdとbalanceが必要です" },
        { status: 400 },
      );
    }

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ credit_balance: Number(balance) })
      .eq("id", userId)
      .select();

    if (updateError || !updateData || updateData.length === 0) {
      console.error("Failed to update balance:", updateError);
      return NextResponse.json(
        {
          success: false,
          message: `残高の更新に失敗しました。対象のユーザープロファイルが見つかりません。`,
        },
        { status: 500 },
      );
    }

    // Record the transaction in balance_transactions for audit purposes
    const { error: transactionError } = await supabaseAdmin.from("balance_transactions").insert({
      user_id: userId,
      amount: Number(balance) - (updateData[0].credit_balance || 0), // Calculate the difference
      type: "admin_adjustment",
      description: `Admin ${admin.username} updated balance.`,
      balance_before: updateData[0].credit_balance || 0,
      balance_after: Number(balance),
    });

    if (transactionError) {
      console.error("Failed to record balance transaction:", transactionError);
      // Don't fail the whole request, but log it
    }

    return NextResponse.json({
      success: true,
      message: "残高を更新しました",
    });
  } catch (error) {
    console.error("Balance update error:", error);
    return NextResponse.json({ success: false, message: "サーバーエラー" }, { status: 500 });
  }
}
