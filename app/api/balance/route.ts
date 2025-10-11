import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin Client
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

// ユーザーの残高を取得
export async function GET(request: NextRequest) {
  try {
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "認証が必要です", balance: 0 },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です", balance: 0 },
        { status: 401 }
      );
    }

    // profilesテーブルから残高を取得
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Balance fetch error:", error);
      // プロファイルが存在しない場合は作成
      if (error.code === "PGRST116") {
        const { error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || "",
            credit_balance: 0
          });
        
        if (insertError) {
          console.error("Failed to create profile:", insertError);
        }
        
        return NextResponse.json({
          balance: 0,
          userId: user.id
        });
      }
      
      return NextResponse.json(
        { error: "残高の取得に失敗しました", balance: 0 },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: data?.credit_balance || 0,
      userId: user.id
    });
  } catch (error) {
    console.error("Balance API error:", error);
    return NextResponse.json(
      { error: "サーバーエラー", balance: 0 },
      { status: 500 }
    );
  }
}
