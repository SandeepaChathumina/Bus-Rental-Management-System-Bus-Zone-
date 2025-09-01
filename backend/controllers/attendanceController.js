import Attendance from '../models/Attendance.js';
import User from '../models/user.js';

// @desc    Check-in a user (Driver/Staff) via QR scan
// @route   POST /api/attendance/check-in
// @access  Private (Driver, Staff)
export const checkInUser = async (req, res) => {
  try {
    const { userId } = req.body; // User ID will be sent from the frontend app after scanning

    // 1. Find the user and validate their role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a driver or staff
    if (user.role !== 'driver' && user.role !== 'staff') {
      return res.status(400).json({ message: 'Only drivers and staff can check in' });
    }

    // 2. Check if user is already checked in (optional: prevent duplicate check-ins on the same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await Attendance.findOne({
      userId: userId,
      checkInTime: { $gte: today },
      status: 'Checked-In'
    });

    if (existingCheckIn) {
      return res.status(400).json({ message: 'You are already checked in for today' });
    }

    // 3. Create a new attendance record
    const attendance = new Attendance({
      userId: userId,
      status: 'Checked-In'
      // scheduleId can be added later if you link to a specific shift
    });

    const savedAttendance = await attendance.save();

    // 4. Populate user details for the response
    const populatedAttendance = await Attendance.findById(savedAttendance._id).populate('userId', 'firstName lastName role');

    res.status(201).json({
      message: 'Check-in successful',
      attendance: populatedAttendance
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance
// @access  Private (Admin)
export const getAttendanceRecords = async (req, res) => {
  try {
    const attendance = await Attendance.find({})
      .populate('userId', 'firstName lastName role')
      .sort({ checkInTime: -1 }); // Show latest first

    res.json({ attendance });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance for a specific user
// @route   GET /api/attendance/user/:userId
// @access  Private (Admin, Specific User)
export const getUserAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.params.userId })
      .populate('userId', 'firstName lastName role')
      .sort({ checkInTime: -1 });

    res.json({ attendance });

  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};