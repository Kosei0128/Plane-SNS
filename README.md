# shark-sns-clone

## 概要

これはNext.jsとSupabaseを使用して構築された、SNS機能を持つECサイトのクローンプロジェクトです。商品の閲覧、カートへの追加、注文機能などを備えています。

## 主な機能

*   ユーザー認証（サインアップ、ログイン）
*   商品一覧表示と検索
*   ショッピングカート機能
*   注文処理
*   reCAPTCHAによるセキュリティ対策

## 使用技術

*   **フレームワーク**: [Next.js](https://nextjs.org/)
*   **バックエンド & データベース**: [Supabase](https://supabase.io/)
*   **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
*   **UIコンポーネント**: [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/)
*   **状態管理**: [Zustand](https://github.com/pmndrs/zustand)
*   **認証**: Supabase Auth

## セットアップと実行方法

1.  **リポジトリをクローンします。**
    ```bash
    git clone https://github.com/Kosei0128/Plane-SNS.git
    ```

2.  **プロジェクトディレクトリに移動します。**
    ```bash
    cd Plane-SNS
    ```

3.  **依存関係をインストールします。**
    ```bash
    npm install
    ```

4.  **環境変数を設定します。**
    `.env.example` ファイルをコピーして `.env.local` ファイルを作成し、中に記載されているSupabaseのURLやAPIキーなどを設定してください。

5.  **開発サーバーを起動します。**
    ```bash
    npm run dev
    ```

6.  ブラウザで `http://localhost:3000` を開きます。
