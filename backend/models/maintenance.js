import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  maintenanceId: {
    type: Number,
    unique: true
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
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  estimatedCost: {
    type: Number,
    min: 0,
    required: true
  },
  actualCost: {
    type: Number,
    min: 0,
    default: 0
  },
  estimatedCompletionDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty dates
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        return value >= today; // Must be today or future
      },
      message: 'Estimated completion date cannot be in the past'
    }
  },
  actualCompletionDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty dates
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        return value <= today; // Must be today or past
      },
      message: 'Actual completion date cannot be in the future'
    }
  }
}, {
  timestamps: true
});

// Auto-increment maintenanceId
maintenanceSchema.pre('save', async function(next) {
  if (this.isNew && !this.maintenanceId) {
    try {
      const lastMaintenance = await this.constructor.findOne().sort({ maintenanceId: -1 });
      this.maintenanceId = lastMaintenance ? lastMaintenance.maintenanceId + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;