// app/api/track-click/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

export async function POST(req) {
  try {
    await connectToDatabase();

    const sessionToken = req.cookies.get("session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ sessionToken });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ ok: false, error: "Product ID is required" }, { status: 400 });
    }

    const post = await Post.findById(productId).lean();
    if (!post) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    // Add the product's tags to the user's preferences
    if (post.tags && post.tags.length > 0) {
      const newTags = post.tags.filter(tag => !user.tagPreferences.includes(tag));
      if (newTags.length > 0) {
        user.tagPreferences.push(...newTags);
        await user.save();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error tracking click:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}