"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Chrome, ArrowLeft } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("reCAPTCHA認証を完了してください");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        alert("確認メールを送信しました。メールを確認してアカウントを有効化してください。");
        router.push("/auth/login");
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      const message = err instanceof Error ? err.message : "登録に失敗しました";
      setError(message);
    } finally {
      setIsLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google sign up error:", err);
      const message = err instanceof Error ? err.message : "Googleログインに失敗しました";
      setError(message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-turquoise px-6 py-12 dark:from-dark-bg dark:via-dark-surface dark:to-dark-elevated">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-dark-surface dark:shadow-glow dark:border dark:border-dark-border">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-brand-blue dark:text-slate-400 dark:hover:text-dark-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            トップに戻る
          </Link>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-turquoise dark:from-dark-accent dark:to-dark-purple dark:shadow-glow">
            <span className="text-3xl">🛫</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-brand-blue dark:text-transparent dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:bg-clip-text">
            アカウント作成
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Plane SNS へようこそ</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-dark-border dark:bg-dark-elevated dark:text-slate-200 dark:hover:bg-dark-elevated/80 dark:hover:border-dark-accent/50"
        >
          <Chrome className="h-5 w-5" />
          Googleで新規登録
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-dark-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-slate-600 dark:bg-dark-surface dark:text-slate-400">
              または
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              お名前
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-dark-accent" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-dark-border dark:bg-dark-elevated dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-dark-accent dark:focus:ring-dark-accent/20"
                placeholder="山田 太郎"
                required
              />
            </div>
          </div>

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

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-dark-accent" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-dark-border dark:bg-dark-elevated dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-dark-accent dark:focus:ring-dark-accent/20"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              パスワード（確認）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-dark-accent" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20 dark:border-dark-border dark:bg-dark-elevated dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-dark-accent dark:focus:ring-dark-accent/20"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={
                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              }
              onChange={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !captchaToken}
            className="w-full rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-50 dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:shadow-glow glow-animate"
          >
            {isLoading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-brand-blue hover:text-brand-turquoise dark:text-dark-accent dark:hover:text-dark-purple dark:hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
          >
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
