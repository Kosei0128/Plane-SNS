import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Clear the cookie
  response.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0), // Set expiry to the past
  });

  response.cookies.set("admin-session-refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
