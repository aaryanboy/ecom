import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDatabase from "@/lib/db";
import { updateUserInterests } from "@/lib/recommendationUtils";

export async function POST(req) {
    try {
        const { email, product, type } = await req.json();

        if (!email || !product || !product.category || !product.subCategory) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log(`[Tracking] User: ${email}, Product: ${product.title}, Category: ${product.category}, Type: ${type}`);

        await updateUserInterests(user, product, type);

        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
