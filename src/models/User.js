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

  // Cart (Refactored from separate collection)
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
      quantity: { type: Number, default: 1 },
    }
  ],

  // Recommendations
  interests: [
    {
      tag: { type: String, required: true },
      score: { type: Number, default: 0 },
      lastInteracted: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// Method to decay interests
// Helper to decay interests (Exported to avoid model caching issues)
export const decayInterests = (user) => {
  if (!user.interests) return false;

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  let changed = false;

  user.interests.forEach(interest => {
    const lastInteracted = new Date(interest.lastInteracted);
    const diffMs = now - lastInteracted;

    // Calculate full weeks passed
    const weeksPassed = Math.floor(diffMs / ONE_WEEK_MS);

    if (weeksPassed > 0) {
      if (interest.score > 0) {
        // Decay by number of weeks passed
        interest.score = Math.max(0, interest.score - weeksPassed);
        // Reset lastInteracted to "now" minus the remainder of the week? 
        // Or just "now" to restart the timer? 
        // Logic: If I decay now, I shouldn't decay again for another week. 
        // So effectively, we "consumed" the time.
        // Let's set it to now to be simple and safe.
        interest.lastInteracted = now;
        changed = true;
      }
    }
  });

  return changed;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
