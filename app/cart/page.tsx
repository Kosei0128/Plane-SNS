"use client";

import { useCartStore } from "@/lib/cart-store";
import { Trash2, ArrowLeft, ShoppingBag, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

// This type should match the one in the success modal
type PurchaseResult = {
  itemTitle: string;
  account: string;
};

// Define the type for the items coming from the API response
interface PurchasedItem {
  itemTitle: string;
  accountInfo: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResults, setPurchaseResults] = useState<PurchaseResult[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setPurchaseError("ログインが必要です。ログインページにリダイレクトします。");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
        return;
      }

      const orderItems = items.map((item) => ({
        itemId: item.id,
        itemTitle: item.title,
        price: item.price,
        quantity: item.quantity,
        accountInfo: "",
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: total(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `購入処理に失敗しました。 (${response.status})`);
      }

      const data = await response.json();

      if (data.success && data.purchasedItems) {
        const results: PurchaseResult[] = data.purchasedItems.map((item: PurchasedItem) => ({
          itemTitle: item.itemTitle,
          account: item.accountInfo,
        }));

        setPurchaseResults(results);
        setShowSuccessModal(true);
        // DO NOT clear cart here. Clear it when the modal is closed.
        window.dispatchEvent(new Event("balance-updated"));
      }
    } catch (error: unknown) {
      console.error("Purchase error:", error);
      const message = error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setPurchaseError(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    clear(); // Clear the cart only after the modal is closed.
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16">
        <ShoppingBag className="h-24 w-24 text-slate-300 dark:text-slate-700" />
        <h1 className="text-2xl font-bold text-brand-blue dark:text-slate-200">カートが空です</h1>
        <p className="text-slate-600 dark:text-slate-400">まずはアイテムを探してみましょう</p>
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
        <h1 className="text-3xl font-bold text-brand-blue dark:text-slate-100">カート</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          すべて削除
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                <Image
                  src={
                    item.image_url ||
                    `https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop`
                  }
                  alt={item.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-brand-blue dark:text-slate-200">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    単価: ¥{item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    数量:
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-brand-blue hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center font-semibold dark:text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-brand-blue hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-brand-blue dark:text-slate-100">
                    小計: ¥{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
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
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
            <h2 className="mb-4 text-xl font-bold text-brand-blue dark:text-slate-200">注文概要</h2>
            <div className="mb-4 space-y-2 border-b border-slate-200 pb-4 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">小計</span>
                <span className="font-semibold dark:text-slate-200">
                  ¥{total().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">手数料</span>
                <span className="font-semibold dark:text-slate-200">¥0</span>
              </div>
            </div>
            <div className="mb-6 flex justify-between text-lg font-bold dark:text-slate-200">
              <span>合計</span>
              <span className="text-brand-blue dark:text-slate-100">
                ¥{total().toLocaleString()}
              </span>
            </div>
            {purchaseError && (
              <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-100 p-4 dark:border-red-500/50 dark:bg-red-500/20">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="font-bold text-red-700 dark:text-red-300">購入エラー</span>
                </div>
                <p className="whitespace-pre-line text-sm text-red-700 dark:text-red-300">
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
              className="mt-3 flex items-center justify-center gap-2 text-sm text-brand-blue transition hover:text-brand-blue/80 dark:text-slate-300 dark:hover:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
              買い物を続ける
            </Link>
          </div>
        </aside>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 dark:border dark:border-slate-700">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                  <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-slate-100">
                    購入完了
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ご購入ありがとうございます
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseSuccessModal}
                className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <div className="rounded-lg bg-green-50 p-4 text-sm dark:bg-green-500/20">
                <p className="font-bold text-green-800 dark:text-green-300">
                  ✅ ご購入ありがとうございます!
                </p>
                <p className="mt-1 text-green-700 dark:text-green-400">
                  購入されたアカウント情報は以下に表示されています。
                </p>
              </div>

              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/50 dark:bg-blue-500/20 dark:text-blue-300">
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
                  key={`${result.itemTitle}-${index}`}
                  className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-brand-blue dark:text-slate-200">
                      {result.itemTitle}
                    </h3>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-300">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="rounded-md bg-white p-3 dark:bg-slate-800">
                    <p className="break-all font-mono text-sm text-slate-800 dark:text-slate-200">
                      {result.account}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.account);
                      alert("コピーしました!");
                    }}
                    className="mt-2 text-xs text-brand-blue hover:underline dark:text-brand-turquoise dark:hover:text-sky-400"
                  >
                    📋 クリップボードにコピー
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  const allAccounts = purchaseResults
                    .map((r, i) => `【${i + 1}】${r.itemTitle}\n${r.account}`)
                    .join("\n\n");
                  navigator.clipboard.writeText(allAccounts);
                  alert("すべてのアカウント情報をコピーしました!");
                }}
                className="w-full rounded-lg border-2 border-brand-blue py-3 font-semibold text-brand-blue transition hover:bg-brand-blue/5 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                📋 すべてのアカウント情報をコピー
              </button>

              <div className="flex gap-3">
                <Link
                  href="/orders"
                  onClick={handleCloseSuccessModal}
                  className="flex-1 rounded-lg border-2 border-slate-300 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  📦 注文履歴を見る
                </Link>
                <Link
                  href="/"
                  onClick={handleCloseSuccessModal}
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
