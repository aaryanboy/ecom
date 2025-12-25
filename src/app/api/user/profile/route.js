import { NextResponse } from "next/server";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req) {
    const { user, error } = await requireAuth(req);
    if (error) return error;
    return NextResponse.json({ ok: true, user: sanitizeUser(user) });
}

export async function PUT(req) {
    const { user, error } = await requireAuth(req);
    if (error) return error;

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
    return NextResponse.json({ ok: true, user: sanitizeUser(saved) });
}
