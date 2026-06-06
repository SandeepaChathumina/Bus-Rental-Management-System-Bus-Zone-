import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Checked-In', 'Checked-Out', 'Absent'],
    default: 'Checked-In'
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate check-ins for same user on same day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Add pagination plugin
attendanceSchema.plugin(mongoosePaginate);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;