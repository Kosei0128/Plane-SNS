# 🛫 Plane SNS - 完全セットアップガイド# 🦈 Shark Market - セットアップガイド



**SNSアカウント販売マーケットプレイス**このガイドでは、Supabase と Google reCAPTCHA を使用した認証機能を設定する手順を説明します。



------



## 📋 目次## 📋 前提条件

1. [プロジェクト概要](#プロジェクト概要)

2. [現在の実装状況](#現在の実装状況)- Node.js 18以上がインストール済み

3. [必須: Supabaseセットアップ](#必須-supabaseセットアップ)- Supabase アカウント (無料プランでOK)

4. [在庫管理の使い方](#在庫管理の使い方)- Google アカウント (reCAPTCHA用)

5. [管理画面の使い方](#管理画面の使い方)

6. [今後の実装が必要な機能](#今後の実装が必要な機能)---



---## 1️⃣ Supabase プロジェクトのセットアップ



## 🎯 プロジェクト概要### ステップ1: プロジェクト作成



### これは何？1. [Supabase ダッシュボード](https://app.supabase.com) にアクセス

TwitterやInstagramなどのSNSアカウントを販売するマーケットプレイスです。2. "New project" をクリック

3. プロジェクト名を入力 (例: `shark-market`)

### 主な機能4. データベースパスワードを設定 (安全な場所に保存)

- ✅ ユーザー登録・ログイン（Google OAuth + メール）5. リージョンを選択 (日本の場合は `Northeast Asia (Tokyo)`)

- ✅ 商品一覧・検索6. "Create new project" をクリック

- ✅ カート・購入フロー

- ✅ 管理画面（商品管理・ユーザー管理・在庫管理）### ステップ2: データベースの初期化

- ✅ ファイルベースの在庫システム

- 🚧 残高管理（実装済み、DB設定が必要）1. 左サイドバーから "SQL Editor" を選択

- ❌ PayPay決済（未実装）2. "New query" をクリック

3. プロジェクトルートにある `supabase-setup.sql` の内容をコピー&ペースト

### 技術スタック4. "Run" をクリックして実行

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS

- **認証**: Supabase Authこれにより以下のテーブルが作成されます:

- **データベース**: Supabase (PostgreSQL)- `profiles` - ユーザープロフィール

- **状態管理**: Zustand- `items` - 商品情報

- **決済**: PayPay (予定)- `item_history` - 商品編集履歴

- `orders` - 注文情報

---- `order_items` - 注文詳細

- `charge_history` - クレジットチャージ履歴

## ✅ 現在の実装状況

### ステップ3: API キーの取得

### 完成している機能

1. 左サイドバーから "Project Settings" → "API" を選択

#### 1. 認証システム 🟢2. 以下の情報をコピー:

- ✅ Googleログイン   - **Project URL**: `https://xxx.supabase.co`

- ✅ メール/パスワードログイン   - **anon public**: `eyJhbG...` (公開用キー)

- ✅ 新規登録   - **service_role**: `eyJhbG...` (管理者用キー、絶対に公開しないこと!)

- ✅ パスワードリセット

- ✅ reCAPTCHA保護### ステップ4: Google OAuth の設定



**使える状態**: はい（Supabase設定が必要）1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス

2. 新しいプロジェクトを作成 (または既存のプロジェクトを選択)

#### 2. 商品管理システム 🟢3. "APIs & Services" → "Credentials" に移動

- ✅ 商品一覧表示4. "Create Credentials" → "OAuth 2.0 Client ID" をクリック

- ✅ 検索・ソート機能5. アプリケーションタイプ: "Web application" を選択

- ✅ カート追加6. 認証済みリダイレクト URI に追加:

- ✅ 管理画面での商品編集   ```

- ✅ 在庫追加・削除機能   https://xxx.supabase.co/auth/v1/callback

   ```

**使える状態**: はい（データはメモリ管理、再起動でリセット）   (xxx を自分のプロジェクトIDに置き換え)

7. "Create" をクリックし、Client ID と Client Secret をコピー

#### 3. 在庫管理システム 🟢

- ✅ `.txt`ファイルベースの在庫管理8. Supabase に戻り、"Authentication" → "Providers" → "Google" を選択

- ✅ 1行 = 1アカウント9. "Enable" をオンにする

- ✅ 購入時に自動で在庫消費10. Google Cloud Console でコピーした Client ID と Client Secret を入力

- ✅ 管理画面での在庫確認・テスト購入11. "Save" をクリック

- ✅ DB在庫数との同期機能

---

**使える状態**: はい（完全動作）

## 2️⃣ Google reCAPTCHA のセットアップ

#### 4. 購入フロー 🟢

- ✅ カートに商品追加### ステップ1: reCAPTCHA サイトの登録

- ✅ 購入処理

- ✅ 購入完了モーダルでアカウント情報表示1. [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) にアクセス

- ✅ クリップボードコピー機能2. "+" ボタンをクリックして新しいサイトを登録

3. 以下の情報を入力:

**使える状態**: はい（在庫ファイルが必要）   - **ラベル**: `Shark Market` (任意の名前)

   - **reCAPTCHA タイプ**: `reCAPTCHA v2` の "I'm not a robot" Checkbox を選択

#### 5. 管理画面 🟢   - **ドメイン**: 

- ✅ 商品管理（追加・編集・削除）     - 開発環境: `localhost`

- ✅ 在庫管理（ファイルベース在庫の確認）     - 本番環境: `yourdomain.com` (実際のドメイン)

- ✅ ユーザー管理（一覧・残高編集）4. "送信" をクリック

- ✅ 履歴管理（商品変更履歴）

- ✅ ダッシュボード### ステップ2: キーの取得



**使える状態**: はい（管理者メールを設定済み: `kosei.jpg0128@gmail.com`）登録後、以下が表示されます:

- **サイトキー**: `6Lc...` (公開用、フロントエンドで使用)

#### 6. 残高システム 🟡- **シークレットキー**: `6Lc...` (サーバー側検証用、絶対に公開しないこと!)

- ✅ APIエンドポイント実装

- ✅ ヘッダーに残高表示---

- ✅ 管理画面での残高編集

- ❌ **データベーステーブル未作成**## 3️⃣ 環境変数の設定



**使える状態**: いいえ（Supabaseテーブル作成が必要）### ステップ1: .env.local ファイルの作成



### 未実装の機能プロジェクトルートに `.env.local` ファイルを作成し、以下を記入:



#### 1. PayPay決済 ❌```env

- ❌ チャージ処理# Supabase Configuration

- ❌ 決済確認NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co

- ❌ 残高反映NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

**実装必要度**: 中（手動で残高を管理画面から追加できる）

# reCAPTCHA Configuration

#### 2. 商品のDB永続化 ❌NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

- 現在: メモリ管理（再起動でリセット）RECAPTCHA_SECRET_KEY=6LcYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

- 必要: Supabaseに保存

# Admin Configuration (変更推奨!)

**実装必要度**: 高ADMIN_USERNAME=admin

ADMIN_PASSWORD=your-secure-password

#### 3. 注文履歴 ❌```

- ユーザーが購入した商品の履歴

- 購入したアカウント情報の再表示⚠️ **重要**: `.env.local` は `.gitignore` に含まれています。Git にコミットしないでください!



**実装必要度**: 高### ステップ2: 環境変数の確認



---以下のコマンドで開発サーバーを再起動:



## 🚀 必須: Supabaseセットアップ```bash

npm run dev

### ステップ1: Supabaseプロジェクト作成```



1. https://supabase.com にアクセスブラウザで http://localhost:3000/auth/signup にアクセスし、登録フォームが表示されることを確認してください。

2. 「Start your project」をクリック

3. プロジェクト名を入力（例: plane-sns）---

4. データベースパスワードを設定（安全な場所に保存！）

5. リージョンを選択（Japan推奨）## 4️⃣ データベース移行 (In-Memory → Supabase)

6. 「Create new project」をクリック

現在、商品データは `lib/db/items.ts` のメモリ内配列に保存されています。Supabase に移行するには:

### ステップ2: データベーステーブル作成

### オプション1: 手動で商品を追加

プロジェクトが作成されたら:

1. Supabase ダッシュボードの "Table Editor" を開く

1. 左サイドバーの「SQL Editor」をクリック2. `items` テーブルを選択

2. 「New query」をクリック3. "Insert row" で商品を追加

3. 以下のSQLを**順番に**実行:

### オプション2: ItemDB クラスの移行

#### 2-1. 残高管理テーブル（最優先）

`lib/db/items.ts` を以下のように書き換え (今後のタスク):

```sql

-- ユーザー残高テーブル```typescript

CREATE TABLE IF NOT EXISTS user_balances (import { supabase } from "@/lib/supabase/client";

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,export class ItemDB {

  balance BIGINT NOT NULL DEFAULT 0,  static async getAll() {

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),    const { data, error } = await supabase

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),      .from("items")

  UNIQUE(user_id)      .select("*")

);      .eq("is_available", true)

      .order("created_at", { ascending: false });

-- 残高履歴テーブル    

CREATE TABLE IF NOT EXISTS balance_transactions (    if (error) throw error;

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    return data;

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  }

  amount BIGINT NOT NULL,  

  type TEXT NOT NULL CHECK (type IN ('charge', 'purchase', 'admin_adjust', 'refund')),  // ... 他のメソッドも Supabase クエリに書き換え

  description TEXT,}

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()```

);

---

-- インデックス

CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);## 5️⃣ 認証フローのテスト

CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);### 新規登録のテスト



-- 残高更新時にupdated_atを自動更新1. http://localhost:3000/auth/signup にアクセス

CREATE OR REPLACE FUNCTION update_updated_at_column()2. "Googleでログイン" または "メールアドレス" で登録

RETURNS TRIGGER AS $$3. reCAPTCHA チェックボックスをクリック

BEGIN4. "新規登録" をクリック

  NEW.updated_at = NOW();5. メール確認リンクをクリック (Supabase の設定で自動確認も可能)

  RETURN NEW;

END;### ログインのテスト

$$ language 'plpgsql';

1. http://localhost:3000/auth/login にアクセス

CREATE TRIGGER update_user_balances_updated_at 2. 登録したメールアドレスとパスワードでログイン

  BEFORE UPDATE ON user_balances 3. トップページにリダイレクトされることを確認

  FOR EACH ROW 

  EXECUTE FUNCTION update_updated_at_column();---



-- RLS (Row Level Security) ポリシー## 6️⃣ トラブルシューティング

ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;### reCAPTCHA が表示されない



-- ユーザーは自分の残高のみ参照可能- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` が正しく設定されているか確認

CREATE POLICY "Users can view their own balance"- 開発サーバーを再起動 (`Ctrl+C` → `npm run dev`)

  ON user_balances FOR SELECT- ブラウザのコンソールでエラーを確認

  USING (auth.uid() = user_id);

### Google ログインが失敗する

-- ユーザーは自分の取引履歴のみ参照可能

CREATE POLICY "Users can view their own transactions"- Supabase の Google Provider 設定を確認

  ON balance_transactions FOR SELECT- リダイレクト URI が正しいか確認:

  USING (auth.uid() = user_id);  ```

```  https://your-project.supabase.co/auth/v1/callback

  ```

4. 「Run」ボタンをクリック- Google Cloud Console で OAuth 同意画面の設定を確認

5. 成功メッセージを確認

### メール確認リンクが届かない

### ステップ3: 環境変数の確認

- Supabase の "Authentication" → "Email Templates" で確認

`.env.local` ファイルに以下が設定されているか確認:- 開発環境では Supabase の "Email" タブでメール内容を確認可能

- 本番環境では SMTP 設定が必要

```env

# Supabase### データベース接続エラー

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key- `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key- Supabase プロジェクトが起動しているか確認 (ダッシュボードでステータスを確認)

- Row Level Security (RLS) が有効で、適切なポリシーが設定されているか確認

# 管理者メール

NEXT_PUBLIC_ADMIN_EMAILS=kosei.jpg0128@gmail.com---



# reCAPTCHA## 🎉 次のステップ

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key

```セットアップが完了したら、以下の機能を実装できます:



**取得方法**:1. **商品検索・フィルター機能** - カテゴリ、価格帯、キーワード検索

1. Supabaseダッシュボード → Settings → API2. **編集履歴の表示** - `item_history` テーブルを使用

2. `URL`をコピー → `NEXT_PUBLIC_SUPABASE_URL`3. **注文機能の実装** - カートから注文を確定

3. `anon public`キーをコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`4. **クレジットチャージ** - PayPythOn Mobile API 連携

4. `service_role`キーをコピー → `SUPABASE_SERVICE_ROLE_KEY`5. **管理画面の拡張** - 注文管理、ユーザー管理



### ステップ4: Google OAuth設定（オプション）詳細は `README.md` と `DATABASE.md` を参照してください。



1. Supabaseダッシュボード → Authentication → Providers---

2. Googleを有効化

3. Google Cloud ConsoleでOAuth認証情報を作成## 📚 参考リンク

4. クライアントIDとシークレットを設定

- [Supabase Documentation](https://supabase.com/docs)

### ステップ5: 動作確認- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)

```bash- [Next.js App Router](https://nextjs.org/docs/app)

npm run dev

```---



1. http://localhost:3000 にアクセス## 🔒 セキュリティ注意事項

2. 新規登録・ログインを試す

3. 管理画面 (`/admin`) にログイン- `.env.local` は絶対に Git にコミットしない

   - Email: `kosei.jpg0128@gmail.com`- `SUPABASE_SERVICE_ROLE_KEY` と `RECAPTCHA_SECRET_KEY` はサーバーサイドでのみ使用

   - Password: 設定したパスワード- 本番環境では強力な admin パスワードを設定

4. ユーザー管理画面で自分の残高を追加- Row Level Security (RLS) を必ず有効にする

5. ホームページをリロードして残高が表示されることを確認- HTTPS を使用する (本番環境)



------



## 📦 在庫管理の使い方問題が解決しない場合は、GitHub Issues でお気軽にお問い合わせください!


### 在庫の仕組み

Plane SNSでは2種類の在庫があります:

1. **表示用在庫数**（データベース）
   - 商品一覧に表示される数字
   - 管理画面から簡単に変更可能

2. **実際の在庫**（`.txt`ファイル）
   - 購入時に配信される実際のアカウント情報
   - `inventory/` フォルダ内のテキストファイル

### 在庫追加の手順

#### ステップ1: 商品IDを確認

管理画面 (`/admin/items`) で商品のIDを確認します。

例:
- `twitter-premium-1`
- `instagram-business-1`

#### ステップ2: 在庫ファイルを作成

プロジェクトルートの `inventory/` フォルダ内に、商品IDと同じ名前の`.txt`ファイルを作成:

```
inventory/
  ├── twitter-premium-1.txt
  ├── instagram-business-1.txt
  └── sample-item.txt
```

#### ステップ3: アカウント情報を記入

ファイル内に、**1行につき1アカウント**の情報を記載:

```txt
username1:password123:email1@example.com
username2:password456:email2@example.com
username3:password789:email3@example.com
```

**重要:**
- 形式は自由（カンマ区切り、タブ区切りも可）
- 空行は自動スキップ
- 購入時に上から順番に取得される

#### ステップ4: データベース在庫数を同期

##### 方法A: 在庫管理画面で自動同期

1. `/admin/inventory` にアクセス
2. 商品IDを入力（例: `twitter-premium-1`）
3. 「DBに同期」ボタンをクリック
4. ファイルの行数が自動的にDBに反映

##### 方法B: 商品管理で手動設定

1. `/admin/items` にアクセス
2. 該当商品の在庫操作ボタンを使用:
   - **+追加**: 指定数追加
   - **-削除**: 指定数削除
   - **=設定**: 在庫数を直接設定

### テスト購入

1. `/admin/inventory` にアクセス
2. 商品IDを入力
3. 「在庫数を確認」で在庫があることを確認
4. 「テスト購入（1件取得）」で動作確認

---

## 🎮 管理画面の使い方

### アクセス方法

1. 管理者メールでログイン（`kosei.jpg0128@gmail.com`）
2. ヘッダーに「🔧 管理」ボタンが表示される
3. クリックでダッシュボードへ

### ダッシュボード (`/admin/dashboard`)

- 全体の統計表示
- 各管理ページへのクイックリンク

### 商品管理 (`/admin/items`)

#### 商品の追加
1. 「新規追加」ボタンをクリック
2. 商品情報を入力
3. 「作成」をクリック

#### 商品の編集
1. 商品カードの「編集」ボタンをクリック
2. 情報を修正
3. 「保存」をクリック

#### 在庫の管理
- **+追加**: プロンプトで数量を入力
- **-削除**: プロンプトで数量を入力
- **=設定**: プロンプトで在庫数を直接入力

すべての操作は即座にデータベースに反映されます。

### ユーザー管理 (`/admin/users`)

#### 残高の編集
1. ユーザー行の「編集」ボタンをクリック
2. 新しい残高を入力
3. 「保存」をクリック

**注意**: 残高はSupabaseテーブルに保存されます。

### 在庫管理 (`/admin/inventory`)

#### 在庫確認
1. 商品IDを入力
2. 「在庫数を確認」をクリック
3. ファイル内の行数が表示される

#### テスト購入
1. 商品IDを入力
2. 「テスト購入（1件取得）」をクリック
3. 1行目のアカウント情報が表示される
4. ファイルから削除され、DB在庫も-1される

#### DB同期
1. 商品IDを入力
2. 「DBに同期」をクリック
3. ファイルの行数がDB在庫数に反映される

---

## 📋 今後の実装が必要な機能

### 優先度: 高 🔴

#### 1. 商品のDB永続化
**現状**: メモリ管理（サーバー再起動でリセット）
**必要**: Supabaseの`items`テーブルに保存

**実装手順**:
1. SQL Editorで商品テーブル作成
2. `lib/db/items.ts`をSupabase連携に書き換え
3. `/api/items`をSupabase経由に変更

#### 2. 注文履歴機能
**現状**: 購入後に情報が再表示できない
**必要**: 購入履歴をDBに保存

**必要なテーブル**:
- `orders`（注文情報）
- `order_items`（注文明細）
- `purchased_accounts`（配信済みアカウント情報）

**実装内容**:
- マイページで注文履歴表示
- 購入したアカウント情報の再表示
- 領収書発行

#### 3. 実際の決済機能
**現状**: 管理画面から手動で残高追加
**必要**: PayPay/クレカ決済

**選択肢**:
- PayPay（既存のPython実装あり）
- Stripe（推奨）
- 銀行振込

### 優先度: 中 🟡

#### 4. 在庫切れ通知
- 在庫が一定数以下になったらメール通知
- 商品ページに「在庫わずか」バッジ

#### 5. レビュー機能
- 購入者が評価を投稿
- 商品ページにレビュー表示

#### 6. クーポン機能
- 割引コード発行
- キャンペーン管理

### 優先度: 低 🟢

#### 7. 販売レポート
- 日別・月別売上グラフ
- 人気商品ランキング
- ユーザー統計

#### 8. メール通知
- 購入完了メール
- アカウント情報送信
- 領収書メール

---

## 🐛 トラブルシューティング

### 残高が表示されない

**原因**: Supabaseテーブルが作成されていない

**解決方法**:
1. Supabase SQL Editorを開く
2. `supabase-balance.sql`の内容を実行
3. ページをリロード

### 購入時に「在庫ファイルが見つかりません」

**原因**: 在庫ファイルが存在しない、または名前が間違っている

**解決方法**:
1. `inventory/`フォルダを確認
2. ファイル名が商品IDと完全一致しているか確認
3. 拡張子が`.txt`になっているか確認

### 管理画面にアクセスできない

**原因**: 管理者メールリストに含まれていない

**解決方法**:
1. `.env.local`を開く
2. `NEXT_PUBLIC_ADMIN_EMAILS`に自分のメールを追加
3. カンマ区切りで複数指定可能
4. サーバーを再起動

### Google OAuth でログインできない

**原因**: Supabase設定が不完了

**解決方法**:
1. Supabaseダッシュボード → Authentication → Providers
2. Google OAuth設定を確認
3. リダイレクトURLを確認

---

## 📞 サポート

### ファイル構成

```
Plane SNS/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   ├── admin/             # 管理画面
│   ├── auth/              # 認証ページ
│   ├── cart/              # カートページ
│   └── charge/            # チャージページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ
│   ├── db/               # データベース（メモリ）
│   ├── supabase/         # Supabase設定
│   └── auth/             # 認証ヘルパー
├── inventory/            # 在庫ファイル格納フォルダ
├── .env.local            # 環境変数
├── supabase-balance.sql  # 残高テーブルSQL
└── SETUP.md              # このファイル
```

### 重要なファイル

- `.env.local` - 環境変数（API キーなど）
- `inventory/` - 在庫ファイル保存場所
- `supabase-balance.sql` - データベーステーブル定義

---

## ✅ クイックスタートチェックリスト

- [ ] Supabaseプロジェクト作成
- [ ] `supabase-balance.sql`を実行
- [ ] `.env.local`に環境変数を設定
- [ ] `npm install`でパッケージインストール
- [ ] `npm run dev`でサーバー起動
- [ ] 新規登録・ログイン動作確認
- [ ] 管理画面で自分の残高を追加
- [ ] `inventory/`フォルダに在庫ファイル作成
- [ ] テスト購入で動作確認

**すべて完了したら、本番運用開始可能です！** 🎉

---

最終更新: 2025年10月8日
