// src/app/api/payment/verify/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db";
import { generateEsewaSignature } from "@/lib/generateEsewaSignature";

// Get the base URL with correct port
const getBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Otherwise use environment variable or default
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export async function GET(req) {
  try {
    console.log("Payment verification callback received");

    const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    // Extract parameters from the URL
    const url = new URL(req.url);
    console.log("Full URL:", url.toString());
    const searchParamsObj = Object.fromEntries(url.searchParams.entries());
    console.log("Search params:", searchParamsObj);

    // eSewa v2 sends a base64-encoded 'data' payload on success
    const dataParam = url.searchParams.get("data");

    let payload = null;
    let transactionCode = null;
    let status = null;
    let transactionUuid = null;
    let productCode = null;
    let totalAmount = null;
    let signedFieldNames = null;
    let signature = null;

    if (dataParam) {
      try {
        const decoded = Buffer.from(dataParam, "base64").toString("utf-8");
        payload = JSON.parse(decoded);
        console.log("Decoded eSewa payload:", payload);

        // Normalize fields from payload
        transactionCode = payload.transaction_code || payload.refId || payload.reference_id || null;
        status = payload.status || null; // Expected 'COMPLETE' or 'COMPLETED'
        transactionUuid = payload.transaction_uuid || payload.oid || null;
        productCode = payload.product_code || null;
        totalAmount = payload.total_amount || payload.amount || null;
        signedFieldNames = payload.signed_field_names || null;
        signature = payload.signature || null;

        // Verify required fields exist
        if (!transactionCode || !transactionUuid || !signedFieldNames || !signature) {
          console.log("Missing required fields in eSewa payload");
          return NextResponse.redirect(`${getBaseUrl()}/cart?payment=invalid`);
        }

        // Build signature string based on signed_field_names order
        const fields = signedFieldNames.split(",").map(f => f.trim()).filter(Boolean);
        const valueMap = {
          transaction_code: transactionCode,
          status,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: productCode,
          signed_field_names: signedFieldNames,
        };
        const signatureString = fields.map((f) => `${f}=${valueMap[f] ?? ""}`).join(",");
        const computedSignature = generateEsewaSignature(ESEWA_SECRET_KEY, signatureString);

        if (computedSignature !== signature) {
          console.log("Signature mismatch:", { signatureString, computedSignature, signature });
          return NextResponse.redirect(`${getBaseUrl()}/cart?payment=invalid`);
        }
      } catch (err) {
        console.error("Failed to decode/parse eSewa data payload:", err);
        return NextResponse.redirect(`${getBaseUrl()}/cart?payment=invalid`);
      }
    } else {
      // Fallback for older flows where params are directly in the query
      transactionCode = url.searchParams.get('transaction_code') || url.searchParams.get('refId');
      status = url.searchParams.get('status') || null;
      transactionUuid = url.searchParams.get('transaction_uuid') || url.searchParams.get('oid');
      productCode = url.searchParams.get('product_code');
      totalAmount = url.searchParams.get('total_amount') || url.searchParams.get('amount') || url.searchParams.get('amt');
    }

    // Status check (accept 'COMPLETE' and 'COMPLETED')
    const statusNormalized = (status || "").toUpperCase();
    if (statusNormalized && statusNormalized !== "COMPLETE" && statusNormalized !== "COMPLETED") {
      console.log("Payment status not complete:", statusNormalized);
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed`);
    }

    // Extract userId (email) and optional buy-now metadata from transactionUuid
    let userId = null;
    let buyNowProductId = null;
    let buyNowQty = null;
    if (transactionUuid) {
      const afterLastDash = transactionUuid.split('-').pop();
      const [emailPart, ...metaParts] = afterLastDash.split('|');
      if (emailPart && emailPart.includes('@')) {
        userId = emailPart;
        console.log("Extracted userId from transaction UUID:", userId);
      }
      if (metaParts.length) {
        for (const m of metaParts) {
          if (m.startsWith('pid:')) buyNowProductId = m.replace('pid:', '');
          if (m.startsWith('qty:')) buyNowQty = parseInt(m.replace('qty:', ''), 10);
        }
      }
    }

    await connectToDatabase();

    if (!userId) {
      console.log("Could not extract userId from transaction UUID, redirecting to success page");
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=success&ref=${transactionCode}`);
    }

    let purchaseItems = [];
    let computedCartTotal = 0;

    if (buyNowProductId && buyNowQty && buyNowQty > 0) {
      const product = await Post.findById(buyNowProductId);
      if (product) {
        purchaseItems = [{ productId: product._id, name: product.title, price: product.price || 0, quantity: buyNowQty }];
        computedCartTotal = (product.price || 0) * buyNowQty;
      }
    } else {
      const user = await User.findOne({ email: userId }).populate('cart.productId');
      const cartItems = user?.cart || [];
      if (cartItems.length > 0) {
        purchaseItems = cartItems.map(item => ({
          productId: item.productId?._id,
          name: item.productId?.title,
          price: item.productId?.price || 0,
          quantity: item.quantity || 1,
        }));
        computedCartTotal = purchaseItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      }
    }

    const amountToStore = parseFloat(totalAmount) || parseFloat(payload?.amount) || computedCartTotal;

    await Payment.create({
      userId,
      transactionId: transactionCode,
      amount: amountToStore,
      status: 'success',
      paymentMethod: 'eSewa',
      items: purchaseItems,
    });

    await Order.create({
      userId,
      transactionId: transactionCode,
      amount: amountToStore,
      paymentStatus: 'paid',
      deliveryStatus: 'pending',
      items: purchaseItems,
    });

    console.log(`Payment details stored for transaction: ${transactionCode}`);

    // Decrement inventory AND Track User Interests
    for (const item of purchaseItems) {
      if (!item.productId || !item.quantity) continue;
      const product = await Post.findById(item.productId);
      if (!product) continue;

      // 1. Decrement Inventory
      const current = product.amount || 0;
      product.amount = Math.max(0, current - item.quantity);
      await product.save();

      // 2. Track Interest (Buy Event)
      if (userId) {
        try {
          const user = await User.findOne({ email: userId });
          if (user) {
            const weight = 10; // High score for buying
            const tagsToTrack = [...(product.tags || []), product.category].filter(Boolean);

            for (const tag of tagsToTrack) {
              const existing = user.interests.find(i => i.tag === tag);
              if (existing) {
                existing.score += weight;
                existing.lastInteracted = new Date();
              } else {
                user.interests.push({ tag, score: weight, lastInteracted: new Date() });
              }
            }
            await user.save();
          }
        } catch (e) {
          console.error("Failed to track interest on buy:", e);
          // Don't block payment flow for analytics failure
        }
      }
    }

    // Clear cart only for cart-origin purchases (no buy-now meta present)
    if (!buyNowProductId) {
      console.log(`Clearing cart for user: ${userId}`);
      await User.findOneAndUpdate({ email: userId }, { $set: { cart: [] } });
    }

    console.log("Payment successful, redirecting to success page");
    return NextResponse.redirect(`${getBaseUrl()}/cart?payment=success&ref=${transactionCode}&cleared=${buyNowProductId ? 'false' : 'true'}`);
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.redirect(`${getBaseUrl()}/cart?payment=error`);
  }
}
