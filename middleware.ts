import { NextRequest, NextResponse } from "next/server";

function decodePermissions(token: string): string[] {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json).permissions ?? [];
  } catch {
    return [];
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const permissions = decodePermissions(token);
  const isPlatformLevel = permissions.includes("companies.manage");

  // Platform-level users hitting root or dashboard → send to admin panel
  if ((pathname === "/" || pathname === "/dashboard") && isPlatformLevel) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Non-platform-level users trying to access admin panel → send to dashboard
  if (pathname.startsWith("/admin") && !isPlatformLevel) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything except API routes, static files, login, password setup and terms
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|set-password|terms).*)"],
};
