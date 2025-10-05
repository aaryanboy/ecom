import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db.js";
import User from "@/models/User.js";

export async function GET(req) {
  try {
    await connectToDatabase();

    const session = req.cookies.get("session")?.value;

    if (!session) {
      return NextResponse.json({ loggedIn: false });
    }

    const user = await User.findOne({ sessionToken: session });

    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      user: { email: user.email },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
