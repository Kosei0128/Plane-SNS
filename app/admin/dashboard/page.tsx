"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-session");
    if (!token || token !== "admin-session-token") {
      router.push("/admin");
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin-session");
    router.push("/admin");
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

  const stats = [
    { label: "総商品数", value: "0", icon: Package, color: "bg-blue-500" },
    { label: "注文数", value: "0", icon: ShoppingBag, color: "bg-green-500" },
    { label: "ユーザー数", value: "0", icon: Users, color: "bg-purple-500" },
    { label: "売上", value: "¥0", icon: TrendingUp, color: "bg-orange-500" }
  ];

  const quickLinks = [
    { href: "/admin/items", label: "商品管理", description: "在庫・価格の編集" },
    { href: "/admin/orders", label: "注文管理", description: "注文状況の確認" },
    { href: "/admin/history", label: "変更履歴", description: "商品の編集履歴" },
    { href: "/admin/users", label: "ユーザー管理", description: "ユーザー一覧" },
    { href: "/admin/inventory", label: "在庫管理", description: ".txtファイル在庫システム" },
    { href: "/admin/settings", label: "設定", description: "システム設定" }
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
            <Link
              href="/"
              className="text-sm text-slate-600 transition hover:text-brand-blue"
            >
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-brand-blue">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

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
