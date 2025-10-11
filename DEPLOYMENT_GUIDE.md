# Vercelへのデプロイガイド

このNext.jsアプリケーションをVercelにデプロイする手順です。

## 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ可能）
- Supabaseプロジェクトが設定済み

## デプロイ手順

### 1. Gitリポジトリの準備

まず、プロジェクトをGitリポジトリにプッシュします:

```bash
# Gitの初期化（まだの場合）
git init

# .gitignoreの確認（既に存在します）
# 必要なファイルを追加
git add .
git commit -m "Initial commit for deployment"

# GitHubリポジトリを作成して、リモートを追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Vercelでのデプロイ

#### 方法A: Vercelダッシュボードから（推奨）

1. [Vercel](https://vercel.com)にアクセスしてログイン
2. "Add New Project"をクリック
3. GitHubリポジトリをインポート
4. プロジェクト設定:
   - **Framework Preset**: Next.js（自動検出されます）
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

5. 環境変数を設定（下記参照）
6. "Deploy"をクリック

#### 方法B: Vercel CLIから

```bash
# Vercel CLIのインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ（初回）
vercel

# 本番環境へデプロイ
vercel --prod
```

### 3. 環境変数の設定

Vercelダッシュボードの Settings → Environment Variables で以下を設定:

#### 必須の環境変数:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_SESSION_SECRET=your_random_secret_string
```

#### オプション（PayPay機能を使う場合）:

```
PAYPAY_ACCESS_TOKEN=your_access_token
PAYPAY_REFRESH_TOKEN=your_refresh_token
```

**注意**: PayPay機能はPythonスクリプトに依存しているため、Vercelでは動作しない可能性があります。
代替案として、PayPay APIを直接TypeScriptで実装するか、別のサーバーレス環境を使用してください。

#### オプション（reCAPTCHAを使う場合）:

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
```

### 4. Supabaseの設定

Supabaseダッシュボードで、Vercelのドメインを許可リストに追加:

1. Supabaseプロジェクト → Settings → API
2. "URL Configuration" セクション
3. Site URL に Vercel のドメインを追加（例: `https://your-app.vercel.app`）
4. Redirect URLs に以下を追加:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`

### 5. カスタムドメインの設定（オプション）

1. Vercelダッシュボード → Settings → Domains
2. カスタムドメインを追加
3. DNS設定を更新（Vercelが指示を表示）

## デプロイ後の確認

### 動作確認:

- ✅ トップページが表示される
- ✅ 商品一覧が表示される
- ✅ ユーザー認証（サインアップ/ログイン）が動作する
- ✅ カート機能が動作する
- ✅ 管理画面にアクセスできる

### トラブルシューティング:

#### ビルドエラーが発生する場合:

```bash
# ローカルでビルドテスト
npm run build

# TypeScriptエラーを確認
npm run typecheck
```

#### 環境変数が読み込まれない場合:

- `NEXT_PUBLIC_` プレフィックスがクライアント側変数に付いているか確認
- Vercelで環境変数を設定後、再デプロイが必要

#### データベース接続エラー:

- Supabaseの環境変数が正しく設定されているか確認
- Supabase側でVercelドメインが許可されているか確認

## 継続的デプロイ（CI/CD）

Vercelは自動的にGitリポジトリと連携します:

- **mainブランチへのプッシュ** → 自動的に本番環境へデプロイ
- **他のブランチへのプッシュ** → プレビューデプロイを作成
- **プルリクエスト** → 自動的にプレビュー環境を作成

## パフォーマンス最適化

デプロイ後、以下を確認してパフォーマンスを向上:

1. **画像の最適化**: Next.js Image コンポーネントを使用（既に実装済み）
2. **キャッシング**: Vercel Edge Network が自動的に処理
3. **分析**: Vercel Analytics を有効化（Settings → Analytics）

## セキュリティのベストプラクティス

- ✅ 環境変数は `.env.local` に保存（Git に含めない）
- ✅ `.env.example` でテンプレートを提供
- ✅ Supabase Row Level Security (RLS) を有効化
- ✅ 管理画面は認証を必須に設定済み

## コスト

- **Hobby プラン**: 無料
  - 個人プロジェクト
  - 無制限のデプロイ
  - 自動HTTPS
  - 100GB帯域幅/月

- **Pro プラン**: $20/月
  - 商用利用
  - チーム機能
  - 1TB帯域幅/月
  - 優先サポート

## サポート

問題が発生した場合:

1. [Vercel ドキュメント](https://vercel.com/docs)
2. [Next.js ドキュメント](https://nextjs.org/docs)
3. [Supabase ドキュメント](https://supabase.io/docs)

## 備考

### PayPay機能について

現在のPayPay実装はPythonスクリプトを使用しています。Vercelはサーバーレス環境のため、
以下の選択肢があります:

1. **PayPay機能を無効化**（推奨）
2. **別のサーバー環境を使用**（AWS Lambda、Google Cloud Functions等）
3. **TypeScriptで再実装**（PayPay APIの公式クライアントがあれば）

当面は、PayPay関連のAPIルートをコメントアウトするか、エラーハンドリングを追加することを推奨します。

---

デプロイ成功をお祈りします! 🚀
