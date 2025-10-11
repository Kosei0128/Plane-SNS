import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/auth/admin-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 認証チェック
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return isValidAdminSession(token);
}

// ユーザー一覧取得
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { success: false, message: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    // Supabaseからユーザー一覧を取得
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Failed to fetch users:", usersError);
      return NextResponse.json(
        { success: false, message: "ユーザーの取得に失敗しました" },
        { status: 500 }
      );
    }

    // 各ユーザーのプロファイル(残高含む)を取得
    const userIds = users.users.map(u => u.id);
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, credit_balance")
      .in("id", userIds);

    if (profileError) {
      console.error("Failed to fetch profiles:", profileError);
    }

    // 残高マップを作成
    const balanceMap = new Map(
      profiles?.map(p => [p.id, p.credit_balance]) || []
    );

    // ユーザー情報と残高をマージ
    const usersWithBalance = users.users.map(user => ({
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown",
      balance: balanceMap.get(user.id) || 0,
      createdAt: user.created_at
    }));

    return NextResponse.json({
      success: true,
      users: usersWithBalance
    });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラー" },
      { status: 500 }
    );
  }
}

// 残高更新
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { success: false, message: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    const { userId, balance } = await request.json();

    console.log("Received balance update request:", { userId, balance });

    if (!userId || balance === undefined) {
      return NextResponse.json(
        { success: false, message: "userIdとbalanceが必要です" },
        { status: 400 }
      );
    }

    // profilesテーブルの残高を更新
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ credit_balance: Number(balance) })
      .eq("id", userId)
      .select();

    console.log("Update result:", { updateData, updateError });

    if (updateError) {
      console.error("Failed to update balance:", updateError);
      return NextResponse.json(
        { success: false, message: `残高の更新に失敗しました: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 更新された行がない場合
    if (!updateData || updateData.length === 0) {
      console.warn("No profile found for user:", userId);
      // プロファイルが存在しない場合は作成を試みる
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          credit_balance: Number(balance),
          email: ""
        })
        .select();

      console.log("Insert result:", { insertData, insertError });

      if (insertError) {
        return NextResponse.json(
          { success: false, message: `プロファイルの作成に失敗しました: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    // charge_historyテーブルに履歴を記録
    const { error: historyError } = await supabaseAdmin
      .from("charge_history")
      .insert({
        user_id: userId,
        amount: Number(balance),
        status: "completed",
        payment_method: "admin_adjust"
      });

    if (historyError) {
      console.error("Failed to record history:", historyError);
    }

    return NextResponse.json({
      success: true,
      message: "残高を更新しました"
    });
  } catch (error) {
    console.error("Balance update error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラー" },
      { status: 500 }
    );
  }
}
