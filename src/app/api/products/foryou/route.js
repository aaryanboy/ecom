import { NextResponse } from "next/server";
import User, { decayInterests } from "@/models/User";
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check for decay
        if (decayInterests(user)) {
            await user.save();
        }

        // Get top 5 tags by score
        const interestsList = user.interests || [];
        console.log("User interests for", email, ":", interestsList);

        const topInterests = interestsList
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(i => i.tag);

        if (topInterests.length === 0) {
            // Fallback to recent products if no interests
            const randomProducts = await Post.find().sort({ createdAt: -1 }).limit(10);
            return NextResponse.json({ products: randomProducts, reason: "recent" });
        }

        // Find products matching tags
        // Fetch up to 100 candidates to sort by relevance in JS
        const candidateProducts = await Post.find({
            tags: { $in: topInterests }
        }).limit(100).lean();

        // Calculate relevance score for each product
        // Score = sum of user interest scores for matching tags
        // Optimization: Create a map of tag -> score for O(1) lookup
        const interestMap = {};
        interestsList.forEach(i => {
            interestMap[i.tag] = i.score;
        });

        const scoredProducts = candidateProducts.map(product => {
            let score = 0;
            // Assuming product.tags is array of strings
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach(t => {
                    if (interestMap[t]) {
                        score += interestMap[t];
                    }
                });
            }
            return { product, score };
        });

        // Sort by score descending
        scoredProducts.sort((a, b) => b.score - a.score);

        // Extract products (limit 20)
        const recommendedProducts = scoredProducts.slice(0, 20).map(sp => sp.product);

        return NextResponse.json({
            products: recommendedProducts,
            reason: "personalized",
            debugTags: topInterests
        });
    } catch (error) {
        console.error("Recommendation Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
