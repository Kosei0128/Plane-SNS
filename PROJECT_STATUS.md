# Plane SNS - プロジェクト概要

**最終更新: 2025年10月9日**

## 📋 プロジェクト概要

PayPay決済を統合したSNSアカウント販売プラットフォーム。Next.js + Supabase + PayPaython-mobileで構築。

### 技術スタック
- **フロントエンド**: Next.js 15, React, TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes, Supabase (PostgreSQL)
- **決済**: PayPay (PayPaython-mobile Python wrapper)
- **認証**: Supabase Auth
- **デプロイ**: Vercel (予定)

---

## 🎯 プロジェクトステータス

### ✅ 完了した機能

#### 1. 基本インフラ (100%)
- [x] Next.js プロジェクトセットアップ
- [x] Supabase統合 (client/admin)
- [x] 環境変数設定 (.env.local)
- [x] TypeScript設定
- [x] TailwindCSS設定

#### 2. データベース設計 (100%)
- [x] Supabaseスキーマ定義 (`supabase-setup.sql`)
  - `profiles` - ユーザープロフィール + 残高管理
  - `items` - 販売アイテム
  - `orders` - 注文管理
  - `order_items` - 注文明細
  - `purchased_accounts` - 在庫管理 (購入済みアカウント)
  - `charge_history` - チャージ履歴
  - `item_history` - アイテム変更履歴
- [x] Row Level Security (RLS) ポリシー設定
- [x] インデックス最適化

#### 3. 認証システム (100%)
- [x] Supabase Auth統合
- [x] ログイン/サインアップページ
- [x] パスワードリセット機能
- [x] 管理者認証 (email-based)
- [x] セッション管理

#### 4. ユーザー機能 (100%)
- [x] ホーム画面 (商品一覧)
- [x] 検索・フィルタ機能 (カテゴリ、価格帯、ソート)
- [x] 商品詳細表示
- [x] 在庫数表示
- [x] カート機能
  - [x] 商品追加/削除
  - [x] 数量変更
  - [x] 合計金額計算
- [x] 購入機能
  - [x] 在庫チェック
  - [x] 残高チェック
  - [x] トランザクション処理
  - [x] エラーハンドリング (部分失敗対応)
- [x] 注文履歴
  - [x] 購入済みアカウント情報表示
  - [x] 注文詳細表示

#### 5. チャージシステム (100%)
- [x] PayPay統合 (PayPaython-mobile)
  - [x] Python wrapper実装 (`lib/paypay/client.py`)
  - [x] TypeScriptクライアント (`lib/paypay/index.ts`)
  - [x] 送金リンク確認
  - [x] 送金リンク受け取り
  - [x] レスポンス構造解析
- [x] チャージページUI
- [x] チャージAPI (`/api/charge`)
  - [x] リンク検証
  - [x] 金額検証
  - [x] パスコード対応
  - [x] 残高更新
  - [x] 履歴記録
- [x] リアルタイム残高更新
  - [x] イベントベース更新 (`balance-updated`)
  - [x] ヘッダー残高表示同期

#### 6. 在庫管理システム (100%)
- [x] ファイルベース → DBベースに移行完了
- [x] 在庫追加API (`/api/inventory`)
  - [x] アカウント一括登録
  - [x] 在庫数自動更新
- [x] 在庫消費API
  - [x] 未使用アカウント取得
  - [x] 購入済みマーク
- [x] 管理画面UI
  - [x] アイテム選択
  - [x] 複数アカウント一括入力
  - [x] リアルタイム在庫数表示

#### 7. 管理者機能 (80%)
- [x] 管理者ダッシュボード
- [x] ユーザー管理
  - [x] ユーザー一覧
  - [x] 残高調整
  - [x] ユーザー削除
- [x] アイテム管理
  - [x] アイテム一覧
  - [x] アイテム追加
  - [x] アイテム編集
  - [x] アイテム削除
- [x] 在庫管理
  - [x] 在庫追加UI
  - [x] 在庫数表示
- [x] 注文履歴管理
  - [x] 全注文一覧
  - [x] フィルタ機能
- [ ] ダッシュボード統計 (未実装)
- [ ] 売上レポート (未実装)

#### 8. UI/UX (95%)
- [x] レスポンシブデザイン
- [x] ブランドカラー統一
- [x] ローディング状態表示
- [x] エラーメッセージ表示
- [x] 成功通知
- [x] モーダル実装
- [x] アニメーション
- [ ] ダークモード (未実装)

#### 9. システム改善 (100%)
- [x] 在庫管理の不整合を引き起こす根本的なバグを修正
- [x] 購入処理のロジックをリファクタリングし、信頼性を向上
- [x] 在庫数を自動で同期するためのデータベーストリガーを導入

---

## 🚧 進行中・未実装の機能

### 1. 管理者ダッシュボード強化 (0%)
- [ ] 売上統計グラフ
- [ ] 在庫アラート
- [ ] ユーザー分析
- [ ] 人気商品ランキング

### 2. 通知機能 (0%)
- [ ] メール通知 (購入完了、チャージ完了)
- [ ] プッシュ通知
- [ ] 在庫切れアラート

### 3. セキュリティ強化 (50%)
- [x] RLS ポリシー
- [x] Service Role Key分離
- [ ] Rate limiting
- [ ] CSRF対策
- [ ] XSS対策の再確認

### 4. パフォーマンス最適化 (30%)
- [x] データベースインデックス
- [ ] 画像最適化
- [ ] キャッシング戦略
- [ ] CDN設定

### 5. テスト (0%)
- [ ] ユニットテスト
- [ ] インテグレーションテスト
- [ ] E2Eテスト

### 6. デプロイ準備 (0%)
- [ ] 環境変数設定 (Vercel)
- [ ] ビルド最適化
- [ ] エラー監視 (Sentry等)
- [ ] ログ集約

---

## 📁 プロジェクト構造

```
Plane SNS/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # ホーム (商品一覧)
│   ├── admin/                   # 管理者機能
│   │   ├── page.tsx            # 管理者ログイン
│   │   ├── dashboard/          # ダッシュボード
│   │   ├── users/              # ユーザー管理
│   │   ├── items/              # アイテム管理
│   │   ├── inventory/          # 在庫管理
│   │   ├── orders/             # 注文管理
│   │   └── history/            # 変更履歴
│   ├── api/                     # APIエンドポイント
│   │   ├── balance/            # 残高取得
│   │   ├── charge/             # チャージ処理
│   │   ├── items/              # 商品API
│   │   ├── search/             # 検索API
│   │   ├── orders/             # 注文API
│   │   ├── inventory/          # 在庫API
│   │   └── admin/              # 管理者API
│   ├── auth/                    # 認証ページ
│   │   ├── login/              # ログイン
│   │   ├── signup/             # サインアップ
│   │   └── reset-password/     # パスワードリセット
│   ├── cart/                    # カート
│   ├── charge/                  # チャージページ
│   └── orders/                  # 注文履歴
├── components/                  # Reactコンポーネント
│   ├── Header.tsx              # ヘッダー (残高表示含む)
│   ├── Footer.tsx              # フッター
│   ├── ItemCard.tsx            # 商品カード
│   ├── SearchableItemGrid.tsx  # 検索可能商品グリッド
│   └── HomeAuthPanel.tsx       # ホーム認証パネル
├── lib/                         # ユーティリティ
│   ├── supabase/               # Supabase設定
│   │   └── client.ts           # クライアント初期化
│   ├── paypay/                 # PayPay統合
│   │   ├── client.py           # Pythonクライアント
│   │   └── index.ts            # TypeScriptラッパー
│   ├── cart-store.ts           # Zustand カートストア
│   ├── auth/                   # 認証ヘルパー
│   │   └── admin-auth.ts       # 管理者認証
├── styles/
│   └── globals.css             # グローバルスタイル
├── public/                      # 静的ファイル
├── supabase-setup.sql          # メインスキーマ
├── supabase-additional.sql     # 追加ポリシー
├── supabase-balance.sql        # 残高関連
├── get_paypay_tokens.py        # PayPayトークン取得
├── .env.local                  # 環境変数
├── next.config.mjs             # Next.js設定
├── tailwind.config.ts          # TailwindCSS設定
├── tsconfig.json               # TypeScript設定
└── package.json                # 依存関係
```

---

## 🔑 主要なAPI エンドポイント

### ユーザー向け
- `GET /api/items` - 全商品取得
- `GET /api/search` - 商品検索・フィルタ
- `GET /api/balance` - 残高取得
- `POST /api/charge` - チャージ処理
- `POST /api/orders` - 注文作成
- `GET /api/orders` - 注文履歴取得

### 管理者向け
- `GET /api/admin/users` - ユーザー一覧
- `POST /api/admin/users` - 残高調整
- `DELETE /api/admin/users/:id` - ユーザー削除
- `GET /api/admin/items` - アイテム管理
- `POST /api/admin/items` - アイテム追加
- `PUT /api/admin/items/:id` - アイテム更新
- `DELETE /api/admin/items/:id` - アイテム削除
- `GET /api/admin/history` - 変更履歴

### 在庫管理
- `POST /api/inventory` - 在庫操作
  - `action: "add"` - 在庫追加
  - `action: "consume"` - 在庫消費

---

## 🗄️ データベーススキーマ概要

### profiles
ユーザープロフィールと残高管理
- `id` (UUID, PK) - Supabase Auth連携
- `email` (TEXT)
- `display_name` (TEXT)
- `credit_balance` (INTEGER) - サイト内残高
- `created_at` (TIMESTAMP)

### items
販売アイテム
- `id` (TEXT, PK)
- `title` (TEXT)
- `description` (TEXT)
- `price` (INTEGER)
- `stock` (INTEGER)
- `category` (TEXT)
- `image_url` (TEXT)
- `rating` (DECIMAL)
- `created_at` (TIMESTAMP)

### orders
注文情報
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `total` (INTEGER)
- `status` (TEXT)
- `created_at` (TIMESTAMP)

### order_items
注文明細
- `id` (UUID, PK)
- `order_id` (UUID, FK → orders)
- `item_id` (TEXT, FK → items)
- `quantity` (INTEGER)
- `unit_price` (INTEGER)

### purchased_accounts
購入済みアカウント (在庫管理)
- `id` (UUID, PK)
- `item_id` (TEXT, FK → items)
- `account_info` (TEXT) - アカウント情報
- `is_purchased` (BOOLEAN)
- `order_id` (UUID, FK → orders)
- `purchased_at` (TIMESTAMP)

### charge_history
チャージ履歴
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `amount` (INTEGER)
- `transaction_id` (TEXT, UNIQUE)
- `status` (TEXT)
- `payment_url` (TEXT)
- `created_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)

### item_history
アイテム変更履歴
- `id` (UUID, PK)
- `item_id` (TEXT)
- `action` (TEXT) - created/updated/deleted/stock_changed
- `changes` (JSONB)
- `performed_by` (TEXT)
- `created_at` (TIMESTAMP)

---

## 🔐 環境変数

### 必須環境変数 (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# PayPay
PAYPAY_PHONE=090-xxxx-xxxx
PAYPAY_PASSWORD=xxxxx
PAYPAY_DEVICE_UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYPAY_ACCESS_TOKEN=ICAgeyJxxx...
PAYPAY_REFRESH_TOKEN=ICAgeyJxxx...
PYTHON_PATH=python

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxx...
RECAPTCHA_SECRET_KEY=6Lxxx...

# 管理者
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

---

## 🚀 セットアップ手順

### 1. リポジトリクローン & 依存関係インストール
```bash
git clone <repository-url>
cd "Plane SNS"
npm install
```

### 2. Python依存関係
```bash
pip install paypaython-mobile
```

### 3. Supabaseセットアップ
1. Supabaseプロジェクト作成
2. SQL実行:
   - `supabase-setup.sql` (メインスキーマ)
   - `supabase-additional.sql` (追加ポリシー)
   - `supabase-balance.sql` (残高関連)

### 4. 環境変数設定
`.env.local`を作成し、上記の環境変数を設定

### 5. PayPayトークン取得 (初回のみ)
```bash
python get_paypay_tokens.py
```

### 6. 開発サーバー起動
```bash
npm run dev
```

---

## 📝 開発ノート

### 重要な実装詳細

#### 1. 在庫管理の移行
- **旧方式**: `inventory/*.txt` ファイルベース
- **新方式**: Supabase `purchased_accounts` テーブル
- **理由**: セキュリティ、スケーラビリティ、管理の容易さ
- **移行状態**: 完了 (ファイルベースは非推奨)

#### 2. PayPay統合の課題と解決
- **問題**: PayPaythonライブラリのレスポンス構造がドキュメントと異なる
- **解決**: 実際のレスポンス構造を解析し、辞書アクセスに対応
- **注意**: `link_check`は`{'header': {...}, 'payload': {...}}`構造を返す

#### 3. 残高管理
- **サイト内残高**: `profiles.credit_balance` (Supabase)
- **PayPay残高**: リアルタイムで取得 (表示のみ)
- **同期**: チャージ/購入時に自動更新 + イベントベースUI更新

#### 4. エラーハンドリング
- 購入時の部分失敗対応 (一部商品が在庫切れの場合)
- PayPayエラーの詳細なロギング
- ユーザーフレンドリーなエラーメッセージ

---

## 🐛 既知の問題

### 1. Lintエラー
複数ファイルで`any`型や未使用変数の警告あり。機能には影響なし。

---

## 📚 関連ドキュメント

- `SETUP.md` - 詳細なセットアップガイド
- `INVENTORY_MIGRATION.md` - 在庫管理移行ガイド
- `FIX_ORDER_ERROR.md` - 注文エラー修正履歴
- `supabase-*.sql` - データベーススキーマ

---

## 🎯 次のステップ (優先度順)

### 短期 (1週間以内)
1. ✅ 在庫管理システムの根本修正 → **完了**
2. ✅ PayPay統合完成 → **完了**
3. ✅ 残高表示リアルタイム更新 → **完了**
4. ✅ ItemDB完全削除 → **完了**
5. [ ] Lintエラー修正

### 中期 (1ヶ月以内)
1. [ ] 管理者ダッシュボード統計実装
2. [ ] メール通知機能
3. [ ] Rate limiting実装
4. [ ] テストコード作成

### 長期 (3ヶ月以内)
1. [ ] 本番デプロイ (Vercel)
2. [ ] パフォーマンス最適化
3. [ ] SEO対策
4. [ ] 多言語対応

---

## 👥 チーム & 連絡先

- **開発者**: [Your Name]
- **プロジェクト開始**: 2025年10月
- **現在のステータス**: MVP完成、本番準備中

---

**最終更新: 2025年10月9日**
