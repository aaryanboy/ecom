import { NextResponse } from "next/server";

export async function middleware(req) {
  const session = req.cookies.get("session")?.value;

  // Protect dashboard and profile routes
  if (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/profile")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
