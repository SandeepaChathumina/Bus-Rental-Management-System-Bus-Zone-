import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  type: {
    type: String,
    enum: ['feedback', 'complaint'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null // Only for feedback type
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'closed'],
    default: 'pending'
  },
  send_date: {
    type: Date,
    default: Date.now
  },
  admin_reply: {
    type: String,
    default: null
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reply_date: {
    type: Date,
    default: null
  },
  is_editable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better performance on public testimonials query
feedbackSchema.index({ type: 1, status: 1, rating: -1, send_date: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;