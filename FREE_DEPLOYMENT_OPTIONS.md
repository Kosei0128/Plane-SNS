# 🆓 完全無料でPayPay機能付きデプロイする方法

PayPay機能（Python）を含めて**完全無料**でデプロイする方法を紹介します。

## 🎯 完全無料オプション

### ✅ オプション1: **Vercel (フロント) + Google Cloud Run (PayPay)** ⭐推奨!

**完全無料の理由:**
- ✅ Vercel: Hobbyプラン無料
- ✅ Google Cloud Run: 月200万リクエスト無料
- ✅ 合計: **$0/月**

**メリット:**
- 🚀 Vercelで高速なフロントエンド
- 🐍 Cloud RunでPythonコンテナ実行
- 💰 小〜中規模なら永久無料
- 🔧 比較的簡単なセットアップ

**デメリット:**
- Google Cloudアカウントが必要（クレカ登録必要だが課金されない）
- Dockerの基本知識が必要

**セットアップ時間:** 30分

---

### ✅ オプション2: **Vercel + Supabase Edge Functions** ⭐最もシンプル!

**完全無料の理由:**
- ✅ Vercel: 無料
- ✅ Supabase Edge Functions: 月50万リクエスト無料
- ✅ 合計: **$0/月**

**メリット:**
- 🚀 既にSupabaseを使っているので統合が簡単
- 💰 完全無料
- ⚡ エッジで高速実行
- 🔧 最もシンプル（Denoベース）

**デメリット:**
- PayPaython-mobileをDenoで動かす必要がある
- またはPayPay APIを直接実装する必要がある

**セットアップ時間:** 1-2時間（PayPay実装次第）

---

### ✅ オプション3: **Render (無料枠)** 

**完全無料の理由:**
- ✅ Render: 無料枠あり（制限付き）
- ✅ Python + Node.js両方サポート
- ✅ 合計: **$0/月**

**メリット:**
- 🐍 Pythonネイティブサポート
- 🚀 1つのサービスで完結
- 💰 無料

**デメリット:**
- ⏰ 15分アクセスなしでスリープ
- 🐌 コールドスタート遅い（30秒〜1分）
- 📊 月750時間制限

**セットアップ時間:** 15分

---

### ✅ オプション4: **Oracle Cloud (Always Free)** 

**完全無料の理由:**
- ✅ Oracle Cloud: Always Freeティア（永久無料）
- ✅ VM 2台無料
- ✅ 合計: **$0/月**

**メリット:**
- 💪 強力なスペック（ARM Ampere 4コア、24GB RAM）
- 🐍 PythonもNode.jsも自由に
- 💰 永久無料

**デメリット:**
- 🔧 自分でサーバー管理が必要
- 🌐 セキュリティ設定が必要
- 📚 学習コスト高い

**セットアップ時間:** 1-2時間

---

## 📋 詳細比較表

| 項目 | Vercel+Cloud Run | Vercel+Supabase | Render | Oracle Cloud |
|-----|------------------|-----------------|--------|--------------|
| **完全無料** | ✅ | ✅ | ✅ | ✅ |
| **セットアップ** | 中程度 | 簡単 | 簡単 | 難しい |
| **Pythonサポート** | ✅ | ❌(Deno) | ✅ | ✅ |
| **コールドスタート** | 速い | 最速 | 遅い | なし(常時起動) |
| **リクエスト制限** | 200万/月 | 50万/月 | 無制限 | 無制限 |
| **スリープ** | なし | なし | 15分でスリープ | なし |
| **推奨度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## 🚀 推奨: Vercel + Google Cloud Run

### アーキテクチャ
```
ユーザー
  ↓
Vercel (Next.js - 無料)
  ↓ (PayPay処理のみ)
Cloud Run (Python Container - 無料枠)
  ↓
PayPay API
```

### 無料枠の詳細
- **Vercel**: 100GB帯域/月、無制限デプロイ
- **Cloud Run**: 
  - 月200万リクエスト無料
  - 36万GB秒の実行時間無料
  - 180,000 vCPU秒無料
  - 小規模アプリなら十分!

---

## 📝 セットアップ手順

### ステップ1: Cloud Run用のDockerfileを作成

まず、PayPay専用のAPIサービスを作成します:

#### ファイル構造
```
paypay-service/
  ├── Dockerfile
  ├── requirements.txt
  ├── main.py
  └── paypay_handler.py
```

#### 1. `paypay-service/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

#### 2. `paypay-service/requirements.txt`
```
PayPaython-mobile
flask
gunicorn
```

#### 3. `paypay-service/main.py`
```python
from flask import Flask, request, jsonify
from paypay_handler import handle_paypay_request
import os

app = Flask(__name__)

@app.route('/paypay', methods=['POST'])
def paypay_endpoint():
    try:
        data = request.get_json()
        result = handle_paypay_request(data)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
```

#### 4. `paypay-service/paypay_handler.py`
```python
# 既存のclient.pyのロジックを移植
from PayPaython_mobile import PayPay
import os

def handle_paypay_request(data):
    action = data.get("action")
    access_token = data.get("access_token")
    
    paypay = PayPay(access_token=access_token)
    
    if action == "link_check":
        return check_link(paypay, data)
    elif action == "link_receive":
        return receive_link(paypay, data)
    # ... 他のアクション
```

### ステップ2: Cloud Runにデプロイ

```bash
# Google Cloud SDKインストール（初回のみ）
# https://cloud.google.com/sdk/docs/install

# ログイン
gcloud auth login

# プロジェクト作成
gcloud projects create plane-sns-paypay --name="Plane SNS PayPay"
gcloud config set project plane-sns-paypay

# Cloud Runサービスを有効化
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# デプロイ（自動でビルド＆デプロイ）
cd paypay-service
gcloud run deploy paypay-service \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars PAYPAY_ACCESS_TOKEN=your_token

# URLが表示される（例: https://paypay-service-xxx.run.app）
```

### ステップ3: Next.jsからCloud Runを呼び出す

```typescript
// lib/paypay/cloud-run-client.ts
export class CloudRunPayPayClient {
  private cloudRunUrl: string;

  constructor() {
    this.cloudRunUrl = process.env.PAYPAY_CLOUD_RUN_URL!;
  }

  async checkLink(linkUrl: string) {
    const response = await fetch(`${this.cloudRunUrl}/paypay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'link_check',
        link_url: linkUrl,
        access_token: process.env.PAYPAY_ACCESS_TOKEN
      })
    });
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
  
  // 他のメソッドも同様に実装
}
```

### ステップ4: Vercelにデプロイ

```bash
# 環境変数に追加
vercel env add PAYPAY_CLOUD_RUN_URL
# Cloud RunのURL（https://paypay-service-xxx.run.app）を入力

# デプロイ
vercel --prod
```

---

## 🎨 最もシンプル: Render (無料枠)

コールドスタートを気にしないなら、Renderが最もシンプルです。

### セットアップ手順

#### 1. `render.yaml` を作成
```yaml
services:
  - type: web
    name: plane-sns
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: ADMIN_SESSION_SECRET
        sync: false
      - key: PAYPAY_ACCESS_TOKEN
        sync: false
      - key: PYTHON_PATH
        value: python3
```

#### 2. `requirements.txt` を作成（プロジェクトルートに）
```
PayPaython-mobile
```

#### 3. Renderにデプロイ
1. https://render.com にアクセス
2. GitHubでサインアップ
3. "New Web Service"
4. リポジトリを選択
5. "Apply" をクリック

**注意**: 15分アクセスがないとスリープします（初回アクセスは30秒〜1分かかる）

---

## 💡 コスト比較（月間1000リクエストの場合）

| サービス | コスト | 制限 |
|---------|--------|------|
| Vercel + Cloud Run | $0 | 無料枠内 |
| Vercel + Supabase | $0 | 無料枠内 |
| Render | $0 | スリープあり |
| Railway | $5 | スリープなし |

---

## 🎯 最終推奨

### 👨‍💻 技術に自信がある方:
→ **Vercel + Google Cloud Run**
- 完全無料
- 高性能
- スリープなし

### 🚀 とにかく簡単に:
→ **Render 無料枠**
- 最も簡単
- スリープあり（15分）
- コールドスタート遅い

### 💰 少額なら払ってもOK:
→ **Railway** ($5/月)
- 最もバランスが良い
- スリープなし
- 高速

---

## 📚 次のステップ

どの方法で進めますか？

1. **Vercel + Cloud Run** - 完全無料、中程度の難易度（30分）
2. **Render** - 完全無料、超簡単、スリープあり（15分）
3. **Railway** - $5/月、最も快適（10分）

必要なファイルを作成しますか？
