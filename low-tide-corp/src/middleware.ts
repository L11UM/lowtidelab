import { NextRequest, NextResponse } from "next/server";
import { expectedSessionToken, timingSafeEqual, SESSION_COOKIE } from "@/lib/auth";

// Single-owner app: everything requires a valid session except login and the
// separately authenticated Vercel cron endpoint.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/cron/daily"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const expected = await expectedSessionToken();
  const authed = cookie.length > 0 && timingSafeEqual(cookie, expected);

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
