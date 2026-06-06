import Attendance from '../models/Attendance.js';
import User from '../models/user.js';
import QRCode from 'qrcode';
import { validationResult } from 'express-validator';

// @desc    Generate QR code for a user (Admin only)
// @route   POST /api/attendance/generate-qr
// @access  Private (Admin)
export const generateQRCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a driver or staff
    if (user.role !== 'driver' && user.role !== 'staff') {
      return res.status(400).json({ message: 'QR codes can only be generated for drivers and staff' });
    }

    // Create QR data (user ID + timestamp to make it unique)
    const qrData = JSON.stringify({
      userId: user._id.toString(),
      timestamp: Date.now()
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    res.status(200).json({
      message: 'QR code generated successfully',
      qrCode: qrCodeDataURL,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check-in/Check-out a user (Driver/Staff) via QR scan
// @route   POST /api/attendance/scan-qr
// @access  Private (Driver, Staff)
export const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    const { userId } = parsedData;

    // 1. Find the user and validate their role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a driver or staff
    if (user.role !== 'driver' && user.role !== 'staff') {
      return res.status(400).json({ message: 'Only drivers and staff can check in/out' });
    }

    // 2. Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 3. Check if user already has an attendance record for today
    let attendance = await Attendance.findOne({
      userId: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const currentTime = new Date();

    if (attendance) {
      // If already checked in, check them out
      if (attendance.status === 'Checked-In') {
        attendance.checkOutTime = currentTime;
        attendance.status = 'Checked-Out';
        await attendance.save();
        
        const populatedAttendance = await Attendance.findById(attendance._id)
          .populate('userId', 'firstName lastName role');
        
        return res.status(200).json({
          message: 'Check-out successful',
          action: 'check-out',
          attendance: populatedAttendance
        });
      } else {
        // Already checked out for today
        return res.status(400).json({ message: 'You have already checked out for today' });
      }
    } else {
      // Create a new check-in record
      attendance = new Attendance({
        userId: userId,
        status: 'Checked-In',
        checkInTime: currentTime,
        date: today
      });

      const savedAttendance = await attendance.save();
      const populatedAttendance = await Attendance.findById(savedAttendance._id)
        .populate('userId', 'firstName lastName role');

      return res.status(201).json({
        message: 'Check-in successful',
        action: 'check-in',
        attendance: populatedAttendance
      });
    }

  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all attendance records with filtering (Admin)
// @route   GET /api/attendance
// @access  Private (Admin)
export const getAttendanceRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, startDate, endDate, status } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1, checkInTime: -1 },
      populate: { path: 'userId', select: 'firstName lastName role' }
    };
    
    // Use mongoose-paginate-v2
    const attendance = await Attendance.paginate(filter, options);
    
    res.json({
      docs: attendance.docs,           // Changed from attendance to docs
      totalPages: attendance.totalPages,
      currentPage: attendance.page,
      totalRecords: attendance.totalDocs
    });

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
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { userId: req.params.userId };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1, checkInTime: -1 },
      populate: { path: 'userId', select: 'firstName lastName role' }
    };
    
    const attendance = await Attendance.paginate(filter, options);
    
    res.json({
      attendance: attendance.docs,
      totalPages: attendance.totalPages,
      currentPage: attendance.page,
      totalRecords: attendance.totalDocs
    });

  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate attendance report
// @route   GET /api/attendance/report
// @access  Private (Admin)
export const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, format = 'json' } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    // Get attendance records with user details
    const attendanceRecords = await Attendance.find(filter)
      .populate('userId', 'firstName lastName role')
      .sort({ date: -1, checkInTime: -1 });
    
    // Calculate summary statistics
    const totalRecords = attendanceRecords.length;
    const checkedInCount = attendanceRecords.filter(record => record.status === 'Checked-In').length;
    const checkedOutCount = attendanceRecords.filter(record => record.status === 'Checked-Out').length;
    const absentCount = attendanceRecords.filter(record => record.status === 'Absent').length;
    
    // Group by user for user-specific stats
    const userStats = {};
    attendanceRecords.forEach(record => {
      const userId = record.userId._id.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          user: record.userId,
          total: 0,
          checkedIn: 0,
          checkedOut: 0,
          absent: 0
        };
      }
      
      userStats[userId].total++;
      if (record.status === 'Checked-In') userStats[userId].checkedIn++;
      if (record.status === 'Checked-Out') userStats[userId].checkedOut++;
      if (record.status === 'Absent') userStats[userId].absent++;
    });
    
    const report = {
      summary: {
        totalRecords,
        checkedInCount,
        checkedOutCount,
        absentCount
      },
      userStats: Object.values(userStats),
      records: attendanceRecords,
      generatedAt: new Date()
    };
    
    // TODO: Add CSV/Excel export functionality if needed
    res.json(report);

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Manually add/edit attendance record (Admin)
// @route   POST /api/attendance/manual
// @access  Private (Admin)
export const manualAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, date, checkInTime, checkOutTime, status, notes } = req.body;
    
    // Validate user exists and is driver/staff
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'driver' && user.role !== 'staff') {
      return res.status(400).json({ message: 'Attendance can only be recorded for drivers and staff' });
    }
    
    // Parse and normalize date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Check if record already exists for this user on this date
    let attendance = await Attendance.findOne({
      userId: userId,
      date: attendanceDate
    });
    
    if (attendance) {
      // Update existing record
      if (checkInTime) attendance.checkInTime = new Date(checkInTime);
      if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);
      if (status) attendance.status = status;
      if (notes !== undefined) attendance.notes = notes;
      
      await attendance.save();
    } else {
      // Create new record
      attendance = new Attendance({
        userId,
        date: attendanceDate,
        checkInTime: checkInTime ? new Date(checkInTime) : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        status: status || 'Checked-In',
        notes
      });
      
      await attendance.save();
    }
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('userId', 'firstName lastName role');
    
    res.status(200).json({
      message: 'Attendance record saved successfully',
      attendance: populatedAttendance
    });

  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete attendance record (Admin)
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
export const deleteAttendanceRecord = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    await Attendance.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Attendance record deleted successfully' });

  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};