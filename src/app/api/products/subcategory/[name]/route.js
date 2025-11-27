import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req, context) {
  try {
    await connectToDatabase();
    const params = await context.params;
    const name = params?.name;
    if (!name) {
      return NextResponse.json({ error: "Missing subCategory" }, { status: 400 });
    }

    const posts = await Post.find({ subCategory: name }).lean();
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

