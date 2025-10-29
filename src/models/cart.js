import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // You can replace with ObjectId later
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
