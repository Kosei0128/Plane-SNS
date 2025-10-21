"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ItemCard } from "./ItemCard";
import type { Item } from "@/app/api/items/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const hasActiveFilters =
    searchQuery || selectedCategory || minPrice || maxPrice || sortBy !== "newest";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品を検索..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              フィルター
            </Button>
          </div>
        </CardContent>
      </Card>

      {showFilters && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>絞り込み</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                クリア
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="category">カテゴリ</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">すべて</SelectItem>
                    {result?.categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="minPrice">最低価格</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="maxPrice">最高価格</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="99999"
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="sortBy">並び替え</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="新着順" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">新着順</SelectItem>
                    <SelectItem value="price-asc">価格が安い順</SelectItem>
                    <SelectItem value="price-desc">価格が高い順</SelectItem>
                    <SelectItem value="popular">人気順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "読み込み中..." : <>{result?.totalCount || 0} 件の商品</>}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
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
              image_url={item.image_url}
              rating={item.rating}
              stock={item.stock}
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="text-6xl">🔍</div>
          <p className="text-lg font-semibold">商品が見つかりませんでした</p>
          <p className="text-sm text-muted-foreground">
            別のキーワードやフィルターをお試しください
          </p>
        </Card>
      )}
    </div>
  );
}
