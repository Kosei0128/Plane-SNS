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

// 認証チェックヘルパー
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!isValidAdminSession(token)) {
    return false;
  }
  return true;
}

// 商品更新
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { success: false, message: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, title, price, description, imageUrl, rating, stock, category } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "商品IDが必要です" },
        { status: 400 }
      );
    }

    interface ItemUpdatePayload {
      title?: string;
      price?: number;
      description?: string;
      image_url?: string;
      rating?: number;
      stock?: number;
      category?: string;
    }

    // Supabaseで商品を更新
    const updateData: ItemUpdatePayload = {};
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (category !== undefined) updateData.category = category;

    const { data: updatedItem, error } = await supabaseAdmin
      .from("items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update item:", error);
      return NextResponse.json(
        { success: false, message: "商品の更新に失敗しました" },
        { status: 500 }
      );
    }

    // 履歴に記録
    await supabaseAdmin.from("item_history").insert({
      item_id: id,
      change_type: "update",
      new_data: updateData
    });

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        title: updatedItem.title,
        price: updatedItem.price,
        description: updatedItem.description,
        imageUrl: updatedItem.image_url,
        rating: updatedItem.rating,
        stock: updatedItem.stock,
        category: updatedItem.category
      },
      message: "商品を更新しました"
    });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 商品削除
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { success: false, message: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "商品IDが必要です" },
        { status: 400 }
      );
    }

    // 履歴に記録（削除前に取得）
    const { data: itemData } = await supabaseAdmin
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    // Supabaseから商品を削除
    const { error } = await supabaseAdmin
      .from("items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete item:", error);
      return NextResponse.json(
        { success: false, message: "商品の削除に失敗しました" },
        { status: 500 }
      );
    }

    // 履歴に記録
    if (itemData) {
      await supabaseAdmin.from("item_history").insert({
        item_id: id,
        change_type: "delete",
        old_data: itemData
      });
    }

    return NextResponse.json({
      success: true,
      message: "商品を削除しました"
    });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 商品作成
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { success: false, message: "認証が必要です" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, title, price, description, imageUrl, rating, stock, category } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // IDが指定されていない場合は自動生成
    const itemId = id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Supabaseに商品を作成
    const newItemData = {
      id: itemId,
      title,
      price: Number(price) || 0,
      description,
      image_url: imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475",
      rating: Number(rating) || 4.5,
      stock: Number(stock) || 0,
      category: category || "その他"
    };

    const { data: newItem, error } = await supabaseAdmin
      .from("items")
      .insert(newItemData)
      .select()
      .single();

    if (error) {
      console.error("Failed to create item:", error);
      return NextResponse.json(
        { success: false, message: "商品の作成に失敗しました" },
        { status: 500 }
      );
    }

    // 履歴に記録
    await supabaseAdmin.from("item_history").insert({
      item_id: newItem.id,
      change_type: "create",
      new_data: newItemData
    });

    return NextResponse.json({
      success: true,
      item: {
        id: newItem.id,
        title: newItem.title,
        price: newItem.price,
        description: newItem.description,
        imageUrl: newItem.image_url,
        rating: newItem.rating,
        stock: newItem.stock,
        category: newItem.category
      },
      message: "商品を作成しました"
    });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
