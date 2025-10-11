import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSession } from "@/lib/auth/admin-auth";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!isValidAdminSession(token)) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    // Supabaseから履歴を取得
    let query = supabaseAdmin
      .from("item_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (itemId) {
      query = query.eq("item_id", itemId);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error("Failed to fetch history:", error);
      return NextResponse.json(
        { error: "履歴の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
