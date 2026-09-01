import { NextRequest, NextResponse } from "next/server";
import { expectedSessionToken, timingSafeEqual, SESSION_COOKIE } from "@/lib/auth";

// Single-owner app: everything requires a valid session except login and the
// separately authenticated Vercel cron endpoint.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/cron/daily", "/api/cron/night", "/api/admin/repair-workday"];

function secure(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return secure(NextResponse.next());
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const expected = await expectedSessionToken();
  const authed = cookie.length > 0 && timingSafeEqual(cookie, expected);

  if (authed) return secure(NextResponse.next());

  if (pathname.startsWith("/api/")) {
    return secure(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return secure(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
