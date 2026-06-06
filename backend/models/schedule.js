import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
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
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  fare: {
    type: Number,
    required: true,
    min: 0
  },
  monday: { type: Boolean, default: false },
  tuesday: { type: Boolean, default: false },
  wednesday: { type: Boolean, default: false },
  thursday: { type: Boolean, default: false },
  friday: { type: Boolean, default: false },
  saturday: { type: Boolean, default: false },
  sunday: { type: Boolean, default: false },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
scheduleSchema.index({ bus: 1 });
scheduleSchema.index({ 'route.from': 1, 'route.to': 1 });

export default mongoose.model('Schedule', scheduleSchema);