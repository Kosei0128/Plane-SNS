import { NextRequest, NextResponse } from "next/server";
import { refreshAdminSession, verifyAdminSession } from "@/lib/auth/admin-auth";

const setSessionCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string | null,
) => {
  response.cookies.set("admin-session", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  if (refreshToken) {
    response.cookies.set("admin-session-refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  } else {
    response.cookies.set("admin-session-refresh", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });
  }
};

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (typeof accessToken !== "string" || accessToken.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "accessToken is required" },
        { status: 400 },
      );
    }

    let adminUser = await verifyAdminSession(accessToken);
    let nextAccessToken = accessToken;
    let nextRefreshToken: string | null = typeof refreshToken === "string" && refreshToken.length > 0
      ? refreshToken
      : null;

    if (!adminUser) {
      if (!nextRefreshToken) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }

      const refreshed = await refreshAdminSession(nextRefreshToken);
      if (!refreshed) {
        return NextResponse.json(
          { success: false, message: "Unable to refresh session" },
          { status: 401 },
        );
      }

      adminUser = refreshed.user;
      nextAccessToken = refreshed.accessToken;
      nextRefreshToken = refreshed.refreshToken;
    }

    const response = NextResponse.json({ success: true, user: adminUser });
    setSessionCookies(response, nextAccessToken, nextRefreshToken);

    return response;
  } catch (error) {
    console.error("Admin session bootstrap failed:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
