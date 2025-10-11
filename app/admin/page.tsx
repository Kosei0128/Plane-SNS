"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        // セッショントークンをlocalStorageに保存（本番ではhttpOnlyクッキー推奨）
        localStorage.setItem("admin-session", data.token);
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "ログインに失敗しました");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-turquoise px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-blue">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-brand-blue">管理者ログイン</h1>
          <p className="text-sm text-slate-600">Shark Market 管理画面へのアクセス</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
          <p className="mb-2 font-semibold">開発用デモアカウント:</p>
          <p>管理者: admin / admin123</p>
          <p>編集者: editor / editor123</p>
        </div>
      </div>
    </main>
  );
}
