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

// ユーザーの残高を取得
export async function GET(request: NextRequest) {
  try {
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "認証が必要です", balance: 0 }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // トークンからユーザー情報を取得
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "認証に失敗しました", balance: 0 }, { status: 401 });
    }
    const user = userData.user;

    // profilesテーブルから残高を取得
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", user.id)
      .single();

    // プロフィールが見つからなかった場合 (PGRST116)
    if (error && error.code === "PGRST116") {
      console.log("Profile not found for user, creating one...");
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({ id: user.id, email: user.email })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to create profile after not finding one:", insertError);
        return NextResponse.json(
          { error: "プロファイルの新規作成に失敗しました。", balance: 0 },
          { status: 500 },
        );
      }

      // 新しく作成したプロフィールの残高（デフォルトで0）を返す
      return NextResponse.json({
        balance: newProfile?.credit_balance || 0,
        userId: user.id,
      });
    }

    // その他のデータベースエラー
    if (error) {
      console.error("Balance fetch error (non-PGRST116):", error);
      return NextResponse.json(
        { error: "残高の取得中にデータベースエラーが発生しました。", balance: 0 },
        { status: 500 },
      );
    }

    return NextResponse.json({
      balance: data?.credit_balance || 0,
      userId: user.id,
    });
  } catch (error) {
    console.error("Balance API error:", error);
    return NextResponse.json({ error: "サーバーエラー", balance: 0 }, { status: 500 });
  }
}
