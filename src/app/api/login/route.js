import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db.js";
import User from "@/models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, password } = body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ error: "User doesn't exist" }, { status: 400 });
    }

    // TODO: add real password check (e.g. bcrypt.compare)
    if (password !== existingUser.password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate random session token
    const token = crypto.randomBytes(16).toString("hex");

    // Save session token in DB (optional, good for security)
    existingUser.sessionToken = token;
    await existingUser.save();

    // Send response with cookie
    const response = NextResponse.json(
      { message: "Login successful", user: { email: existingUser.email } },
      { status: 200 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
