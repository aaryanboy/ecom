import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Cart from "@/models/cart";
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db";
import { generateEsewaSignature } from "@/lib/generateEsewaSignature";

const getBaseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_SUCCESS_URL = `${getBaseUrl()}/api/payment/verify`;
const ESEWA_FAILURE_URL = `${getBaseUrl()}/cart?payment=failed`;
const ESEWA_API_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { userId, productId, quantity, items } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    let totalAmount = 0;
    let transactionUuidSuffix = userId;

    if (productId && typeof quantity === "number" && quantity > 0) {
      const product = await Post.findById(productId);
      if (!product) {
        return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
      }
      const available = product.amount || 0;
      if (available < quantity) {
        return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
      }
      totalAmount = (product.price || 0) * quantity;
      transactionUuidSuffix = `${userId}|pid:${productId}|qty:${quantity}`;
    } else if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        if (!it?.productId || !it?.quantity || it.quantity < 1) continue;
        const product = await Post.findById(it.productId);
        if (!product) continue;
        totalAmount += (product.price || 0) * it.quantity;
      }
      transactionUuidSuffix = userId;
    } else {
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
      }
      for (const item of cart.items) {
        if (item.productId && item.productId.price) {
          totalAmount += (item.productId.price || 0) * (item.quantity || 1);
        }
      }
      transactionUuidSuffix = userId;
    }

    const formattedAmount = totalAmount.toFixed(2);
    const transactionUuid = `${Date.now()}-${uuidv4()}-${transactionUuidSuffix}`;

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

    const signatureString = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
    const signature = generateEsewaSignature(ESEWA_SECRET_KEY, signatureString);
    const formData = { ...esewaConfig, signature };

    const htmlForm = `<!DOCTYPE html><html><head><title>Redirecting to eSewa...</title><style>body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column}.loader{border:5px solid #f3f3f3;border-top:5px solid #3498db;border-radius:50%;width:50px;height:50px;animation:spin 2s linear infinite;margin-bottom:20px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></head><body><div class="loader"></div><p>Redirecting to eSewa payment gateway...</p><form id="esewaForm" method="POST" action="${ESEWA_API_URL}">${Object.entries(formData).map(([k,v]) => `<input type="hidden" name="${k}" value="${v}" />`).join("")}</form><script>document.getElementById('esewaForm').submit();</script></body></html>`;

    return new NextResponse(htmlForm, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json({ success: false, message: "Failed to initiate payment" }, { status: 500 });
  }
}

