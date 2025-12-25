import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import Order from "@/models/Order";

export async function GET(req) {
  const { user, error } = await requireOwner(req);
  if (error) return error;

  const all = await Order.find({}).sort({ createdAt: -1 }).lean();
  const pending = all.filter(o => o.deliveryStatus === "pending");
  const shipped = all.filter(o => o.deliveryStatus === "shipped");
  const delivered = all.filter(o => o.deliveryStatus === "delivered");
  return NextResponse.json({ ok: true, pending, shipped, delivered });
}

export async function PATCH(req) {
  const { user, error } = await requireOwner(req);
  if (error) return error;

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
}
