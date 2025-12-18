// src/app/api/cart/route.js
import { NextResponse } from "next/server";
import Cart from "@/models/cart"; // ✅ uppercase Cart
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db"; // ✅ default import

export async function POST(req) {
  try {
    await connectToDatabase();

    const { userId, productId, quantity } = await req.json();

    // Find existing cart for user
    let cart = await Cart.findOne({ userId });

    const product = await Post.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    const available = product.amount || 0;
    if (available <= 0) {
      return NextResponse.json({ success: false, message: "Out of stock" }, { status: 400 });
    }

    if (!cart) {
      // Create new cart if none exists
      let qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
      qty = Math.min(qty, available);
      cart = new Cart({ userId, items: [{ productId, quantity: qty }] });
    } else {
      // Update existing cart
      const item = cart.items.find((i) => i.productId.toString() === productId);
      if (item) {
        let inc = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
        item.quantity = Math.min(item.quantity + inc, available);
      } else {
        let qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
        qty = Math.min(qty, available);
        cart.items.push({ productId, quantity: qty });
      }
    }

    await cart.save();

    return NextResponse.json({ success: true, message: "Added to cart!", cart });
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    return NextResponse.json({ success: false, message: "Failed to add item." }, { status: 500 });
  }
}
