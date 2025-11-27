import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const subCategory = (searchParams.get("subCategory") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 8));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 8));
    const skip = (page - 1) * limit;

    const filters = [];
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "i");
      filters.push({ title: re });
      filters.push({ tags: re });
      filters.push({ category: re });
    }

    const and = [];
    if (category) and.push({ category });
    if (subCategory) and.push({ subCategory });

    const query = {};
    if (filters.length) query.$or = filters;
    if (and.length) query.$and = and;

    const [items, total] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(query),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
