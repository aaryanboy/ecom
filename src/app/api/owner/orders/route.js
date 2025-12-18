import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();
    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;
    if (!user || !user.isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const all = await Order.find({}).sort({ createdAt: -1 }).lean();
    const pending = all.filter(o => o.deliveryStatus === "pending");
    const shipped = all.filter(o => o.deliveryStatus === "shipped");
    const delivered = all.filter(o => o.deliveryStatus === "delivered");
    return NextResponse.json({ ok: true, pending, shipped, delivered });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectToDatabase();
    const sessionToken = req.cookies.get("session")?.value;
    const user = sessionToken ? await User.findOne({ sessionToken }) : null;
    if (!user || !user.isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, deliveryStatus } = body;
    if (!id || !deliveryStatus) {
      return NextResponse.json({ error: "Missing id or deliveryStatus" }, { status: 400 });
    }
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const current = order.deliveryStatus;
    const allowed = (current === "pending" && deliveryStatus === "shipped") || (current === "shipped" && deliveryStatus === "delivered");
    if (!allowed) {
      return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
    }

    order.deliveryStatus = deliveryStatus;
    await order.save();
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

