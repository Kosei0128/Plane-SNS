# Plane SNS - セットアップガイド

このドキュメントでは、Plane SNS ECサイトのセットアップ手順を詳しく説明します。

## 目次

1. [必要な環境](#必要な環境)
2. [Supabaseプロジェクトのセットアップ](#supabaseプロジェクトのセットアップ)
3. [環境変数の設定](#環境変数の設定)
4. [データベースのセットアップ](#データベースのセットアップ)
5. [アプリケーションの起動](#アプリケーションの起動)
6. [管理者アカウントの設定](#管理者アカウントの設定)
7. [PayPay統合の設定（オプション）](#paypay統合の設定オプション)
8. [トラブルシューティング](#トラブルシューティング)

## 必要な環境

- **Node.js**: v18.0.0以上
- **npm**: v9.0.0以上
- **Supabase**: アカウントとプロジェクト
- **Python**: v3.8以上（PayPay統合を使用する場合）

## Supabaseプロジェクトのセットアップ

### 1. Supabaseアカウントの作成

1. [Supabase](https://supabase.com/)にアクセスし、アカウントを作成します
2. 「New Project」をクリックして新しいプロジェクトを作成します
3. プロジェクト名、データベースパスワード、リージョンを設定します

### 2. APIキーの取得

1. Supabaseダッシュボードで「Settings」→「API」に移動します
2. 以下の情報をコピーします:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **重要**: `service_role key`は絶対に公開しないでください。

## 環境変数の設定

### 1. 環境変数ファイルの作成

プロジェクトのルートディレクトリで、`.env.example`をコピーして`.env.local`を作成します:

```bash
cp .env.example .env.local
```

### 2. 環境変数の設定

`.env.local`ファイルを開き、以下の値を設定します:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Authentication
ADMIN_JWT_SECRET=your-secret-key-here-minimum-32-characters
ADMIN_SESSION_DURATION=7d
```

### 3. JWT Secretの生成

管理者認証用の強力なシークレットキーを生成します:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

生成されたキーを`ADMIN_JWT_SECRET`に設定してください。

## データベースのセットアップ

### 1. マスタースキーマの実行

1. Supabaseダッシュボードで「SQL Editor」に移動します
2. `sql/master_schema.sql`ファイルの内容をコピーして貼り付けます
3. 「Run」をクリックして実行します

### 2. トランザクション関数の作成

1. 同じく「SQL Editor」で`sql/create_order_transaction.sql`の内容を実行します
2. これにより、注文処理用のストアドプロシージャが作成されます

### 3. サンプルデータの投入（オプション）

開発環境でテストする場合は、サンプルデータを投入できます:

```sql
-- 商品のサンプルデータ
INSERT INTO public.items (title, price, description, image_url, rating, category, stock)
VALUES
  ('Netflixアカウント', 1500, 'Netflix Premium 1ヶ月', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85', 4.8, '動画配信', 10),
  ('Spotifyアカウント', 980, 'Spotify Premium 1ヶ月', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41', 4.7, '音楽', 15),
  ('Discordアカウント', 500, 'Discord Nitro 1ヶ月', 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7', 4.5, 'SNS', 20);

-- 購入可能なアカウント情報を追加
-- 注: 実際のアカウント情報は絶対に公開しないでください
INSERT INTO public.purchased_accounts (item_id, account_info, is_purchased)
SELECT 
  id,
  'email: test' || generate_series || '@example.com, password: test' || generate_series,
  FALSE
FROM public.items, generate_series(1, 5);
```

## アプリケーションの起動

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで`http://localhost:3000`を開きます。

### 3. ビルドと本番環境での起動

```bash
npm run build
npm start
```

## 管理者アカウントの設定

### デフォルトの管理者アカウント

開発環境では、以下のデフォルトアカウントが使用できます:

- **ユーザー名**: `admin`
- **パスワード**: `ChangeMe123!`

⚠️ **重要**: 本番環境では必ずパスワードを変更してください。

### 本番環境での管理者パスワードの設定

#### 方法1: 環境変数を使用（推奨）

1. パスワードのハッシュを生成します:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-secure-password', 10));"
```

2. 生成されたハッシュを環境変数に設定します:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$YourGeneratedHashHere
EDITOR_USERNAME=editor
EDITOR_PASSWORD_HASH=$2a$10$YourGeneratedHashHere
```

#### 方法2: データベースを使用（最も安全）

将来的には、管理者情報をデータベースで管理することを強く推奨します。

1. `admin_users`テーブルを作成します:

```sql
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. 管理者ユーザーを追加します:

```sql
-- パスワードは事前にbcryptでハッシュ化してください
INSERT INTO public.admin_users (username, email, password_hash, role)
VALUES ('admin', 'admin@example.com', '$2a$10$YourHashedPassword', 'admin');
```

3. `lib/auth/admin-auth.ts`の`validateAdminCredentialsFromDB`関数を使用するように変更します。

## PayPay統合の設定（オプション）

PayPay決済機能を使用する場合は、以下の手順に従ってください。

### 1. PayPaython-mobileのインストール

```bash
pip3 install paypython-mobile
```

### 2. PayPayトークンの取得

```bash
python3 get_paypay_tokens.py
```

画面の指示に従ってPayPayにログインし、トークンを取得します。

### 3. 環境変数の設定

取得したトークンを`.env.local`に設定します:

```env
PAYPAY_ACCESS_TOKEN=your-access-token-here
PAYPAY_REFRESH_TOKEN=your-refresh-token-here
```

## トラブルシューティング

### エラー: "ADMIN_JWT_SECRET is not set"

**原因**: 環境変数が正しく設定されていません。

**解決方法**:
1. `.env.local`ファイルが存在することを確認
2. `ADMIN_JWT_SECRET`が設定されていることを確認
3. 開発サーバーを再起動

### エラー: "Supabase URL または Anon Key が設定されていません"

**原因**: Supabaseの環境変数が設定されていません。

**解決方法**:
1. Supabaseダッシュボードから正しいAPIキーをコピー
2. `.env.local`に設定
3. 開発サーバーを再起動

### エラー: "トランザクションエラー: function public.create_order_transaction does not exist"

**原因**: ストアドプロシージャが作成されていません。

**解決方法**:
1. Supabaseの「SQL Editor」で`sql/create_order_transaction.sql`を実行
2. エラーがないことを確認

### 管理画面にログインできない

**原因**: パスワードが正しくない、または環境変数が設定されていません。

**解決方法**:
1. デフォルトパスワード`ChangeMe123!`を試す
2. 環境変数`ADMIN_PASSWORD_HASH`が正しく設定されているか確認
3. ブラウザのコンソールでエラーメッセージを確認

## 次のステップ

セットアップが完了したら、以下のドキュメントも参照してください:

- [README.md](./README.md) - プロジェクトの概要
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - デプロイメントガイド
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API仕様書

## サポート

問題が解決しない場合は、GitHubのIssuesで質問してください。

