import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();
    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const all = await Order.find({ userId: user.email }).sort({ createdAt: -1 }).lean();
    const pending = all.filter(o => o.deliveryStatus === "pending");
    const shipped = all.filter(o => o.deliveryStatus === "shipped");
    const delivered = all.filter(o => o.deliveryStatus === "delivered");
    return NextResponse.json({ ok: true, pending, shipped, delivered, total: all.length });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

