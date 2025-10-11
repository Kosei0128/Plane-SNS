# 🛫 Plane SNS - SNSアカウント販売プラットフォーム

> PayPay決済統合型のSNSアカウント販売・管理システム

[![Next.js](https://img.shields.io/badge/Next.js-15.2.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![PayPay](https://img.shields.io/badge/PayPay-Integration-red)](https://paypay.ne.jp/)

---

## 📖 プロジェクト概要

**Plane SNS**は、SNSアカウントを安全に販売・購入できるNext.jsベースのプラットフォームです。PayPay決済を統合し、在庫管理から注文処理まで完全自動化されたシステムを提供します。

### 主要機能
- ✨ PayPay決済統合 (完全自動)
- 🔐 セキュアな在庫管理 (Supabase PostgreSQL)
- 📊 管理者ダッシュボード (ユーザー・商品・在庫管理)
- 🛒 リアルタイムカート (Zustand)
- 💳 残高管理 (サイト内クレジット + PayPay)
- 📱 レスポンシブUI (モバイル対応)

---

## 📚 ドキュメント一覧

| ファイル | 説明 | 読むべき人 |
|---------|------|-----------|
| **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** | 📊 プロジェクト全体の進捗・完了/未完了機能 | 全員 (まず最初に) |
| **[AI_CODING_GUIDE.md](./AI_CODING_GUIDE.md)** | 🤖 AI開発者向け実装ガイド・パターン集 | AI開発者 |
| **[SETUP.md](./SETUP.md)** | ⚙️ 詳細なセットアップ手順 | 初回セットアップ時 |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | 🚀 Vercelデプロイ完全ガイド | デプロイ時 |
| **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** | ✅ デプロイ前チェックリスト | デプロイ直前 |
| **[INVENTORY_MIGRATION.md](./INVENTORY_MIGRATION.md)** | 📦 在庫管理システム移行ガイド | 在庫機能理解時 |
| **[FIX_ORDER_ERROR.md](./FIX_ORDER_ERROR.md)** | 🐛 過去のバグ修正履歴 | トラブル発生時 |

### 📖 推奨読書順序

1. **初めての方**: このREADME → `PROJECT_STATUS.md` → `SETUP.md`
2. **AI開発者**: `PROJECT_STATUS.md` → `AI_CODING_GUIDE.md`
3. **デプロイ時**: `DEPLOY_CHECKLIST.md` → `DEPLOYMENT_GUIDE.md`
4. **特定機能**: 該当する専門ドキュメント

---

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- Python 3.8以上 (PayPay統合用)
- Supabaseアカウント
- PayPayアカウント

### インストール

```bash
# リポジトリクローン
git clone <repository-url>
cd "Plane SNS"

# 依存関係
npm install
pip install paypaython-mobile
```

### 環境変数設定

`.env.local`ファイル作成:

```bash
# Supabase (必須)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# PayPay (必須)
PAYPAY_PHONE=090-xxxx-xxxx
PAYPAY_PASSWORD=xxxxx
PAYPAY_DEVICE_UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYPAY_ACCESS_TOKEN=ICAgeyJxxx...
PYTHON_PATH=python

# 管理者
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### データベースセットアップ

Supabase SQLエディタで実行:

1. `supabase-setup.sql` (メインスキーマ)
2. `supabase-additional.sql` (追加ポリシー)
3. `supabase-balance.sql` (残高管理)

### 起動

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## 🎯 開発ステータス (進捗: 80%)

### ✅ 完了
- 基本インフラ、データベース設計
- 認証システム (Supabase Auth)
- ユーザー機能 (購入、チャージ、注文履歴)
- 在庫管理システム (DB移行完了)
- PayPay決済統合 (完全動作)
- 管理者機能 (ユーザー・商品・在庫管理)

### 🚧 進行中
- 管理者ダッシュボード統計
- 通知機能
- パフォーマンス最適化

### 📋 未着手
- テストコード
- 本番デプロイ (Vercel)

詳細は **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** 参照

---

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes, Supabase (PostgreSQL)
- **決済**: PayPay (PayPaython-mobile)
- **認証**: Supabase Auth
- **状態管理**: Zustand
- **デプロイ**: Vercel (予定)

---

## 📁 プロジェクト構造

```
Plane SNS/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   ├── admin/             # 管理者画面
│   ├── auth/              # 認証ページ
│   ├── cart/              # カート
│   └── charge/            # チャージ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ
│   ├── supabase/         # Supabase設定
│   └── paypay/           # PayPay統合
├── *.sql                  # DBスキーマ
└── *.md                   # ドキュメント
```

---

## 🔧 よく使うコマンド

```bash
npm run dev      # 開発サーバー
npm run build    # ビルド
npm run lint     # Lint
python get_paypay_tokens.py  # PayPayトークン取得
```

---

## 🤖 AI開発者の方へ

このプロジェクトはAI開発に最適化されています:

1. **[AI_CODING_GUIDE.md](./AI_CODING_GUIDE.md)** を読む
2. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** で現状確認
3. タスクを選んで実装開始

### 実装パターン、デバッグ方法、よくある問題の解決策がすべて記載されています!

---

## ⚠️ 重要な注意事項

1. **最初に必ず `PROJECT_STATUS.md` を読んでください**
2. Supabaseのデータベース設定が必須
3. PayPayトークンの取得が必要
4. `.env.local`は必ずGit管理外に

---

## 📞 問題が発生したら

1. `AI_CODING_GUIDE.md` の「よくある問題」を確認
2. 関連ドキュメントを参照
3. Supabaseログ確認
4. ターミナルエラーログ確認

---

## 📌 クイックリンク

- 📊 [プロジェクト全体像 (必読)](./PROJECT_STATUS.md)
- 🤖 [AI開発ガイド](./AI_CODING_GUIDE.md)
- ⚙️ [セットアップ手順](./SETUP.md)

---

**プロジェクト開始**: 2025年10月  
**最終更新**: 2025年10月9日  
**進捗率**: 80% (MVP完成)

**Happy Coding! 🚀**
