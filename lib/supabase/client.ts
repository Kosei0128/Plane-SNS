import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL または Anon Key が設定されていません。 .env.local を確認してください。",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseAdminClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("管理者用 Supabase クライアントはサーバーサイドでのみ使用してください。");
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません。");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
