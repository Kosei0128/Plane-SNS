"use client";

import { useCartStore } from "@/lib/cart-store";
import { Trash2, ArrowLeft, ShoppingBag, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type PurchaseResult = {
  itemId: string;
  itemTitle: string;
  account: string;
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResults, setPurchaseResults] = useState<PurchaseResult[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async () => {
    console.log("=== Purchase Started ===");
    console.log("Cart items:", items);
    
    setIsPurchasing(true);
    setPurchaseError(null);
    
    try {
      // 認証チェック
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        setPurchaseError("ログインが必要です。ログインページにリダイレクトします。");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
        setIsPurchasing(false);
        return;
      }
      
      console.log("User authenticated:", session.user.id);

      // 各アイテムの在庫を消費してアカウント情報を取得
      const results: PurchaseResult[] = [];
      const failedItems: string[] = [];
      
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          try {
            const response = await fetch("/api/inventory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                itemId: item.id,
                action: "consume"
              })
            });

            const data = await response.json();

            if (!response.ok) {
              // 在庫切れの場合
              if (response.status === 400 && data.error?.includes("在庫切れ")) {
                failedItems.push(`${item.title} - 在庫不足（残り${i}個まで購入可能）`);
                break;
              }
              // その他のエラー
              throw new Error(data.error || "在庫の取得に失敗しました");
            }

            if (!data.item) {
              throw new Error("アカウント情報が取得できませんでした");
            }

            results.push({
              itemId: item.id,
              itemTitle: item.title,
              account: data.item
            });
          } catch (error: unknown) {
            console.error("Purchase error:", error);
            const message = error instanceof Error ? error.message : "不明なエラー";
            failedItems.push(`${item.title} - ${message}`);
            break;
          }
        }
      }

      // 一部でも失敗した場合
      if (failedItems.length > 0) {
        setPurchaseError(
          `以下の商品の購入に失敗しました:\n${failedItems.join("\n")}\n\n` +
          (results.length > 0 
            ? "購入に成功した商品は以下に表示されます。" 
            : "在庫を確認してもう一度お試しください。")
        );
        
        // 成功した分があれば表示
        if (results.length > 0) {
          setPurchaseResults(results);
          setShowSuccessModal(true);
          // 成功した分はカートから削除
          results.forEach(r => removeItem(r.itemId));
        } else {
          setIsPurchasing(false);
          return;
        }
      }

      // すべて成功した場合のみ注文をデータベースに保存
      if (results.length > 0 && failedItems.length === 0) {
        try {
          const orderItems = results.map((result) => ({
            itemId: result.itemId,
            itemTitle: result.itemTitle,
            price: items.find((i) => i.id === result.itemId)?.price || 0,
            quantity: 1,
            accountInfo: result.account
          }));

          const orderResponse = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              items: orderItems,
              totalAmount: total()
            })
          });

          const orderData = await orderResponse.json();

          if (!orderResponse.ok) {
            console.error("Failed to save order:", orderData.message);
            // 注文保存に失敗してもアカウント情報は表示する
          }
        } catch (orderError) {
          console.error("Order save error:", orderError);
          // 注文保存に失敗してもアカウント情報は表示する
        }

        // 購入成功
        setPurchaseResults(results);
        setShowSuccessModal(true);
        clear(); // カートをクリア
        
        // ヘッダーの残高を更新するためにイベントを発火
        window.dispatchEvent(new Event('balance-updated'));
      }
    } catch (error: unknown) {
      console.error("Unexpected purchase error:", error);
      const message = error instanceof Error ? error.message : "不明なエラー";
      setPurchaseError(
        `購入処理中に予期しないエラーが発生しました。\n` +
        `エラー詳細: ${message}\n\n` +
        `問題が解決しない場合は、サポートにお問い合わせください。`
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16">
        <ShoppingBag className="h-24 w-24 text-slate-300" />
        <h1 className="text-2xl font-bold text-brand-blue">カートが空です</h1>
        <p className="text-slate-600">まずはアイテムを探してみましょう</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue/90"
        >
          <ArrowLeft className="h-4 w-4" />
          ストアに戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-blue">カート</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-red-600 transition hover:text-red-700"
        >
          すべて削除
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={`https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop`}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-brand-blue">{item.title}</h3>
                  <p className="text-sm text-slate-600">単価: ¥{item.price.toLocaleString()}</p>
                </div>
                
                {/* 数量変更 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">数量:</span>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-brand-blue hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-brand-blue hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-brand-blue">
                    小計: ¥{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    aria-label={`${item.title}を削除`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-brand-blue">注文概要</h2>
            <div className="mb-4 space-y-2 border-b border-slate-200 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">小計</span>
                <span className="font-semibold">¥{total().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">手数料</span>
                <span className="font-semibold">¥0</span>
              </div>
            </div>
            <div className="mb-6 flex justify-between text-lg font-bold">
              <span>合計</span>
              <span className="text-brand-blue">¥{total().toLocaleString()}</span>
            </div>
            {purchaseError && (
              <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="font-bold text-red-700">購入エラー</span>
                </div>
                <p className="whitespace-pre-line text-sm text-red-700">
                  {purchaseError}
                </p>
              </div>
            )}
            
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="w-full rounded-full bg-brand-turquoise py-3 text-sm font-semibold text-white transition hover:bg-brand-turquoise/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPurchasing ? "購入処理中..." : "購入手続きへ"}
            </button>
            <Link
              href="/"
              className="mt-3 flex items-center justify-center gap-2 text-sm text-brand-blue transition hover:text-brand-blue/80"
            >
              <ArrowLeft className="h-4 w-4" />
              買い物を続ける
            </Link>
          </div>
        </aside>
      </div>

      {/* 購入成功モーダル */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue">購入完了</h2>
                  <p className="text-sm text-slate-600">ご購入ありがとうございます</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-full p-2 transition hover:bg-slate-100"
              >
                <X className="h-6 w-6 text-slate-600" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <div className="rounded-lg bg-green-50 p-4 text-sm">
                <p className="font-bold text-green-800">✅ ご購入ありがとうございます!</p>
                <p className="mt-1 text-green-700">
                  購入されたアカウント情報は以下に表示されています。
                </p>
              </div>
              
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">📋 重要: アカウント情報の保存</p>
                <p className="mt-1 text-xs">
                  以下のアカウント情報を必ず安全な場所に保管してください。
                  購入履歴は「注文履歴」ページからいつでも確認できます。
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {purchaseResults.map((result, index) => (
                <div
                  key={`${result.itemId}-${index}`}
                  className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-brand-blue">{result.itemTitle}</h3>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="break-all font-mono text-sm text-slate-800">
                      {result.account}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.account);
                      alert("コピーしました!");
                    }}
                    className="mt-2 text-xs text-brand-blue hover:underline"
                  >
                    📋 クリップボードにコピー
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  const allAccounts = purchaseResults.map((r, i) => `【${i + 1}】${r.itemTitle}\n${r.account}`).join("\n\n");
                  navigator.clipboard.writeText(allAccounts);
                  alert("すべてのアカウント情報をコピーしました!");
                }}
                className="w-full rounded-lg border-2 border-brand-blue py-3 font-semibold text-brand-blue transition hover:bg-brand-blue/5"
              >
                📋 すべてのアカウント情報をコピー
              </button>
              
              <div className="flex gap-3">
                <Link
                  href="/orders"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 rounded-lg border-2 border-slate-300 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  📦 注文履歴を見る
                </Link>
                <Link
                  href="/"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 rounded-lg bg-brand-blue py-3 text-center font-semibold text-white transition hover:bg-brand-blue/90"
                >
                  🏠 ホームに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
