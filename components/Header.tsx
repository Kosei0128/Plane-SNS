"use client";

import {
  ShoppingCart,
  Menu,
  LogIn,
  LogOut,
  Clock,
  Settings,
  Coins,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/ThemeToggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    meta?.profile_image,
  ].find((value) => typeof value === "string" && value.length > 0) as string | undefined;

  return {
    name: fullName,
    email,
    provider,
    avatarUrl: avatarCandidate ?? null,
    isAdmin: email ? adminEmailList.includes(email.toLowerCase()) : false,
  };
}

export function Header() {
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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
              Authorization: `Bearer ${data.session.access_token}`,
            },
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
    window.addEventListener("balance-updated", handleBalanceUpdate);

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setProfile(mapUserToProfile(session?.user));
      router.refresh();

      // 認証状態が変わったら残高も再取得
      if (session?.user && session.access_token) {
        try {
          const res = await fetch("/api/balance", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
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
      window.removeEventListener("balance-updated", handleBalanceUpdate);
    };
  }, [router]);

  const isGoogleUser = useMemo(() => profile?.provider === "google", [profile]);
  const isAdmin = profile?.isAdmin ?? false;
  const avatarInitial = useMemo(
    () => profile?.name?.charAt(0)?.toUpperCase() ?? "P",
    [profile?.name],
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsMenuOpen(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-dark-border/80 dark:bg-dark-surface/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-turquoise shadow-md">
            <span className="text-2xl font-bold text-white">🛫</span>
          </div>
          <span className="text-2xl font-bold text-brand-blue dark:text-white">Plane SNS</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {profile && (
            <>
              <Link
                href="/charge"
                className="hidden items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm transition hover:scale-105 hover:bg-white dark:bg-dark-elevated/80 dark:text-slate-200 dark:hover:bg-dark-border sm:flex"
              >
                <span className="hidden sm:inline">残高</span>
                <span>¥{balance.toLocaleString()}</span>
                <span className="text-lg leading-none">+</span>
              </Link>

              <Link
                href="/orders"
                className="hidden rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm transition hover:scale-105 hover:bg-white dark:bg-dark-elevated/80 dark:text-slate-200 dark:hover:bg-dark-border sm:flex"
              >
                📦 <span className="hidden sm:inline">注文履歴</span>
              </Link>
            </>
          )}

          <ThemeToggle />

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-turquoise px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-105 hover:brightness-110"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="rounded-lg p-2 text-brand-blue transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-dark-border lg:hidden"
            aria-label="メニューを開く"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="hidden cursor-pointer items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-left shadow-lg transition-transform hover:scale-105 dark:border-dark-border dark:bg-dark-elevated/90 lg:flex">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={`${profile.name}のプロフィール画像`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md dark:border-dark-border"
                    />
                  ) : (
                    <DefaultAvatar initial={avatarInitial} isGoogle={isGoogleUser} />
                  )}
                  <div className="flex min-w-[100px] flex-col leading-tight">
                    <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                      {profile.name}
                    </span>
                    <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                      ¥{balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/charge">
                    <Coins className="mr-2 h-4 w-4" />
                    <span>クレジットをチャージ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>注文履歴</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/site-control-a4b7/dashboard">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>管理ダッシュボード</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/50 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-blue/30 px-4 py-2 text-sm font-semibold text-brand-blue transition hover:scale-105 hover:border-brand-blue/50 hover:bg-brand-blue/5 dark:border-dark-border dark:text-slate-300 dark:hover:bg-dark-elevated"
              >
                <LogIn className="h-4 w-4" />
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-turquoise px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 hover:brightness-110"
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
      className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white text-sm font-semibold text-white shadow-md dark:border-dark-border ${
        isGoogle
          ? "bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#34A853]"
          : "bg-gradient-to-br from-brand-blue to-brand-turquoise dark:from-dark-accent dark:to-dark-purple"
      }`}
    >
      {initial}
    </div>
  );
}
