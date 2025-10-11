#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PayPay送金リンク処理用Pythonスクリプト
PayPaython-mobileを使用してPayPayの送金リンクを検証・受け取る
"""

import sys
import json
import os
from PayPaython_mobile import PayPay

def main():
    """メイン処理"""
    try:
        # 標準入力からJSONを受け取る
        input_data = json.loads(sys.stdin.read())
        
        action = input_data.get("action")
        access_token = input_data.get("access_token")
        refresh_token = input_data.get("refresh_token")
        
        # PayPayインスタンスを初期化
        if access_token:
            # アクセストークンがある場合はそれを使用
            paypay = PayPay(access_token=access_token)
        else:
            # 環境変数からログイン情報を取得
            phone = os.environ.get("PAYPAY_PHONE")
            password = os.environ.get("PAYPAY_PASSWORD")
            device_uuid = os.environ.get("PAYPAY_DEVICE_UUID")
            
            if not phone or not password:
                raise Exception("PayPay credentials (phone and password) not found in environment variables")
            
            if not device_uuid:
                raise Exception("Device UUID is required. Please set PAYPAY_DEVICE_UUID in environment variables")
            
            # 電話番号、パスワード、Device_UUIDでログイン（ワンタイムURL不要）
            paypay = PayPay(phone, password, device_uuid)
        
        # アクションに応じた処理を実行
        if action == "link_check":
            result = check_link(paypay, input_data)
        elif action == "link_receive":
            result = receive_link(paypay, input_data)
        elif action == "link_reject":
            result = reject_link(paypay, input_data)
        elif action == "create_link":
            result = create_link(paypay, input_data)
        elif action == "get_balance":
            result = get_balance(paypay)
        elif action == "token_refresh":
            result = refresh_tokens(paypay, refresh_token)
        else:
            raise Exception(f"Unknown action: {action}")
        
        # 結果を標準出力に返す
        print(json.dumps({
            "success": True,
            "data": result
        }, ensure_ascii=False))
        
    except Exception as e:
        # エラーを標準出力に返す
        print(json.dumps({
            "success": False,
            "error": str(e)
        }, ensure_ascii=False))
        sys.exit(1)

def check_link(paypay, input_data):
    """送金リンクの確認"""
    link_url = input_data.get("link_url")
    
    if not link_url:
        raise Exception("link_url is required")
    
    # リンク情報を取得
    link_info = paypay.link_check(link_url)
    
    # レスポンス構造: {'header': {...}, 'payload': {'pendingP2PInfo': {...}, 'orderStatus': ..., 'message': {...}}}
    if isinstance(link_info, dict):
        payload = link_info.get("payload", {})
        pending_info = payload.get("pendingP2PInfo", {})
        message = payload.get("message", {})
        
        return {
            "amount": pending_info.get("amount", 0),
            "money_light": 0,  # subWalletSplitから取得する必要がある場合は追加
            "money": pending_info.get("amount", 0),  # 合計金額
            "has_password": pending_info.get("isSetPasscode", False),
            "chat_room_id": message.get("chatRoomId", ""),
            "status": payload.get("orderStatus", "UNKNOWN"),
            "order_id": pending_info.get("orderId", "")
        }
    
    # オブジェクトの場合（PayPaythonライブラリのラッパーオブジェクト）
    return {
        "amount": getattr(link_info, "amount", 0),
        "money_light": getattr(link_info, "money_light", 0),
        "money": getattr(link_info, "money", 0),
        "has_password": getattr(link_info, "has_password", False),
        "chat_room_id": getattr(link_info, "chat_room_id", ""),
        "status": getattr(link_info, "status", "UNKNOWN"),
        "order_id": getattr(link_info, "order_id", "")
    }

def receive_link(paypay, input_data):
    """送金リンクの受け取り"""
    link_url = input_data.get("link_url")
    passcode = input_data.get("passcode")
    
    if not link_url:
        raise Exception("link_url is required")
    
    # リンクを受け取る
    paypay.link_receive(link_url, passcode if passcode else None)
    
    # 最新の残高を取得
    balance = paypay.get_balance()
    
    return {
        "message": "送金リンクを受け取りました",
        "balance": {
            "all_balance": getattr(balance, "all_balance", 0),
            "useable_balance": getattr(balance, "useable_balance", 0),
            "money_light": getattr(balance, "money_light", 0),
            "money": getattr(balance, "money", 0),
            "points": getattr(balance, "points", 0)
        }
    }

def reject_link(paypay, input_data):
    """送金リンクの辞退"""
    link_url = input_data.get("link_url")
    
    if not link_url:
        raise Exception("link_url is required")
    
    # リンクを辞退
    paypay.link_reject(link_url)
    
    return {
        "message": "送金リンクを辞退しました"
    }

def create_link(paypay, input_data):
    """送金リンクの作成"""
    amount = input_data.get("amount")
    passcode = input_data.get("passcode")
    
    if not amount:
        raise Exception("amount is required")
    
    # 送金リンクを作成
    create_result = paypay.create_link(amount=amount, passcode=passcode if passcode else None)
    
    return {
        "link": getattr(create_result, "link", ""),
        "chat_room_id": getattr(create_result, "chat_room_id", "")
    }

def get_balance(paypay):
    """残高の取得"""
    balance = paypay.get_balance()
    
    return {
        "all_balance": getattr(balance, "all_balance", 0),
        "useable_balance": getattr(balance, "useable_balance", 0),
        "money_light": getattr(balance, "money_light", 0),
        "money": getattr(balance, "money", 0),
        "points": getattr(balance, "points", 0)
    }

def refresh_tokens(paypay, refresh_token):
    """トークンのリフレッシュ"""
    if not refresh_token:
        raise Exception("refresh_token is required")
    
    paypay.token_refresh(refresh_token)
    
    return {
        "access_token": paypay.access_token,
        "refresh_token": paypay.refresh_token
    }

if __name__ == "__main__":
    main()
