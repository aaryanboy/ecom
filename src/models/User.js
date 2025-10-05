import mongoose from "mongoose";

// Define schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Check if model already exists (prevents recompiling)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
