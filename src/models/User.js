import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // Basic auth
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isOwner: { type: Boolean, required: true, default: false },
  sessionToken: { type: String, default: null },

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

  // Recommendations
  tagPreferences: { type: [String], default: [] },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
