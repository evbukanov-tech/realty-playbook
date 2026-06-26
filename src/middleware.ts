import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * Middleware на Edge Runtime — без Prisma.
 * Проверяет наличие сессионной cookie; полная валидация — в Server Components.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/my-prompts");

  // req.auth доступен, если сессия расшифрована; иначе — проверяем cookie
  const hasSessionCookie = req.cookies.has("authjs.session-token");
  const isLoggedIn = !!req.auth?.user || hasSessionCookie;

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/my-prompts/:path*", "/login"],
};
