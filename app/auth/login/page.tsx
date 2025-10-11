"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Chrome, ArrowLeft } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("reCAPTCHA認証を完了してください");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (data.user) {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message = err instanceof Error ? err.message : "ログインに失敗しました";
      setError(message);
    } finally {
      setIsLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google login error:", err);
      const message = err instanceof Error ? err.message : "Googleログインに失敗しました";
      setError(message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-turquoise px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-brand-blue">
            <ArrowLeft className="h-4 w-4" />
            トップに戻る
          </Link>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-turquoise">
            <span className="text-3xl">🦈</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-brand-blue">ログイン</h1>
          <p className="text-sm text-slate-600">Plane SNS にログイン</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Chrome className="h-5 w-5" />
          Googleでログイン
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-slate-600">または</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !captchaToken}
            className="w-full rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/reset-password" className="text-sm text-brand-blue hover:text-brand-turquoise">
            パスワードをお忘れですか？
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          アカウントをお持ちでないですか？{" "}
          <Link href="/auth/signup" className="font-semibold text-brand-blue hover:text-brand-turquoise">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
