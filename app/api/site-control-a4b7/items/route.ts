import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { verifyAdminSession, AdminUser } from "@/lib/auth/admin-auth";

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

interface Item {
  id: string;
  title: string;
  price: number;
  description: string;
  image_url: string;
  rating: number;
  category: string;
  [key: string]: unknown; // Allow for other properties
}

// Helper function to get admin's profile UUID from email
const getAdminProfileId = async (admin: AdminUser): Promise<string | null> => {
  if (!admin.email) {
    console.error("Admin user does not have an email address.");
    return null;
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", admin.email)
    .single();

  if (error || !profile) {
    console.error(`Failed to find profile for admin email ${admin.email}:`, error);
    return null;
  }

  return profile.id;
};

// Helper function to log changes to item_history
const logHistory = async (
  supabase: SupabaseClient,
  itemId: string,
  changeType: "create" | "update" | "delete",
  admin: AdminUser,
  oldData: Partial<Item> | null = null,
  newData: Partial<Item> | null = null,
) => {
  const adminProfileId = await getAdminProfileId(admin);
  if (!adminProfileId) {
    console.error("Could not log history: admin profile ID not found.");
    return; // Do not block the main operation
  }

  const { error } = await supabase.from("item_history").insert({
    item_id: itemId,
    change_type: changeType,
    changed_by: adminProfileId, // Use the correct UUID
    old_data: oldData,
    new_data: newData,
  });

  if (error) {
    console.error("Failed to log item history:", error);
  }
};

// Async authentication check using JWT from cookie
async function checkAuth(request: NextRequest): Promise<AdminUser | null> {
  const token = request.cookies.get("admin-session")?.value;
  if (!token) return null;
  return await verifyAdminSession(token);
}

// Update Item
export async function PUT(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ success: false, message: "権限がありません" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updatePayload } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "商品IDが必要です" }, { status: 400 });
    }

    const { data: existingItem, error: fetchError } = await supabaseAdmin
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: "商品の既存データの取得に失敗しました" },
        { status: 500 },
      );
    }

    const { data: updatedItem, error } = await supabaseAdmin
      .from("items")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: `商品の更新に失敗しました: ${error.message}` },
        { status: 500 },
      );
    }

    // Log the change
    await logHistory(supabaseAdmin, id, "update", admin, existingItem, updatedItem);

    return NextResponse.json({ success: true, item: updatedItem, message: "商品を更新しました" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// Delete Item
export async function DELETE(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ success: false, message: "権限がありません" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "商品IDが必要です" }, { status: 400 });
    }

    const { data: itemData, error: fetchError } = await supabaseAdmin
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !itemData) {
      return NextResponse.json(
        { success: false, message: "削除対象の商品が見つかりません" },
        { status: 404 },
      );
    }

    const { error } = await supabaseAdmin.from("items").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, message: `商品の削除に失敗しました: ${error.message}` },
        { status: 500 },
      );
    }

    // Log the change
    await logHistory(supabaseAdmin, id, "delete", admin, itemData);

    return NextResponse.json({ success: true, message: "商品を削除しました" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// Create Item
export async function POST(request: NextRequest) {
  const admin = await checkAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ success: false, message: "権限がありません" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, price, description, imageUrl, rating, category } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "必須項目が不足しています" },
        { status: 400 },
      );
    }

    const newItemData = {
      title,
      price: Number(price) || 0,
      description,
      image_url: imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475",
      rating: Number(rating) || 4.5,
      category: category || "その他",
    };

    const { data: newItem, error } = await supabaseAdmin
      .from("items")
      .insert(newItemData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: `商品の作成に失敗しました: ${error.message}` },
        { status: 500 },
      );
    }

    // Log the change
    await logHistory(supabaseAdmin, newItem.id, "create", admin, null, newItem);

    return NextResponse.json({ success: true, item: newItem, message: "商品を作成しました" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${errorMessage}` },
      { status: 500 },
    );
  }
}
