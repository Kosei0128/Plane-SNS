import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession, AdminUser } from "@/lib/auth/admin-auth";

// Async authentication check using JWT from cookie
async function checkAuth(request: NextRequest): Promise<AdminUser | null> {
  const token = request.cookies.get("admin-session")?.value;
  if (!token) return null;
  return await verifyAdminSession(token);
}

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

export async function GET(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const { data: accounts, error } = await supabaseAdmin
      .from("purchased_accounts")
      .select("id, account_info, created_at")
      .eq("item_id", itemId)
      .eq("is_purchased", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch available accounts:", error);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    return NextResponse.json({ accounts: accounts || [] });
  } catch (error) {
    console.error("Fetch available accounts error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    const { itemId, action, accounts } = await request.json();

    if (!itemId || !action) {
      return NextResponse.json({ error: "itemId and action are required" }, { status: 400 });
    }

    if (action === "add") {
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        return NextResponse.json({ error: "Accounts data is required" }, { status: 400 });
      }

      const { data: item, error: itemError } = await supabaseAdmin
        .from("items")
        .select("id, stock")
        .eq("id", itemId)
        .single();

      if (itemError || !item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      const accountsToInsert = accounts.map((accountInfo) => ({
        item_id: itemId,
        account_info: accountInfo,
        is_purchased: false,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("purchased_accounts")
        .insert(accountsToInsert);

      if (insertError) {
        console.error("Failed to insert accounts:", insertError);
        return NextResponse.json({ error: "Failed to add account information" }, { status: 500 });
      }

      // The stock is now updated by a database trigger, so we don't need to manually fetch it.
      // We can just return a success message.
      return NextResponse.json({
        success: true,
        message: `${accounts.length} accounts were added.`,
      });
    }

    return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: unknown) {
    console.error("Inventory API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred in the inventory system.", details: message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("purchased_accounts").delete().eq("id", accountId);

    if (error) {
      console.error("Failed to delete account:", error);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
