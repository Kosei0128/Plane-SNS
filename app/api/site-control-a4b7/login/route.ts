import { NextRequest, NextResponse } from "next/server";
import { validateAdminCredentials, createAdminSession } from "@/lib/auth/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "ユーザー名とパスワードを入力してください" },
        { status: 400 },
      );
    }

    const user = validateAdminCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ユーザー名またはパスワードが正しくありません" },
        { status: 401 },
      );
    }

    // Create a JWT for the authenticated user
    const token = await createAdminSession(user);

    // Create the response and set the JWT in a secure, HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
