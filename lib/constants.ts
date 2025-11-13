/**
 * アプリケーション全体で使用する定数を定義します
 */

// ============================================
// デフォルト値
// ============================================

export const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop";

export const DEFAULT_RATING = 4.5;

export const DEFAULT_CATEGORY = "その他";

// ============================================
// 制限値
// ============================================

export const MAX_CART_QUANTITY = 99;

export const MIN_CART_QUANTITY = 1;

export const MAX_ORDER_AMOUNT = 1000000; // 100万円

export const MIN_CHARGE_AMOUNT = 1;

export const MAX_CHARGE_AMOUNT = 100000; // 10万円

// ============================================
// ページネーション
// ============================================

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

// ============================================
// セッション
// ============================================

export const SESSION_DURATION = "7d";

export const ADMIN_SESSION_COOKIE_NAME = "admin-session";

// ============================================
// レート制限
// ============================================

export const RATE_LIMIT = {
  // 一般的なAPIエンドポイント
  DEFAULT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15分
  },
  // 認証関連のエンドポイント
  AUTH: {
    MAX_REQUESTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15分
  },
  // 注文・決済関連のエンドポイント
  PAYMENT: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60 * 1000, // 1分
  },
};

// ============================================
// ステータス
// ============================================

export const ORDER_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const CHARGE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const TRANSACTION_TYPE = {
  CHARGE: "charge",
  PURCHASE: "purchase",
  REFUND: "refund",
  ADMIN_ADJUSTMENT: "admin_adjustment",
} as const;

// ============================================
// カテゴリー
// ============================================

export const CATEGORIES = ["ゲーム", "SNS", "動画配信", "音楽", "ビジネス", "その他"] as const;

// ============================================
// エラーメッセージ
// ============================================

export const ERROR_MESSAGES = {
  // 認証エラー
  AUTH_REQUIRED: "認証が必要です",
  INVALID_CREDENTIALS: "ユーザー名またはパスワードが正しくありません",
  SESSION_EXPIRED: "セッションの有効期限が切れました",
  PERMISSION_DENIED: "権限がありません",

  // バリデーションエラー
  INVALID_INPUT: "入力内容が不正です",
  REQUIRED_FIELD: "必須項目が入力されていません",
  INVALID_EMAIL: "メールアドレスの形式が正しくありません",
  INVALID_AMOUNT: "金額が不正です",

  // ビジネスロジックエラー
  INSUFFICIENT_BALANCE: "残高が不足しています",
  OUT_OF_STOCK: "在庫が不足しています",
  ORDER_NOT_FOUND: "注文が見つかりません",
  ITEM_NOT_FOUND: "商品が見つかりません",

  // サーバーエラー
  SERVER_ERROR: "サーバーエラーが発生しました",
  DATABASE_ERROR: "データベースエラーが発生しました",
  UNKNOWN_ERROR: "不明なエラーが発生しました",
} as const;

// ============================================
// 成功メッセージ
// ============================================

export const SUCCESS_MESSAGES = {
  ORDER_CREATED: "注文が完了しました",
  CHARGE_COMPLETED: "チャージが完了しました",
  ITEM_CREATED: "商品を作成しました",
  ITEM_UPDATED: "商品を更新しました",
  ITEM_DELETED: "商品を削除しました",
} as const;
