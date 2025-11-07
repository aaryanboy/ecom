// app/api/recommendations/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const sessionToken = req.cookies.get("session")?.value || null;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;

    const filter =
      user && Array.isArray(user.tagPreferences) && user.tagPreferences.length > 0
        ? { tags: { $in: user.tagPreferences } }
        : {};

    const [products, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    return NextResponse.json({ ok: true, products, total, page, limit });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}