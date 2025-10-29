// src/app/api/cart/route.js
import { NextResponse } from "next/server";
import Cart from "@/models/cart"; // ✅ uppercase Cart
import connectToDatabase from "@/lib/db"; // ✅ default import

export async function POST(req) {
  try {
    await connectToDatabase();

    const { userId, productId } = await req.json();

    // Find existing cart for user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        userId,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      // Update existing cart
      const item = cart.items.find(
        (i) => i.productId.toString() === productId
      );
      if (item) {
        item.quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();

    return NextResponse.json({ success: true, message: "Added to cart!", cart });
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    return NextResponse.json({ success: false, message: "Failed to add item." });
  }
}
