"use client";

import { Wallet, ArrowRight, CreditCard, Zap, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

const CHARGE_PRESETS = [1, 10, 50, 100]; // テスト用に1円から

export default function ChargePage() {
  const [amount, setAmount] = useState<number | "">(1); // デフォルト1円
  const [isProcessing, setIsProcessing] = useState(false);
  const [userCredit, setUserCredit] = useState(0);

  // モーダル関連のstate
  const [showModal, setShowModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [passcode, setPasscode] = useState("");

  // 残高を取得
  useEffect(() => {
    const fetchBalance = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const res = await fetch("/api/balance", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          
          if (!res.ok) {
            throw new Error(`Failed to fetch balance: ${res.status}`);
          }
          
          const data = await res.json();
          setUserCredit(data.balance || 0);
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    };
    fetchBalance();
  }, []);

  const handleOpenModal = () => {
    if (!amount || amount < 1) {
      alert("チャージ金額は1円以上を指定してください");
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPaymentUrl("");
    setPasscode("");
  };

  const handleSubmitPayment = async () => {
    if (!paymentUrl.trim()) {
      alert("決済リンクを入力してください");
      return;
    }

    // PayPayのURLかどうかを簡易チェック
    if (!paymentUrl.includes("pay.paypay.ne.jp") && !paymentUrl.includes("paypay")) {
      const confirmResult = confirm("PayPayのURLではない可能性があります。続行しますか？");
      if (!confirmResult) return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentUrl,
          passcode: passcode || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `チャージに失敗しました。 (${res.status})`);
      }

      const data = await res.json();

      if (data.success) {
        // 成功メッセージを表示
        alert(data.message || `¥${amount}のチャージが完了しました！`);
        handleCloseModal();
        setAmount(1); // 金額をリセット

        // 残高を再取得
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          try {
            const balanceRes = await fetch("/api/balance", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            
            if (!balanceRes.ok) {
              throw new Error(`Failed to fetch balance: ${balanceRes.status}`);
            }
            
            const balanceData = await balanceRes.json();
            setUserCredit(balanceData.balance || 0);

            // ヘッダーの残高表示も更新するためにイベント発火
            window.dispatchEvent(new Event("balance-updated"));
          } catch (error) {
            console.error("Failed to fetch balance:", error);
          }
        }
      } else {
        alert(data.message || "チャージに失敗しました");
      }
    } catch (error) {
      console.error("Charge error:", error);
      const errorMessage = error instanceof Error ? error.message : "ネットワークエラーが発生しました";
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-turquoise">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-brand-blue dark:text-slate-100">
          クレジットチャージ
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          PayPay経由でサイト内クレジットを購入できます
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            現在の残高
          </span>
          <span className="text-2xl font-bold text-brand-blue dark:text-slate-100">
            ¥{userCredit.toLocaleString()}
          </span>
        </div>

        <div className="mb-6">
          <label
            htmlFor="charge-amount"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            チャージ金額
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 dark:text-slate-500">
              ¥
            </span>
            <input
              id="charge-amount"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-lg font-semibold focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
              placeholder="1"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-3">
          {CHARGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`rounded-lg border py-2 text-sm font-semibold transition ${
                amount === preset
                  ? "border-brand-turquoise bg-brand-turquoise/10 text-brand-turquoise dark:bg-brand-turquoise/20 dark:text-brand-turquoise"
                  : "border-slate-300 text-slate-700 hover:border-brand-turquoise dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-turquoise"
              }`}
            >
              ¥{preset.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          disabled={!amount}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-turquoise py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <CreditCard className="h-5 w-5" />
          PayPayでチャージ
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* 決済情報入力モーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 dark:border dark:border-slate-700">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-xl font-bold text-brand-blue dark:text-slate-200">
              決済情報の入力
            </h2>

            <div className="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  チャージ金額
                </span>
                <span className="text-2xl font-bold text-brand-blue dark:text-slate-100">
                  ¥{amount?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                決済リンク <span className="text-red-500">(必須)</span>
              </label>
              <input
                type="url"
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                placeholder="https://pay.paypay.ne.jp/..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                PayPayで作成した決済リンクを貼り付けてください
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                パスコード <span className="text-slate-400">(任意)</span>
              </label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="パスコード（任意）"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
              />
            </div>

            <button
              onClick={handleSubmitPayment}
              disabled={isProcessing || !paymentUrl.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Zap className="h-5 w-5 animate-pulse" />
                  処理中...
                </>
              ) : (
                <>確定</>
              )}
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-slate-100 p-6 dark:bg-slate-800/50">
        <h2 className="mb-4 text-lg font-bold text-brand-blue dark:text-slate-200">
          チャージについて
        </h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex gap-2">
            <span>•</span>
            <span>PayPythOn mobile APIを使用してPayPay経由でチャージできます</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>最低チャージ金額は100円です</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>チャージされたクレジットは購入時に自動適用されます</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>現在はモックUIのため、実際の決済は行われません</span>
          </li>
        </ul>
      </section>
    </main>
  );
}
