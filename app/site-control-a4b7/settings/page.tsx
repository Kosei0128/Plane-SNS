"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export default function AdminSettingsPage() {


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/site-control-a4b7/dashboard"
              className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-brand-blue"
            >
              <ArrowLeft className="h-4 w-4" />
              ダッシュボード
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <h1 className="text-lg font-bold text-brand-blue">設定</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <Settings className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h2 className="mb-2 text-xl font-bold text-brand-blue">システム設定</h2>
          <p className="text-slate-600">今後実装予定の機能です</p>
        </div>
      </main>
    </div>
  );
}
