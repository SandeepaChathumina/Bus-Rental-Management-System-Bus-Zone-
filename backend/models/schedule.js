import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startLocation: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;