import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export type Item = {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  rating: number;
  stock: number;
  category: string;
};

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

export async function GET() {
  try {
    const { data: items, error } = await supabaseAdmin
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch items:", error);
      return NextResponse.json({ items: [] });
    }

    // Supabaseのカラム名をフロントエンドの形式に変換
    const formattedItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      description: item.description,
      imageUrl: item.image_url,
      rating: item.rating,
      stock: item.stock,
      category: item.category,
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("Items API error:", error);
    return NextResponse.json({ items: [] });
  }
}
