import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get("accessToken")?.value;
  const adminToken = request.cookies.get("adminAccessToken")?.value;
  const superAdminToken = request.cookies.get("superAdminAccessToken")?.value;

  console.log("Path:", pathname);

  // 🔹 USER ROUTES
  if (pathname.startsWith("/auth/")) {
    if (userToken && (pathname === "/auth/login" || pathname === "/auth/signup")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") && !userToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 🔹 ADMIN ROUTES
  if (pathname.startsWith("/admin/auth/login") && adminToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/auth/") && !adminToken) {
    return NextResponse.redirect(new URL("/admin/auth/login", request.url));
  }

  // 🔹 SUPER ADMIN ROUTES
  if (pathname.startsWith("/super-admin/auth/login") && superAdminToken) {
    return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
  }

  if (pathname.startsWith("/super-admin/") && !pathname.startsWith("/super-admin/auth/") && !superAdminToken) {
    return NextResponse.redirect(new URL("/super-admin/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/super-admin/:path*"
  ],
};