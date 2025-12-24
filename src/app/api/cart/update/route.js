import { NextResponse } from "next/server";
import User from "@/models/User";
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { userId, itemId, quantity } = await req.json();

    if (!userId || !itemId || typeof quantity !== 'number') {
      return NextResponse.json(
        { success: false, message: 'userId, itemId and numeric quantity required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: userId }).populate('cart.productId');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const item = user.cart.find(i => i._id.toString() === itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    const product = await Post.findById(item.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const available = product.amount || 0;
    const newQty = Math.min(quantity, available);
    item.quantity = newQty;
    await user.save();

    return NextResponse.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

