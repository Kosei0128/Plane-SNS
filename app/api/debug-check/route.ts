import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// このAPIは、環境変数の設定が正しいかを確認するためだけの一時的なデバッグ用です。
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. 環境変数が.env.localから読み込まれているかチェック
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        status: "【エラー】",
        message:
          "環境変数 `NEXT_PUBLIC_SUPABASE_URL` または `SUPABASE_SERVICE_ROLE_KEY` が見つかりません。.env.localファイルの内容を再確認してください。",
      },
      { status: 500 },
    );
  }

  // 2. キーの形式を簡易チェック
  if (!supabaseUrl.startsWith("http")) {
    return NextResponse.json(
      {
        status: "【エラー】",
        message:
          "`NEXT_PUBLIC_SUPABASE_URL` の形式がURLではありません。Supabaseダッシュボードからコピーし直してください。",
      },
      { status: 500 },
    );
  }
  if (serviceKey.length < 100) {
    return NextResponse.json(
      {
        status: "【エラー】",
        message:
          "`SUPABASE_SERVICE_ROLE_KEY` が非常に短いようです。Supabaseダッシュボードからコピーし直してください。",
      },
      { status: 500 },
    );
  }

  try {
    // 3. 他のAPIと全く同じ方法で、管理者用クライアントを初期化
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 4. 最も基本的な管理者操作（ユーザーリストの取得）を試みる
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });

    // 5. Supabaseからエラーが返された場合
    if (error) {
      return NextResponse.json(
        {
          status: "【エラー】",
          message:
            "Supabase管理者クライアントの初期化には成功しましたが、データベースへのアクセスに失敗しました。`SUPABASE_SERVICE_ROLE_KEY`が間違っている可能性が非常に高いです。",
          error_details: {
            message: error.message,
            status: error.status,
          },
        },
        { status: 500 },
      );
    }

    // 6. 全て成功した場合
    return NextResponse.json({
      status: "【成功】",
      message:
        "Supabase管理者クライアントは正常に動作しています。環境変数の設定は正しいです。もし他のAPIでエラーが続く場合、原因は他にあります。",
      user_count: data.users.length,
    });
  } catch (e: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json(
      {
        status: "【エラー】",
        message: "デバッグAPIの実行中に予期せぬクラッシュが発生しました。",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
