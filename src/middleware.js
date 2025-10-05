// middleware.js (at root of your project or in /app)
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("session"); // read cookie
  console.log("Session token value:", token?.value); // log the value
  console.log("hello from middleware")



  // redirect if no session
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // allow request to continue
  return NextResponse.next();
}

// Specify which paths this middleware applies to
export const config = {
  matcher: ["/dashboard/:path*"], // applies to /shop and all subpaths
};
