# Plane SNS - エラー修正完了

## 🔧 修正内容

### 問題点
注文作成APIで「注文の作成に失敗しました」エラーが発生していました。

### 原因
`orders`テーブルのカラム名が`total`なのに、APIコードでは`total_amount`を使用していました。

### 修正箇所

1. **POST /api/orders** (注文作成)
   - `total_amount` → `total` に修正

2. **GET /api/orders** (注文履歴取得)
   - `order.total_amount` → `order.total` に修正

3. **詳細なログ出力を追加**
   - 各処理ステップでコンソールログを出力
   - エラー時の詳細情報を記録

## ⚠️ 重要: SQLの実行が必要

次の手順で`supabase-additional.sql`を実行してください:

### 手順

1. **Supabase Dashboard**にアクセス
   - プロジェクトを開く

2. **SQL Editor**を開く
   - 左メニューから「SQL Editor」をクリック

3. **SQLを実行**
   - `supabase-additional.sql`の全内容をコピー
   - SQL Editorに貼り付け
   - **Run**ボタンをクリック

4. **実行完了を確認**
   - エラーがないことを確認
   - "Success. No rows returned"のようなメッセージが表示される

### SQLで作成されるもの

- ✅ `purchased_accounts`テーブル
- ✅ Service roleポリシー (items, orders, profiles, etc.)
- ✅ 初期商品データ (twitter-premium-1, instagram-business-1, test items)

## 🧪 テスト手順

### 1. 開発サーバーを再起動
```powershell
# Ctrl+C で停止
npm run dev
```

### 2. ブラウザでテスト

1. ログイン
2. 「【テスト用】1円アイテム」をカートに追加
3. カートページで購入
4. ターミナルで以下のログを確認:
   ```
   === Order Creation Started ===
   User authenticated: xxx
   Order request: { itemCount: 1, totalAmount: 1 }
   Creating order in database...
   Order created successfully: xxx
   Inserting order items: ...
   Order items created successfully
   Inserting purchased accounts: 1 items
   Purchased accounts saved successfully
   Updating balance: 9999 -> 9998
   Balance updated successfully
   === Order Creation Completed Successfully ===
   ```

5. 購入成功モーダルが表示される
6. アカウント情報がコピーできる
7. 「📦 注文履歴を見る」をクリック
8. 購入履歴が表示される

### 3. エラーチェック

もしエラーが発生した場合:
- F12でブラウザの開発者ツールを開く
- Consoleタブでエラーを確認
- Networkタブで`/api/orders`のレスポンスを確認
- ターミナルでサーバーログを確認

## 📝 次回以降の注意点

データベースのカラム名とAPIコードの整合性を確認する:
- `orders.total` (NOT `total_amount`)
- `profiles.credit_balance` (NOT `balance`)
- snake_case (DB) ↔ camelCase (フロントエンド) の変換

## 🎯 これで完了!

SQLを実行してから、もう一度購入をテストしてください。
