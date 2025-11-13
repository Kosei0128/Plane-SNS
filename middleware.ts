import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshAdminSession, verifyAdminSession } from "@/lib/auth/admin-auth";

const applySessionCookies = (
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

const clearSessionCookies = (response: NextResponse) => {
  response.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });
  response.cookies.set("admin-session-refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin-session")?.value;
  const { pathname } = request.nextUrl;

  let userPayload = await verifyAdminSession(token);
  let response: NextResponse | null = null;
  let refreshedTokens: { accessToken: string; refreshToken: string | null } | null = null;

  if (!userPayload) {
    const refreshToken = request.cookies.get("admin-session-refresh")?.value;
    if (refreshToken) {
      const refreshed = await refreshAdminSession(refreshToken);
      if (refreshed) {
        userPayload = refreshed.user;
        response = NextResponse.next();
        applySessionCookies(response, refreshed.accessToken, refreshed.refreshToken);
        refreshedTokens = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
        };
      }
    }
  }

  const isLoggedIn = !!userPayload;

  // If user is trying to access the login page
  if (pathname === "/site-control-a4b7") {
    if (isLoggedIn) {
      // If already logged in, redirect to the dashboard
      const redirectResponse = NextResponse.redirect(
        new URL("/site-control-a4b7/dashboard", request.url),
      );
      if (refreshedTokens) {
        applySessionCookies(redirectResponse, refreshedTokens.accessToken, refreshedTokens.refreshToken);
      }
      return redirectResponse;
    }
    // If not logged in, allow access to the login page
    const nextResponse = response ?? NextResponse.next();
    if (!userPayload) {
      clearSessionCookies(nextResponse);
    }
    return nextResponse;
  }

  // For all other protected admin pages (/site-control-a4b7/*)
  if (!isLoggedIn) {
    // If not logged in, redirect to the login page
    // Preserve the original destination for a better user experience after login
    const loginUrl = new URL("/site-control-a4b7", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    clearSessionCookies(redirectResponse);
    return redirectResponse;
  }

  // If logged in, allow access
  return response ?? NextResponse.next();
}

export const config = {
  // Match all paths under /site-control-a4b7, including the root
  matcher: ["/site-control-a4b7/:path*", "/site-control-a4b7"],
};
