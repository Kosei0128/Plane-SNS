# セキュリティガイド

このドキュメントでは、Plane SNS ECサイトのセキュリティに関するベストプラクティスと推奨事項を説明します。

## 目次

1. [認証とアクセス制御](#認証とアクセス制御)
2. [データ保護](#データ保護)
3. [入力バリデーション](#入力バリデーション)
4. [レート制限](#レート制限)
5. [セキュリティヘッダー](#セキュリティヘッダー)
6. [環境変数の管理](#環境変数の管理)
7. [定期的なセキュリティ監査](#定期的なセキュリティ監査)
8. [インシデント対応](#インシデント対応)

## 認証とアクセス制御

### 管理者認証

管理者認証は、アプリケーションのセキュリティにおいて最も重要な要素の一つです。

#### パスワードのハッシュ化

管理者パスワードは必ずbcryptでハッシュ化して保存してください。平文でのパスワード保存は絶対に避けてください。

**パスワードハッシュの生成方法**:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-secure-password', 10));"
```

生成されたハッシュを環境変数`ADMIN_PASSWORD_HASH`に設定します。

#### JWT Secretの管理

JWT Secretは、トークンの署名と検証に使用される重要な鍵です。以下の点に注意してください:

- **長さ**: 最低32文字、推奨64文字以上
- **ランダム性**: 暗号学的に安全な乱数生成器を使用
- **秘密性**: 絶対に公開しない、ソースコードに含めない

**JWT Secretの生成方法**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### セッション管理

- **有効期限**: デフォルトは7日間ですが、セキュリティ要件に応じて調整してください
- **トークンの保存**: HTTPOnly Cookieに保存し、JavaScriptからのアクセスを防ぎます
- **トークンの更新**: 長期間使用する場合は、定期的にトークンを更新してください

### ユーザー認証

ユーザー認証はSupabase Authを使用しています。

#### 推奨設定

1. **メール確認の有効化**: Supabaseダッシュボードで「Authentication」→「Settings」→「Email Confirmations」を有効化
2. **パスワードポリシー**: 最低8文字、大文字・小文字・数字・記号を含む
3. **二要素認証**: 将来的な実装を検討

## データ保護

### Row Level Security (RLS)

Supabaseのデータベースでは、Row Level Security (RLS)を使用してデータへのアクセスを制御します。

#### RLSポリシーの確認

すべてのテーブルでRLSが有効化されていることを確認してください:

```sql
-- RLSの有効化状態を確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

#### 重要なポリシー

- **profiles**: ユーザーは自分のプロフィールのみ閲覧・更新可能
- **orders**: ユーザーは自分の注文のみ閲覧可能
- **items**: すべてのユーザーが閲覧可能、管理者のみ編集可能
- **purchased_accounts**: ユーザーは自分が購入したアカウントのみ閲覧可能

### データの暗号化

#### 転送中の暗号化

- **HTTPS**: 本番環境では必ずHTTPSを使用してください
- **TLS 1.2以上**: 古いプロトコルは無効化してください

#### 保存時の暗号化

- **Supabase**: デフォルトでデータベースが暗号化されています
- **機密情報**: クレジットカード情報などは保存しないでください

### 個人情報の取り扱い

- **最小限の収集**: 必要最小限の個人情報のみ収集してください
- **保持期間**: 不要になった個人情報は削除してください
- **アクセス制御**: 個人情報へのアクセスを制限してください

## 入力バリデーション

すべてのユーザー入力は、サーバーサイドで厳密に検証する必要があります。

### Zodスキーマの使用

Zodを使用して、入力データのバリデーションを行います。

**例**:

```typescript
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    }),
  ),
  totalAmount: z.number().int().min(1),
});
```

### SQLインジェクション対策

Supabaseのクエリビルダーを使用することで、SQLインジェクションを防ぎます。

**安全な例**:

```typescript
const { data } = await supabase.from("items").select("*").eq("category", userInput);
```

**危険な例（使用しないでください）**:

```typescript
// 文字列結合によるクエリ構築は避ける
const query = `SELECT * FROM items WHERE category = '${userInput}'`;
```

### XSS (Cross-Site Scripting) 対策

Reactは自動的にXSS攻撃を防ぎますが、以下の点に注意してください:

- **dangerouslySetInnerHTML**: 使用を避けるか、DOMPurifyなどでサニタイズ
- **ユーザー生成コンテンツ**: 適切にエスケープ

## レート制限

レート制限は、DDoS攻撃やブルートフォース攻撃からアプリケーションを保護します。

### Upstash Redisの設定

1. [Upstash](https://upstash.com/)でアカウントを作成
2. Redisデータベースを作成
3. 環境変数を設定:

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### レート制限の設定

各エンドポイントタイプに応じたレート制限が設定されています:

- **一般API**: 15分間に100リクエスト
- **認証API**: 15分間に5リクエスト
- **決済API**: 1分間に10リクエスト

これらの値は`lib/constants.ts`で調整できます。

## セキュリティヘッダー

HTTPセキュリティヘッダーを設定することで、様々な攻撃から保護できます。

### next.config.mjsの設定

```javascript
export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};
```

### Content Security Policy (CSP)

より高度なセキュリティが必要な場合は、CSPを設定してください。

## 環境変数の管理

### 環境変数の分離

開発環境と本番環境で異なる環境変数を使用してください。

- **開発環境**: `.env.local`
- **本番環境**: ホスティングサービスの環境変数設定

### 機密情報の保護

以下の情報は絶対に公開しないでください:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_JWT_SECRET`
- `ADMIN_PASSWORD_HASH`
- `PAYPAY_ACCESS_TOKEN`
- `PAYPAY_REFRESH_TOKEN`
- `UPSTASH_REDIS_REST_TOKEN`

### .gitignoreの確認

`.gitignore`に以下が含まれていることを確認してください:

```
.env
.env.local
.env.production
.env.development
```

## 定期的なセキュリティ監査

### 依存関係の監査

定期的に依存関係の脆弱性をチェックしてください。

```bash
npm audit
npm audit fix
```

### 自動化

GitHub Dependabotを有効化して、自動的に依存関係を更新してください。

1. GitHubリポジトリで「Settings」→「Security」→「Dependabot」
2. 「Enable Dependabot alerts」を有効化
3. 「Enable Dependabot security updates」を有効化

### ペネトレーションテスト

本番環境にデプロイする前に、ペネトレーションテストを実施することを推奨します。

## インシデント対応

### セキュリティインシデントの検知

以下の兆候に注意してください:

- 異常なトラフィックパターン
- 大量の失敗したログイン試行
- 予期しないデータベースクエリ
- エラーログの急増

### 対応手順

1. **インシデントの確認**: ログを確認し、問題の範囲を特定
2. **影響の評価**: 影響を受けたユーザーとデータを特定
3. **封じ込め**: 攻撃を停止させる（該当IPのブロック、サービスの一時停止など）
4. **復旧**: システムを正常な状態に戻す
5. **事後分析**: 原因を特定し、再発防止策を実施
6. **通知**: 必要に応じてユーザーに通知

### バックアップと復旧

定期的にデータベースのバックアップを取得し、復旧手順をテストしてください。

**Supabaseのバックアップ**:

1. Supabaseダッシュボードで「Database」→「Backups」
2. 手動バックアップを実行
3. バックアップのダウンロード

## セキュリティチェックリスト

デプロイ前に以下の項目を確認してください:

### 認証

- [ ] 管理者パスワードがbcryptでハッシュ化されている
- [ ] JWT Secretが強力で秘密に保たれている
- [ ] セッション有効期限が適切に設定されている

### データ保護

- [ ] すべてのテーブルでRLSが有効化されている
- [ ] HTTPSが有効化されている
- [ ] 機密情報が適切に保護されている

### 入力バリデーション

- [ ] すべてのAPIエンドポイントで入力検証を実施
- [ ] SQLインジェクション対策が実装されている
- [ ] XSS対策が実装されている

### レート制限

- [ ] 重要なエンドポイントにレート制限が設定されている
- [ ] レート制限の閾値が適切に設定されている

### セキュリティヘッダー

- [ ] セキュリティヘッダーが設定されている
- [ ] CSPが設定されている（オプション）

### 環境変数

- [ ] 機密情報が環境変数に保存されている
- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] 本番環境の環境変数が正しく設定されている

### 監査

- [ ] 依存関係の脆弱性がチェックされている
- [ ] Dependabotが有効化されている
- [ ] ログ監視が設定されている

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)

## サポート

セキュリティに関する質問や懸念がある場合は、以下の方法でお問い合わせください:

- メール: security@plane-sns.com
- セキュリティ脆弱性の報告: security-report@plane-sns.com

**重要**: セキュリティ脆弱性を発見した場合は、公開する前に必ず私たちに報告してください。
