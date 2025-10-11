#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PayPay初回ログインスクリプト
"""

from PayPaython_mobile import PayPay
import time

print("=" * 60)
print("PayPay初回ログイン")
print("=" * 60)
print()

# アカウント情報
phone = "090-6708-0452"
password = "Sk535616"

print(f"電話番号: {phone}")
print(f"パスワード: {'*' * len(password)}")
print()

# PayPayインスタンス作成
print("PayPayに接続しています...")
paypay = PayPay(phone, password)
print("✓ 接続成功")
print()

print("=" * 60)
print("【重要】PayPayアプリを今すぐ開いてください！")
print("=" * 60)
print("通知が届いているはずです。")
print("通知をタップして、表示されたURLをコピーしてください。")
print()
print("URLの例:")
print("  https://www.paypay.ne.jp/portal/oauth2/l?id=XXXXXX")
print()
print("または、id= の後ろの部分だけでもOK:")
print("  XXXXXX")
print()

# URLを入力
url = input("コピーしたURLまたはIDを貼り付けてEnter: ").strip()

if not url:
    print("\n❌ エラー: URLが入力されていません")
    exit(1)

print()
print("ログイン処理中...")

try:
    # ログイン実行
    paypay.login(url)
    
    print()
    print("=" * 60)
    print("✅ ログイン成功！")
    print("=" * 60)
    print()
    
    # トークン情報を表示
    print("以下の内容を .env.local ファイルにコピー＆ペーストしてください:")
    print()
    print("-" * 60)
    print(f"PAYPAY_PHONE={phone}")
    print(f"PAYPAY_PASSWORD={password}")
    print(f"PAYPAY_DEVICE_UUID={paypay.device_uuid}")
    print(f"PAYPAY_ACCESS_TOKEN={paypay.access_token}")
    print(f"PAYPAY_REFRESH_TOKEN={paypay.refresh_token}")
    print(f"PYTHON_PATH=python")
    print("-" * 60)
    print()
    
    print("📋 上記の6行をコピーして、.env.local に貼り付けてください")
    print("⚠️  アクセストークンは90日間有効です")
    print("⚠️  この情報は絶対に他人に見せないでください")
    print()
    
except Exception as e:
    print()
    print("=" * 60)
    print("❌ エラーが発生しました")
    print("=" * 60)
    print()
    print(f"エラー内容: {e}")
    print()
    print("【対処方法】")
    print("1. PayPayアプリで新しい通知を確認")
    print("2. もう一度このスクリプトを実行")
    print("3. 通知が届いたら、すぐにURLをコピーして入力")
    print()
    exit(1)
