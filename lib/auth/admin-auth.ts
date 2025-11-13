import { createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

export type AdminRole = "admin" | "editor";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
};

type AdminAuthResult = {
  user: AdminUser;
  accessToken: string;
  refreshToken: string | null;
};

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const rawSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawSupabaseUrl || !rawSupabaseAnonKey || !rawSupabaseServiceRoleKey) {
  throw new Error(
    "Supabase credentials are missing. Please set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const supabaseUrl = rawSupabaseUrl;
const supabaseAnonKey = rawSupabaseAnonKey;
const supabaseServiceRoleKey = rawSupabaseServiceRoleKey;

const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const editorEmailList = (process.env.NEXT_PUBLIC_EDITOR_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const resolveRoleForEmail = (email: string): AdminRole | null => {
  const normalizedEmail = email.toLowerCase();
  if (adminEmailList.includes(normalizedEmail)) {
    return "admin";
  }
  if (editorEmailList.includes(normalizedEmail)) {
    return "editor";
  }
  return null;
};

const buildUsername = (email: string, fallback?: string | null): string => {
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }
  const [localPart] = email.split("@");
  return localPart || email;
};

const toAdminAuthResult = (user: User, session: Session): AdminAuthResult | null => {
  const email = user.email ?? "";
  const role = resolveRoleForEmail(email);

  if (!role) {
    return null;
  }

  return {
    user: {
      id: user.id,
      username: buildUsername(
        email,
        (user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined,
      ),
      email,
      role,
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token ?? null,
  };
};

/**
 * Supabaseに対してメールアドレス / パスワードでサインインし、管理者権限を確認します。
 */
export async function validateAdminCredentials(
  email: string,
  password: string,
): Promise<AdminAuthResult | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user || !data.session) {
    console.error("Admin Supabase sign-in failed:", error);
    return null;
  }

  const adminResult = toAdminAuthResult(data.user, data.session);

  if (!adminResult) {
    console.warn(
      `Supabase user ${data.user.email ?? "unknown"} does not have admin privileges. Check NEXT_PUBLIC_ADMIN_EMAILS / NEXT_PUBLIC_EDITOR_EMAILS.`,
    );
    return null;
  }

  return adminResult;
}

/**
 * Supabaseのアクセストークンを検証し、管理者情報を返却します。
 */
export async function verifyAdminSession(token?: string | null): Promise<AdminUser | null> {
  if (!token) {
    return null;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "bad_jwt") {
      console.warn("Supabase admin session token is invalid and will be cleared.");
    } else {
      console.error("Failed to verify admin Supabase session:", error);
    }
    return null;
  }

  const email = data.user.email ?? "";
  const role = resolveRoleForEmail(email);

  if (!role) {
    return null;
  }

  return {
    id: data.user.id,
    username: buildUsername(
      email,
      (data.user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined,
    ),
    email,
    role,
  };
}

/**
 * リフレッシュトークンからアクセストークンを再発行します。
 */
export async function refreshAdminSession(refreshToken: string): Promise<AdminAuthResult | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    // リフレッシュトークンが既に使用済みの場合、ログアウト状態に
    if (
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "refresh_token_already_used"
    ) {
      console.warn("Refresh token already used. Session needs to be re-established.");
      return null;
    }
    console.error("Failed to refresh admin Supabase session:", error);
    return null;
  }

  if (!data.session || !data.user) {
    console.error("No session or user data returned from refresh.");
    return null;
  }

  const adminResult = toAdminAuthResult(data.user, data.session);

  if (!adminResult) {
    return null;
  }

  return adminResult;
}
