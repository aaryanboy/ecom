import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { createAdminClient, STORAGE_BUCKET } from "@/lib/supabase";

async function removeStorageFor(post) {
  if (!post?.imagePath) return;
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.from(STORAGE_BUCKET).remove([post.imagePath]);
    if (error) console.error("Storage removal error:", error);
  } catch (err) {
    console.error("Storage client error:", err);
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;
    if (!user || !user.isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    const all = !!body?.all;

    let targets = [];
    if (all) {
      targets = await Post.find({}).select({ _id: 1, imagePath: 1 }).lean();
    } else if (ids.length > 0) {
      targets = await Post.find({ _id: { $in: ids } }).select({ _id: 1, imagePath: 1 }).lean();
    } else {
      return NextResponse.json({ error: "Provide ids or set all=true" }, { status: 400 });
    }

    const toDeleteIds = targets.map(t => t._id);
    // Remove storage for each
    await Promise.all(targets.map(t => removeStorageFor(t)));
    // Delete posts
    const result = await Post.deleteMany({ _id: { $in: toDeleteIds } });
    return NextResponse.json({ ok: true, deletedCount: result.deletedCount || 0 });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

