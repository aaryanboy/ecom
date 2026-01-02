// src/app/api/payment/verify/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import Post from "@/models/Post";
import connectToDatabase from "@/lib/db";
import { generateEsewaSignature } from "@/lib/generateEsewaSignature";
import { updateUserInterests } from "@/lib/recommendationUtils";

// Get the base URL with correct port
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export async function GET(req) {
  try {
    console.log("Payment verification callback received");

    const ESEWA_SECRET_KEY =
      process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    const url = new URL(req.url);
    const searchParamsObj = Object.fromEntries(url.searchParams.entries());

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
      const decoded = Buffer.from(dataParam, "base64").toString("utf-8");
      payload = JSON.parse(decoded);

      transactionCode =
        payload.transaction_code ||
        payload.refId ||
        payload.reference_id ||
        null;
      status = payload.status || null;
      transactionUuid = payload.transaction_uuid || payload.oid || null;
      productCode = payload.product_code || null;
      totalAmount = payload.total_amount || payload.amount || null;
      signedFieldNames = payload.signed_field_names || null;
      signature = payload.signature || null;

      if (!transactionCode || !transactionUuid || !signedFieldNames || !signature) {
        return NextResponse.redirect(`${getBaseUrl()}/cart?payment=invalid`);
      }

      const fields = signedFieldNames
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const valueMap = {
        transaction_code: transactionCode,
        status,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        signed_field_names: signedFieldNames,
      };

      const signatureString = fields
        .map((f) => `${f}=${valueMap[f] ?? ""}`)
        .join(",");

      const computedSignature = generateEsewaSignature(
        ESEWA_SECRET_KEY,
        signatureString
      );

      if (computedSignature !== signature) {
        return NextResponse.redirect(`${getBaseUrl()}/cart?payment=invalid`);
      }
    } else {
      transactionCode =
        url.searchParams.get("transaction_code") ||
        url.searchParams.get("refId");
      status = url.searchParams.get("status");
      transactionUuid =
        url.searchParams.get("transaction_uuid") ||
        url.searchParams.get("oid");
      productCode = url.searchParams.get("product_code");
      totalAmount =
        url.searchParams.get("total_amount") ||
        url.searchParams.get("amount") ||
        url.searchParams.get("amt");
    }

    const statusNormalized = (status || "").toUpperCase();
    if (
      statusNormalized &&
      statusNormalized !== "COMPLETE" &&
      statusNormalized !== "COMPLETED"
    ) {
      return NextResponse.redirect(`${getBaseUrl()}/cart?payment=failed`);
    }

    let userId = null;
    let buyNowProductId = null;
    let buyNowQty = null;

    if (transactionUuid) {
      const afterLastDash = transactionUuid.split("-").pop();
      const [emailPart, ...metaParts] = afterLastDash.split("|");

      if (emailPart && emailPart.includes("@")) {
        userId = emailPart;
      }

      for (const m of metaParts) {
        if (m.startsWith("pid:")) buyNowProductId = m.replace("pid:", "");
        if (m.startsWith("qty:"))
          buyNowQty = parseInt(m.replace("qty:", ""), 10);
      }
    }

    await connectToDatabase();

    if (!userId) {
      return NextResponse.redirect(
        `${getBaseUrl()}/cart?payment=success&ref=${transactionCode}`
      );
    }

    let purchaseItems = [];
    let computedCartTotal = 0;

    if (buyNowProductId && buyNowQty && buyNowQty > 0) {
      const product = await Post.findById(buyNowProductId);
      if (product) {
        purchaseItems = [
          {
            productId: product._id,
            name: product.title,
            price: product.price || 0,
            quantity: buyNowQty,
          },
        ];
        computedCartTotal = (product.price || 0) * buyNowQty;
      }
    } else {
      const user = await User.findOne({ email: userId }).populate(
        "cart.productId"
      );
      const cartItems = user?.cart || [];

      purchaseItems = cartItems.map((item) => ({
        productId: item.productId?._id,
        name: item.productId?.title,
        price: item.productId?.price || 0,
        quantity: item.quantity || 1,
      }));

      computedCartTotal = purchaseItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    }

    const amountToStore =
      parseFloat(totalAmount) ||
      parseFloat(payload?.amount) ||
      computedCartTotal;

    await Payment.create({
      userId,
      transactionId: transactionCode,
      amount: amountToStore,
      status: "success",
      paymentMethod: "eSewa",
      items: purchaseItems,
    });

    await Order.create({
      userId,
      transactionId: transactionCode,
      amount: amountToStore,
      paymentStatus: "paid",
      deliveryStatus: "pending",
      items: purchaseItems,
    });

    for (const item of purchaseItems) {
      if (!item.productId || !item.quantity) continue;

      const product = await Post.findById(item.productId);
      if (!product) continue;

      product.amount = Math.max(
        0,
        (product.amount || 0) - item.quantity
      );
      await product.save();

      try {
        const user = await User.findOne({ email: userId });
        if (user) {
          await updateUserInterests(user, product, "buy");
          await user.save();
        }
      } catch (e) {
        console.error("Failed to track interest on buy:", e);
      }
    }

    if (!buyNowProductId) {
      await User.findOneAndUpdate(
        { email: userId },
        { $set: { cart: [] } }
      );
    }

    return NextResponse.redirect(
      `${getBaseUrl()}/cart?payment=success&ref=${transactionCode}&cleared=${buyNowProductId ? "false" : "true"
      }`
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.redirect(`${getBaseUrl()}/cart?payment=error`);
  }
}
