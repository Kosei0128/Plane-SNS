# Plane SNS - 統合要件定義書（仕様書）

> **重要**: このドキュメントは、プロジェクトのすべての重要な情報を統合した唯一の仕様書です。  
> どのAIや開発者も、このドキュメントを見ればプロジェクトを理解し、作業を進められるように設計されています。

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [最重要事項](#最重要事項)
3. [技術スタック](#技術スタック)
4. [機能一覧](#機能一覧)
5. [API仕様](#api仕様)
6. [データベース設計](#データベース設計)
7. [セキュリティ要件](#セキュリティ要件)
8. [環境変数設定](#環境変数設定)
9. [セットアップ手順](#セットアップ手順)
10. [デプロイ手順](#デプロイ手順)
11. [変更履歴](#変更履歴)
12. [次にやること](#次にやること)
13. [トラブルシューティング](#トラブルシューティング)

---

## プロジェクト概要

### 基本情報

- **プロジェクト名**: Plane SNS (shark-sns-clone)
- **タイプ**: ECサイト（デジタル商品販売特化）
- **フレームワーク**: Next.js 15.5.6
- **バックエンド**: Supabase (PostgreSQL)
- **目的**: デジタル商品（アカウント、サブスクリプション、ゲームアイテムなど）の販売プラットフォーム

### 主要な特徴

- ✅ ユーザー認証（Supabase Auth）
- ✅ 商品管理と在庫管理
- ✅ ショッピングカート機能
- ✅ クレジット残高システム
- ✅ PayPay決済統合（オプション）
- ✅ 管理ダッシュボード
- ✅ 注文履歴管理
- ✅ レスポンシブデザイン（モバイル対応）

---

## 最重要事項

### ⚠️ 絶対に守るべきこと

1. **セキュリティ**
   - 管理者パスワードは必ずbcryptでハッシュ化（平文保存は禁止）
   - `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しない
   - `.env.local`は`.gitignore`に含まれていることを確認
   - 本番環境ではデフォルトパスワード`ChangeMe123!`を変更必須

2. **データベース**
   - 注文処理は必ず`create_order_transaction`ストアドプロシージャを使用
   - Row Level Security (RLS)はすべてのテーブルで有効化必須
   - トランザクション処理によりデータ整合性を保証

3. **エラーハンドリング**
   - すべてのfetch呼び出しで`res.ok`を確認してから`.json()`を呼ぶ
   - エラー時は適切なメッセージを表示
   - ネットワークエラーは`.catch()`で処理

4. **環境変数**
   - 開発環境と本番環境で異なる環境変数を使用
   - 機密情報は絶対にソースコードに含めない

### 🎯 プロジェクトの目標

- **商用販売可能な品質**のECサイトテンプレート
- **セキュリティ**と**信頼性**を最優先
- **保守性**と**拡張性**を重視した設計

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.5.6 | Reactフレームワーク |
| React | 18.3.1 | UIライブラリ |
| TypeScript | 5.5.4 | 型安全性 |
| Tailwind CSS | 3.4.10 | CSSフレームワーク |
| Zustand | 4.5.5 | 状態管理（カートなど） |
| shadcn/ui | - | UIコンポーネント |
| lucide-react | 0.428.0 | アイコン |

### バックエンド

| 技術 | 用途 |
|------|------|
| Supabase | BaaS（認証、データベース、ストレージ） |
| PostgreSQL | リレーショナルデータベース |
| Row Level Security | データベースレベルのセキュリティ |

### セキュリティ

| 技術 | 用途 |
|------|------|
| bcryptjs | パスワードハッシュ化 |
| jose | JWT処理 |
| Zod | スキーマバリデーション |
| @upstash/ratelimit | レート制限（オプション） |

### 決済（オプション）

| 技術 | 用途 |
|------|------|
| PayPaython-mobile | PayPay統合 |

---

## 機能一覧

### ユーザー機能

1. **認証**
   - メール/パスワードでのサインアップ
   - Google OAuthログイン
   - ログイン/ログアウト
   - パスワードリセット
   - reCAPTCHAによるボット対策

2. **商品閲覧**
   - 商品一覧表示
   - 商品検索（キーワード、カテゴリ、価格範囲）
   - 商品詳細表示
   - ソート機能（新着順、価格順、人気順）

3. **ショッピングカート**
   - 商品の追加/削除
   - 数量変更
   - カート内容の保持（Zustand）

4. **注文**
   - カートからの注文
   - クレジット残高での決済
   - 注文履歴の閲覧
   - 購入済みアカウント情報の表示

5. **チャージ**
   - PayPay決済リンクでのチャージ
   - 残高確認
   - チャージ履歴

### 管理者機能

1. **ダッシュボード**
   - 売上統計
   - 注文数、商品数、ユーザー数の表示
   - 日次売上グラフ

2. **商品管理**
   - 商品の追加/編集/削除
   - 在庫管理
   - カテゴリ管理

3. **在庫管理**
   - アカウント情報の追加
   - アカウント情報の削除
   - 在庫数の自動更新

4. **注文管理**
   - 全注文の閲覧
   - 注文ステータスの確認
   - 注文詳細の表示

5. **ユーザー管理**
   - ユーザー一覧
   - 残高の手動調整

6. **履歴管理**
   - 商品変更履歴の閲覧
   - フィルタリング機能

---

## API仕様

### エンドポイント一覧

#### 一般API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | `/api/items` | 商品一覧取得 | 不要 |
| GET | `/api/search` | 商品検索 | 不要 |
| GET | `/api/balance` | 残高取得 | Bearer Token |
| GET | `/api/orders` | 注文履歴取得 | Bearer Token |
| POST | `/api/orders` | 注文作成 | Bearer Token |
| POST | `/api/charge` | チャージ処理 | Bearer Token |
| GET | `/api/inventory` | 在庫情報取得 | Bearer Token |
| POST | `/api/inventory` | 在庫追加 | Bearer Token |
| DELETE | `/api/inventory` | 在庫削除 | Bearer Token |

#### 管理者API

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | `/api/site-control-a4b7/login` | 管理者ログイン | Cookie |
| POST | `/api/site-control-a4b7/logout` | 管理者ログアウト | Cookie |
| POST | `/api/site-control-a4b7/session` | セッション作成 | Bearer Token |
| GET | `/api/site-control-a4b7/analytics` | 分析データ取得 | Cookie |
| GET | `/api/site-control-a4b7/orders` | 全注文取得 | Cookie |
| GET | `/api/site-control-a4b7/users` | ユーザー一覧取得 | Cookie |
| PUT | `/api/site-control-a4b7/users` | ユーザー残高更新 | Cookie |
| GET | `/api/site-control-a4b7/items` | 商品一覧取得（管理用） | Cookie |
| POST | `/api/site-control-a4b7/items` | 商品作成 | Cookie |
| PUT | `/api/site-control-a4b7/items` | 商品更新 | Cookie |
| DELETE | `/api/site-control-a4b7/items` | 商品削除 | Cookie |
| GET | `/api/site-control-a4b7/history` | 変更履歴取得 | Cookie |

### エラーハンドリング

すべてのAPIエンドポイントは以下の形式でエラーを返します：

```json
{
  "error": "エラーメッセージ",
  "message": "詳細なエラーメッセージ（オプション）"
}
```

### レート制限

- **一般API**: 15分間に100リクエスト
- **認証API**: 15分間に5リクエスト
- **決済API**: 1分間に10リクエスト

---

## データベース設計

### テーブル一覧

1. **profiles** - ユーザープロフィール
   - `id` (UUID, PK) - ユーザーID
   - `email` (TEXT) - メールアドレス
   - `credit_balance` (INTEGER) - クレジット残高
   - `created_at`, `updated_at` (TIMESTAMP)

2. **items** - 商品
   - `id` (UUID, PK)
   - `title` (TEXT) - 商品名
   - `price` (INTEGER) - 価格
   - `description` (TEXT) - 説明
   - `image_url` (TEXT) - 画像URL
   - `rating` (REAL) - 評価
   - `stock` (INTEGER) - 在庫数
   - `category` (TEXT) - カテゴリ

3. **orders** - 注文
   - `id` (UUID, PK)
   - `user_id` (UUID, FK) - ユーザーID
   - `total` (INTEGER) - 合計金額
   - `status` (TEXT) - ステータス（pending/completed/cancelled）

4. **order_items** - 注文明細
   - `id` (UUID, PK)
   - `order_id` (UUID, FK) - 注文ID
   - `item_id` (UUID, FK) - 商品ID
   - `quantity` (INTEGER) - 数量
   - `price` (INTEGER) - 単価

5. **purchased_accounts** - 購入済みアカウント
   - `id` (UUID, PK)
   - `order_id` (UUID, FK) - 注文ID
   - `item_id` (UUID, FK) - 商品ID
   - `account_info` (TEXT) - アカウント情報
   - `is_purchased` (BOOLEAN) - 購入済みフラグ

6. **charge_history** - チャージ履歴
   - `id` (UUID, PK)
   - `user_id` (UUID, FK) - ユーザーID
   - `amount` (INTEGER) - 金額
   - `status` (TEXT) - ステータス
   - `payment_url` (TEXT) - 決済URL

7. **balance_transactions** - 残高取引履歴
   - `id` (UUID, PK)
   - `user_id` (UUID, FK) - ユーザーID
   - `amount` (INTEGER) - 変動額
   - `type` (TEXT) - 取引タイプ（charge/purchase/refund/admin_adjustment）
   - `balance_before` (INTEGER) - 取引前残高
   - `balance_after` (INTEGER) - 取引後残高

8. **item_history** - 商品変更履歴
   - `id` (UUID, PK)
   - `item_id` (UUID, FK) - 商品ID
   - `change_type` (TEXT) - 変更タイプ（create/update/delete）
   - `old_data` (JSONB) - 変更前データ
   - `new_data` (JSONB) - 変更後データ

### 重要なストアドプロシージャ

#### `create_order_transaction`

注文処理をトランザクションで実行するストアドプロシージャ。

**処理内容**:
1. ユーザー残高の確認
2. 在庫の確認と予約
3. 注文の作成
4. 購入済みアカウントの更新
5. 残高の更新
6. 取引履歴の記録
7. エラー時の自動ロールバック

**使用方法**:
```sql
SELECT * FROM create_order_transaction(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount INTEGER
);
```

### Row Level Security (RLS)

すべてのテーブルでRLSが有効化されています：

- **profiles**: ユーザーは自分のプロフィールのみ閲覧・更新可能
- **orders**: ユーザーは自分の注文のみ閲覧可能
- **items**: すべてのユーザーが閲覧可能、管理者のみ編集可能
- **purchased_accounts**: ユーザーは自分が購入したアカウントのみ閲覧可能

---

## セキュリティ要件

### 認証

1. **ユーザー認証**
   - Supabase Authを使用
   - メール確認の推奨
   - パスワードポリシー: 最低8文字

2. **管理者認証**
   - bcryptによるパスワードハッシュ化（必須）
   - JWTトークンベースの認証
   - HTTPOnly Cookieに保存
   - セッション有効期限: 7日間（デフォルト）

### データ保護

1. **Row Level Security (RLS)**
   - すべてのテーブルで有効化必須
   - ユーザーは自分のデータのみアクセス可能

2. **環境変数**
   - 機密情報は環境変数に保存
   - `.env.local`は`.gitignore`に含める
   - 本番環境ではホスティングサービスの環境変数設定を使用

### 入力バリデーション

1. **Zodスキーマ**
   - すべてのAPIエンドポイントで入力検証
   - 型安全なバリデーション

2. **SQLインジェクション対策**
   - Supabaseクエリビルダーを使用
   - パラメータ化クエリの使用

### レート制限

- Upstash Redisを使用（推奨）
- メモリベースのフォールバック機能あり
- エンドポイントタイプ別の制限設定

---

## 環境変数設定

### 必須の環境変数

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Authentication
ADMIN_JWT_SECRET=your-secret-key-here-minimum-32-characters
ADMIN_PASSWORD_HASH=$2a$10$YourGeneratedHashHere
EDITOR_PASSWORD_HASH=$2a$10$YourGeneratedHashHere
```

### オプションの環境変数

```env
# Admin Settings
ADMIN_USERNAME=admin
EDITOR_USERNAME=editor
ADMIN_SESSION_DURATION=7d

# PayPay Integration (Optional)
PAYPAY_ACCESS_TOKEN=your-access-token
PAYPAY_REFRESH_TOKEN=your-refresh-token
PYTHON_PATH=python3

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Environment
NODE_ENV=production
```

### 環境変数の生成方法

#### JWT Secretの生成
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### パスワードハッシュの生成
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

---

## セットアップ手順

### ステップ1: 前提条件の確認

- [ ] Node.js 18.0.0以上がインストールされている
- [ ] npm 9.0.0以上がインストールされている
- [ ] Supabaseアカウントを持っている
- [ ] Gitがインストールされている

### ステップ2: プロジェクトのクローン

```bash
git clone https://github.com/Kosei0128/Plane-SNS.git
cd Plane-SNS
```

### ステップ3: 依存関係のインストール

```bash
npm install
```

### ステップ4: Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. Settings > APIから以下を取得:
   - Project URL
   - anon (public) key
   - service_role key

### ステップ5: 環境変数の設定

1. `.env.example`をコピーして`.env.local`を作成
2. 取得したSupabaseの情報を設定
3. JWT Secretとパスワードハッシュを生成して設定

### ステップ6: データベースのセットアップ

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `sql/master_schema.sql`の内容を実行
3. `sql/create_order_transaction.sql`の内容を実行

### ステップ7: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで`http://localhost:3000`を開く

### ステップ8: 動作確認

- [ ] ホームページが表示される
- [ ] 商品一覧が表示される
- [ ] ユーザー登録ができる
- [ ] ログインができる
- [ ] 管理画面にログインできる（デフォルト: admin / ChangeMe123!）

---

## デプロイ手順

### Vercelへのデプロイ（推奨）

1. **Vercelアカウントの作成**
   - [Vercel](https://vercel.com/)にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクトのインポート**
   - 「New Project」をクリック
   - GitHubリポジトリを選択
   - フレームワークプリセットで「Next.js」を選択

3. **環境変数の設定**
   - 「Environment Variables」セクションで必須の環境変数を設定
   - 本番環境用のSupabaseプロジェクトの情報を使用

4. **デプロイ**
   - 「Deploy」ボタンをクリック
   - デプロイ完了後、URLが発行される

### デプロイ前のチェックリスト

- [ ] 管理者パスワードを強力なものに変更
- [ ] `ADMIN_JWT_SECRET`を本番用の強力なキーに変更
- [ ] 本番用のSupabaseプロジェクトを作成
- [ ] データベーススキーマを本番環境に適用
- [ ] 環境変数が正しく設定されている
- [ ] `.env.local`が`.gitignore`に含まれている

---

## 変更履歴

### [v2.1.0] - 2025-01-XX

#### エラーハンドリングの完全修正

- ✅ すべてのfetch呼び出しで`res.ok`チェックを追加
- ✅ ネットワークエラーの適切な処理（try-catch）
- ✅ エラーメッセージの統一と改善
- ✅ `app/charge/page.tsx`の残高取得処理を修正
- ✅ `app/site-control-a4b7/dashboard/page.tsx`のログアウト処理を修正

#### ファイル構造の整理

- ✅ 不要なバックアップファイルを削除（`Header.tsx.backup`）
- ✅ 重複したドキュメントを削除（`GEMINI.md`, `IMPROVEMENTS_SUMMARY.md`）
- ✅ 統合済みドキュメントを削除（`DEPLOYMENT_GUIDE.md`, `SETUP_GUIDE.md`, `SECURITY_GUIDE.md`）
- ✅ SQLスクリプトの整理（古い修正ファイルを削除）
- ✅ `PROJECT_STRUCTURE.md`の追加
- ✅ `sql/README.md`の追加
- ✅ `docs/README.md`の追加

### [v2.0.0] - 2025-10-22

#### セキュリティの大幅強化

- ✅ 管理者認証をbcryptハッシュ化に変更
- ✅ トランザクション処理の実装（`create_order_transaction`）
- ✅ レート制限機能の追加
- ✅ 入力バリデーションの強化（Zod）

#### コード品質の向上

- ✅ 型定義の統一（`types/api.ts`）
- ✅ 定数管理の一元化（`lib/constants.ts`）
- ✅ バリデーションスキーマの追加（`lib/validation/schemas.ts`）

#### エラーハンドリングの改善

- ✅ すべてのfetch呼び出しで`res.ok`チェックを追加
- ✅ エラーメッセージの統一
- ✅ ネットワークエラーの適切な処理

#### ドキュメントの充実

- ✅ セットアップガイドの追加
- ✅ デプロイメントガイドの追加
- ✅ セキュリティガイドの追加
- ✅ この統合仕様書の作成

### [v1.0.0] - 2024-11-01

- 初回リリース
- 基本的なECサイト機能
- 管理画面の実装

---

## 次にやること

### 🔴 高優先度（すぐに実施）

1. **エラーハンドリングの確認** ✅ **完了**
   - [x] すべてのfetch呼び出しで`res.ok`チェックが実装されているか確認
   - [x] エラーメッセージが適切に表示されるか確認
   - [x] `app/charge/page.tsx`の残高取得処理を修正
   - [x] `app/site-control-a4b7/dashboard/page.tsx`のログアウト処理を修正

2. **セキュリティ監査**
   - [ ] 本番環境でデフォルトパスワードが変更されているか確認
   - [ ] 環境変数が正しく設定されているか確認
   - [ ] RLSがすべてのテーブルで有効化されているか確認

### 🟡 中優先度（1-2週間以内）

1. **テストの追加**
   - [ ] E2Eテストの実装（Playwright推奨）
   - [ ] APIエンドポイントのユニットテスト
   - [ ] コンポーネントテストの拡充

2. **パフォーマンス最適化**
   - [ ] 画像の最適化（WebP形式への変換）
   - [ ] キャッシュ戦略の見直し
   - [ ] データベースクエリの最適化

3. **モニタリングの実装**
   - [ ] エラー監視サービスの統合（Sentry推奨）
   - [ ] パフォーマンス監視の実装
   - [ ] ログ管理システムの導入

### 🟢 低優先度（1-3ヶ月以内）

1. **機能追加**
   - [ ] 二要素認証の実装
   - [ ] メール通知機能
   - [ ] レビュー・評価機能

2. **UI/UX改善**
   - [ ] アニメーションの追加
   - [ ] アクセシビリティの向上
   - [ ] 多言語対応

3. **管理者機能の拡充**
   - [ ] 管理者情報のデータベース管理への移行
   - [ ] より詳細な分析機能
   - [ ] バックアップ機能の自動化

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. "Failed to fetch" エラー

**原因**: fetch呼び出しでレスポンスの成功確認をしていない

**解決方法**:
```typescript
const res = await fetch("/api/endpoint");
if (!res.ok) {
  const errorData = await res.json().catch(() => ({}));
  throw new Error(errorData.message || `Request failed: ${res.status}`);
}
const data = await res.json();
```

#### 2. "Supabase URL または Anon Key が設定されていません"

**原因**: 環境変数が設定されていない

**解決方法**:
1. `.env.local`ファイルが存在するか確認
2. 環境変数が正しく設定されているか確認
3. 開発サーバーを再起動

#### 3. "ADMIN_JWT_SECRET is not set"

**原因**: 管理者認証用の環境変数が設定されていない

**解決方法**:
1. JWT Secretを生成: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. `.env.local`に`ADMIN_JWT_SECRET`を設定
3. 開発サーバーを再起動

#### 4. 管理画面にログインできない

**原因**: パスワードハッシュが正しく設定されていない

**解決方法**:
1. パスワードハッシュを生成: `node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"`
2. `.env.local`に`ADMIN_PASSWORD_HASH`を設定
3. デフォルトパスワード`ChangeMe123!`を試す

#### 5. 注文処理でエラーが発生する

**原因**: ストアドプロシージャが作成されていない

**解決方法**:
1. Supabaseの「SQL Editor」で`sql/create_order_transaction.sql`を実行
2. エラーがないことを確認

#### 6. データベース接続エラー

**原因**: Supabaseの環境変数が間違っている、またはプロジェクトが停止している

**解決方法**:
1. Supabaseダッシュボードでプロジェクトが稼働しているか確認
2. 環境変数が正しいか確認
3. ネットワーク接続を確認

---

## 重要なファイルとディレクトリ

### コアファイル

```
├── app/                          # Next.js App Router
│   ├── api/                      # APIエンドポイント
│   │   ├── balance/              # 残高API
│   │   ├── charge/               # チャージAPI
│   │   ├── items/                # 商品API
│   │   ├── orders/               # 注文API
│   │   └── site-control-a4b7/     # 管理者API
│   ├── auth/                     # 認証ページ
│   ├── cart/                     # カートページ
│   ├── charge/                   # チャージページ
│   ├── orders/                   # 注文履歴ページ
│   └── site-control-a4b7/         # 管理画面
├── components/                    # Reactコンポーネント
│   ├── Header.tsx                # ヘッダーコンポーネント
│   ├── SearchableItemGrid.tsx    # 商品検索グリッド
│   └── ui/                       # UIコンポーネント
├── lib/                          # ライブラリとユーティリティ
│   ├── auth/                     # 認証関連
│   ├── supabase/                 # Supabaseクライアント
│   ├── validation/               # バリデーションスキーマ
│   └── constants.ts              # 定数定義
├── sql/                          # SQLファイル
│   ├── master_schema.sql         # マスタースキーマ
│   └── create_order_transaction.sql  # トランザクション関数
└── types/                        # TypeScript型定義
    └── api.ts                    # API型定義
```

### 設定ファイル

- `next.config.mjs` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `tsconfig.json` - TypeScript設定
- `.env.example` - 環境変数のサンプル
- `package.json` - 依存関係とスクリプト

---

## 開発ワークフロー

### 1. 新機能の追加

1. 要件を明確にする
2. 型定義を`types/api.ts`に追加
3. バリデーションスキーマを`lib/validation/schemas.ts`に追加
4. APIエンドポイントを実装
5. フロントエンドコンポーネントを実装
6. エラーハンドリングを追加
7. テストを追加

### 2. バグ修正

1. 問題を再現する
2. 原因を特定する
3. 修正を実装する
4. エラーハンドリングを確認する
5. テストを実行する

### 3. セキュリティ更新

1. セキュリティガイドを確認
2. 脆弱性を特定する
3. 修正を実装する
4. テストを実行する
5. ドキュメントを更新する

---

## 参考資料

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

### セキュリティ

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## サポートと連絡先

### 問題報告

- GitHub Issues: [リポジトリのIssuesページ]
- メール: support@plane-sns.com

### セキュリティ脆弱性の報告

- メール: security@plane-sns.com
- **重要**: 公開する前に必ず報告してください

---

## ライセンス

このプロジェクトは商用利用可能なライセンスで提供されています。

---

**最終更新日**: 2025-01-XX  
**バージョン**: 2.1.0  
**メンテナー**: Plane SNS Team

---

> **注意**: このドキュメントは定期的に更新されます。重要な変更があった場合は、必ず最新版を確認してください。

