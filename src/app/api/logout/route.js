import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db.js";
import User from "@/models/User.js";

export async function POST(req) {
  try {
    await connectToDatabase();

    const session = req.cookies.get("session")?.value;

    if (session) {
      // Clear token in DB
      await User.updateOne({ sessionToken: session }, { $unset: { sessionToken: "" } });
    }

    const response = NextResponse.json({ message: "Logged out successfully" });

    // Remove cookie
    response.cookies.set("session", "", {
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
