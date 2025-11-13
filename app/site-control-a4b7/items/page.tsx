"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Plus, Package } from "lucide-react";
import type { Item } from "@/app/api/items/route";

export default function AdminItemsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    price: 0,
    description: "",
    imageUrl: "",
    rating: 4.5,
    category: "その他",
  });

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const token = localStorage.getItem("admin-session");

    try {
      const res = await fetch("/api/site-control-a4b7/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();

      if (data.success) {
        alert("商品を更新しました");
        setEditingItem(null);
        fetchItems(); // 一覧を再取得
      } else {
        alert(data.message || "更新に失敗しました");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("ネットワークエラーが発生しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    const token = localStorage.getItem("admin-session");

    try {
      const res = await fetch(`/api/site-control-a4b7/items?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        alert("商品を削除しました");
        fetchItems(); // 一覧を再取得
      } else {
        alert(data.message || "削除に失敗しました");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("ネットワークエラーが発生しました");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-slate-600">読み込み中...</div>
      </div>
    );
  }

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
            <h1 className="text-lg font-bold text-brand-blue">商品管理</h1>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue/90"
          >
            <Plus className="h-4 w-4" />
            新規追加
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-2xl bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              全 {items.length} 商品を管理中。在庫・価格・ステータスを編集できます。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-brand-blue">{item.title}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.stock > 50
                          ? "bg-green-100 text-green-700"
                          : item.stock > 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      在庫: {item.stock}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">{item.description}</p>
                  <div className="mb-3 flex items-center gap-6 text-sm">
                    <span className="font-semibold text-brand-blue">
                      ¥{item.price.toLocaleString()}
                    </span>
                    <span className="text-slate-600">評価: ⭐ {item.rating}</span>
                    <span className="text-slate-600">ID: {item.id}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    削除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-brand-blue">商品編集</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">商品名</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">価格</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">在庫数</label>
                  <input
                    type="number"
                    value={editingItem.stock}
                    readOnly
                    className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">説明</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 rounded-lg bg-slate-100 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新規作成モーダル */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-brand-blue">商品新規作成</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">商品名 *</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                  placeholder="例: プレミアムパック"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">価格 *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="3200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    カテゴリー
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="グラフィック"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">評価</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newItem.rating}
                    onChange={(e) => setNewItem({ ...newItem, rating: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">画像URL</label>
                <input
                  type="text"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">説明 *</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
                  placeholder="商品の詳細説明を入力してください"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!newItem.title || !newItem.description) {
                      alert("必須項目を入力してください");
                      return;
                    }

                    const token = localStorage.getItem("admin-session");

                    try {
                      const res = await fetch("/api/site-control-a4b7/items", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(newItem),
                      });

                      const data = await res.json();

                      if (data.success) {
                        alert("商品を作成しました");
                        setIsCreating(false);
                        setNewItem({
                          title: "",
                          price: 0,
                          description: "",
                          imageUrl: "",
                          rating: 4.5,
                          category: "その他",
                        });
                        fetchItems();
                      } else {
                        alert(data.message || "作成に失敗しました");
                      }
                    } catch (error) {
                      console.error("Create error:", error);
                      alert("ネットワークエラーが発生しました");
                    }
                  }}
                  className="flex-1 rounded-lg bg-brand-blue py-3 font-semibold text-white transition hover:bg-brand-blue/90"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewItem({
                      title: "",
                      price: 0,
                      description: "",
                      imageUrl: "",
                      rating: 4.5,
                      category: "その他",
                    });
                  }}
                  className="flex-1 rounded-lg bg-slate-100 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
