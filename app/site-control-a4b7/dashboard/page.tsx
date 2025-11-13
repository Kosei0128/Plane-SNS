"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp, LogOut, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

type AnalyticsData = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalItems: number;
  topSellingItems: { item_id: string; title: string; total_quantity: number }[];
  dailySales: { sale_date: string; total_revenue: number }[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // The browser automatically sends the HttpOnly cookie, so no headers are needed.
        const res = await fetch("/api/site-control-a4b7/analytics");

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch analytics");
        }

        const data = await res.json();
        setAnalytics(data.analytics);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        if (message === "Unauthorized") {
          router.push("/site-control-a4b7");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/site-control-a4b7/logout");
    router.push("/site-control-a4b7");
    router.refresh();
  };

  const stats = [
    {
      label: "総売上",
      value: `¥${analytics?.totalRevenue.toLocaleString() ?? 0}`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
    {
      label: "総注文数",
      value: analytics?.totalOrders.toLocaleString() ?? 0,
      icon: ShoppingBag,
      color: "bg-green-500",
    },
    {
      label: "総商品数",
      value: analytics?.totalItems.toLocaleString() ?? 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "総ユーザー数",
      value: analytics?.totalUsers.toLocaleString() ?? 0,
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  const quickLinks = [
    { href: "/site-control-a4b7/items", label: "商品管理", description: "在庫・価格の編集" },
    { href: "/site-control-a4b7/orders", label: "注文管理", description: "注文状況の確認" },
    { href: "/site-control-a4b7/history", label: "変更履歴", description: "商品の編集履歴" },
    { href: "/site-control-a4b7/users", label: "ユーザー管理", description: "ユーザー一覧" },
    {
      href: "/site-control-a4b7/inventory",
      label: "在庫管理",
      description: "アカウント情報の追加・削除",
    },
    { href: "/site-control-a4b7/settings", label: "設定", description: "システム設定" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-turquoise">
              <span className="text-xl font-bold text-white">🛫</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-brand-blue">管理画面</h1>
              <p className="text-xs text-slate-600">Plane SNS Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-600 transition hover:text-brand-blue">
              サイトを表示
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-brand-blue">ダッシュボード</h2>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 rounded bg-slate-200 animate-pulse"></div>
                      <div className="h-8 w-24 rounded bg-slate-200 animate-pulse"></div>
                    </div>
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-bold">データの読み込みに失敗しました</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-brand-blue">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {!isLoading && !error && analytics && (
          <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Top Selling Items */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-brand-blue">人気商品ランキング</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-sm font-semibold text-slate-600">商品名</th>
                      <th className="p-3 text-sm font-semibold text-slate-600 text-right">
                        販売数
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topSellingItems.map((item) => (
                      <tr key={item.item_id} className="border-b border-slate-100">
                        <td className="p-3 text-sm text-slate-800">{item.title}</td>
                        <td className="p-3 text-sm text-slate-800 text-right font-semibold">
                          {item.total_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Sales */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-brand-blue">日別売上 (直近30日)</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-sm font-semibold text-slate-600">日付</th>
                      <th className="p-3 text-sm font-semibold text-slate-600 text-right">売上</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dailySales.map((sale) => (
                      <tr key={sale.sale_date} className="border-b border-slate-100">
                        <td className="p-3 text-sm text-slate-800">
                          {new Date(sale.sale_date).toLocaleDateString("ja-JP")}
                        </td>
                        <td className="p-3 text-sm text-slate-800 text-right font-semibold">
                          ¥{sale.total_revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-6 text-xl font-bold text-brand-blue">クイックアクセス</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <h3 className="mb-2 text-lg font-semibold text-brand-blue group-hover:text-brand-turquoise">
                  {link.label}
                </h3>
                <p className="text-sm text-slate-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
