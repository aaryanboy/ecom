import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

// Public posts listing with pagination
export async function GET(req) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find({}).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
            Post.countDocuments({}),
        ]);

        return NextResponse.json({ posts, total, page, limit });
    } catch (err) {
        console.error("Error fetching posts:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
