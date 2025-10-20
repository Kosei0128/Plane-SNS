import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin-auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin-session")?.value;
  const { pathname } = request.nextUrl;

  const userPayload = token ? await verifyAdminSession(token) : null;
  const isLoggedIn = !!userPayload;

  // If user is trying to access the login page
  if (pathname === "/site-control-a4b7") {
    if (isLoggedIn) {
      // If already logged in, redirect to the dashboard
      return NextResponse.redirect(new URL("/site-control-a4b7/dashboard", request.url));
    }
    // If not logged in, allow access to the login page
    return NextResponse.next();
  }

  // For all other protected admin pages (/site-control-a4b7/*)
  if (!isLoggedIn) {
    // If not logged in, redirect to the login page
    // Preserve the original destination for a better user experience after login
    const loginUrl = new URL("/site-control-a4b7", request.url);
    loginUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in, allow access
  return NextResponse.next();
}

export const config = {
  // Match all paths under /site-control-a4b7, including the root
  matcher: ["/site-control-a4b7/:path*", "/site-control-a4b7"],
};
