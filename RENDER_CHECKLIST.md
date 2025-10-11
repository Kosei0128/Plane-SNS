# ✅ Render デプロイチェックリスト

デプロイ前の最終確認リストです。

## 📝 デプロイ前の確認

### ファイルの確認
- [x] `requirements.txt` が存在する
- [x] `render.yaml` が存在する
- [x] `build.sh` が存在する
- [ ] `.gitignore` に `.env.local` が含まれている
- [ ] 全ての変更がコミットされている

### 環境変数の準備
- [ ] Supabase URL をコピーした
- [ ] Supabase Anon Key をコピーした
- [ ] Supabase Service Role Key をコピーした
- [ ] Admin Secret を作成した（32文字以上）
- [ ] PayPay Access Token を準備した
- [ ] PayPay Refresh Token を準備した

### ローカルテスト
```bash
# ビルドテスト
npm run build

# Pythonパッケージテスト（オプション）
pip install -r requirements.txt
```

---

## 🚀 デプロイ手順（5分）

### 1. GitHubにプッシュ
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Renderでデプロイ
1. https://render.com にアクセス
2. GitHubでログイン
3. "New +" → "Web Service"
4. リポジトリを選択
5. 設定を入力:
   - Name: `plane-sns`
   - Region: `Singapore`
   - Build Command: `bash build.sh`
   - Start Command: `npm run start`
6. "Free" プランを選択
7. 環境変数を設定（下記参照）
8. "Create Web Service" をクリック

### 3. 環境変数を設定
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ADMIN_SESSION_SECRET=your_secret
PAYPAY_ACCESS_TOKEN=your_token
PAYPAY_REFRESH_TOKEN=your_refresh_token
PYTHON_PATH=python3
NODE_ENV=production
```

---

## ✅ デプロイ後の確認

### Renderでの確認
- [ ] ビルドが成功した（緑色のチェックマーク）
- [ ] "Service is live" が表示される
- [ ] URLが発行される（例: https://plane-sns.onrender.com）

### サイトの動作確認
- [ ] URLにアクセスできる
- [ ] トップページが表示される
- [ ] 商品一覧が表示される
- [ ] サインアップ/ログインページにアクセスできる

### Supabaseの設定更新
- [ ] Supabase Dashboard → Settings → API → URL Configuration
- [ ] Site URL: `https://your-app.onrender.com` を設定
- [ ] Redirect URLs: `https://your-app.onrender.com/**` を追加

### 完全な動作テスト
- [ ] 新規ユーザー登録ができる
- [ ] ログインができる
- [ ] 商品をカートに追加できる
- [ ] 注文が作成できる
- [ ] 管理画面にログインできる
- [ ] PayPay機能が動作する（リンクチェック等）

---

## ⚠️ 注意事項

### 無料プランの制限
- ⏰ 15分アクセスなしで自動スリープ
- 🐌 初回アクセス時、起動に30秒〜1分かかる
- ✅ その後は通常速度で動作

### スリープ対策（オプション）
UptimeRobotで定期的にping:
1. https://uptimerobot.com でアカウント作成
2. "Add New Monitor"
3. URL: `https://your-app.onrender.com/api/health`
4. Interval: 5分
5. これで常時起動状態を維持（実質スリープなし）

---

## 🐛 トラブルシューティング

### ビルドエラー
```bash
# ローカルで確認
npm run build
```

### Pythonエラー
```bash
# ローカルで確認
pip install -r requirements.txt
python lib/paypay/client.py
```

### データベース接続エラー
- 環境変数が正しく設定されているか確認
- Supabase側でRenderドメインが許可されているか確認

### 画像が表示されない
- 正常です（開発中は問題なし）
- 本番環境で外部URLから画像を取得します

---

## 🎉 完了!

全てのチェックが完了したら、デプロイ成功です! 🚀

RenderのURL: `https://your-app.onrender.com`

---

詳細は [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) を参照してください。
