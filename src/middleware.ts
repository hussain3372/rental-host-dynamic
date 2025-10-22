import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Define routes for clarity
const AUTH_PATHS = ["/auth/login", "/auth/signup"];
const PROTECTED_PATHS = ["/dashboard"]; // you can add more later

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  console.log("Middleware running on:", pathname);
  console.log("Token present:", !!token);

  // 🧭 CASE 1: Logged in → visiting /auth/* → redirect to /dashboard
  if (token && AUTH_PATHS.includes(pathname)) {
    console.log("User already logged in — redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🧭 CASE 2: Not logged in → visiting a protected route → redirect to login
  if (!token && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    console.log("User not authenticated — redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ✅ Default: allow request to continue
  return NextResponse.next();
}

// ✅ Match both auth and dashboard routes for middleware execution
export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
