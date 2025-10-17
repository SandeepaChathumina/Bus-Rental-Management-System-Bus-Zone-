import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busId: {
    type: Number,
    unique: true
  },
  busType: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Luxury', 'Mini', 'Double Decker'],
    trim: true
  },
  brand: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: ''
  },
  modelName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: ''
  },
  engineNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  numberPlate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  vehiclePhoto: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Available', 'Maintenance', 'In Service', 'Retired'],
    default: 'Available'
  }
}, {
  timestamps: true
});

// Auto-increment busId
busSchema.pre('save', async function(next) {
  if (this.isNew && !this.busId) {
    try {
      const lastBus = await this.constructor.findOne().sort({ busId: -1 });
      this.busId = lastBus ? lastBus.busId + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Bus = mongoose.model('Bus', busSchema);

export default Bus;