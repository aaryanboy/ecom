import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

// CREATE
export async function POST(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const post = await Post.create(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Create error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// GET ALL POSTS
export async function GET() {
  await connectToDatabase();
  const posts = await Post.find();
  return NextResponse.json(posts);
}

// UPDATE (PUT)
export async function PUT(req) {
  await connectToDatabase();
  const { id, ...data } = await req.json();
  const updated = await Post.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(updated);
}
