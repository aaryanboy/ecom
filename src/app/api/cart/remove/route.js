// src/app/api/cart/remove/route.js
import { NextResponse } from "next/server";
import Cart from "@/models/cart";
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

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}