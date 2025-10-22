/**
 * Zodを使用したバリデーションスキーマ
 * すべてのAPIエンドポイントで使用される入力バリデーションを定義します
 */

import { z } from "zod";
import {
  MAX_CART_QUANTITY,
  MIN_CART_QUANTITY,
  MAX_ORDER_AMOUNT,
  MIN_CHARGE_AMOUNT,
  MAX_CHARGE_AMOUNT,
} from "@/lib/constants";

// ============================================
// 商品関連のスキーマ
// ============================================

export const itemCreateSchema = z.object({
  title: z.string().min(1, "商品名は必須です").max(200, "商品名は200文字以内で入力してください"),
  price: z.number().int("価格は整数で入力してください").min(0, "価格は0以上で入力してください"),
  description: z
    .string()
    .min(1, "商品説明は必須です")
    .max(2000, "商品説明は2000文字以内で入力してください"),
  imageUrl: z.string().url("画像URLの形式が正しくありません").optional(),
  rating: z.number().min(0, "評価は0以上で入力してください").max(5, "評価は5以下で入力してください").optional(),
  category: z.string().max(50, "カテゴリーは50文字以内で入力してください").optional(),
});

export const itemUpdateSchema = z.object({
  id: z.string().uuid("商品IDの形式が正しくありません"),
  title: z.string().min(1).max(200).optional(),
  price: z.number().int().min(0).optional(),
  description: z.string().min(1).max(2000).optional(),
  imageUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  category: z.string().max(50).optional(),
});

export const itemIdSchema = z.object({
  id: z.string().uuid("商品IDの形式が正しくありません"),
});

// ============================================
// 注文関連のスキーマ
// ============================================

export const orderItemSchema = z.object({
  itemId: z.string().uuid("商品IDの形式が正しくありません"),
  itemTitle: z.string().min(1, "商品名は必須です"),
  price: z.number().int("価格は整数で入力してください").min(0, "価格は0以上で入力してください"),
  quantity: z
    .number()
    .int("数量は整数で入力してください")
    .min(MIN_CART_QUANTITY, `数量は${MIN_CART_QUANTITY}以上で入力してください`)
    .max(MAX_CART_QUANTITY, `数量は${MAX_CART_QUANTITY}以下で入力してください`),
  accountInfo: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "注文には少なくとも1つの商品が必要です")
    .max(100, "一度に注文できる商品は100個までです"),
  totalAmount: z
    .number()
    .int("合計金額は整数で入力してください")
    .min(1, "合計金額は1円以上で入力してください")
    .max(MAX_ORDER_AMOUNT, `合計金額は${MAX_ORDER_AMOUNT.toLocaleString()}円以下で入力してください`),
});

// ============================================
// チャージ関連のスキーマ
// ============================================

export const chargeSchema = z.object({
  amount: z
    .number()
    .int("チャージ金額は整数で入力してください")
    .min(MIN_CHARGE_AMOUNT, `チャージ金額は${MIN_CHARGE_AMOUNT}円以上で入力してください`)
    .max(MAX_CHARGE_AMOUNT, `チャージ金額は${MAX_CHARGE_AMOUNT.toLocaleString()}円以下で入力してください`),
  paymentUrl: z
    .string()
    .min(1, "決済リンクを入力してください")
    .url("決済リンクの形式が正しくありません")
    .refine(
      (url) =>
        url.includes("pay.paypay.ne.jp") || url.includes("paypay.ne.jp") || url.includes("qr.paypay.ne.jp"),
      {
        message: "有効なPayPayリンクを入力してください",
      }
    ),
  passcode: z.string().max(20, "パスコードは20文字以内で入力してください").optional(),
});

// ============================================
// 検索関連のスキーマ
// ============================================

export const searchSchema = z.object({
  q: z.string().max(200, "検索キーワードは200文字以内で入力してください").optional(),
  category: z.string().max(50, "カテゴリーは50文字以内で入力してください").optional(),
  minPrice: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(0).optional())
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(0).optional())
    .optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
});

// ============================================
// 認証関連のスキーマ
// ============================================

export const adminLoginSchema = z.object({
  username: z.string().min(1, "ユーザー名を入力してください").max(50, "ユーザー名は50文字以内で入力してください"),
  password: z.string().min(1, "パスワードを入力してください").max(100, "パスワードは100文字以内で入力してください"),
});

// ============================================
// ページネーション関連のスキーマ
// ============================================

export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "ページ番号は1以上で入力してください"))
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100, "1ページあたりの表示件数は100件までです"))
    .optional()
    .default("20"),
});

// ============================================
// ヘルパー関数
// ============================================

/**
 * Zodスキーマを使用してデータを検証します
 * 
 * @param schema Zodスキーマ
 * @param data 検証するデータ
 * @returns 検証結果
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);

  return { success: false, errors };
}

