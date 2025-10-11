"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Plus } from "lucide-react";

type Item = {
  id: string;
  title: string;
  stock: number;
  category: string;
};

export default function AdminInventoryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [accountData, setAccountData] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-session");
    if (!token || token !== "admin-session-token") {
      router.push("/admin");
    } else {
      setIsAuthenticated(true);
      fetchItems();
    }
  }, [router]);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items || []);
      if (data.items && data.items.length > 0) {
        setSelectedItemId(data.items[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const handleAddStock = async () => {
    if (!selectedItemId || !accountData.trim()) {
      setMessage({ type: "error", text: "アイテムとアカウント情報を入力してください" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const accounts = accountData
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemId: selectedItemId, 
          action: "add",
          accounts 
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          type: "success", 
          text: `✅ ${accounts.length}件のアカウントを追加しました。現在の在庫: ${data.stock}件` 
        });
        setAccountData("");
        fetchItems();
      } else {
        setMessage({ type: "error", text: `❌ エラー: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `❌ 通信エラー: ${error}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-brand-blue"
            >
              <ArrowLeft className="h-4 w-4" />
              ダッシュボード
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <h1 className="text-lg font-bold text-brand-blue">在庫管理</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-brand-blue">
            <Package className="h-6 w-6" />
            在庫追加
          </h2>

          {message && (
            <div
              className={`mb-4 rounded-lg p-4 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                商品を選択
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} (現在の在庫: {item.stock}件)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                在庫を追加する商品を選択してください
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                アカウント情報（1行に1件）
              </label>
              <textarea
                value={accountData}
                onChange={(e) => setAccountData(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 font-mono text-sm focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                placeholder={`account1:password123:email1@example.com
account2:password456:email2@example.com
account3:password789:email3@example.com

各行に1つのアカウント情報を入力してください。
形式は自由ですが、一般的には「ID:パスワード:メール」の形式を推奨します。`}
              />
              <p className="mt-1 text-xs text-slate-500">
                {accountData.split("\n").filter((line) => line.trim()).length} 件のアカウントが入力されています
              </p>
            </div>

            <button
              onClick={handleAddStock}
              disabled={isSubmitting || !selectedItemId || !accountData.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              {isSubmitting ? "追加中..." : "在庫を追加"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-blue-50 p-6">
          <h3 className="mb-3 font-semibold text-brand-blue">💡 在庫管理について</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• アカウント情報は安全にデータベースに保存されます</li>
            <li>• 購入時に自動的に1件ずつ取り出されます</li>
            <li>• 在庫数はリアルタイムで同期されます</li>
            <li>• 在庫がなくなると自動的に「在庫切れ」表示になります</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
