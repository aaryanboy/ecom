// app/api/owner/payments/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Payment from "@/models/Payment";

export async function GET(req) {
  try {
    await connectToDatabase();

    const sessionToken = req.cookies.get("session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ sessionToken });
    if (!user || !user.isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
  } catch (err) {
    console.error("Error fetching owner payments:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
