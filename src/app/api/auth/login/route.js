import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db.js";
import User from "@/models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password } = body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ error: "User doesn't exist" }, { status: 400 });
    }

    if (password !== existingUser.password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = crypto.randomBytes(16).toString("hex");
    existingUser.sessionToken = token;
    try {
      await existingUser.save();
    } catch (saveError) {
      console.warn("User save failed, checking for schema incompatibility...", saveError.message);
      // Migration: If interests are invalid (old schema), reset them
      if (saveError.message && saveError.message.includes("interests")) {
        console.log("Migrating user interests to new schema (resetting)...");
        existingUser.interests = [];
        await existingUser.save();
      } else {
        throw saveError;
      }
    }

    const response = NextResponse.json(
      { message: "Login successful", user: { email: existingUser.email, isOwner: existingUser.isOwner } },
      { status: 200 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

