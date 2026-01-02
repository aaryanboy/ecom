import { NextResponse } from "next/server";
import User from "@/models/User";
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

        const interests = user.interests || [];
        if (interests.length === 0) {
            const recentProducts = await Post.find().sort({ createdAt: -1 }).limit(10);
            return NextResponse.json({ products: recentProducts, reason: "recent" });
        }

        // 1. Sort categories by recency
        const sortedCategories = [...interests].sort((a, b) => b.lastInteractionAt - a.lastInteractionAt);
        const topCategoryValues = sortedCategories.slice(0, 3).map(c => c.category);

        // 2. Priority 1: Same category & same subcategory (recent + high weight tags)
        // Extract top tags from the most recent category/subcategory
        const p1Subcategories = [];
        const p1Tags = [];
        sortedCategories.slice(0, 2).forEach(cat => {
            const topSub = cat.subcategories.sort((a, b) => b.lastInteractionAt - a.lastInteractionAt)[0];
            if (topSub) {
                p1Subcategories.push(topSub.name);
                p1Tags.push(...topSub.tags.sort((a, b) => b.weight - a.weight).slice(0, 5).map(t => t.name));
            }
        });

        let recommendedProducts = [];

        // P1 Query: Match category, subcategory AND tags
        const p1Products = await Post.find({
            category: { $in: topCategoryValues },
            subCategory: { $in: p1Subcategories },
            tags: { $in: p1Tags }
        }).limit(10).lean();
        recommendedProducts.push(...p1Products);

        // 3. Priority 2: Same category, any subcategory (if we need more)
        if (recommendedProducts.length < 15) {
            const p2Products = await Post.find({
                _id: { $nin: recommendedProducts.map(p => p._id) },
                category: { $in: topCategoryValues }
            }).limit(15 - recommendedProducts.length).lean();
            recommendedProducts.push(...p2Products);
        }

        // 4. Priority 3: Related categories / Fallback
        if (recommendedProducts.length < 20) {
            const p3Products = await Post.find({
                _id: { $nin: recommendedProducts.map(p => p._id) },
                category: { $nin: topCategoryValues }
            }).sort({ createdAt: -1 }).limit(20 - recommendedProducts.length).lean();
            recommendedProducts.push(...p3Products);
        }

        return NextResponse.json({
            products: recommendedProducts,
            reason: "personalized",
            debug: { categories: topCategoryValues, p1Subcategories }
        });
    } catch (error) {
        console.error("Recommendation Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
