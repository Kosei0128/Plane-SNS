#!/usr/bin/env node

/**
 * 管理者パスワードのハッシュを生成するスクリプト
 * 
 * 使用方法:
 *   node scripts/generate-password-hash.js
 * 
 * または:
 *   node scripts/generate-password-hash.js your-password
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

// コマンドライン引数からパスワードを取得
const args = process.argv.slice(2);

if (args.length > 0) {
  // パスワードが引数として渡された場合
  const password = args[0];
  generateHash(password);
} else {
  // パスワードが渡されていない場合、対話的に入力を求める
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('='.repeat(60));
  console.log('管理者パスワードハッシュ生成ツール');
  console.log('='.repeat(60));
  console.log('');

  rl.question('パスワードを入力してください: ', (password) => {
    rl.close();
    
    if (!password) {
      console.error('エラー: パスワードが入力されていません');
      process.exit(1);
    }

    generateHash(password);
  });
}

function generateHash(password) {
  console.log('');
  console.log('パスワードの強度をチェック中...');
  
  // パスワードの強度をチェック
  const strength = checkPasswordStrength(password);
  
  if (strength.score < 3) {
    console.warn('⚠️  警告: パスワードが弱いです');
    console.warn('推奨事項:');
    strength.suggestions.forEach(suggestion => {
      console.warn(`  - ${suggestion}`);
    });
    console.log('');
  } else {
    console.log('✓ パスワードの強度: 良好');
    console.log('');
  }

  console.log('ハッシュを生成中...');
  
  // bcryptでハッシュを生成（ソルトラウンド: 10）
  const hash = bcrypt.hashSync(password, 10);
  
  console.log('');
  console.log('='.repeat(60));
  console.log('生成されたハッシュ:');
  console.log('='.repeat(60));
  console.log(hash);
  console.log('');
  console.log('このハッシュを .env.local ファイルに設定してください:');
  console.log('');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('');
  console.log('または');
  console.log('');
  console.log(`EDITOR_PASSWORD_HASH=${hash}`);
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  重要: このハッシュは安全に保管してください');
  console.log('⚠️  このハッシュをGitHubなどに公開しないでください');
  console.log('');
}

function checkPasswordStrength(password) {
  const result = {
    score: 0,
    suggestions: []
  };

  // 長さのチェック
  if (password.length >= 12) {
    result.score += 2;
  } else if (password.length >= 8) {
    result.score += 1;
  } else {
    result.suggestions.push('パスワードは最低8文字、推奨12文字以上にしてください');
  }

  // 大文字のチェック
  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.suggestions.push('大文字を含めてください');
  }

  // 小文字のチェック
  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.suggestions.push('小文字を含めてください');
  }

  // 数字のチェック
  if (/[0-9]/.test(password)) {
    result.score += 1;
  } else {
    result.suggestions.push('数字を含めてください');
  }

  // 記号のチェック
  if (/[^A-Za-z0-9]/.test(password)) {
    result.score += 1;
  } else {
    result.suggestions.push('記号を含めてください');
  }

  return result;
}

