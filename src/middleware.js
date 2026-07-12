import { NextResponse } from "next/server";

/**
 * Next.js Middleware — Security Headers Only
 * 
 * Route protection is handled client-side by each dashboard page
 * via supabase.auth.getSession() checks (Supabase stores auth
 * tokens in localStorage, not cookies).
 */
export function middleware(request) {
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

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
};
