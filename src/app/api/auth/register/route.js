import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db.js";
import User from "@/models/User.js";
import { encryptPassword } from "@/lib/cipher.js";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const encryptedPassword = encryptPassword(password);
    const newUser = new User({ username: name, email, password: encryptedPassword });
    await newUser.save();

    return NextResponse.json(
      {
        message: "User stored successfully",
        data: { username: newUser.username, email: newUser.email, isOwner: newUser.isOwner, addresses: newUser.addresses }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error storing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

