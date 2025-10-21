"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Edit, Wallet, RefreshCw } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newBalance, setNewBalance] = useState<number>(0);
  const router = useRouter();

  const loadUsers = useCallback(async () => {
    try {
      // The browser automatically sends the HttpOnly cookie, so no headers are needed.
      const res = await fetch("/api/site-control-a4b7/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        console.error("Failed to load users:", data.message);
        // If unauthorized, redirect to login
        if (res.status === 401) {
          router.push("/site-control-a4b7");
        }
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, [router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);



  const handleEditBalance = (user: User) => {
    setEditingUser(user);
    setNewBalance(user.balance);
  };

  const handleSaveBalance = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch("/api/site-control-a4b7/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editingUser.id,
          balance: newBalance,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, balance: newBalance } : u)));
        alert(`${editingUser.name} の残高を ¥${newBalance.toLocaleString()} に更新しました`);
        setEditingUser(null);
        await loadUsers(); // Refresh the list
      } else {
        alert(`エラー: ${data.message}`);
        if (res.status === 401) {
          router.push("/site-control-a4b7");
        }
      }
    } catch (error) {
      console.error("Failed to update balance:", error);
      alert("残高の更新に失敗しました");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            <h1 className="text-lg font-bold text-brand-blue">ユーザー管理</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="メールアドレスまたは名前で検索..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
            />
          </div>
          <button
            onClick={() => loadUsers()}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            更新
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  残高
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-brand-blue">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-semibold text-brand-blue">
                      <Wallet className="h-4 w-4" />¥{user.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditBalance(user)}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-blue/90"
                    >
                      <Edit className="h-3 w-3" />
                      残高変更
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-brand-blue">残高を変更</h3>
            <div className="mb-4">
              <p className="mb-2 text-sm text-slate-600">ユーザー: {editingUser.name}</p>
              <p className="mb-4 text-sm text-slate-600">
                現在の残高: ¥{editingUser.balance.toLocaleString()}
              </p>
              <label className="mb-2 block text-sm font-semibold text-slate-700">新しい残高</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                min="0"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveBalance}
                className="flex-1 rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white transition hover:bg-brand-blue/90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
