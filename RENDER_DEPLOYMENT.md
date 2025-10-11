# 🚀 Render デプロイガイド

このガイドに従って、Renderに**完全無料**でデプロイできます（Python + Next.js両方対応）。

## 📋 準備

### 必要なもの
- ✅ GitHubアカウント
- ✅ Renderアカウント（無料）
- ✅ Supabaseプロジェクト

### 所要時間
⏱️ **15分**

---

## 🎯 ステップ1: GitHubにプッシュ

まず、プロジェクトをGitHubにプッシュします（まだの場合）:

```bash
# Gitの初期化（まだの場合）
git init

# 全てのファイルを追加
git add .

# コミット
git commit -m "Ready for Render deployment"

# GitHubリポジトリを作成して接続
# GitHub.comで新しいリポジトリを作成してから:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🎯 ステップ2: Renderでデプロイ

### 1. Renderにアクセス

https://render.com にアクセスして、GitHubアカウントでサインアップ/ログイン

### 2. 新しいWebサービスを作成

1. ダッシュボードで **"New +"** をクリック
2. **"Web Service"** を選択
3. GitHubリポジトリを接続
   - "Connect account" でGitHub連携
   - このリポジトリを選択

### 3. サービス設定

以下の設定を入力:

| 項目 | 設定値 |
|------|--------|
| **Name** | `plane-sns` (任意の名前) |
| **Region** | `Singapore` (日本に最も近い) |
| **Branch** | `main` |
| **Root Directory** | (空白のまま) |
| **Runtime** | `Node` |
| **Build Command** | `bash build.sh` |
| **Start Command** | `npm run start` |

### 4. プランを選択

**Free** プランを選択（$0/月）

⚠️ 注意: 無料プランの制限
- 15分アクセスなしで自動スリープ
- 初回アクセス時の起動に30秒〜1分かかる
- 月750時間まで（十分な時間）

---

## 🎯 ステップ3: 環境変数を設定

"Environment Variables" セクションで以下を追加:

### 必須の環境変数:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin
ADMIN_SESSION_SECRET=your_random_secret_string_here

# PayPay
PAYPAY_ACCESS_TOKEN=your_paypay_access_token
PAYPAY_REFRESH_TOKEN=your_paypay_refresh_token

# Python Path
PYTHON_PATH=python3

# Node Environment
NODE_ENV=production
```

### 環境変数の取得方法:

#### Supabase:
1. https://app.supabase.com にログイン
2. プロジェクトを選択
3. Settings → API
4. 以下をコピー:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

#### ADMIN_SESSION_SECRET:
任意のランダムな長い文字列（32文字以上推奨）

例: `my-super-secure-admin-secret-key-2024`

#### PayPay:
既存の `PAYPAY_ACCESS_TOKEN` と `PAYPAY_REFRESH_TOKEN` を使用

---

## 🎯 ステップ4: デプロイ開始

1. **"Create Web Service"** をクリック
2. 自動的にビルドとデプロイが開始されます
3. ログを確認（ビルドの進行状況が表示されます）

### ビルドログの例:
```
📦 Installing Python dependencies...
✓ PayPaython-mobile installed

📦 Installing npm dependencies...
✓ Dependencies installed

🔨 Building Next.js application...
✓ Build completed successfully!

🚀 Deploying...
✓ Service is live!
```

### デプロイ完了!
Renderが提供するURL（例: `https://plane-sns.onrender.com`）にアクセスできます。

---

## 🎯 ステップ5: Supabaseの設定を更新

RenderのURLをSupabaseに登録:

1. Supabase Dashboard → Settings → API → URL Configuration
2. **Site URL**: `https://your-app.onrender.com`
3. **Redirect URLs**: `https://your-app.onrender.com/**` を追加
4. "Save" をクリック

---

## ✅ 動作確認

以下を確認してください:

- [ ] トップページが表示される
- [ ] 商品一覧が表示される
- [ ] サインアップ/ログインが動作する
- [ ] カート機能が動作する
- [ ] 注文が作成できる
- [ ] 管理画面にアクセスできる (`/admin`)
- [ ] PayPay機能が動作する

---

## ⚠️ 無料プランの制限事項

### スリープについて:
- **15分アクセスなし** → 自動的にスリープ
- **初回アクセス** → 起動に30秒〜1分かかる
- **その後** → 通常速度で動作

### 対処方法:
1. **定期的にアクセス**: Cron jobで15分ごとにpingする
2. **UptimeRobot**: 無料の監視サービスで自動ping
   - https://uptimerobot.com
   - 5分ごとにpingを設定

---

## 🔧 トラブルシューティング

### ビルドが失敗する

**原因**: Pythonパッケージのインストール失敗

**解決方法**:
```bash
# ローカルでテスト
pip install -r requirements.txt
npm run build
```

### データベース接続エラー

**原因**: 環境変数が正しく設定されていない

**解決方法**:
1. Render Dashboard → Environment
2. 全ての環境変数が設定されているか確認
3. 特に `NEXT_PUBLIC_` プレフィックスを確認

### PayPay機能が動作しない

**原因**: Pythonパスが正しくない、またはパッケージ未インストール

**解決方法**:
1. `PYTHON_PATH=python3` が設定されているか確認
2. `requirements.txt` が存在するか確認
3. ビルドログで "Installing Python dependencies" を確認

### ページが表示されない

**原因**: スリープ状態

**解決方法**:
- 30秒〜1分待つ（初回起動）
- その後は通常速度で動作

---

## 🚀 継続的デプロイ（自動）

Renderは自動的にGitHubと連携:

- **mainブランチにプッシュ** → 自動的に再デプロイ
- **他のブランチ** → デプロイされない
- **プルリクエスト** → プレビュー環境を作成（有料プラン）

---

## 💡 アップグレードオプション

### 無料プランで困ったら:

**Starter プラン ($7/月):**
- スリープなし
- 常時起動
- より多くのリソース

**スリープを回避したい場合:**
- UptimeRobot等で定期的にping（無料）
- または有料プランにアップグレード

---

## 📊 パフォーマンス最適化

### 無料プランでも速くする:

1. **画像最適化**: Next.js Imageコンポーネント（既に実装済み）
2. **キャッシング**: 適切なCache-Controlヘッダー
3. **CDN**: Renderが自動的に提供

---

## 🎉 完了!

おめでとうございます! あなたのPlane SNSが完全無料でデプロイされました!

### 次のステップ:

1. **カスタムドメイン** (オプション):
   - Render Dashboard → Settings → Custom Domain
   - 独自ドメインを接続可能（無料プランでもOK）

2. **監視設定** (推奨):
   - UptimeRobotでダウンタイム監視
   - スリープ防止のping設定

3. **パフォーマンス監視**:
   - Renderのメトリクスを確認
   - ユーザーフィードバックを収集

---

## 🆘 サポート

問題が発生した場合:

1. [Render ドキュメント](https://render.com/docs)
2. [Render コミュニティ](https://community.render.com/)
3. このリポジトリのIssues

---

デプロイ成功をお祈りします! 🚀
