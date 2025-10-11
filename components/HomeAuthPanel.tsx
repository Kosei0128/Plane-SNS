"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase/client";
import { ArrowRight, Chrome, Lock, Mail, User } from "lucide-react";
import Link from "next/link";

type AuthMode = "login" | "signup";

type FormState = {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
};

const defaultSiteKey =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export function HomeAuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  useEffect(() => {
    setError(null);
    setMessage(null);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  }, [mode]);

  const canSubmit = useMemo(() => {
    if (!captchaToken) return false;
    if (!form.email || !form.password) return false;
    if (mode === "signup") {
      return Boolean(form.fullName && form.confirmPassword && form.password === form.confirmPassword);
    }
    return true;
  }, [captchaToken, form, mode]);

  const handleInput = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!captchaToken) {
      setError("reCAPTCHA認証を完了してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });

      if (signInError) throw signInError;

      if (data.user) {
        setMessage("ログインに成功しました");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setIsSubmitting(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!captchaToken) {
      setError("reCAPTCHA認証を完了してください");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (form.password.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setMessage("確認メールを送信しました。メールをご確認ください。");
        setForm({ email: "", password: "", fullName: "", confirmPassword: "" });
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setIsSubmitting(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google認証に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="auth" className="mx-auto grid w-full max-w-7xl gap-12 rounded-3xl bg-white/60 px-6 py-12 shadow-xl ring-1 ring-brand-blue/10 backdrop-blur">
      <div className="flex flex-col gap-4 text-center">
        <span className="mx-auto inline-flex items-center rounded-full bg-brand-blue/10 px-4 py-1 text-sm font-semibold text-brand-blue">
          アカウントを作成して始めましょう
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
          ログインまたは新規登録
        </h2>
        <p className="mx-auto max-w-2xl text-base text-slate-600">
          Googleアカウントかメールアドレスでログインできます。ログインするとカートやチャージなどの機能を利用できます。
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white px-6 py-8 shadow-lg ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-center gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-2 transition ${
              mode === "login" ? "bg-white text-brand-blue shadow" : "hover:text-brand-blue"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-2 transition ${
              mode === "signup" ? "bg-white text-brand-blue shadow" : "hover:text-brand-blue"
            }`}
          >
            新規登録
          </button>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <Chrome className="h-5 w-5" />
            Googleで{mode === "login" ? "ログイン" : "新規登録"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500">または</span>
            </div>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="home-email" className="mb-2 block text-sm font-semibold text-slate-700">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="home-email"
                    type="email"
                    value={form.email}
                    onChange={handleInput("email")}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="home-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="home-password"
                    type="password"
                    value={form.password}
                    onChange={handleInput("password")}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm text-brand-blue">
                <Link href="/auth/reset-password" className="inline-flex items-center gap-1 hover:text-brand-turquoise">
                  <ArrowRight className="h-4 w-4" />
                  パスワードをお忘れですか？
                </Link>
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={defaultSiteKey}
                  onChange={setCaptchaToken}
                />
              </div>

              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{message}</p>}

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {isSubmitting ? "処理中..." : "ログイン"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="home-full-name" className="mb-2 block text-sm font-semibold text-slate-700">
                  お名前
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="home-full-name"
                    type="text"
                    value={form.fullName}
                    onChange={handleInput("fullName")}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="山田 太郎"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="home-signup-email" className="mb-2 block text-sm font-semibold text-slate-700">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="home-signup-email"
                    type="email"
                    value={form.email}
                    onChange={handleInput("email")}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="home-signup-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="home-signup-password"
                    type="password"
                    value={form.password}
                    onChange={handleInput("password")}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="home-confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  パスワード（確認）
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="home-confirm-password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleInput("confirmPassword")}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={defaultSiteKey}
                  onChange={setCaptchaToken}
                />
              </div>

              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{message}</p>}

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-lg bg-brand-turquoise py-3 font-semibold text-white transition hover:bg-brand-turquoise/90 disabled:opacity-50"
              >
                {isSubmitting ? "登録中..." : "アカウントを作成"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500">
            詳細なフローが必要な場合は
            <Link href={mode === "login" ? "/auth/login" : "/auth/signup"} className="px-1 text-brand-blue hover:text-brand-turquoise">
              専用ページ
            </Link>
            もご利用いただけます。
          </p>
        </div>
      </div>
    </section>
  );
}
