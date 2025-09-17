import express from 'express';
import { 
  generateQRCode, 
  scanQRCode, 
  getAttendanceRecords, 
  getUserAttendance, 
  generateAttendanceReport,
  manualAttendance,
  deleteAttendanceRecord
} from '../controllers/attendanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

// All routes are protected
router.use(protect);

// QR code generation (Admin only)
router.post('/generate-qr', 
  admin,
  [
    body('userId').isMongoId().withMessage('Valid user ID is required')
  ],
  generateQRCode
);

// QR code scanning (Driver/Staff)
router.post('/scan-qr', scanQRCode);

// Get attendance records with filtering (Admin only)
router.get('/', admin, getAttendanceRecords);

// Get attendance for specific user
router.get('/user/:userId', getUserAttendance);

// Generate attendance report (Admin only)
router.get('/report', admin, generateAttendanceReport);

// Manual attendance management (Admin only)
router.post('/manual',
  admin,
  [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('date').isISO8601().withMessage('Valid date is required')
  ],
  manualAttendance
);

// Delete attendance record (Admin only)
router.delete('/:id', admin, deleteAttendanceRecord);

export default router;