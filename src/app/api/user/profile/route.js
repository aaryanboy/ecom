import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

const sanitize = (u) => ({
    username: u.username,
    email: u.email,
    isOwner: u.isOwner,
    firstName: u.firstName || null,
    lastName: u.lastName || null,
    phoneNumber: u.phoneNumber || null,
    avatar: u.avatar || null,
    addresses: Array.isArray(u.addresses) ? u.addresses : [],
});

export async function GET(req) {
    try {
        await connectToDatabase();
        const sessionToken = req.cookies.get("session")?.value;
        if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const user = await User.findOne({ sessionToken });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json({ ok: true, user: sanitize(user) });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectToDatabase();
        const sessionToken = req.cookies.get("session")?.value;
        if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const user = await User.findOne({ sessionToken });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const update = {};

        if (typeof body.username === "string" && body.username.trim()) {
            update.username = body.username.trim();
        }
        if (Array.isArray(body.addresses)) {
            update.addresses = body.addresses.map((a) => ({
                fullName: a.fullName || user.username,
                street: a.street || "",
                city: a.city || "",
                state: a.state || "",
                zip: a.zip || "",
                country: a.country || "",
                phone: a.phone || "",
                isDefault: !!a.isDefault,
            }));
            if (update.addresses.length) {
                const hasDefault = update.addresses.some((a) => a.isDefault);
                if (!hasDefault) update.addresses[0].isDefault = true;
            }
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: "No changes submitted" }, { status: 400 });
        }

        const saved = await User.findByIdAndUpdate(user._id, update, { new: true });
        return NextResponse.json({ ok: true, user: sanitize(saved) });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
