import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import Payment from "@/models/Payment";

export async function GET(req) {
  const { user, error } = await requireOwner(req);
  if (error) return error;

  const payments = await Payment.find({ status: "success" }).lean();

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOrders = payments.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return NextResponse.json({
    ok: true,
    stats: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
    },
  });
}
