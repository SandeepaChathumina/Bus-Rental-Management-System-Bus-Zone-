import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: {
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    distance: Number,
    estimatedDuration: String
  },
  travelDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip'],
    default: 'one-way'
  },
  numberOfDays: {
    type: Number,
    min: 1,
    default: 1
  },
  departureTime: {
    type: String,
    required: true
  },
  seats: [{
    seatNumber: String,
    passengerName: {
      type: String,
      required: true,
      trim: true
    },
    passengerNIC: {
      type: String,
      required: true,
      trim: true
    },
    passengerAge: Number,
    passengerGender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  numberOfPassengers: {
    type: Number,
    required: true,
    min: 1
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Completed', 'Pending'],
    default: 'Pending'
  },
  qrCode: {
    type: String
  },
  specialRequests: {
    type: String,
    trim: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actualStartTime: {
    type: Date,
    default: null
  },
  actualEndTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bus: 1, travelDate: 1 });
bookingSchema.index({ 'route.from': 1, 'route.to': 1 });

export default mongoose.model('Booking', bookingSchema);