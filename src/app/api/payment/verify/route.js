// src/app/api/payment/verify/route.js
import { NextResponse } from "next/server";
import Cart from "@/models/cart";
import Payment from "@/models/Payment";
import connectToDatabase from "@/lib/db";

// Get the base URL with correct port
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export async function GET(req) {
  try {
    console.log("==================== PAYMENT VERIFICATION START ====================");
    console.log("Payment verification callback received at:", new Date().toISOString());
    
    // Extract parameters from the URL
    const url = new URL(req.url);
    console.log("Full URL:", url.toString());
    
    // Check if we have a data parameter (eSewa v2 API)
    let transactionCode, status, transactionUuid, productCode, amount;
    let esewaData = null;
    
    const dataParam = url.searchParams.get('data');
    if (dataParam) {
      try {
        // Decode base64 data parameter
        const decodedData = Buffer.from(dataParam, 'base64').toString('utf-8');
        console.log("Decoded data:", decodedData);
        
        // Parse the JSON data
        esewaData = JSON.parse(decodedData);
        console.log("Parsed eSewa data:", esewaData);
        
        // Extract values from the parsed data
        transactionCode = esewaData.transaction_code;
        status = esewaData.status;
        transactionUuid = esewaData.transaction_uuid;
        productCode = esewaData.product_code;
        amount = esewaData.total_amount;
      } catch (error) {
        console.error("ERROR: Failed to decode or parse data parameter:", error);
        return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed&reason=invalid_data_format&error=${encodeURIComponent(error.message)}`);
      }
    } else {
      // Fallback to direct URL parameters (old API)
      transactionCode = url.searchParams.get('transaction_code') || url.searchParams.get('refId');
      status = url.searchParams.get('status') || 'COMPLETE'; // Default to COMPLETE for old API
      transactionUuid = url.searchParams.get('transaction_uuid') || url.searchParams.get('oid');
      productCode = url.searchParams.get('product_code');
      amount = url.searchParams.get('amount') || url.searchParams.get('amt');
    }
    
    console.log("PAYMENT DETAILS:");
    console.log("- Transaction Code:", transactionCode);
    console.log("- Status:", status);
    console.log("- Transaction UUID:", transactionUuid);
    console.log("- Product Code:", productCode);
    console.log("- Amount:", amount);
    
    // For eSewa v2 API, check if the status is success
    if (status && status.toUpperCase() !== 'COMPLETE') {
      console.error(`ERROR: Payment status is not complete: ${status}`);
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed&reason=incomplete_status&status=${status}`);
    }
    
    // Validate required parameters
    if (!transactionUuid) {
      console.error("ERROR: Transaction UUID is missing");
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=invalid&reason=missing_transaction_uuid`);
    }
    
    // Extract email (userId) from the transaction UUID
    // Format expected: timestamp-uuid-email@domain.com
    let userId = null;
    
    if (transactionUuid.includes('-')) {
      // Get the part after the last dash
      const parts = transactionUuid.split('-');
      const lastPart = parts[parts.length - 1];
      
      // Check if the last part is an email
      if (lastPart && lastPart.includes('@')) {
        userId = lastPart;
        console.log("Extracted userId (email):", userId);
      } else {
        // Try to find any email pattern in the transaction UUID
        const emailMatch = transactionUuid.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch && emailMatch[1]) {
          userId = emailMatch[1];
          console.log("Extracted userId using regex:", userId);
        }
      }
    }
    
    if (!userId) {
      console.error("ERROR: Could not extract email from transaction UUID:", transactionUuid);
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed&reason=invalid_transaction_format`);
    }
    
    // Connect to database
    await connectToDatabase();
    
    try {
      console.log("Looking for cart with userId:", userId);
      
      // Get the cart items using the extracted email as userId
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      
      if (!cart) {
        console.error(`ERROR: Cart not found for user: ${userId}`);
        return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed&reason=cart_not_found`);
      }
      
      console.log("Cart found for user");
      let cartItems = [];
      
      if (cart.items && cart.items.length > 0) {
        console.log(`Cart has ${cart.items.length} items`);
        // Format cart items for storage
        cartItems = cart.items.map(item => {
          if (!item.productId) {
            console.error(`ERROR: Product ID missing for cart item`);
            return null;
          }
          return {
            productId: item.productId._id,
            name: item.productId.name || 'Unknown Product',
            price: item.productId.price || 0,
            quantity: item.quantity || 1
          };
        }).filter(item => item !== null);
      } else {
        console.warn("WARNING: Cart is empty, but proceeding with payment");
      }
      
      // Store payment details in database
      const paymentAmount = parseFloat(amount) || 
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      console.log("Creating payment record with amount:", paymentAmount);
      
      const payment = await Payment.create({
        userId,
        transactionId: transactionCode,
        amount: paymentAmount,
        status: 'success',
        paymentMethod: 'eSewa',
        items: cartItems,
      });
      
      console.log(`Payment details stored for transaction: ${transactionCode}`);
      
      // Clear the cart
      console.log(`Clearing cart for user: ${userId}`);
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );
      
      console.log("Payment verification successful");
      console.log("==================== PAYMENT VERIFICATION SUCCESS ====================");
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=success&ref=${transactionCode}&cleared=true`);
    } catch (dbError) {
      console.error('ERROR: Database operation failed during payment verification:', dbError);
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed&reason=database_error&error=${encodeURIComponent(dbError.message)}`);
    }
  } catch (error) {
    console.error('ERROR: Payment verification failed with exception:', error);
    return NextResponse.redirect(`${getBaseUrl()}/cart?payment=error&error=${encodeURIComponent(error.message)}`);
  }
}