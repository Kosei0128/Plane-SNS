"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ItemCard } from "./ItemCard";
import type { Item } from "@/app/api/items/route";

type SearchResult = {
  items: Item[];
  totalCount: number;
  categories: string[];
  appliedFilters: {
    query: string;
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    sortBy: string;
  };
};

export function SearchableItemGrid() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("sortBy", sortBy);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory || minPrice || maxPrice || sortBy !== "newest";

  return (
    <div className="flex flex-col gap-6">
      {/* 検索バー */}
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-white/60 bg-white/90 p-4 shadow-lg sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="商品を検索..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-brand-blue/30 bg-white px-4 py-2 font-bold text-brand-blue shadow-sm transition hover:scale-105 hover:border-brand-blue/50 hover:bg-brand-blue/5"
        >
          <SlidersHorizontal className="h-5 w-5" />
          フィルター
        </button>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="rounded-2xl border-2 border-white/60 bg-white/90 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-blue">絞り込み</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-turquoise"
              >
                <X className="h-4 w-4" />
                クリア
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* カテゴリ */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                カテゴリ
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              >
                <option value="">すべて</option>
                {result?.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 最低価格 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                最低価格
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              />
            </div>

            {/* 最高価格 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                最高価格
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="99999"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              />
            </div>

            {/* 並び替え */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                並び替え
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-turquoise/20"
              >
                <option value="newest">新着順</option>
                <option value="price-asc">価格が安い順</option>
                <option value="price-desc">価格が高い順</option>
                <option value="popular">人気順</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 検索結果の表示 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {isLoading ? (
            "読み込み中..."
          ) : (
            <>
              <span className="font-semibold">{result?.totalCount || 0}</span> 件の商品
            </>
          )}
        </p>
      </div>

      {/* 商品グリッド */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : result && result.items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              description={item.description}
              imageUrl={item.imageUrl}
              rating={item.rating}
              stock={item.stock}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 py-16">
          <div className="text-6xl">🔍</div>
          <p className="text-lg font-semibold text-slate-700">
            商品が見つかりませんでした
          </p>
          <p className="text-sm text-slate-600">
            別のキーワードやフィルターをお試しください
          </p>
        </div>
      )}
    </div>
  );
}
