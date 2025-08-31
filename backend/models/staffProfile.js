import mongoose from 'mongoose';

const staffProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  staffRole: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String
  },
  salary: {
    type: Number
  },
  hireDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const StaffProfile = mongoose.model('StaffProfile', staffProfileSchema);

export default StaffProfile;