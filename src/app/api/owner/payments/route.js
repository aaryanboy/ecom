// app/api/owner/payments/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Post from "@/models/Post";

// Utility to aggregate items sold across payments
function aggregateItems(payments, postMap) {
  const map = new Map();
  for (const p of payments) {
    for (const item of p.items || []) {
      const key = item.productId?.toString();
      if (!key) continue;

      const post = postMap.get(key);
      const existing = map.get(key) || {
        productId: item.productId,
        name: post ? post.title : "Unknown Product",
        totalQuantity: 0,
        totalRevenue: 0,
        latestPrice: item.price,
      };
      existing.totalQuantity += item.quantity || 0;
      existing.totalRevenue += (item.price || 0) * (item.quantity || 0);
      existing.latestPrice = item.price;
      map.set(key, existing);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

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

    const [payments, posts] = await Promise.all([
      Payment.find({ status: "success" }).sort({ createdAt: -1 }).lean(),
      Post.find({}).lean(),
    ]);

    const postMap = new Map(posts.map((p) => [p._id.toString(), p]));

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOrders = payments.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const itemsAggregated = aggregateItems(payments, postMap);

    return NextResponse.json({
      ok: true,
      stats: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
      },
      items: itemsAggregated,
      payments,
    });
  } catch (err) {
    console.error("Error fetching owner payments:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}