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
  // Add maintenance reference
  maintenance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Add driver reference for salary payments
   driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverProfile'  // ← Changed this line
  },
  // Add schedule reference for salary payments
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
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'wallet'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'none'],
    default: 'none'
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
    responseCode: String,
    responseMessage: String,
    rawResponse: Object
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
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
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  }],
  // Payment type to distinguish between booking, maintenance, and salary payments
  paymentType: {
    type: String,
    enum: ['booking', 'maintenance', 'salary'],
    default: 'booking'
  },
  // Soft delete fields
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

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;