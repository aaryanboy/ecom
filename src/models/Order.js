import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid','failed','pending'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['pending','shipped','delivered'], default: 'pending' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    name: String,
    price: Number,
    quantity: Number,
  }],
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

