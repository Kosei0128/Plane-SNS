"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle, Package } from "lucide-react";

type Order = {
  id: string;
  userId: string;
  items: Array<{ id: string; title: string; quantity: number; price: number }>;
  total: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "order-001",
    userId: "user-123",
    items: [
      { id: "texture-pack", title: "プレミアムテクスチャパック", quantity: 1, price: 3200 },
      { id: "sound-pack", title: "アンビエントサウンドパック", quantity: 2, price: 1800 }
    ],
    total: 6800,
    status: "completed",
    createdAt: "2025-10-07T10:30:00Z"
  },
  {
    id: "order-002",
    userId: "user-456",
    items: [{ id: "avatar-skin", title: "限定アバタースキン", quantity: 1, price: 4500 }],
    total: 4500,
    status: "pending",
    createdAt: "2025-10-07T14:15:00Z"
  },
  {
    id: "order-003",
    userId: "user-789",
    items: [{ id: "ui-theme", title: "カスタムUIテーマ", quantity: 3, price: 2400 }],
    total: 7200,
    status: "cancelled",
    createdAt: "2025-10-06T09:00:00Z"
  }
];

export default function AdminOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-session");
    if (!token || token !== "admin-session-token") {
      router.push("/admin");
    } else {
      setIsAuthenticated(true);
      // 本番ではAPI経由で取得
      setOrders(MOCK_ORDERS);
      setIsLoading(false);
    }
  }, [router]);

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return { label: "完了", icon: CheckCircle, className: "bg-green-100 text-green-700" };
      case "pending":
        return { label: "処理中", icon: Clock, className: "bg-yellow-100 text-yellow-700" };
      case "cancelled":
        return { label: "キャンセル", icon: XCircle, className: "bg-red-100 text-red-700" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
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
              全 {orders.length} 件の注文を管理中。ステータスの更新や詳細確認ができます。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-brand-blue">注文 {order.id}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString("ja-JP")}
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-600">
                    ユーザー: <span className="font-semibold">{order.userId}</span>
                  </div>
                  <div className="text-lg font-bold text-brand-blue">
                    合計: ¥{order.total.toLocaleString()}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
