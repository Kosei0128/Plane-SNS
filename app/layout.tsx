import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Plane SNS",
  description: "SNSアカウントの販売と運用をひとつにまとめる Plane SNS のデモマーケット",
  openGraph: {
    title: "Plane SNS",
    description: "SNSアカウントの販売と運用をひとつにまとめる Plane SNS のデモマーケット",
    url: "https://plane-sns.example",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-[#eff6ff] via-white to-[#e6fff7] text-brand-blue antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
