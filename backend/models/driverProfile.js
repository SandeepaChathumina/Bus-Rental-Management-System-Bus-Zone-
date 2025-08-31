import mongoose from 'mongoose';

const driverProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  emergencyContact: {
    type: String
  },
  assignedBus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  },
  experience: {
    type: Number, // years of experience
    default: 0
  }
}, {
  timestamps: true
});

const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);

export default DriverProfile;