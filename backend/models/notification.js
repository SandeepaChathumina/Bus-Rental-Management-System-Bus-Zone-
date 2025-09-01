import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['discount', 'package', 'alert', 'reminder', 'booking_confirmation', 'promotional', 'seasonal_offer'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 255
  },
  message: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'passengers', 'drivers', 'staff', 'admins'],
    default: 'all'
  },
  deliveryChannel: {
    type: String,
    enum: ['email', 'sms', 'in_app', 'push', 'all_channels'],
    default: 'in_app'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed', 'expired'],
    default: 'draft'
  },
  sendAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  
  isSeasonal: {
    type: Boolean,
    default: false
  },
  promotionCode: {
    type: String
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },

  relatedEntityType: {
    type: String,
    enum: ['booking', 'payment', 'maintenance', 'user']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  readStatus: {
    type: Boolean,
    default: false
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;