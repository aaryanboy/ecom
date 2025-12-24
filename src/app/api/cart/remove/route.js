// src/app/api/cart/remove/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { userId, itemId } = await req.json();

    if (!userId || !itemId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Item ID are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove the item from the cart
    user.cart = user.cart.filter(item => item._id.toString() !== itemId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      cart: user.cart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}