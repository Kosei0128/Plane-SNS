"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Plus, Trash2, Loader2 } from "lucide-react";

type Item = {
  id: string;
  title: string;
  stock: number;
  category: string;
};

type Account = {
  id: string;
  account_info: string;
  created_at: string;
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [accountData, setAccountData] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items || []);
      if (data.items && data.items.length > 0 && !selectedItemId) {
        setSelectedItemId(data.items[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  }, [selectedItemId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (selectedItemId) {
      fetchAvailableAccounts(selectedItemId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemId]);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items || []);
      if (data.items && data.items.length > 0 && !selectedItemId) {
        setSelectedItemId(data.items[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const fetchAvailableAccounts = async (itemId: string) => {
    setIsAccountsLoading(true);
    try {
      const res = await fetch(`/api/inventory?itemId=${itemId}`);
      const data = await res.json();
      if (res.ok) {
        setAvailableAccounts(data.accounts || []);
      } else {
        console.error("Failed to fetch accounts:", data.error);
        setAvailableAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setAvailableAccounts([]);
    } finally {
      setIsAccountsLoading(false);
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
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItemId,
          action: "add",
          accounts,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `✅ ${accounts.length}件のアカウントを追加しました。現在の在庫: ${data.stock}件`,
        });
        setAccountData("");
        await fetchItems(); // アイテムリスト（在庫数）を更新
        await fetchAvailableAccounts(selectedItemId); // アカウントリストを更新
      } else {
        setMessage({ type: "error", text: `❌ エラー: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `❌ 通信エラー: ${error}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm("このアカウントを本当に削除しますか？この操作は元に戻せません。")) {
      return;
    }

    setMessage(null);

    try {
      const res = await fetch(`/api/inventory?accountId=${accountId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "✅ アカウントを削除しました。" });
        await fetchItems(); // アイテムリスト（在庫数）を更新
        await fetchAvailableAccounts(selectedItemId); // アカウントリストを更新
      } else {
        setMessage({ type: "error", text: `❌ 削除エラー: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `❌ 通信エラー: ${error}` });
    }
  };

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
            <h1 className="text-lg font-bold text-brand-blue">在庫管理</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                <p className="mt-1 text-xs text-slate-500">在庫を追加する商品を選択してください</p>
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
                  placeholder={`account1:password123:email1@example.com\naccount2:password456:email2@example.com\naccount3:password789:email3@example.com\n\n各行に1つのアカウント情報を入力してください。\n形式は自由ですが、一般的には「ID:パスワード:メール」の形式を推奨します。`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {accountData.split("\n").filter((line) => line.trim()).length}{" "}
                  件のアカウントが入力されています
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

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-brand-blue">
              <Package className="h-6 w-6" />
              未売却アカウント
            </h2>
            {isAccountsLoading ? (
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>読み込み中...</span>
              </div>
            ) : availableAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <p className="mb-4 text-sm text-slate-600">
                  {items.find((item) => item.id === selectedItemId)?.title}の未売却アカウントは
                  <span className="font-bold text-brand-blue"> {availableAccounts.length} </span>
                  件です。
                </p>
                <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                        >
                          アカウント情報
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                        >
                          追加日
                        </th>
                        <th scope="col" className="relative px-4 py-3">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {availableAccounts.map((account) => (
                        <tr key={account.id}>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-mono text-sm text-slate-900">
                              {account.account_info}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="text-sm text-slate-600">
                              {new Date(account.created_at).toLocaleString("ja-JP")}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="rounded-md p-1 text-slate-500 transition hover:bg-red-100 hover:text-red-600"
                              title="削除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                この商品には利用可能なアカウント在庫がありません。
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-blue-50/80 p-6 shadow-sm">
          <h3 className="mb-3 font-semibold text-brand-blue">💡 在庫管理について</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• アカウント情報は安全にデータベースに保存されます</li>
            <li>• 購入時に自動的に1件ずつ取り出されます</li>
            <li>• 在庫数はリアルタイムで同期されます</li>
            <li>• 在庫がなくなると自動的に「在庫切れ」表示になります</li>
            <li>
              • ここで表示されるのは<span className="font-bold">未売却</span>のアカウントのみです
            </li>
            <li>• アカウントを削除すると在庫数が減り、購入できなくなりますのでご注意ください</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
