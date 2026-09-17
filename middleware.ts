import { NextRequest, NextResponse } from "next/server";

function decodeRole(token: string): string | undefined {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json).role;
  } catch {
    return undefined;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = decodeRole(token);

  // Superadmin hitting root or dashboard → send to admin panel
  if ((pathname === "/" || pathname === "/dashboard") && role === "superadmin") {
    return NextResponse.redirect(new URL("/admin/companies", req.url));
  }

  // Non-superadmin trying to access admin panel → send to dashboard
  if (pathname.startsWith("/admin") && role !== "superadmin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything except API routes, static files, and login
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
