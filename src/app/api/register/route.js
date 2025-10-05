import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db.js";
import User from "@/models/User.js";

export async function POST(req) {
  try {
    // Connect to DB
    await connectToDatabase();

    // Parse JSON body
    const body = await req.json();
    console.log("Received data:", body);

    const { name, email, password } = body;

    // Optional: check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }


    // regez codwe??

    
    // Save new user
    const newUser = new User({ username:name, email, password }); // You can hash password here
    await newUser.save();

    return NextResponse.json(
      { message: "User stored successfully", data: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error storing user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
