import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
];

/**
 * Edge middleware без NextAuth: database-сессии нельзя читать на Edge,
 * а вызов auth() с JWT-стратегией по умолчанию удаляет cookie сессии.
 * Достаточно проверить наличие cookie; полная валидация — в Server Components.
 */
function hasSessionCookie(req: NextRequest): boolean {
  return req.cookies.getAll().some((cookie) =>
    SESSION_COOKIE_PREFIXES.some(
      (prefix) =>
        cookie.name === prefix || cookie.name.startsWith(`${prefix}.`),
    ),
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/my-prompts");

  const isLoggedIn = hasSessionCookie(req);

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/my-prompts",
    "/my-prompts/:path*",
    "/login",
  ],
};
