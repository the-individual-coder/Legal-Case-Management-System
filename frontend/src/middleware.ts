// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/api/auth/",
  "/_next",
  "/favicon.ico",
  "/logo.png",
  "/_next/static",
  "/assets",
  "/public",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname) || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // authenticated - allow. Fine-grained RBAC handled client-side/server-side guards per page.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
