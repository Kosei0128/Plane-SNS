/**
 * API共通の型定義
 * フロントエンドとバックエンドで共有される型を定義します
 */

// ============================================
// 共通レスポンス型
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// 商品関連の型
// ============================================

export interface Item {
  id: string;
  title: string;
  price: number;
  description: string;
  image_url: string;
  rating: number;
  stock: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemCreateInput {
  title: string;
  price: number;
  description: string;
  imageUrl?: string;
  rating?: number;
  category?: string;
}

export interface ItemUpdateInput extends Partial<ItemCreateInput> {
  id: string;
}

// ============================================
// 注文関連の型
// ============================================

export interface OrderItem {
  itemId: string;
  itemTitle: string;
  price: number;
  quantity: number;
  accountInfo?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  purchasedItems: {
    itemTitle: string;
    accountInfo: string;
  }[];
  message: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  items: {
    id: string;
    itemId: string;
    title: string;
    imageUrl: string;
    quantity: number;
    price: number;
    accounts: string[];
  }[];
}

// ============================================
// ユーザー関連の型
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credit_balance: number;
  created_at: string;
  updated_at: string;
}

export interface BalanceTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "charge" | "purchase" | "refund" | "admin_adjustment";
  charge_id?: string;
  order_id?: string;
  description?: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

// ============================================
// チャージ関連の型
// ============================================

export interface ChargeRequest {
  amount: number;
  paymentUrl: string;
  passcode?: string;
}

export interface ChargeResponse {
  success: boolean;
  transactionId?: string;
  linkInfo?: {
    amount: number;
    orderId: string;
    chatRoomId: string;
  };
  balance?: {
    credit_balance: number;
    paypay_balance: number;
  };
  message?: string;
}

// ============================================
// 検索関連の型
// ============================================

export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular";
}

export interface SearchResponse {
  items: Item[];
  totalCount: number;
  categories: string[];
  appliedFilters: SearchParams;
}

// ============================================
// エラー型
// ============================================

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  statusCode?: number;
}

// ============================================
// バリデーションエラー型
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse extends ApiError {
  errors: ValidationError[];
}
