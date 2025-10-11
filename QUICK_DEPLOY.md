# 🚀 Vercel 簡単デプロイ手順

## 超簡単! 3ステップでデプロイ

### ステップ 1: Vercelにアクセス
1. https://vercel.com を開く
2. GitHubアカウントでサインアップ/ログイン

### ステップ 2: プロジェクトをインポート
1. "Add New..." → "Project" をクリック
2. このGitHubリポジトリを選択
3. "Import" をクリック

### ステップ 3: 環境変数を設定
以下の環境変数を設定（Environment Variables セクション）:

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase Anon Key
SUPABASE_SERVICE_ROLE_KEY=あなたのSupabase Service Role Key
ADMIN_SESSION_SECRET=ランダムな長い文字列
```

**"Deploy" をクリック!** 🎉

---

## 環境変数の取得方法

### Supabase の値を取得:
1. https://app.supabase.com にログイン
2. あなたのプロジェクトを選択
3. Settings → API をクリック
4. 以下をコピー:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### ADMIN_SESSION_SECRET の生成:
任意のランダムな文字列（32文字以上推奨）

例:
```
my-super-secret-admin-key-12345
```

---

## デプロイ後の設定

### Supabaseの設定を更新:
1. Supabase Dashboard → Settings → API → URL Configuration
2. Site URL: デプロイされたVercel URL (例: `https://your-app.vercel.app`)
3. Redirect URLs: `https://your-app.vercel.app/**` を追加

---

## 完了! 🎊

デプロイが完了したら:
- Vercelが提供するURLにアクセス
- サインアップ/ログインをテスト
- 管理画面にアクセス (`/admin`)

---

## トラブルシューティング

### Q: ビルドが失敗する
A: ローカルで `npm run build` を実行してエラーを確認

### Q: データベースに接続できない
A: Supabaseの環境変数が正しく設定されているか確認

### Q: 画像が表示されない
A: 正常です - 開発中は問題ありません

---

詳細は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照してください。
