import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, default: 0 },
    price: { type: Number, required: true },
    tags: { type: [String], default: [] },
    imagePath: { type: String, default: null },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
