"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle, Package, ServerCrash, Inbox } from "lucide-react";

// APIからのデータ構造に合わせた型定義
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
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  items: OrderItem[];
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // 管理者用の注文APIエンドポイントをコール
      const response = await fetch("/api/site-control-a4b7/orders");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `注文データの取得に失敗しました。 (${response.status})`);
      }

      const data = await response.json();

      // APIのレスポンスに合わせて`data.orders`を使用
      setOrders(data.orders || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "不明なエラーが発生しました。";
      setError(message);
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return { label: "完了", icon: CheckCircle, className: "bg-green-100 text-green-700" };
      case "pending":
        return { label: "処理中", icon: Clock, className: "bg-yellow-100 text-yellow-700" };
      case "cancelled":
        return { label: "キャンセル", icon: XCircle, className: "bg-red-100 text-red-700" };
      default:
        return { label: "不明", icon: XCircle, className: "bg-gray-100 text-gray-700" };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
          <ServerCrash className="mx-auto mb-4 h-12 w-12" />
          <p className="font-semibold">エラーが発生しました</p>
          <p className="mt-2 text-sm">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-100">
          <Inbox className="mb-4 h-12 w-12 text-slate-400" />
          <p className="font-semibold text-slate-600">注文はまだありません</p>
          <p className="mt-1 text-sm text-slate-500">新しい注文が入るとここに表示されます。</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-brand-blue">
                    注文 {order.id.slice(0, 8)}...
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusInfo.label}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  {new Date(order.createdAt).toLocaleString("ja-JP")}
                </div>
              </div>

              <div className="mb-4 space-y-2 border-y border-slate-200 py-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-700">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  ユーザー:{" "}
                  <span className="font-semibold">
                    {order.user?.email || order.user?.id || "N/A"}
                  </span>
                </div>
                <div className="text-lg font-bold text-brand-blue">
                  合計: ¥{order.totalAmount.toLocaleString()}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/site-control-a4b7/dashboard"
              className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-brand-blue"
            >
              <ArrowLeft className="h-4 w-4" />
              ダッシュボード
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <h1 className="text-lg font-bold text-brand-blue">注文管理</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-2xl bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              {loading ? "注文データを読み込み中..." : `全 ${orders.length} 件の注文を管理中。`}
            </p>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
