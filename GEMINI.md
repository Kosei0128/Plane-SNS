# Plane SNS (shark-sns-clone) 完全セットアップガイド

## 1. プロジェクト概要

このプロジェクトは、Next.jsとSupabaseを主軸に構築された、SNS機能を持つECサイトです。ユーザーはアカウントを作成し、商品を閲覧・購入できます。クレジット残高の概念があり、PayPayでのチャージや商品購入が可能です。

- **プロジェクト名**: `shark-sns-clone`
- **目的**: 高機能なECサイトの構築と運用

## 2. 技術スタック

- **フレームワーク**: Next.js
- **バックエンド & データベース**: Supabase
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Radix UI / shadcn/ui
- **状態管理**: Zustand
- **認証**: Supabase Auth

## 3. 環境構築 (ローカル)

### 3.1. 前提条件

- [Node.js](https://nodejs.org/) (v20.x 以上を推奨)
- [npm](https://www.npmjs.com/) (Node.jsに同梱)
- [Supabase](https://supabase.com/) のアカウント

### 3.2. プロジェクトのセットアップ

1.  **リポジトリをクローンします。**

    ```bash
    git clone https://github.com/Kosei0128/Plane-SNS.git
    ```

2.  **プロジェクトディレクトリに移動します。**

    ```bash
    cd Plane-SNS
    ```

3.  **依存関係をインストールします。**
    ```bash
    npm install
    ```

### 3.3. 環境変数の設定

1.  Supabaseプロジェクトを新規作成または既存のプロジェクトにアクセスします。
2.  プロジェクトの **Settings > API** に移動します。
3.  `Project URL` と `Project API keys` にある `anon (public)` キーをコピーします。
4.  プロジェクトのルートにある `.env.example` ファイルをコピーして、`.env.local` という名前のファイルを作成します。
5.  `.env.local` ファイルを以下のように編集します。

    ```env
    NEXT_PUBLIC_SUPABASE_URL=ここにSupabaseのProject URLを貼り付け
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ここにSupabaseのanon (public)キーを貼り付け
    ```

## 4. Supabase データベース設定

Supabaseの管理画面にある **SQL Editor** を使って、以下の手順でデータベースを構築します。

---

### ステップA: (オプション) データベースの完全リセット

**目的**: データベースを完全に初期状態に戻したい場合のみ実行します。

**SQLエディタに貼り付けるコード:**

```sql
-- 警告: このスクリプトを実行すると、publicスキーマ内のすべてのテーブルとデータが削除されます。
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

### ステップB: マスタースキーマの適用

**目的**: データベースのテーブル、権限、基本的な機能をすべて構築します。

**SQLエディタに貼り付けるコード:**

```sql
-- ====================================================================
-- Plane SNS Master Schema
-- This single file sets up the entire database from scratch.
-- ====================================================================

-- ====================================================================
-- Part 1: Core Tables
-- ====================================================================

-- User Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credit_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  rating REAL DEFAULT 4.5,
  stock INTEGER DEFAULT 0,
  category TEXT DEFAULT 'その他',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item History Table
CREATE TABLE public.item_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.profiles(id),
  change_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charge History Table
CREATE TABLE public.charge_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Purchased Accounts Table
CREATE TABLE public.purchased_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  account_info TEXT NOT NULL,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Balance Transactions Table
CREATE TABLE public.balance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 変動額。購入の場合は負の値。
  type TEXT NOT NULL CHECK (type IN ('charge', 'purchase', 'refund', 'admin_adjustment')), -- トランザクションの種類
  charge_id UUID REFERENCES public.charge_history(id) ON DELETE SET NULL, -- charge_historyとの関連
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- ordersとの関連
  description TEXT, -- 運営による調整の理由など
  balance_before INTEGER NOT NULL, -- この取引の前の残高
  balance_after INTEGER NOT NULL, -- この取引の後の残高
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- Part 2: Indexes
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_stock ON public.items(stock);
CREATE INDEX IF NOT EXISTS idx_item_history_item_id ON public.item_history(item_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_charge_history_user_id ON public.charge_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_accounts_order_id ON public.purchased_accounts(order_id);
CREATE INDEX IF NOT EXISTS idx_purchased_accounts_item_id_is_purchased ON public.purchased_accounts(item_id, is_purchased);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id_created_at ON public.balance_transactions(user_id, created_at DESC);


-- ====================================================================
-- Part 3: Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can manage their own profile.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Items: Anyone can view items.
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT TO public USING (true);

-- Orders: Users can manage their own orders.
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Users can view items in their own orders.
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Charge History: Users can view their own charge history.
CREATE POLICY "Users can view their own charge history" ON public.charge_history FOR SELECT USING (auth.uid() = user_id);

-- Purchased Accounts: Users can view accounts from their own orders.
CREATE POLICY "Users can view their own purchased accounts" ON public.purchased_accounts FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = purchased_accounts.order_id AND orders.user_id = auth.uid()));

-- Balance Transactions: Users can view their own transactions.
CREATE POLICY "Users can view their own balance transactions" ON public.balance_transactions FOR SELECT USING (auth.uid() = user_id);

-- Service Role Policies: Allow backend to bypass RLS for all tables.
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage items" ON public.items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage item history" ON public.item_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage order items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage charge history" ON public.charge_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage purchased accounts" ON public.purchased_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage balance transactions" ON public.balance_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ====================================================================
-- Part 4: Database Functions & Triggers
-- ====================================================================

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically update `updated_at` columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for `updated_at`
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Functions and Triggers for Automatic Stock Management

-- 1. Increment stock when a new account is added
CREATE OR REPLACE FUNCTION handle_new_account()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items SET stock = stock + 1 WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_account AFTER INSERT ON purchased_accounts FOR EACH ROW EXECUTE FUNCTION handle_new_account();

-- 2. Decrement stock when an account is marked as purchased
CREATE OR REPLACE FUNCTION handle_purchased_account()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_purchased = FALSE AND NEW.is_purchased = TRUE THEN
    UPDATE items SET stock = stock - 1 WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_account_purchase AFTER UPDATE ON purchased_accounts FOR EACH ROW EXECUTE FUNCTION handle_purchased_account();

-- 3. Decrement stock when an unsold account is deleted
CREATE OR REPLACE FUNCTION handle_deleted_account()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_purchased = FALSE THEN
    UPDATE items SET stock = stock - 1 WHERE id = OLD.item_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_account_delete AFTER DELETE ON purchased_accounts FOR EACH ROW EXECUTE FUNCTION handle_deleted_account();


-- ====================================================================
-- Part 5: Initial Data Seeding
-- ====================================================================

INSERT INTO public.items (id, title, price, description, image_url, rating, stock, category) VALUES
  ('d4937a29-3cbe-4547-abba-37d05d217eee', 'Twitter プレミアムアカウント', 2500, 'フォロワー1000人以上、認証済みのTwitterプレミアムアカウント。即日利用可能です。', 'https://images.unsplash.com/photo-1611605698335-8b1569810432', 4.9, 0, 'SNSアカウント'),
  ('a2d1f7d8-2e9b-4a1c-9b0a-1e8d7f6c5b3a', 'Instagram ビジネスアカウント', 3800, 'フォロワー5000人以上、ビジネスアカウント設定済み。マーケティングに最適。', 'https://images.unsplash.com/photo-1611262588024-d12430b98920', 4.8, 0, 'SNSアカウント'),
  ('b3e4c6a8-9d2e-4f1a-b0e3-2e1d8f7c6a5b', '【テスト用】1円アイテム', 1, '動作確認用のテストアイテムです。実際に購入できます。', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da', 5.0, 0, 'テスト'),
  ('c1f5d8b0-8e3d-4c2a-a1b4-3e2d9f8b7a6c', '【テスト用】10円アイテム', 10, '動作確認用のテストアイテムです。実際に購入できます。', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 5.0, 0, 'テスト')
ON CONFLICT (id) DO NOTHING;

-- Note: `stock`は0で初期化されます。在庫は`purchased_accounts`テーブルにデータを追加すると自動で増えます。
```

---

### ステップC: (オプション) 分析関数の追加

**目的**: 売上分析などに使用する便利な関数をデータベースに追加します。

**SQLエディタに貼り付けるコード:**

```sql
-- Function to get top selling items
CREATE OR REPLACE FUNCTION get_top_selling_items(limit_count INT)
RETURNS TABLE (
  item_id UUID,
  title TEXT,
  total_quantity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.item_id,
    i.title,
    SUM(oi.quantity) AS total_quantity
  FROM
    order_items AS oi
  JOIN
    items AS i ON oi.item_id = i.id
  GROUP BY
    oi.item_id,
    i.title
  ORDER BY
    total_quantity DESC
  LIMIT
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily sales for the last N days
CREATE OR REPLACE FUNCTION get_daily_sales(days_count INT)
RETURNS TABLE (
  sale_date DATE,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(o.created_at) AS sale_date,
    SUM(o.total_amount) AS total_revenue
  FROM
    orders AS o
  WHERE
    o.created_at >= NOW() - (days_count || ' days')::INTERVAL
  GROUP BY
    sale_date
  ORDER BY
    sale_date ASC;
END;
$$ LANGUAGE plpgsql;
```

## 5. アプリケーションの実行

1.  **開発サーバーを起動します。**
    ```bash
    npm run dev
    ```
2.  ブラウザで `http://localhost:3000` を開きます。サイトが表示されれば成功です。

## 6. その他のユーティリティ

### `get_paypay_tokens.py`

PayPay連携に必要なトークンを取得するためのPythonスクリプトです。使用方法はスクリプト内のコメントを参照してください。

### トランザクションデータの削除 (`sql/01_truncate_data.sql`)

ユーザー情報や商品マスターは残したまま、注文履歴や残高履歴などのトランザクションデータのみを削除したい場合に使用します。デバッグやテストの際に便利です。

## 7. プロジェクト構造の概要

- **/app**: Next.jsのApp Router。各ページとAPIエンドポイントが含まれます。
- **/components**: Reactコンポーネント。
- **/lib**: SupabaseクライアントやPayPay連携など、各種ヘルパー関数。
- **/sql**: このプロジェクトのデータベースを構築・管理するためのSQLファイル群。
- **/styles**: グローバルなCSSファイル。
