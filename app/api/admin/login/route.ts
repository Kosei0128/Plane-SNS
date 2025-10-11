import { NextRequest, NextResponse } from "next/server";
import { validateAdminCredentials, createAdminSession } from "@/lib/auth/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "ユーザー名とパスワードを入力してください" },
        { status: 400 }
      );
    }

    const user = validateAdminCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ユーザー名またはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const token = createAdminSession();

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
