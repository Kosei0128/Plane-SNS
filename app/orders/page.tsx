"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Package, Calendar, Copy, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type OrderItem = {
  id: string;
  itemId: string;
  title: string;
  imageUrl: string;
  quantity: number;
  price: number;
  accounts: string[];
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [copiedAccounts, setCopiedAccounts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("ログインが必要です");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "注文履歴の取得に失敗しました");
      }

      setOrders(data.orders);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "注文履歴の取得に失敗しました";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const copyToClipboard = (text: string, accountId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccounts(new Set(copiedAccounts).add(accountId));
    setTimeout(() => {
      setCopiedAccounts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-transparent dark:border-slate-600 dark:border-t-transparent"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700 dark:bg-red-500/20 dark:text-red-300">
          <p className="font-semibold">{error}</p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block text-brand-blue hover:underline dark:text-brand-turquoise dark:hover:text-sky-400"
          >
            ログインページへ
          </Link>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <Package className="mb-6 h-24 w-24 text-slate-300 dark:text-slate-700" />
        <h1 className="mb-2 text-2xl font-bold text-brand-blue dark:text-slate-200">
          注文履歴がありません
        </h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">まだ商品を購入していません</p>
        <Link
          href="/"
          className="rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue/90"
        >
          商品を探す
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-blue dark:text-slate-100">注文履歴</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          過去に購入した商品とアカウント情報を確認できます
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          const orderDate = new Date(order.createdAt);

          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50"
            >
              {/* 注文ヘッダー */}
              <button
                onClick={() => toggleOrder(order.id)}
                className="w-full px-6 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 dark:bg-sky-500/20">
                      <Package className="h-6 w-6 text-brand-blue dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-blue dark:text-slate-200">
                        注文番号: {order.id.slice(0, 8)}...
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {orderDate.toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-300">
                          {order.status === "completed" ? "完了" : order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">合計金額</p>
                      <p className="text-xl font-bold text-brand-blue dark:text-slate-100">
                        ¥{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* 注文詳細 */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-700/50"
                      >
                        {/* 商品情報 */}
                        <div className="mb-4 flex gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-600">
                            <Image
                              src={
                                item.imageUrl ||
                                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200"
                              }
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-brand-blue dark:text-slate-200">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              数量: {item.quantity} × ¥{item.price.toLocaleString()}
                            </p>
                            <p className="mt-1 text-lg font-bold text-brand-blue dark:text-slate-100">
                              小計: ¥{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* 購入したアカウント情報 */}
                        {item.accounts.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              📦 購入したアカウント情報
                            </p>
                            {item.accounts.map((account, accountIndex) => {
                              const accountId = `${item.id}-${accountIndex}`;
                              const isCopied = copiedAccounts.has(accountId);

                              return (
                                <div
                                  key={accountIndex}
                                  className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-600/50"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="flex-1 break-all font-mono text-sm text-slate-800 dark:text-slate-200">
                                      {account}
                                    </p>
                                    <button
                                      onClick={() => copyToClipboard(account, accountId)}
                                      className="flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-blue/90"
                                    >
                                      {isCopied ? (
                                        <>
                                          <CheckCircle className="h-4 w-4" />
                                          コピー済み
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-4 w-4" />
                                          コピー
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
