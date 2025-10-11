# 在庫管理システムの移行ガイド

## 変更内容

### 旧システム（ファイルベース）
- `inventory/*.txt` ファイルで在庫を管理
- ファイルシステムに依存
- セキュリティリスクあり（ディレクトリトラバーサル等）
- 手動でファイル編集が必要

### 新システム（データベースベース）
- Supabase `purchased_accounts` テーブルで在庫を管理
- 完全にDBで管理、ファイル不要
- セキュアでスケーラブル
- 管理画面から簡単に在庫追加可能

## 移行手順

### 1. 既存の在庫ファイルをDBにインポート（必要な場合）

既存の `inventory/*.txt` ファイルがある場合、以下の手順でDBに移行できます：

```bash
# sync-inventory.js を使用してインポート（旧方式のため非推奨）
# 代わりに管理画面から手動で追加することを推奨
```

### 2. 管理画面から在庫を追加

1. `/admin/inventory` にアクセス
2. 商品を選択
3. アカウント情報を1行に1件ずつ入力
4. 「在庫を追加」ボタンをクリック

**入力例:**
```
account1:password123:email1@example.com
account2:password456:email2@example.com
account3:password789:email3@example.com
```

### 3. inventory/ フォルダの削除（任意）

DBベースの在庫管理に完全移行後、以下のファイル/フォルダは不要になります：

- `inventory/` フォルダとその中のすべての `.txt` ファイル
- `sync-inventory.js` スクリプト

```bash
# PowerShell
Remove-Item -Recurse -Force inventory
Remove-Item sync-inventory.js
```

## API変更点

### `/api/inventory` エンドポイント

#### 在庫追加（新規）
```json
POST /api/inventory
{
  "itemId": "twitter-premium-1",
  "action": "add",
  "accounts": [
    "account1:password123:email1@example.com",
    "account2:password456:email2@example.com"
  ]
}
```

#### 在庫消費（変更なし）
```json
POST /api/inventory
{
  "itemId": "twitter-premium-1",
  "action": "consume"
}
```

## データベーススキーマ

### `purchased_accounts` テーブル
```sql
CREATE TABLE purchased_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id TEXT NOT NULL REFERENCES items(id),
  account_info TEXT NOT NULL,
  is_purchased BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id),
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_purchased_accounts_item_purchased 
  ON purchased_accounts(item_id, is_purchased);
```

## セキュリティ改善

### 旧システムのリスク
- ファイルシステムへの直接アクセス
- ディレクトリトラバーサル攻撃の可能性
- ファイルパーミッションの管理が必要
- サーバーのファイルシステムに依存

### 新システムの利点
- データベースのアクセス制御で保護
- SQLインジェクション対策済み（Supabaseクライアント使用）
- Row Level Security（RLS）で追加の保護が可能
- スケーラブルで信頼性が高い

## トラブルシューティング

### Q: 既存の在庫ファイルがあるが、DBに移行したい
A: 管理画面から手動でコピー&ペーストすることを推奨します。各 `.txt` ファイルの内容を管理画面のテキストエリアに貼り付けて追加してください。

### Q: 在庫が正しく表示されない
A: `items.stock` とDB内の実際の在庫数が同期していない可能性があります。以下のSQLで修正できます：

```sql
-- 各アイテムの実際の在庫数でstockカラムを更新
UPDATE items
SET stock = (
  SELECT COUNT(*)
  FROM purchased_accounts
  WHERE purchased_accounts.item_id = items.id
    AND purchased_accounts.is_purchased = FALSE
);
```

### Q: inventory/ フォルダは削除しても大丈夫？
A: DBベースの在庫管理に完全移行し、すべての在庫をDBに追加した後であれば削除しても問題ありません。念のため、削除前にバックアップを取ることを推奨します。

## 今後の拡張

DBベースになったことで、以下の機能が追加しやすくなりました：

- 在庫の一括インポート/エクスポート
- 在庫の履歴管理
- 在庫アラート（残り少なくなったら通知）
- 在庫の有効期限管理
- アカウント品質のフラグ管理

