import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();

    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;
    if (!user || !user.isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const { imageUrl, imagePath } = body;

    if (!ids.length) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }

    const update = { imageUrl };
    if (typeof imagePath === "string") update.imagePath = imagePath;

    const result = await Post.updateMany({ _id: { $in: ids } }, { $set: update });

    return NextResponse.json({ ok: true, matchedCount: result.matchedCount ?? result.n, modifiedCount: result.modifiedCount ?? result.nModified });
  } catch (err) {
    console.error("Bulk image update error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

