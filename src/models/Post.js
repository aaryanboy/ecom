import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, default: 0 },
    price: { type: Number, required: true },
    tags: { type: [String], default: [] },
    image: { 
      url: { type: String, default: "" },
      path: { type: String, default: "" }
    },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
