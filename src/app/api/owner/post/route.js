import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { createAdminClient, STORAGE_BUCKET } from "@/lib/supabase";

// CREATE
export async function POST(req) {
  await connectToDatabase();
  try {
    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;
    if (!user || !user.isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const post = await Post.create(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Create error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// GET ALL POSTS (supports pagination via page & limit)
export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // If page & limit provided, return paginated shape { posts, total, page, limit }
    if (pageParam && limitParam) {
      const page = parseInt(pageParam) || 1;
      const limit = parseInt(limitParam) || 10;
      const skip = (page - 1) * limit;
    
      const [posts, total] = await Promise.all([
        Post.find({}).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
        Post.countDocuments({}),
      ]);
    
      return NextResponse.json({ posts, total, page, limit });
    }

    // Backward-compatible: no pagination -> return full list (array)
    const posts = await Post.find().lean();
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// UPDATE (PUT)
export async function PUT(req) {
  await connectToDatabase();
  const sessionToken = req.cookies.get("session")?.value;
  const user = sessionToken ? await User.findOne({ sessionToken }) : null;
  if (!user || !user.isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, ...data } = await req.json();
  const updated = await Post.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(req) {
  await connectToDatabase();
  const sessionToken = req.cookies.get("session")?.value;
  const user = sessionToken ? await User.findOne({ sessionToken }) : null;
  if (!user || !user.isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete image from Supabase Storage if present
  if (post.imagePath) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.storage
        .from(STORAGE_BUCKET)
        .remove([post.imagePath]);
      if (error) {
        console.error("Error deleting image from storage:", error);
      }
    } catch (err) {
      console.error("Storage removal error:", err);
    }
  }

  await Post.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
