// app/api/products/tag/[tag]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const tag = params?.tag;
    if (!tag) {
        return NextResponse.json({ error: "Missing tag" }, { status: 400 });
    }

    const posts = await Post.find({ tags: { $in: [tag] } }).lean();
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Error fetching products by tag:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}