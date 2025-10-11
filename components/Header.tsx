"use client";

import { ShoppingCart, Menu, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type AuthProfile = {
  name: string;
  email: string;
  provider: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function mapUserToProfile(user: SupabaseUser | null | undefined): AuthProfile | null {
  if (!user) return null;
  const provider = user.app_metadata?.provider ?? "email";
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    (typeof meta?.full_name === "string" && meta.full_name) ||
    (typeof meta?.name === "string" && meta.name) ||
    user.email?.split("@")[0] ||
    "ユーザー";
  const email = user.email ?? "";
  const avatarCandidate = [
    meta?.avatar_url,
    meta?.avatarUrl,
    meta?.picture,
    meta?.profile_image
  ].find((value) => typeof value === "string" && value.length > 0) as string | undefined;

  return {
    name: fullName,
    email,
    provider,
    avatarUrl: avatarCandidate ?? null,
    isAdmin: email ? adminEmailList.includes(email.toLowerCase()) : false
  };
}

export function Header() {
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      
      // 残高を取得
      if (data.session?.user && data.session.access_token) {
        try {
          const res = await fetch("/api/balance", {
            headers: {
              "Authorization": `Bearer ${data.session.access_token}`
            }
          });
          const balanceData = await res.json();
          if (isMounted) {
            setBalance(balanceData.balance || 0);
          }
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      } else {
        setBalance(0);
      }
    };

    const syncProfile = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setProfile(mapUserToProfile(data.session?.user));
      await fetchBalance();
    };

    void syncProfile();

    // 残高更新イベントをリッスン
    const handleBalanceUpdate = () => {
      fetchBalance();
    };
    window.addEventListener('balance-updated', handleBalanceUpdate);

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setProfile(mapUserToProfile(session?.user));
      router.refresh();
      
      // 認証状態が変わったら残高も再取得
      if (session?.user && session.access_token) {
        try {
          const res = await fetch("/api/balance", {
            headers: {
              "Authorization": `Bearer ${session.access_token}`
            }
          });
          const data = await res.json();
          if (isMounted) {
            setBalance(data.balance || 0);
          }
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      } else {
        setBalance(0);
      }
    });

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
      window.removeEventListener('balance-updated', handleBalanceUpdate);
    };
  }, [router]);

  const isGoogleUser = useMemo(() => profile?.provider === "google", [profile]);
  const isAdmin = profile?.isAdmin ?? false;
  const avatarInitial = useMemo(() => profile?.name?.charAt(0)?.toUpperCase() ?? "P", [profile?.name]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-turquoise shadow-md">
            <span className="text-xl font-bold text-white">🛫</span>
          </div>
          <span className="text-xl font-bold text-brand-blue">Plane SNS</span>
        </Link>

        <nav className="flex items-center gap-4">
          {profile && (
            <>
              <Link
                href="/charge"
                className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-blue shadow-sm transition hover:scale-105 hover:bg-white"
              >
                <span className="hidden sm:inline">残高</span>
                <span>¥{balance.toLocaleString()}</span>
                <span className="text-lg leading-none">+</span>
              </Link>
              
              <Link
                href="/orders"
                className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-blue shadow-sm transition hover:scale-105 hover:bg-white"
              >
                📦 <span className="hidden sm:inline">注文履歴</span>
              </Link>
            </>
          )}

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-turquoise px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 hover:brightness-110"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="rounded-lg p-2 text-brand-blue transition hover:bg-slate-100 lg:hidden"
            aria-label="メニューを開く"
          >
            <Menu className="h-6 w-6" />
          </button>

          {profile ? (
            <div className="hidden items-center gap-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-left shadow-lg lg:flex">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.name}のプロフィール画像`}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-md"
                />
              ) : (
                <DefaultAvatar initial={avatarInitial} isGoogle={isGoogleUser} />
              )}
              <div className="flex min-w-[140px] flex-col leading-tight">
                <span className="truncate text-xs font-semibold text-slate-700">{profile.name}</span>
                <span className="truncate text-[10px] text-slate-500">{profile.email}</span>
              </div>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-blue/20 to-brand-turquoise/20 px-2.5 py-1 text-[11px] font-semibold text-brand-blue transition hover:from-brand-blue/30 hover:to-brand-turquoise/30"
                >
                  🔧 管理
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:scale-105 hover:bg-slate-200"
              >
                <LogOut className="h-3 w-3" />
                ログアウト
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 rounded-full border-2 border-brand-blue/30 px-3 py-1.5 text-xs font-semibold text-brand-blue transition hover:scale-105 hover:border-brand-blue/50 hover:bg-brand-blue/5"
              >
                <LogIn className="h-3.5 w-3.5" />
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-blue to-brand-turquoise px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:scale-105 hover:brightness-110"
              >
                新規登録
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function DefaultAvatar({ initial, isGoogle }: { initial: string; isGoogle: boolean }) {
  return (
    <div
      className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-sm font-semibold text-white shadow-md ${
        isGoogle ? "bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#34A853]" : "bg-gradient-to-br from-brand-blue to-brand-turquoise"
      }`}
    >
      {initial}
    </div>
  );
}
