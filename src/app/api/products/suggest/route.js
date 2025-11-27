import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ suggestions: [] });

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "i");
    const posts = await Post.find({ $or: [{ title: re }, { tags: re }] })
      .select({ title: 1, tags: 1 })
      .limit(20)
      .lean();

    const set = new Set();
    for (const p of posts) {
      if (typeof p.title === "string" && re.test(p.title)) set.add(p.title);
      if (Array.isArray(p.tags)) for (const t of p.tags) if (re.test(t)) set.add(t);
    }
    const suggestions = Array.from(set).slice(0, 10);
    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json({ suggestions: [] });
  }
}

