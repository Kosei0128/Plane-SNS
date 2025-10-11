// 本番環境では強力な認証システム（NextAuth.js、Clerk、Auth0など）を使用してください
// これは開発用の簡易実装です

export type AdminUser = {
  id: string;
  username: string;
  role: "admin" | "editor";
};

// 環境変数から管理者情報を取得（本番ではDBやAuth providerを使用）
const ADMIN_USERS = [
  { id: "admin-1", username: "admin", password: "admin123", role: "admin" as const },
  { id: "admin-2", username: "editor", password: "editor123", role: "editor" as const }
];

export function validateAdminCredentials(username: string, password: string): AdminUser | null {
  const user = ADMIN_USERS.find((u) => u.username === username && u.password === password);
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}

export function isValidAdminSession(sessionToken: string | undefined): boolean {
  // 本番では JWT トークン検証やセッションDB確認を実装
  return sessionToken === "admin-session-token";
}

export function createAdminSession(): string {
  // 本番では JWT トークンを生成
  return "admin-session-token";
}
