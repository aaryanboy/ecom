import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // Basic auth
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isOwner: { type: Boolean, required: true,default: false },   // owner/admin flag
  sessionToken: { type: String, default: null }, // store session token

  // Profile info
  firstName: String,
  lastName: String,
  phoneNumber: String,
  avatar: String,

  // Shipping addresses
  addresses: [
    {
      fullName: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
      isDefault: { type: Boolean, default: false }
    }
  ],

  // Cart & Wishlist
  cart: [
    { productId: mongoose.Schema.Types.ObjectId, quantity: Number, addedAt: { type: Date, default: Date.now } }
  ],
  wishlist: [
    { productId: mongoose.Schema.Types.ObjectId, addedAt: { type: Date, default: Date.now } }
  ],

  // Orders
  orders: [
    { orderId: mongoose.Schema.Types.ObjectId, status: String, purchasedAt: Date }
  ]

}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
