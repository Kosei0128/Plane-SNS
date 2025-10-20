-- ====================================================================
-- Plane SNS Master Schema
-- This single file sets up the entire database from scratch.
-- It will DROP existing tables to ensure a clean setup.
-- Run this in the Supabase SQL Editor.
-- ====================================================================

-- ====================================================================
-- Part 0: Drop Existing Tables
-- ====================================================================
DROP TABLE IF EXISTS public.balance_transactions CASCADE;
DROP TABLE IF EXISTS public.purchased_accounts CASCADE;
DROP TABLE IF EXISTS public.charge_history CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.item_history CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


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
-- Part 2: Indexes (from all files)
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
-- Part 3: Row Level Security (RLS) Policies (from all files)
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
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Items: Anyone can view items.
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT TO public USING (true);

-- Orders: Users can manage their own orders.
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Users can view items in their own orders.
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Charge History: Users can view their own charge history.
DROP POLICY IF EXISTS "Users can view their own charge history" ON public.charge_history;
CREATE POLICY "Users can view their own charge history" ON public.charge_history FOR SELECT USING (auth.uid() = user_id);

-- Purchased Accounts: Users can view accounts from their own orders.
DROP POLICY IF EXISTS "Users can view their own purchased accounts" ON public.purchased_accounts;
CREATE POLICY "Users can view their own purchased accounts" ON public.purchased_accounts FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = purchased_accounts.order_id AND orders.user_id = auth.uid()));

-- Balance Transactions: Users can view their own transactions.
DROP POLICY IF EXISTS "Users can view their own balance transactions" ON public.balance_transactions;
CREATE POLICY "Users can view their own balance transactions" ON public.balance_transactions FOR SELECT USING (auth.uid() = user_id);

-- Service Role Policies: Allow backend to bypass RLS for all tables.
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage items" ON public.items;
CREATE POLICY "Service role can manage items" ON public.items FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage item history" ON public.item_history;
CREATE POLICY "Service role can manage item history" ON public.item_history FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
CREATE POLICY "Service role can manage orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage order items" ON public.order_items;
CREATE POLICY "Service role can manage order items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage charge history" ON public.charge_history;
CREATE POLICY "Service role can manage charge history" ON public.charge_history FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage purchased accounts" ON public.purchased_accounts;
CREATE POLICY "Service role can manage purchased accounts" ON public.purchased_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role can manage balance transactions" ON public.balance_transactions;
CREATE POLICY "Service role can manage balance transactions" ON public.balance_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ====================================================================
-- Part 4: Database Functions & Triggers (from all files)
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Functions and Triggers for Automatic Stock Management (from supabase-triggers.sql)

-- 1. Increment stock when a new account is added
CREATE OR REPLACE FUNCTION handle_new_account()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items SET stock = stock + 1 WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_account ON purchased_accounts;
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

DROP TRIGGER IF EXISTS on_account_purchase ON purchased_accounts;
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

DROP TRIGGER IF EXISTS on_account_delete ON purchased_accounts;
CREATE TRIGGER on_account_delete AFTER DELETE ON purchased_accounts FOR EACH ROW EXECUTE FUNCTION handle_deleted_account();


-- ====================================================================
-- Part 5: Initial Data Seeding (from supabase-additional.sql)
-- ====================================================================

INSERT INTO public.items (id, title, price, description, image_url, rating, stock, category) VALUES
  ('d4937a29-3cbe-4547-abba-37d05d217eee', 'Twitter プレミアムアカウント', 2500, 'フォロワー1000人以上、認証済みのTwitterプレミアムアカウント。即日利用可能です。', 'https://images.unsplash.com/photo-1611605698335-8b1569810432', 4.9, 0, 'SNSアカウント'),
  ('a2d1f7d8-2e9b-4a1c-9b0a-1e8d7f6c5b3a', 'Instagram ビジネスアカウント', 3800, 'フォロワー5000人以上、ビジネスアカウント設定済み。マーケティングに最適。', 'https://images.unsplash.com/photo-1611262588024-d12430b98920', 4.8, 0, 'SNSアカウント'),
  ('b3e4c6a8-9d2e-4f1a-b0e3-2e1d8f7c6a5b', '【テスト用】1円アイテム', 1, '動作確認用のテストアイテムです。実際に購入できます。', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da', 5.0, 0, 'テスト'),
  ('c1f5d8b0-8e3d-4c2a-a1b4-3e2d9f8b7a6c', '【テスト用】10円アイテム', 10, '動作確認用のテストアイテムです。実際に購入できます。', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 5.0, 0, 'テスト')
ON CONFLICT (id) DO NOTHING;

-- Note: The `stock` column is seeded with 0 because the triggers will automatically update it
-- as you add accounts to the `purchased_accounts` table.

-- ====================================================================
-- End of Master Schema
-- ====================================================================