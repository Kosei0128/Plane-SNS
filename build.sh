#!/bin/bash

# Renderのビルドスクリプト
# Pythonパッケージとnpmパッケージの両方をインストール

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing npm dependencies..."
npm install

echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
