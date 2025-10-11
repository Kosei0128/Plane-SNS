import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">🛫</span>
              <span className="text-xl font-bold text-brand-blue">Plane SNS</span>
            </div>
            <p className="text-sm text-slate-600">
              SNSアカウントの在庫管理と販売をまとめて扱える Plane SNS のプロトタイプです。
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-brand-blue">リンク</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="transition hover:text-brand-blue">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-brand-blue">
                  カート
                </Link>
              </li>
              <li>
                <Link href="/charge" className="transition hover:text-brand-blue">
                  チャージ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-brand-blue">サポート</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="transition hover:text-brand-blue">
                  ヘルプセンター
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-brand-blue">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-brand-blue">
                  プライバシーポリシー
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/60 pt-8 text-center text-sm text-slate-600">
          © 2025 Plane SNS. Built with Next.js 15.2.5
        </div>
      </div>
    </footer>
  );
}
