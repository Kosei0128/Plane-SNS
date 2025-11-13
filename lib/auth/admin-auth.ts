import { SignJWT, jwtVerify } from "jose";
import * as bcrypt from "bcryptjs";

export type AdminUser = {
  id: string;
  username: string;
  email?: string;
  role: "admin" | "editor";
};

/**
 * 管理者認証情報の取得
 * 環境変数から管理者情報を取得します
 *
 * セキュリティ上の理由から、以下の対策を実施してください:
 * 1. 環境変数に認証情報を設定
 * 2. パスワードはbcryptでハッシュ化
 * 3. 本番環境では必ずデータベースへの移行を検討
 */
const getAdminUsers = () => {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const editorUsername = process.env.EDITOR_USERNAME || "editor";
  const editorPasswordHash = process.env.EDITOR_PASSWORD_HASH;

  if (!adminPasswordHash || !editorPasswordHash) {
    console.warn("⚠️ WARNING: Admin password hashes not set in environment variables.");
    console.warn("⚠️ Please set ADMIN_PASSWORD_HASH and EDITOR_PASSWORD_HASH in production.");
    console.warn(
      "⚠️ Generate hash: node -e \"const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));\"",
    );

    // 開発環境用のデフォルト値（本番環境では絶対に使用しないこと）
    // デフォルトパスワード: "ChangeMe123!"
    // ハッシュ: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
    return [
      {
        id: "admin-1",
        username: adminUsername,
        passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        role: "admin" as const,
      },
      {
        id: "editor-1",
        username: editorUsername,
        passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        role: "editor" as const,
      },
    ];
  }

  return [
    {
      id: "admin-1",
      username: adminUsername,
      passwordHash: adminPasswordHash,
      role: "admin" as const,
    },
    {
      id: "editor-1",
      username: editorUsername,
      passwordHash: editorPasswordHash,
      role: "editor" as const,
    },
  ];
};

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "ADMIN_JWT_SECRET is not set in the environment variables. Please check your .env.local file.",
  );
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * 管理者認証情報を検証します
 * パスワードはbcryptでハッシュ化されたものと比較します
 *
 * @param username 管理者のユーザー名
 * @param password 管理者のパスワード（平文）
 * @returns 認証が成功した場合はユーザー情報、失敗した場合はnull
 */
export async function validateAdminCredentials(
  username: string,
  password: string,
): Promise<(Omit<AdminUser, "id"> & { id: string }) | null> {
  const adminUsers = getAdminUsers();
  const user = adminUsers.find((u) => u.username === username);

  if (!user) {
    return null;
  }

  // bcryptでパスワードを検証
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

/**
 * 管理者用のJWTトークンを生成します
 *
 * @param user トークンに含めるユーザー情報
 * @returns 署名されたJWTトークン
 */
export async function createAdminSession(user: AdminUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.ADMIN_SESSION_DURATION || "7d")
    .sign(secretKey);

  return token;
}

/**
 * JWTトークンを検証し、ペイロードを返します
 *
 * @param token 検証するJWTトークン
 * @returns トークンが有効な場合はユーザー情報、無効な場合はnull
 */
export async function verifyAdminSession(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (
      payload &&
      typeof payload.sub === "string" &&
      typeof payload.username === "string" &&
      (payload.role === "admin" || payload.role === "editor")
    ) {
      return {
        id: payload.sub,
        username: payload.username,
        email: typeof payload.email === "string" ? payload.email : undefined,
        role: payload.role,
      };
    }
    return null;
  } catch (error) {
    // トークンの有効期限切れ、無効な署名などをキャッチ
    console.error("Admin session verification failed:", error);
    return null;
  }
}
