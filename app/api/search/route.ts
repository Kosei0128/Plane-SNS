import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータの取得
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, price-asc, price-desc, popular

    const supabase = getSupabaseAdminClient();

    let queryBuilder = supabase
      .from("items")
      .select("*", { count: "exact" });

    if (query) {
      const sanitizedQuery = query
        .replace(/[%_]/g, "\\$&")
        .replace(/,/g, "\\,");
      const searchValue = `%${sanitizedQuery}%`;
      queryBuilder = queryBuilder.or(
        `title.ilike.${searchValue},description.ilike.${searchValue}`
      );
    }

    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    if (minPrice !== null) {
      const min = parseInt(minPrice, 10);
      if (!isNaN(min)) {
        queryBuilder = queryBuilder.gte("price", min);
      }
    }

    if (maxPrice !== null) {
      const max = parseInt(maxPrice, 10);
      if (!isNaN(max)) {
        queryBuilder = queryBuilder.lte("price", max);
      }
    }

    switch (sortBy) {
      case "price-asc":
        queryBuilder = queryBuilder.order("price", { ascending: true });
        break;
      case "price-desc":
        queryBuilder = queryBuilder.order("price", { ascending: false });
        break;
      case "popular":
        queryBuilder = queryBuilder.order("stock", { ascending: true });
        break;
      case "newest":
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
        break;
    }

    const { data: items, error, count } = await queryBuilder;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({
        items: [],
        totalCount: 0,
        categories: [],
        appliedFilters: {
          query,
          category,
          minPrice: minPrice ? parseInt(minPrice, 10) : null,
          maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
          sortBy
        }
      });
    }

    const formattedItems = (items ?? []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      description: item.description,
      imageUrl: item.image_url,
      rating: item.rating,
      stock: item.stock,
      category: item.category
    }));

    const { data: allCategoriesData } = await supabase
      .from("items")
      .select("category");

    const categories = Array.from(
      new Set(
        (allCategoriesData ?? [])
          .map(item => item.category)
          .filter((cat): cat is string => Boolean(cat))
      )
    );

    return NextResponse.json({
      items: formattedItems,
      totalCount: count ?? formattedItems.length,
      categories,
      appliedFilters: {
        query,
        category,
        minPrice: minPrice ? parseInt(minPrice, 10) : null,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
        sortBy
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "検索に失敗しました" },
      { status: 500 }
    );
  }
}
