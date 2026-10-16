import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-e-commerce-jwt-key-2026"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Total lock for /configurator, /profile, and /dashboard
  if (
    pathname.startsWith("/configurator") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/dashboard")
  ) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      // Invalid or expired token: clear cookie and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/configurator/:path*", "/profile/:path*", "/dashboard/:path*"]
};
