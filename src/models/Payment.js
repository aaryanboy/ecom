// src/models/Payment.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'eSewa',
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: String,
    price: Number,
    quantity: Number,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model is already defined to prevent overwriting
const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;