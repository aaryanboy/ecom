// src/app/api/cart/get/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
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

    // Find user and populate cart items
    const user = await User.findOne({ email: userId }).populate('cart.productId');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const cartItems = user.cart || [];

    // Format the response data
    const formattedItems = cartItems.map(item => ({
      _id: item._id,
      name: item.productId?.title || 'Product Not Available',
      price: item.productId?.price || 0,
      imageUrl: item.productId?.imageUrl || '/logo.svg',
      image: item.productId?.imageUrl || '/logo.svg',
      quantity: item.quantity,
      stock: item.productId?.amount ?? 0,
      productId: item.productId?._id,
    }));

    return NextResponse.json({
      _id: user._id, // Using user ID as "cart ID" context
      userId: user.email,
      items: formattedItems,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}
