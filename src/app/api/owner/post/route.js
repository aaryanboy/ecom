import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

// CREATE
export async function POST(req) {
  await connectToDatabase();
  try {
    const { title, description, amount, price, tags, image } = await req.json();
    const post = await Post.create({
      title,
      description,
      amount,
      price,
      tags,
      image,
    });
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
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;
    
    // Ensure image data is properly handled
    if (updateData.image) {
      // Make sure image data is properly structured
      if (typeof updateData.image === 'object' && updateData.image !== null) {
        // Image data is already in the correct format
      } else {
        // Remove invalid image data
        delete updateData.image;
      }
    }
    
    const post = await Post.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectToDatabase();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    // Find the post to get image info before deleting
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Delete the post from the database
    await Post.findByIdAndDelete(id);
    
    // Return success response
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
