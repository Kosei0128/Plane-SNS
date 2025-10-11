import { NextRequest, NextResponse } from "next/server";
import { getPayPayClient } from "@/lib/paypay";

export type ChargeRequest = {
  amount: number;
  paymentUrl: string;
  passcode?: string;
  userId?: string;
};

// Define specific types for the response payload
interface ResponseLinkInfo {
  amount: number;
  orderId: string;
  chatRoomId: string;
}

interface ResponseBalanceInfo {
  credit_balance: number;
  paypay_balance: number;
}

export type ChargeResponse = {
  success: boolean;
  transactionId?: string;
  linkInfo?: ResponseLinkInfo;
  balance?: ResponseBalanceInfo;
  message?: string;
};

/**
 * PayPayチャージAPIエンドポイント
 * PayPaython-mobileを使用して送金リンクを検証・受け取る
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChargeRequest = await request.json();
    const { amount, paymentUrl, passcode } = body;

    // ============================================
    // 1. バリデーション
    // ============================================
    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, message: "チャージ金額は1円以上を指定してください" },
        { status: 400 }
      );
    }

    if (!paymentUrl || !paymentUrl.trim()) {
      return NextResponse.json(
        { success: false, message: "決済リンクを入力してください" },
        { status: 400 }
      );
    }

    // PayPay URLの形式チェック
    const isValidPayPayUrl = 
      paymentUrl.includes("pay.paypay.ne.jp") || 
      paymentUrl.includes("paypay.ne.jp") ||
      paymentUrl.includes("qr.paypay.ne.jp");

    if (!isValidPayPayUrl) {
      return NextResponse.json(
        { 
          success: false, 
          message: "有効なPayPayリンクを入力してください（pay.paypay.ne.jp または qr.paypay.ne.jp）" 
        },
        { status: 400 }
      );
    }

    // ============================================
    // 2. PayPayクライアントの初期化
    // ============================================
    const paypayClient = getPayPayClient();

    // ============================================
    // 3. 送金リンクの確認
    // ============================================
    console.log("Checking PayPay link:", paymentUrl);
    
    let linkInfo;
    try {
      linkInfo = await paypayClient.checkLink(paymentUrl);
      console.log("Link info:", linkInfo);
    } catch (error: unknown) {
      console.error("Link check error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { 
          success: false, 
          message: `送金リンクの確認に失敗しました: ${message}` 
        },
        { status: 400 }
      );
    }

    // ============================================
    // 4. リンク情報の検証
    // ============================================
    
    // ステータスチェック
    if (linkInfo.status !== "PENDING") {
      return NextResponse.json(
        { 
          success: false, 
          message: `このリンクは既に処理済みです（ステータス: ${linkInfo.status}）` 
        },
        { status: 400 }
      );
    }

    // 金額チェック
    if (linkInfo.amount !== amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `リンクの金額（¥${linkInfo.amount}）が指定された金額（¥${amount}）と一致しません` 
        },
        { status: 400 }
      );
    }

    // パスコードチェック
    if (linkInfo.has_password && !passcode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "このリンクにはパスコードが必要です" 
        },
        { status: 400 }
      );
    }

    // ============================================
    // 5. 送金リンクの受け取り
    // ============================================
    console.log("Receiving PayPay link:", paymentUrl);
    
    let receiveResult;
    try {
      receiveResult = await paypayClient.receiveLink(paymentUrl, passcode);
      console.log("Receive result:", receiveResult);
    } catch (error: unknown) {
      console.error("Link receive error:", error);
      const message = error instanceof Error ? error.message : String(error);
      
      // パスコードエラーの場合
      if (message.includes("password") || message.includes("パスコード")) {
        return NextResponse.json(
          { 
            success: false, 
            message: "パスコードが正しくありません" 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: `送金リンクの受け取りに失敗しました: ${message}` 
        },
        { status: 500 }
      );
    }

    // ============================================
    // 6. データベースに記録してユーザー残高を更新
    // ============================================
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    // Supabaseクライアントを取得
    const { createClient } = await import("@supabase/supabase-js");
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

    // 認証ヘッダーからユーザーを取得
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabaseUser.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ログインが必要です" },
        { status: 401 }
      );
    }

    // ユーザーの現在の残高を取得
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credit_balance")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Failed to fetch user profile:", profileError);
      return NextResponse.json(
        { success: false, message: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    // 新しい残高を計算
    const newBalance = (profile.credit_balance || 0) + amount;

    // トランザクション: 残高更新 + チャージ履歴記録
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ credit_balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update balance:", updateError);
      return NextResponse.json(
        { success: false, message: "残高の更新に失敗しました" },
        { status: 500 }
      );
    }

    // チャージ履歴を記録
    const { error: historyError } = await supabaseAdmin
      .from("charge_history")
      .insert({
        user_id: userId,
        amount: amount,
        transaction_id: transactionId,
        status: "completed",
        payment_url: paymentUrl,
        completed_at: new Date().toISOString()
      });

    if (historyError) {
      console.error("Failed to record charge history:", historyError);
      // 履歴記録は失敗しても残高更新は成功しているのでエラーにはしない
    }
    
    console.log("Transaction completed:", {
      transactionId,
      userId,
      amount,
      oldBalance: profile.credit_balance,
      newBalance,
      paymentUrl,
      orderId: linkInfo.order_id,
      timestamp: new Date().toISOString()
    });

    // ============================================
    // 7. 成功レスポンス
    // ============================================
    return NextResponse.json({
      success: true,
      transactionId,
      linkInfo: {
        amount: linkInfo.amount,
        orderId: linkInfo.order_id,
        chatRoomId: linkInfo.chat_room_id
      },
      balance: {
        credit_balance: newBalance,
        paypay_balance: receiveResult.balance
      },
      message: `¥${amount.toLocaleString()}のチャージが完了しました！\n\nサイト残高: ¥${newBalance.toLocaleString()}`
    });

  } catch (error: unknown) {
    console.error("Charge API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    
    // PayPayLoginErrorの場合
    if (message.includes("PayPayLoginError") || message.includes("S0001")) {
      return NextResponse.json(
        { 
          success: false, 
          message: "PayPay認証エラーが発生しました。管理者に連絡してください。" 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: `サーバーエラーが発生しました: ${message}` 
      },
      { status: 500 }
    );
  }
}
