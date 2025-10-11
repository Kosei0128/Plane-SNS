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

export async function POST(request: NextRequest) {
  try {
    const { itemId, action, accounts } = await request.json();

    if (!itemId || !action) {
      return NextResponse.json(
        { error: "itemId と action が必要です" },
        { status: 400 }
      );
    }

    // アクション: 在庫追加
    if (action === "add") {
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        return NextResponse.json(
          { error: "追加するアカウント情報が必要です" },
          { status: 400 }
        );
      }

      // アイテムが存在するか確認
      const { data: item, error: itemError } = await supabaseAdmin
        .from("items")
        .select("id, stock")
        .eq("id", itemId)
        .single();

      if (itemError || !item) {
        return NextResponse.json(
          { error: "商品が見つかりません" },
          { status: 404 }
        );
      }

      // purchased_accounts テーブルに一括追加
      const accountsToInsert = accounts.map(accountInfo => ({
        item_id: itemId,
        account_info: accountInfo,
        is_purchased: false
      }));

      const { error: insertError } = await supabaseAdmin
        .from("purchased_accounts")
        .insert(accountsToInsert);

      if (insertError) {
        console.error("Failed to insert accounts:", insertError);
        return NextResponse.json(
          { error: "アカウント情報の追加に失敗しました" },
          { status: 500 }
        );
      }

      // items テーブルの stock を更新
      const newStock = item.stock + accounts.length;
      const { error: updateError } = await supabaseAdmin
        .from("items")
        .update({ stock: newStock })
        .eq("id", itemId);

      if (updateError) {
        console.error("Failed to update stock:", updateError);
      }

      return NextResponse.json({
        success: true,
        stock: newStock,
        added: accounts.length,
        message: `${accounts.length}件のアカウントを追加しました`
      });
    }

    // アクション: 在庫消費（購入時）
    if (action === "consume") {
      // 未使用のアカウントを1件取得
      const { data: availableAccount, error: fetchError } = await supabaseAdmin
        .from("purchased_accounts")
        .select("id, account_info")
        .eq("item_id", itemId)
        .eq("is_purchased", false)
        .limit(1)
        .single();

      if (fetchError || !availableAccount) {
        console.log(`Out of stock: ${itemId}`);
        return NextResponse.json(
          { 
            error: "在庫切れです。現在この商品の在庫がありません。", 
            stock: 0,
            itemId 
          },
          { status: 400 }
        );
      }

      // アカウントを購入済みにマーク
      const { error: markError } = await supabaseAdmin
        .from("purchased_accounts")
        .update({ is_purchased: true })
        .eq("id", availableAccount.id);

      if (markError) {
        console.error(`Failed to mark account as purchased: ${itemId}`, markError);
        return NextResponse.json(
          { error: "在庫の更新に失敗しました" },
          { status: 500 }
        );
      }

      // items テーブルの stock を -1
      const { data: currentItem, error: itemFetchError } = await supabaseAdmin
        .from("items")
        .select("stock")
        .eq("id", itemId)
        .single();

      if (!itemFetchError && currentItem) {
        await supabaseAdmin
          .from("items")
          .update({ stock: Math.max(0, currentItem.stock - 1) })
          .eq("id", itemId);
      }

      // 残りの在庫数を取得
      const { count: remainingStock } = await supabaseAdmin
        .from("purchased_accounts")
        .select("*", { count: "exact", head: true })
        .eq("item_id", itemId)
        .eq("is_purchased", false);

      console.log(`Stock consumed: ${itemId}, remaining: ${remainingStock ?? 0}`);

      return NextResponse.json({
        success: true,
        item: availableAccount.account_info,
        stock: remainingStock ?? 0,
        itemId,
        message: "ご購入ありがとうございます"
      });
    }

    return NextResponse.json(
      { error: `不正なアクションです: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Inventory API error:", error);
    const message = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { 
        error: "在庫管理システムでエラーが発生しました。",
        details: message
      },
      { status: 500 }
    );
  }
}
