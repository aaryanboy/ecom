// src/app/api/cart/get/route.js
import { NextResponse } from "next/server";
import Cart from "@/models/cart";
import connectToDatabase from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user's cart
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Format the response data
    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      name: item.productId?.title || 'Product Not Available',
      price: item.productId?.price || 0,
      image: item.productId?.image || '/logo.svg',
      quantity: item.quantity
    }));

    return NextResponse.json({
      _id: cart._id,
      userId: cart.userId,
      items: formattedItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}