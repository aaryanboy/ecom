// src/app/api/cart/checkout/route.js
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Cart from "@/models/cart";
import connectToDatabase from "@/lib/db";
import { generateEsewaSignature } from "@/lib/generateEsewaSignature";

// Get the base URL with correct port
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// eSewa credentials and endpoints
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_SUCCESS_URL = `${getBaseUrl()}/api/payment/verify`;
const ESEWA_FAILURE_URL = `${getBaseUrl()}/cart?payment=failed`;

// New eSewa API endpoint
const ESEWA_API_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user's cart and populate product details
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    cart.items.forEach(item => {
      if (item.productId && item.productId.price) {
        totalAmount += item.productId.price * item.quantity;
      }
    });

    // Generate a unique transaction UUID with userId for verification
    const transactionUuid = `${Date.now()}-${uuidv4()}-${userId}`;
    
    // Format the amount as a string with 2 decimal places
    const formattedAmount = totalAmount.toFixed(2);

    // Create eSewa payment configuration
    const esewaConfig = {
      amount: formattedAmount,
      tax_amount: "0.00",
      total_amount: formattedAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_MERCHANT_ID,
      product_service_charge: "0.00",
      product_delivery_charge: "0.00",
      success_url: ESEWA_SUCCESS_URL,
      failure_url: ESEWA_FAILURE_URL,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    // Create signature string
    const signatureString = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
    
    // Generate signature
    const signature = generateEsewaSignature(ESEWA_SECRET_KEY, signatureString);

    // Create form data for submission
    const formData = {
      ...esewaConfig,
      signature,
    };

    // Create HTML form for automatic submission
    const htmlForm = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to eSewa...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              flex-direction: column;
            }
            .loader {
              border: 5px solid #f3f3f3;
              border-top: 5px solid #3498db;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 2s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Redirecting to eSewa payment gateway...</p>
          <form id="esewaForm" method="POST" action="${ESEWA_API_URL}">
            ${Object.entries(formData).map(([key, value]) => 
              `<input type="hidden" name="${key}" value="${value}" />`
            ).join('')}
          </form>
          <script>
            document.getElementById("esewaForm").submit();
          </script>
        </body>
      </html>
    `;

    // Return HTML response for automatic form submission
    return new NextResponse(htmlForm, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error('Error initiating checkout:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate checkout' },
      { status: 500 }
    );
  }
}