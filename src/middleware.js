// middleware.js
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();

  // Only protect /owner routes
  if (url.pathname.startsWith("/owner")) {
    const sessionCookie = req.cookies.get("session")?.value;

    if (!sessionCookie) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Call your check-session API
    const res = await fetch(`${req.nextUrl.origin}/api/check-session`, {
      headers: { cookie: `session=${sessionCookie}` },
    });

    const data = await res.json();

    // Redirect non-logged-in or non-owner users
    if (!data.loggedIn || !data.user?.isOwner) {
      url.pathname = "/dashboard"; // customer dashboard
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply only to /owner pages
export const config = {
  matcher: ["/owner/:path*"],
};
