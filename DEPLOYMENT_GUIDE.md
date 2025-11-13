# デプロイメントガイド

このガイドでは、Plane SNS ECサイトを本番環境にデプロイする手順を説明します。

## 目次

1. [デプロイ前のチェックリスト](#デプロイ前のチェックリスト)
2. [Vercelへのデプロイ](#vercelへのデプロイ)
3. [Netlifyへのデプロイ](#netlifyへのデプロイ)
4. [AWS (EC2)へのデプロイ](#aws-ec2へのデプロイ)
5. [環境変数の設定](#環境変数の設定)
6. [データベースの本番環境設定](#データベースの本番環境設定)
7. [カスタムドメインの設定](#カスタムドメインの設定)
8. [SSL証明書の設定](#ssl証明書の設定)
9. [パフォーマンス最適化](#パフォーマンス最適化)
10. [モニタリングとログ](#モニタリングとログ)

## デプロイ前のチェックリスト

デプロイを開始する前に、以下の項目を確認してください。

### セキュリティ

- [ ] 管理者パスワードを強力なものに変更済み
- [ ] `ADMIN_JWT_SECRET`を本番用の強力なキーに変更済み
- [ ] Supabaseの`service_role_key`が環境変数に設定され、ソースコードから削除済み
- [ ] PayPayトークンが環境変数に設定され、ソースコードから削除済み
- [ ] `.env.local`ファイルが`.gitignore`に含まれている
- [ ] データベースのRow Level Security (RLS)が有効化されている

### 機能

- [ ] すべての機能が正常に動作することを確認
- [ ] 注文処理のテストが完了
- [ ] 決済処理のテストが完了
- [ ] 管理画面の動作確認が完了

### パフォーマンス

- [ ] 画像が最適化されている
- [ ] 不要なコンソールログが削除されている
- [ ] ビルドエラーがない

### データベース

- [ ] 本番用のSupabaseプロジェクトが作成済み
- [ ] データベーススキーマが適用済み
- [ ] ストアドプロシージャが作成済み
- [ ] 必要なインデックスが作成済み

## Vercelへのデプロイ

Vercelは、Next.jsアプリケーションのデプロイに最適なプラットフォームです。

### 1. Vercelアカウントの作成

[Vercel](https://vercel.com/)にアクセスし、GitHubアカウントでサインアップします。

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクト名を入力
4. フレームワークプリセットで「Next.js」を選択

### 3. 環境変数の設定

「Environment Variables」セクションで、以下の環境変数を設定します。

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_JWT_SECRET=your-jwt-secret
ADMIN_PASSWORD_HASH=your-password-hash
EDITOR_PASSWORD_HASH=your-password-hash
```

オプション（PayPay統合を使用する場合）:

```
PAYPAY_ACCESS_TOKEN=your-access-token
PAYPAY_REFRESH_TOKEN=your-refresh-token
PYTHON_PATH=python3
```

オプション（レート制限を使用する場合）:

```
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 4. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始します。数分後、デプロイが完了し、URLが発行されます。

### 5. カスタムドメインの設定

1. Vercelダッシュボードで「Settings」→「Domains」に移動
2. カスタムドメインを追加
3. DNSレコードを設定（Vercelが指示を表示します）

## Netlifyへのデプロイ

Netlifyも優れたホスティングプラットフォームです。

### 1. Netlifyアカウントの作成

[Netlify](https://www.netlify.com/)にアクセスし、GitHubアカウントでサインアップします。

### 2. プロジェクトのインポート

1. Netlifyダッシュボードで「Add new site」→「Import an existing project」をクリック
2. GitHubリポジトリを選択
3. ビルド設定を入力:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### 3. 環境変数の設定

「Site settings」→「Build & deploy」→「Environment」で環境変数を設定します。

### 4. デプロイ

「Deploy site」をクリックしてデプロイを開始します。

## AWS (EC2)へのデプロイ

より高度な制御が必要な場合は、AWS EC2にデプロイできます。

### 1. EC2インスタンスの作成

1. AWS Management Consoleで「EC2」サービスに移動
2. 「Launch Instance」をクリック
3. Ubuntu Server 22.04 LTSを選択
4. インスタンスタイプを選択（t2.medium以上を推奨）
5. セキュリティグループで以下のポートを開放:
   - SSH (22)
   - HTTP (80)
   - HTTPS (443)

### 2. サーバーのセットアップ

SSH接続後、以下のコマンドを実行します。

```bash
# システムのアップデート
sudo apt update && sudo apt upgrade -y

# Node.jsのインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Nginxのインストール
sudo apt install -y nginx

# PM2のインストール（プロセス管理）
sudo npm install -g pm2

# Gitのインストール
sudo apt install -y git
```

### 3. アプリケーションのデプロイ

```bash
# リポジトリのクローン
cd /var/www
sudo git clone https://github.com/your-repo/plane-sns.git
cd plane-sns

# 依存関係のインストール
sudo npm install

# 環境変数の設定
sudo nano .env.local
# 必要な環境変数を入力

# ビルド
sudo npm run build

# PM2でアプリケーションを起動
sudo pm2 start npm --name "plane-sns" -- start
sudo pm2 save
sudo pm2 startup
```

### 4. Nginxの設定

```bash
sudo nano /etc/nginx/sites-available/plane-sns
```

以下の内容を入力します。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

設定を有効化します。

```bash
sudo ln -s /etc/nginx/sites-available/plane-sns /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL証明書の設定（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 環境変数の設定

本番環境では、以下の環境変数を必ず設定してください。

### 必須の環境変数

これらの変数は必ず設定する必要があります。

| 変数名                          | 説明                          | 例                                        |
| ------------------------------- | ----------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | SupabaseプロジェクトのURL     | `https://xxx.supabase.co`                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの公開キー            | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabaseのサービスロールキー  | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `ADMIN_JWT_SECRET`              | 管理者認証用のJWTシークレット | `your-secret-key-here`                    |

### オプションの環境変数

必要に応じて設定してください。

| 変数名                     | 説明                       | デフォルト値 |
| -------------------------- | -------------------------- | ------------ |
| `ADMIN_USERNAME`           | 管理者のユーザー名         | `admin`      |
| `ADMIN_PASSWORD_HASH`      | 管理者パスワードのハッシュ | -            |
| `EDITOR_USERNAME`          | 編集者のユーザー名         | `editor`     |
| `EDITOR_PASSWORD_HASH`     | 編集者パスワードのハッシュ | -            |
| `ADMIN_SESSION_DURATION`   | セッションの有効期限       | `7d`         |
| `PAYPAY_ACCESS_TOKEN`      | PayPayアクセストークン     | -            |
| `PAYPAY_REFRESH_TOKEN`     | PayPayリフレッシュトークン | -            |
| `PYTHON_PATH`              | Pythonのパス               | `python`     |
| `UPSTASH_REDIS_REST_URL`   | Upstash RedisのURL         | -            |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redisのトークン    | -            |
| `NODE_ENV`                 | 実行環境                   | `production` |

## データベースの本番環境設定

### 1. 本番用Supabaseプロジェクトの作成

開発環境とは別に、本番用のSupabaseプロジェクトを作成することを強く推奨します。

### 2. データベーススキーマの適用

1. Supabaseダッシュボードで「SQL Editor」に移動
2. `sql/master_schema.sql`の内容を実行
3. `sql/create_order_transaction.sql`の内容を実行

### 3. バックアップの設定

Supabaseは自動的にバックアップを取得しますが、追加のバックアップ戦略を検討してください。

1. Supabaseダッシュボードで「Database」→「Backups」に移動
2. バックアップスケジュールを確認
3. 必要に応じて手動バックアップを実行

### 4. パフォーマンスの監視

Supabaseダッシュボードで、データベースのパフォーマンスを定期的に監視してください。

## カスタムドメインの設定

### DNSレコードの設定

ドメインプロバイダーで、以下のDNSレコードを設定します。

#### Vercelの場合

```
A レコード: @ → 76.76.21.21
CNAME レコード: www → cname.vercel-dns.com
```

#### Netlifyの場合

```
A レコード: @ → 75.2.60.5
CNAME レコード: www → your-site.netlify.app
```

#### AWS EC2の場合

```
A レコード: @ → [EC2のIPアドレス]
CNAME レコード: www → your-domain.com
```

## SSL証明書の設定

### Vercel / Netlifyの場合

VercelとNetlifyは、カスタムドメインを追加すると自動的にSSL証明書を発行します。特別な設定は不要です。

### AWS EC2の場合

Let's Encryptを使用して無料のSSL証明書を取得できます（前述の手順を参照）。

## パフォーマンス最適化

### 1. 画像の最適化

Next.jsの`Image`コンポーネントを使用していますが、さらに最適化するには:

- WebP形式の画像を使用
- 画像をCDNにホスト
- 適切な`sizes`属性を設定

### 2. キャッシュの設定

`next.config.mjs`でキャッシュヘッダーを設定します。

```javascript
export default {
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|gif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

### 3. CDNの活用

静的アセットをCDNにホストすることで、読み込み速度を向上できます。

## モニタリングとログ

### 1. エラー監視

Sentryなどのエラー監視サービスを導入することを推奨します。

```bash
npm install @sentry/nextjs
```

### 2. パフォーマンス監視

Google Analyticsやその他のアナリティクスツールを導入してください。

### 3. アップタイム監視

UptimeRobotなどのサービスを使用して、サイトの稼働状況を監視してください。

## トラブルシューティング

### デプロイ後にサイトが表示されない

1. ビルドログを確認してエラーがないか確認
2. 環境変数が正しく設定されているか確認
3. DNSレコードが正しく設定されているか確認

### データベース接続エラー

1. Supabaseの環境変数が正しいか確認
2. Supabaseプロジェクトが稼働しているか確認
3. ネットワーク接続を確認

### 管理画面にログインできない

1. 管理者パスワードハッシュが正しく設定されているか確認
2. `ADMIN_JWT_SECRET`が設定されているか確認
3. ブラウザのコンソールでエラーを確認

## 次のステップ

デプロイが完了したら:

1. すべての機能が正常に動作することを確認
2. パフォーマンステストを実施
3. セキュリティ監査を実施
4. バックアップ戦略を確認
5. モニタリングを設定

## サポート

デプロイに関する問題が発生した場合は、以下の方法でサポートを受けられます:

- メール: support@plane-sns.com
- Discord: [招待リンク]
- GitHub Issues: [リンク]
