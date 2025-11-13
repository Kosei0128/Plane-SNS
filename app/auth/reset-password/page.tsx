"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const message = err instanceof Error ? err.message : "パスワードリセットに失敗しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-turquoise px-6 py-12 dark:from-dark-bg dark:via-dark-surface dark:to-dark-elevated">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-dark-surface dark:shadow-glow dark:border dark:border-dark-border">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 dark:border dark:border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-brand-blue dark:text-transparent dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:bg-clip-text">
              メールを送信しました
            </h1>
            <p className="mb-6 text-slate-600 dark:text-slate-300">
              {email} にパスワードリセット用のリンクを送信しました。
              メールを確認してリンクをクリックしてください。
            </p>
            <Link
              href="/auth/login"
              className="inline-block rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-brand-blue/90 dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:shadow-glow"
            >
              ログインページに戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-turquoise px-6 py-12 dark:from-dark-bg dark:via-dark-surface dark:to-dark-elevated">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-dark-surface dark:shadow-glow dark:border dark:border-dark-border">
        <div className="mb-8 text-center">
          <Link
            href="/auth/login"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-brand-blue dark:text-slate-400 dark:hover:text-dark-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            ログインに戻る
          </Link>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-turquoise dark:from-dark-accent dark:to-dark-purple dark:shadow-glow">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-brand-blue dark:text-transparent dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:bg-clip-text">
            パスワードリセット
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            登録したメールアドレスを入力してください
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-dark-accent" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-dark-border dark:bg-dark-elevated dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-dark-accent dark:focus:ring-dark-accent/20"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-50 dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:shadow-glow glow-animate"
          >
            {isLoading ? "送信中..." : "リセットリンクを送信"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-brand-blue hover:text-brand-turquoise dark:text-dark-accent dark:hover:text-dark-purple dark:hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
          >
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
