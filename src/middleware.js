// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("session")?.value;
  console.log("Session token:", token);
  console.log("Middleware running ✅");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/explore/:path*"], // ✅ protect dashboard & explore
};
