import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";

export async function GET(req) {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const all = await Order.find({ userId: user.email }).sort({ createdAt: -1 }).lean();
    const pending = all.filter(o => o.deliveryStatus === "pending");
    const shipped = all.filter(o => o.deliveryStatus === "shipped");
    const delivered = all.filter(o => o.deliveryStatus === "delivered");
    return NextResponse.json({ ok: true, pending, shipped, delivered, total: all.length });
}
