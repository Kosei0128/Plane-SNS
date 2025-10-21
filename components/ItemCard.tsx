"use client";

import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useNotificationStore } from "@/lib/notification-store";
import { useState } from "react";

export type ItemCardProps = {
  id: string;
  title: string;
  price: number;
  description: string;
  image_url: string;
  rating?: number;
  stock?: number;
};

export function ItemCard({
  id,
  title,
  price,
  description,
  image_url,
  rating = 4.8,
  stock = 0,
}: ItemCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({ id, title, price, image_url });
    addNotification({
      message: `${title} をカートに追加しました`,
      type: "success",
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <article
      className="group card-hover flex flex-col gap-3 rounded-3xl border-2 border-slate-200/80 bg-white/80 p-4 shadow-lg transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl dark:border-dark-border dark:bg-dark-surface/80 dark:backdrop-blur-sm"
      aria-labelledby={`item-${id}`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner dark:bg-dark-elevated">
        <Image
          src={image_url}
          alt={`${title} の商品画像`}
          fill
          className="object-cover transition duration-300 group-hover:scale-110 group-hover:rotate-1"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/50 to-transparent opacity-0 dark:opacity-100 transition-opacity" />
      </div>
      <header className="flex items-start justify-between gap-2">
        <h3
          id={`item-${id}`}
          className="text-lg font-bold tracking-tight text-brand-blue dark:text-slate-100 dark:drop-shadow-[0_0_8px_rgba(0,217,255,0.3)]"
        >
          {title}
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-2 py-1 text-xs font-bold text-white shadow-sm dark:from-dark-accent dark:to-dark-purple dark:shadow-glow-sm">
          <Star className="h-3 w-3 fill-current" aria-hidden />
          {rating.toFixed(1)}
        </span>
      </header>
      <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            stock > 10
              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/30"
              : stock > 0
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border dark:border-yellow-500/30"
                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/30"
          }`}
        >
          📦 在庫: {stock > 999 ? "999+" : stock}個
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xl font-bold text-brand-blue dark:text-transparent dark:bg-gradient-to-r dark:from-dark-accent dark:to-dark-purple dark:bg-clip-text">
          ¥{price.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || stock === 0}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-blue to-brand-turquoise px-4 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed dark:from-dark-accent dark:to-dark-purple dark:shadow-glow glow-animate"
        >
          <ShoppingCart className={`h-4 w-4 ${isAdding ? "animate-bounce" : ""}`} aria-hidden />
          {stock === 0 ? "在庫切れ" : isAdding ? "追加中..." : "カートに追加"}
        </button>
      </div>
    </article>
  );
}
