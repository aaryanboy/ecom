// src/app/api/cart/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db"; // ✅ default import

export async function POST(req) {
  try {
    await connectToDatabase();

    const { userId, productId, quantity } = await req.json();

    // Find user by email (userId carries email from client)
    const user = await User.findOne({ email: userId });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const product = await Post.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    const available = product.amount || 0;
    if (available <= 0) {
      return NextResponse.json({ success: false, message: "Out of stock" }, { status: 400 });
    }

    // Update user cart
    const item = user.cart.find((i) => i.productId.toString() === productId);
    if (item) {
      let inc = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
      item.quantity = Math.min(item.quantity + inc, available);
    } else {
      let qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
      qty = Math.min(qty, available);
      user.cart.push({ productId, quantity: qty });
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Added to cart!", cart: user.cart });
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    return NextResponse.json({ success: false, message: "Failed to add item." }, { status: 500 });
  }
}
