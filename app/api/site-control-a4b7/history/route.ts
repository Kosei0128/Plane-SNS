import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Async authentication check using JWT from cookie
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get("admin-session")?.value;
  if (!token) return null;
  return await verifyAdminSession(token);
}

export async function GET(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    // Fetch history from Supabase
    let query = supabaseAdmin
      .from("item_history")
      .select("*")
      .order("changed_at", { ascending: false });

    if (itemId) {
      query = query.eq("item_id", itemId);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error("Failed to fetch history:", error);
      return NextResponse.json({ error: "履歴の取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "履歴の取得に失敗しました" }, { status: 500 });
  }
}
