// models/payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  maintenance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverProfile'
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'wallet'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'none'],
    default: 'stripe' // Changed default to stripe
  },
  cardDetails: {
    cardNumber: String,
    cardHolder: String,
    expiryDate: String,
    cvv: String
  },
  gatewayResponse: {
    gatewayId: String,
    status: String,
    clientSecret: String, // Added for Stripe
    responseCode: String,
    responseMessage: String,
    rawResponse: Object
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  description: String,
  refunds: [{
    amount: Number,
    reason: String,
    processedAt: Date,
    refundId: String,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  }],
  paymentType: {
    type: String,
    enum: ['booking', 'maintenance', 'salary'],
    default: 'booking'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
// paymentId and transactionId already have unique indexes from schema definition
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentGateway: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;