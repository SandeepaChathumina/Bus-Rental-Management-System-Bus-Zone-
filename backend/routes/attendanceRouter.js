import express from 'express';
import { checkInUser, getAttendanceRecords, getUserAttendance } from '../controllers/attendanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/check-in', checkInUser); // Drivers & Staff check themselves in
router.get('/', admin, getAttendanceRecords); // Admin sees all
router.get('/user/:userId', getUserAttendance); // Users see their own, Admins see anyone's

export default router;