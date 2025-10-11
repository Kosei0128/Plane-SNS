#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PayPayテストリンク作成スクリプト
テスト用の送金リンクを簡単に作成できます
"""

import os
from PayPaython_mobile import PayPay

# .env.localから環境変数を読み込む
try:
    with open('.env.local', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
except FileNotFoundError:
    print("❌ エラー: .env.local ファイルが見つかりません")
    exit(1)

# アクセストークンを取得
access_token = os.environ.get("PAYPAY_ACCESS_TOKEN")

if not access_token or access_token.endswith('...'):
    print("❌ エラー: PAYPAY_ACCESS_TOKEN が正しく設定されていません")
    print("get_paypay_tokens.py を実行して、正しいトークンを取得してください")
    exit(1)

print("=" * 60)
print("PayPay テストリンク作成ツール")
print("=" * 60)
print()

# PayPayに接続
try:
    paypay = PayPay(access_token=access_token)
    print("✓ PayPayに接続しました")
except Exception as e:
    print(f"❌ 接続エラー: {e}")
    print("アクセストークンが期限切れの可能性があります")
    exit(1)

print()
print("テスト用の送金リンクを作成します")
print()

# 金額を入力
while True:
    amount_input = input("金額を入力（1円以上、例: 1, 10, 100）: ").strip()
    try:
        amount = int(amount_input)
        if amount < 1:
            print("❌ 1円以上を指定してください")
            continue
        break
    except ValueError:
        print("❌ 数字を入力してください")

# パスコードを入力
print()
print("パスコードを設定しますか？")
use_passcode = input("y/n（Enterでスキップ）: ").strip().lower()

passcode = None
if use_passcode == 'y':
    passcode = input("4桁のパスコードを入力: ").strip()
    if not passcode:
        passcode = None

print()
print(f"送金リンクを作成中...（金額: ¥{amount}）")

try:
    # リンク作成
    if passcode:
        link_result = paypay.create_link(amount=amount, passcode=passcode)
    else:
        link_result = paypay.create_link(amount=amount)
    
    print()
    print("=" * 60)
    print("✅ テストリンク作成成功！")
    print("=" * 60)
    print()
    print(f"📋 金額: ¥{amount}")
    if passcode:
        print(f"🔒 パスコード: {passcode}")
    else:
        print("🔓 パスコードなし")
    print()
    print("🔗 リンク:")
    print(link_result.link)
    print()
    print("-" * 60)
    print("【テスト手順】")
    print("1. 開発サーバーを起動: npm run dev")
    print("2. http://localhost:3000/charge にアクセス")
    print(f"3. 金額に {amount} を入力")
    print("4. 「PayPayでチャージ」をクリック")
    print("5. 上記のリンクを貼り付け")
    if passcode:
        print(f"6. パスコードに {passcode} を入力")
    print("7. 「確定」をクリック")
    print("-" * 60)
    print()
    
except Exception as e:
    print()
    print(f"❌ エラー: {e}")
    print()
    exit(1)
