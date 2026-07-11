import { NextResponse } from "next/server";

/**
 * Next.js Middleware for Route Protection
 * 
 * Security layers:
 * 1. Adds security headers (XSS, clickjacking, MIME sniffing protection)
 * 2. Prevents direct access to /dashboard/* routes without a valid session cookie
 *    (Supabase stores its auth token in cookies automatically)
 * 3. Redirects unauthenticated users to /login
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Security Headers ──────────────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // ── Dashboard Route Guard ─────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // Check for Supabase auth cookie (sb-*-auth-token or sb-*-auth-token.0)
    const cookies = request.cookies.getAll();
    const hasAuthCookie = cookies.some(
      (cookie) =>
        cookie.name.includes("auth-token") ||
        cookie.name.startsWith("sb-")
    );

    if (!hasAuthCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Prevent logged-in users from seeing login page ────────────────
  if (pathname === "/login") {
    const cookies = request.cookies.getAll();
    const hasAuthCookie = cookies.some(
      (cookie) =>
        cookie.name.includes("auth-token") ||
        cookie.name.startsWith("sb-")
    );

    // If already logged in, let the client-side handle the redirect
    // (we don't redirect here because the cookie check is superficial;
    //  the actual session validity is checked client-side by Supabase)
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
};
