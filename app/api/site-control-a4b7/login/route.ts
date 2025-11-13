import { NextRequest, NextResponse } from "next/server";
import { validateAdminCredentials } from "@/lib/auth/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "メールアドレスとパスワードを入力してください" },
        { status: 400 },
      );
    }

    const result = await validateAdminCredentials(email, password);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 },
      );
    }

    const { user, accessToken, refreshToken } = result;

    // Create the response and set the JWT in a secure, HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set("admin-session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    if (refreshToken) {
      response.cookies.set("admin-session-refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
