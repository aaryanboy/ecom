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
    category: { type: String, default: null },
    subCategory: { type: String, default: null },
  },
  { timestamps: true }
);

let PostModel;
try {
  PostModel = mongoose.model("Post");
  if (!PostModel.schema.paths.category) {
    PostModel.schema.add({ category: { type: String, default: null } });
  }
  if (!PostModel.schema.paths.subCategory) {
    PostModel.schema.add({ subCategory: { type: String, default: null } });
  }
} catch {
  PostModel = mongoose.model("Post", PostSchema);
}

export default PostModel;
