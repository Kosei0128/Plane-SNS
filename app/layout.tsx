import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotificationManager } from "@/components/NotificationManager";
import "../styles/globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Plane SNS",
  description: "SNSアカウントの販売と運用をひとつにまとめる Plane SNS のデモマーケット",
  openGraph: {
    title: "Plane SNS",
    description: "SNSアカウントの販売と運用をひとつにまとめる Plane SNS のデモマーケット",
    url: "https://plane-sns.example",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-brand-sand text-brand-blue antialiased dark:bg-dark-gradient dark:text-slate-300">
        <Providers>
          <NotificationManager />
          <Header />
          <div className="dark:bg-dark-gradient">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
