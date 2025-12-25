import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

// Fetch a single post by id
export async function GET(req, context) {
    try {
        await connectToDatabase();
        const params = await context.params;
        const id = params?.id;
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const post = await Post.findById(id).lean();
        if (!post) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (err) {
        console.error("Error fetching post by id:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
