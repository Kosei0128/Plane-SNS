# 🚀 デプロイチェックリスト

Vercelにデプロイする前の確認事項です。

## ✅ デプロイ前チェック

### 1. ローカルでビルドテスト
```bash
npm install
npm run build
npm run start
```

### 2. 環境変数の準備
- [ ] `.env.local` に本番環境の値を設定済み
- [ ] Supabase URL と Keys を取得済み
- [ ] 管理画面用のシークレットキーを生成済み

### 3. Gitリポジトリの準備
```bash
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

## 🔧 Vercelでの設定

### デプロイ手順（5分で完了）

1. **Vercelにアクセス**: https://vercel.com
2. **"New Project"をクリック**
3. **GitHubリポジトリをインポート**
4. **環境変数を設定**:

最低限必要な環境変数:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
ADMIN_SESSION_SECRET=任意の長いランダム文字列
```

5. **"Deploy"をクリック**

## 📝 デプロイ後の設定

### Supabaseの設定更新

1. Supabase Dashboard → Settings → API → URL Configuration
2. 以下を追加:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

## 🧪 動作確認

デプロイ完了後、以下を確認:

- [ ] トップページが表示される
- [ ] 商品一覧が表示される
- [ ] サインアップ/ログインが動作する
- [ ] カート機能が動作する
- [ ] 注文が作成できる
- [ ] 管理画面にログインできる

## ⚠️ 既知の制限事項

### PayPay機能について
現在のPayPay実装はPythonスクリプトを使用しているため、Vercelでは動作しません。
対処方法:
- オプション1: PayPay機能を一時的に無効化
- オプション2: 別のサーバーレス環境を使用
- オプション3: TypeScriptで再実装

チャージ機能を無効化する場合は、`app/charge/page.tsx` と `app/api/charge/route.ts` をコメントアウトしてください。

## 💡 ヒント

### カスタムドメインを使いたい場合
Vercelダッシュボード → Settings → Domains で設定できます。

### 環境変数を変更した場合
Vercelダッシュボードで変更後、再デプロイが必要です:
```bash
vercel --prod
```

または、GitHubに新しいコミットをプッシュすると自動的に再デプロイされます。

## 🆘 トラブルシューティング

### ビルドが失敗する
```bash
# ローカルで確認
npm run build
npm run typecheck
```

### データベースに接続できない
- Supabaseの環境変数が正しいか確認
- Supabase側でVercelドメインが許可されているか確認

### 画像が表示されない
- `next.config.mjs` の `images.remotePatterns` を確認
- 使用している画像ホスティングサービスが許可リストに含まれているか確認

## 📊 パフォーマンス

デプロイ後、以下でパフォーマンスを確認:
- Vercel Analytics（ダッシュボードで有効化）
- Chrome DevTools の Lighthouse
- https://pagespeed.web.dev/

---

準備ができたら、Vercelにデプロイしましょう! 🎉
