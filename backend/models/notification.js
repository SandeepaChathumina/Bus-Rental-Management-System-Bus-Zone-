import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'discount', 'promotional', 'alert', 'booking', 'reminder', 'package', 'seasonal'],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'passengers', 'drivers', 'staff', 'admins'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'scheduled', 'active'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
notificationSchema.index({ isActive: 1, createdAt: -1 });
notificationSchema.index({ targetAudience: 1 });
notificationSchema.index({ expiresAt: 1 });

// Method to check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;