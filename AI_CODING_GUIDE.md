# Plane SNS - AI開発コーディングガイド

このドキュメントは、AIアシスタントが効率的にプロジェクトを理解し、開発を継続できるように設計されています。

---

## 🤖 AIへのクイックリファレンス

### プロジェクトの現在地
**進捗率: 80%** - MVP完成、本番デプロイ準備段階

**最後に完了した作業:**
- 在庫管理システムの根本的な問題を修正（購入処理のリファクタリング）
- 在庫数を自動更新するデータベーストリガーを導入
- PayPay決済統合
- 残高リアルタイム更新
- 在庫管理のDB移行
- 旧在庫管理コードの完全削除

**次に取り組むべき課題:**
1. Lintエラー修正 (`any`型、未使用変数)
2. 管理者ダッシュボード統計実装

---

## 📂 重要ファイルマップ

### 🔴 頻繁に編集するファイル
```
app/api/
  ├── charge/route.ts         ← チャージAPI (PayPay統合)
  ├── orders/route.ts         ← 注文処理 (購入ロジック)
  ├── inventory/route.ts      ← 在庫管理
  └── balance/route.ts        ← 残高取得

app/admin/
  ├── inventory/page.tsx      ← 在庫追加UI
  ├── items/page.tsx          ← アイテム管理UI
  └── users/page.tsx          ← ユーザー管理UI

lib/paypay/
  ├── client.py               ← PayPay Python wrapper
  └── index.ts                ← PayPay TypeScript client

components/
  └── Header.tsx              ← ヘッダー (残高表示)
```

### 🟡 設定ファイル
```
.env.local                    ← 環境変数 (Supabase, PayPay)
supabase-setup.sql            ← DBスキーマ定義
package.json                  ← 依存関係
next.config.mjs               ← Next.js設定
tsconfig.json                 ← TypeScript設定
```

### 🟢 ドキュメント
```
PROJECT_STATUS.md             ← プロジェクト全体像 (このファイル)
AI_CODING_GUIDE.md            ← AI開発ガイド (この文書)
SETUP.md                      ← セットアップ手順
INVENTORY_MIGRATION.md        ← 在庫移行ガイド
FIX_ORDER_ERROR.md            ← 過去の修正履歴
```

---

## 🧠 コンテキスト理解チェックリスト

新しいタスクを開始する前に、以下を確認してください:

### ✅ 基本理解
- [ ] `PROJECT_STATUS.md`を読み、現在の進捗を把握した
- [ ] 関連するAPIエンドポイントの位置を確認した
- [ ] 関連するSupabaseテーブルを確認した

### ✅ コード規約
- [ ] TypeScriptを使用 (型定義必須)
- [ ] ESMモジュール (`import/export`)
- [ ] Supabase Clientは`lib/supabase/client.ts`から取得
- [ ] Admin操作には`getSupabaseAdminClient()`使用
- [ ] エラーハンドリングは必須

### ✅ データベース操作
- [ ] 変更前に`supabase-setup.sql`でスキーマ確認
- [ ] RLSポリシーを考慮
- [ ] Service Role Keyが必要な操作か確認

---

## 🎯 タスク別の実装パターン

### 1️⃣ 新しいAPIエンドポイント追加

**手順:**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    
    // 認証が必要な場合
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // データ取得
    const { data, error } = await supabase
      .from("table_name")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**チェックリスト:**
- [ ] エラーハンドリング実装
- [ ] 認証チェック (必要な場合)
- [ ] 型定義
- [ ] レスポンス形式統一

---

### 2️⃣ Supabaseクエリ実装

**基本パターン:**
```typescript
// データ取得
const { data, error } = await supabase
  .from("table_name")
  .select("column1, column2")
  .eq("column1", value)
  .single(); // 単一行の場合

// データ挿入
const { data, error } = await supabase
  .from("table_name")
  .insert([{ column1: value1, column2: value2 }])
  .select();

// データ更新
const { data, error } = await supabase
  .from("table_name")
  .update({ column1: newValue })
  .eq("id", id)
  .select();

// データ削除
const { error } = await supabase
  .from("table_name")
  .delete()
  .eq("id", id);
```

**注意点:**
- `.select()`を忘れずに (返り値が必要な場合)
- エラーチェックは必須
- RLSポリシーを考慮
- **在庫数（`items.stock`）はトリガーで自動更新されます。** `purchased_accounts`テーブルへの`INSERT`/`UPDATE`/`DELETE`時に自動で増減するため、手動での更新は不要です。

---

### 3️⃣ 管理画面UI実装

**基本構造:**
```typescript
"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/endpoint");
      const json = await res.json();
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      {/* UI実装 */}
    </div>
  );
}
```

**チェックリスト:**
- [ ] ローディング状態
- [ ] エラー表示
- [ ] レスポンシブデザイン
- [ ] 成功/失敗通知

---

### 4️⃣ PayPay統合

**使用例:**
```typescript
import { PayPayClient } from "@/lib/paypay";

const client = new PayPayClient();

// リンク確認
const info = await client.checkLink(paymentUrl, passcode);
console.log(info.amount, info.status);

// リンク受け取り
const result = await client.receiveLink(paymentUrl, passcode);
console.log(result.balance); // PayPay残高
```

**注意点:**
- Pythonプロセスを起動するため時間がかかる (3-5秒)
- エラーハンドリング必須
- `PYTHON_PATH`環境変数設定確認

---

## 🔍 デバッグ方法

### 1. APIエンドポイント
```bash
# ターミナルで確認
curl http://localhost:3000/api/endpoint

# ブラウザでJSON確認
http://localhost:3000/api/endpoint
```

### 2. Supabaseクエリ
```typescript
// エラー詳細を確認
const { data, error } = await supabase.from("table").select();
console.log("Data:", data);
console.log("Error:", error);
```

### 3. PayPay統合
```bash
# Pythonスクリプト単体テスト
python lib/paypay/client.py check <payment_url>
```

### 4. データベース
```sql
-- Supabase SQLエディタで実行
SELECT * FROM profiles WHERE email = 'test@example.com';
SELECT * FROM items WHERE stock > 0;
SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '1 day';
```

---

## 🚨 よくある問題と解決策

### 問題1: "require is not defined in ES module scope"
**原因:** CommonJS (`require`) をESMプロジェクトで使用
**解決:**
```javascript
// ❌ 間違い
const fs = require('fs');

// ✅ 正解
import fs from 'node:fs';
```

### 問題2: "'dict' object has no attribute 'amount'"
**原因:** PayPayレスポンスの構造が予想と異なる
**解決:** `client.py`で`payload.pendingP2PInfo.amount`にアクセス

### 問題3: 残高が更新されない
**原因:** イベント未発火またはSupabase更新失敗
**解決:**
1. `charge_history`テーブルに記録されているか確認
2. `profiles.credit_balance`が更新されているか確認
3. `window.dispatchEvent(new Event('balance-updated'))`が呼ばれているか確認

### 問題4: 在庫が減らない
**原因:** `purchased_accounts`の消費処理失敗
**解決:**
1. `is_purchased = false`のレコードが存在するか確認
2. `items.stock`が正しく更新されているか確認
3. トランザクション処理のエラーログ確認

---

## 📊 データフロー理解

### チャージフロー
```
ユーザー (charge page)
  ↓ PayPayリンク送信
PayPay API (client.py)
  ↓ リンク検証
/api/charge
  ↓ 金額確認・受け取り
Supabase profiles (credit_balance更新)
  ↓
Supabase charge_history (履歴記録)
  ↓ レスポンス
ユーザー (残高更新 + balance-updated event)
  ↓
Header.tsx (残高表示更新)
```

### 購入フロー
```
ユーザー (cart page)
  ↓ カート送信
/api/orders
  ↓ 在庫・残高チェック
トランザクション的な処理を開始
  ├─ orders作成
  ├─ order_items作成
  ├─ purchased_accountsのレコードをUPDATE (is_purchased=true)
  ├─ profiles.credit_balance減算
  └─ 【自動】DBトリガーがitems.stockを減算
処理完了
  ↓ レスポンス
ユーザー (注文完了画面)
```

### 在庫追加フロー
```
管理者 (inventory page)
  ↓ アイテム選択 + アカウント入力
/api/inventory (action: "add")
  ↓
Supabase purchased_accounts (一括insert)
  ↓
Supabase items (stock更新)
  ↓ レスポンス
管理者 (成功通知)
```

---

## 🎨 UI/UXガイドライン

### カラーパレット
```css
/* プライマリ */
--primary: #3B82F6;      /* ブルー */
--primary-dark: #2563EB;

/* セカンダリ */
--secondary: #8B5CF6;    /* パープル */

/* ステータス */
--success: #10B981;      /* グリーン */
--warning: #F59E0B;      /* オレンジ */
--error: #EF4444;        /* レッド */

/* ニュートラル */
--gray-50: #F9FAFB;
--gray-800: #1F2937;
```

### ボタンスタイル
```tsx
// プライマリボタン
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">

// セカンダリボタン
<button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">

// 危険ボタン
<button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
```

### レスポンシブブレークポイント
```
sm: 640px   (モバイル)
md: 768px   (タブレット)
lg: 1024px  (デスクトップ)
xl: 1280px  (大画面)
```

---

## 🧪 テスト手順

### 手動テストチェックリスト

#### ユーザー機能
- [ ] ホーム: 商品一覧表示
- [ ] 検索: キーワード・カテゴリ・価格フィルタ
- [ ] カート: 追加・削除・数量変更
- [ ] 購入: 在庫切れ・残高不足のエラー
- [ ] チャージ: PayPayリンク検証・残高更新
- [ ] 注文履歴: アカウント情報表示

#### 管理者機能
- [ ] ログイン: 管理者メール認証
- [ ] ユーザー管理: 一覧・残高調整
- [ ] アイテム管理: 追加・編集・削除
- [ ] 在庫管理: アカウント一括追加
- [ ] 注文管理: 全注文閲覧

---

## 📝 コード規約

### TypeScript
```typescript
// ✅ 良い例
interface User {
  id: string;
  email: string;
  balance: number;
}

const getUser = async (id: string): Promise<User | null> => {
  // ...
}

// ❌ 悪い例
const getUser = async (id: any): Promise<any> => {
  // ...
}
```

### 命名規則
- **ファイル**: kebab-case (`user-profile.tsx`)
- **コンポーネント**: PascalCase (`UserProfile`)
- **関数・変数**: camelCase (`getUserProfile`)
- **定数**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **型・インターフェース**: PascalCase (`UserProfile`)

### インポート順序
```typescript
// 1. Reactライブラリ
import { useState, useEffect } from "react";
import { NextRequest, NextResponse } from "next/server";

// 2. サードパーティ
import { createClient } from "@supabase/supabase-js";

// 3. 内部モジュール
import { getSupabaseAdminClient } from "@/lib/supabase/client";
import { PayPayClient } from "@/lib/paypay";

// 4. 型定義
import type { User, Item } from "@/types";
```

---

## 🔒 セキュリティチェックリスト

### API実装時
- [ ] 認証チェック実装
- [ ] ユーザー権限確認
- [ ] 入力値バリデーション
- [ ] SQLインジェクション対策 (Supabaseが自動対応)
- [ ] XSS対策 (Reactが自動対応)
- [ ] Rate limiting考慮

### 管理者機能
- [ ] メールベース認証
- [ ] Service Role Key使用
- [ ] 操作ログ記録 (item_history)

### 環境変数
- [ ] `.env.local`をGit管理外に
- [ ] 本番環境で異なるキー使用
- [ ] NEXT_PUBLIC_プレフィックス注意 (クライアント公開)

---

## 🚀 デプロイ前チェックリスト

- [ ] 全APIエンドポイントのエラーハンドリング確認
- [ ] 環境変数をVercelに設定
- [ ] Supabase RLSポリシー確認
- [ ] PayPay本番環境トークン取得
- [ ] ビルドエラーなし (`npm run build`)
- [ ] Lintエラー修正 (`npm run lint`)
- [ ] 手動テスト完了
- [ ] データベースバックアップ

---

## 📞 問題が発生したら

### 1. エラーログ確認
- ブラウザコンソール
- ターミナル出力
- Supabaseログ

### 2. 関連ドキュメント参照
- `PROJECT_STATUS.md` - 全体像
- `SETUP.md` - セットアップ
- `INVENTORY_MIGRATION.md` - 在庫移行
- `FIX_ORDER_ERROR.md` - 過去の修正例

### 3. データベース確認
Supabase SQLエディタで現状を確認

### 4. 段階的デバッグ
- 単純な部分から確認
- console.logで値を確認
- 各ステップでエラーチェック

---

## 🎯 優先順位付けルール

### 🔴 高優先度 (すぐに対応)
- セキュリティ脆弱性
- データ整合性の問題
- 決済エラー
- ユーザーブロッキングバグ

### 🟡 中優先度 (1週間以内)
- パフォーマンス問題
- UI/UXの改善
- Lintエラー
- 管理機能の追加

### 🟢 低優先度 (余裕があれば)
- リファクタリング
- コメント追加
- テストコード
- ドキュメント更新

---

**このガイドを参照して、効率的にコーディングを進めてください!**

**最終更新: 2025年10月9日**
