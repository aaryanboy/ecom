import { NextResponse } from "next/server";
import User, { decayInterests } from "@/models/User";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
    try {
        const { email, tags, type } = await req.json();

        if (!email || !tags || !Array.isArray(tags)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Weights: View = 1, Buy = 10 (Buy is handled in payment verify usually, but separate endpoint is good)
        const weight = type === 'buy' ? 10 : 1;

        // Ensure interests array exists (migration for old users)
        if (!user.interests) {
            user.interests = [];
        }

        // Apply decay before adding new points
        // This ensures meaningful engagement is tracked on top of current status
        decayInterests(user);

        console.log(`[Tracking] User: ${email}, Tags: ${tags}, Type: ${type}, Current Interests: ${user.interests.length}`);

        for (const tag of tags) {
            if (!tag) continue;
            const existingInterest = user.interests.find(i => i.tag === tag);
            if (existingInterest) {
                existingInterest.score += weight;
                existingInterest.lastInteracted = new Date();
            } else {
                user.interests.push({ tag, score: weight, lastInteracted: new Date() });
            }
        }

        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
