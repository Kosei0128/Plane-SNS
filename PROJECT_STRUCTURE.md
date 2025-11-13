# プロジェクト構造

このドキュメントでは、プロジェクトのファイル構造と各ディレクトリの役割を説明します。

## 📁 ディレクトリ構造

```
Plane-SNS-Fixed/
├── app/                          # Next.js App Router
│   ├── api/                      # APIエンドポイント
│   │   ├── balance/              # 残高API
│   │   ├── charge/               # チャージAPI
│   │   ├── items/                # 商品API
│   │   ├── orders/               # 注文API
│   │   ├── search/               # 検索API
│   │   ├── inventory/            # 在庫API
│   │   └── site-control-a4b7/    # 管理者API
│   ├── auth/                     # 認証ページ
│   │   ├── login/                # ログインページ
│   │   ├── signup/               # サインアップページ
│   │   └── callback/             # OAuthコールバック
│   ├── cart/                     # カートページ
│   ├── charge/                   # チャージページ
│   ├── orders/                   # 注文履歴ページ
│   ├── site-control-a4b7/        # 管理画面
│   │   ├── dashboard/            # ダッシュボード
│   │   ├── items/                # 商品管理
│   │   ├── inventory/            # 在庫管理
│   │   ├── orders/               # 注文管理
│   │   ├── users/                # ユーザー管理
│   │   └── history/              # 変更履歴
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # ホームページ
│   └── providers.tsx             # プロバイダー
│
├── components/                   # Reactコンポーネント
│   ├── ui/                       # UIコンポーネント（shadcn/ui）
│   ├── Header.tsx                # ヘッダーコンポーネント
│   ├── Footer.tsx                # フッターコンポーネント
│   ├── ItemCard.tsx              # 商品カード
│   ├── SearchableItemGrid.tsx    # 商品検索グリッド
│   ├── HomeAuthPanel.tsx         # ホーム認証パネル
│   └── ThemeToggle.tsx           # テーマ切り替え
│
├── lib/                          # ライブラリとユーティリティ
│   ├── auth/                     # 認証関連
│   │   └── admin-auth.ts         # 管理者認証
│   ├── supabase/                 # Supabaseクライアント
│   │   └── client.ts             # クライアント設定
│   ├── validation/               # バリデーション
│   │   └── schemas.ts            # Zodスキーマ
│   ├── paypay/                   # PayPay統合
│   ├── cart-store.ts             # カート状態管理（Zustand）
│   ├── constants.ts              # 定数定義
│   ├── rate-limit.ts             # レート制限
│   └── utils.ts                  # ユーティリティ関数
│
├── sql/                          # SQLスクリプト
│   ├── master_schema.sql         # ⭐ マスタースキーマ（最重要）
│   ├── create_order_transaction.sql  # ⭐ トランザクション関数（必須）
│   ├── 02_create_analytics_functions.sql  # 分析関数（オプション）
│   ├── 01_truncate_data.sql      # トランザクションデータ削除
│   ├── reset_database.sql        # データベースリセット
│   ├── fix_permissions.sql       # 権限修正
│   └── README.md                 # SQLスクリプトの説明
│
├── types/                        # TypeScript型定義
│   └── api.ts                    # API型定義
│
├── styles/                       # スタイル
│   └── globals.css               # グローバルCSS
│
├── scripts/                      # スクリプト
│   └── generate-password-hash.js # パスワードハッシュ生成
│
├── docs/                         # ドキュメント（将来の拡張用）
│   └── README.md                 # ドキュメント説明
│
├── SPECIFICATION.md              # ⭐ 統合要件定義書（最重要）
├── README.md                     # プロジェクト概要
├── CHANGELOG.md                  # 変更履歴
├── PROJECT_STRUCTURE.md          # このファイル
│
├── package.json                  # 依存関係とスクリプト
├── tsconfig.json                 # TypeScript設定
├── next.config.mjs               # Next.js設定
├── tailwind.config.ts            # Tailwind CSS設定
├── .env.example                  # 環境変数のサンプル
└── middleware.ts                 # Next.jsミドルウェア
```

## 📂 主要ディレクトリの説明

### `app/`
Next.js 15のApp Routerを使用したページとAPIルートが含まれています。

- **`app/api/`**: すべてのAPIエンドポイント
- **`app/auth/`**: 認証関連のページ
- **`app/site-control-a4b7/`**: 管理者用の管理画面

### `components/`
再利用可能なReactコンポーネントが含まれています。

- **`components/ui/`**: shadcn/uiのUIコンポーネント
- その他のコンポーネントは機能別に整理

### `lib/`
アプリケーション全体で使用されるユーティリティとライブラリが含まれています。

- **`lib/auth/`**: 認証ロジック
- **`lib/supabase/`**: Supabaseクライアント設定
- **`lib/validation/`**: バリデーションスキーマ
- **`lib/constants.ts`**: 定数定義

### `sql/`
データベースのセットアップとメンテナンス用のSQLスクリプトが含まれています。

- **`master_schema.sql`**: データベースの完全なスキーマ
- **`create_order_transaction.sql`**: 注文処理用のストアドプロシージャ

### `types/`
TypeScriptの型定義が含まれています。

- **`types/api.ts`**: APIレスポンスとリクエストの型定義

## 🔍 ファイル命名規則

### コンポーネント
- PascalCase: `Header.tsx`, `ItemCard.tsx`
- 機能を表す明確な名前を使用

### APIルート
- 小文字とハイフン: `route.ts`
- ディレクトリ名がエンドポイントパス

### ユーティリティ
- camelCase: `utils.ts`, `constants.ts`
- 機能を表す明確な名前を使用

## 📝 重要なファイル

### 必須ファイル
- `SPECIFICATION.md` - 統合要件定義書
- `sql/master_schema.sql` - データベーススキーマ
- `sql/create_order_transaction.sql` - トランザクション関数
- `.env.local` - 環境変数（作成が必要）

### 設定ファイル
- `package.json` - 依存関係とスクリプト
- `tsconfig.json` - TypeScript設定
- `next.config.mjs` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定

## 🚫 削除されたファイル

以下のファイルは整理のため削除されました：

- `components/Header.tsx.backup` - バックアップファイル
- `GEMINI.md` - 重複したセットアップガイド
- `IMPROVEMENTS_SUMMARY.md` - SPECIFICATION.mdに統合済み
- `README_SALES.md` - 販売用ドキュメント
- `DEPLOYMENT_GUIDE.md` - SPECIFICATION.mdに統合済み
- `SETUP_GUIDE.md` - SPECIFICATION.mdに統合済み
- `SECURITY_GUIDE.md` - SPECIFICATION.mdに統合済み
- `sql/cleanup_trigger.sql` - 古い修正ファイル
- `sql/fix_final_trigger.sql` - 古い修正ファイル
- `sql/fix_user_trigger.sql` - 古い修正ファイル

## 🔗 関連ドキュメント

- [SPECIFICATION.md](./SPECIFICATION.md) - 統合要件定義書
- [README.md](./README.md) - プロジェクト概要
- [sql/README.md](./sql/README.md) - SQLスクリプトの説明

