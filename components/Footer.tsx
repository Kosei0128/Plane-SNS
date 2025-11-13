"use client";

import Link from "next/link";
import { Twitter, Mail, ArrowUp } from "lucide-react";

export function Footer() {
  // Scroll to top functionality needs to be handled client-side
  // This can be done with a simple onClick handler in a client component
  // or by creating a dedicated ScrollToTopButton component.

  return (
    <footer className="bg-[#1c1c27] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Logo and Social */}
          <div className="md:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
                <span className="text-xl font-bold text-white">🛫</span>
              </div>
              <span className="text-xl font-bold text-white">Plane SNS</span>
            </div>
            <p className="mb-4 text-sm text-slate-400">最高品質のデジタルサービスを提供</p>
            <a href="#" className="text-slate-400 hover:text-white">
              <Twitter className="h-6 w-6" />
            </a>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-2">
            <h3 className="mb-3 font-semibold text-white">カスタマーサービス</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  お問い合わせ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  よくある質問 (Q&A)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  配送について
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  返品・交換
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  お支払い方法
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="mb-3 font-semibold text-white">規約・ポリシー</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  特定商取引法に基づく表記
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Cookieポリシー
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  セキュリティ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="md:col-span-3 md:col-start-10">
            <h3 className="mb-3 font-semibold text-white">お問い合わせ</h3>
            <a
              href="#"
              className="flex items-start gap-3 rounded-lg bg-slate-800/50 p-3 hover:bg-slate-800"
            >
              <Mail className="h-6 w-6 flex-shrink-0 text-purple-400" />
              <div>
                <p className="font-semibold text-white">お問い合わせフォーム</p>
                <p className="text-sm text-slate-400">こちらから送信 →</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="mx-auto max-w-7xl border-t border-slate-800 px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Plane SNS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-400">決済方法:</p>
            <div className="flex items-center gap-2 text-2xl text-slate-500">
              <span>VISA</span> {/* Replace with actual icons if available */}
              <span>MasterCard</span>
              <span>PayPay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button - functionality needs client-side JS */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="トップに戻る"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </footer>
  );
}
