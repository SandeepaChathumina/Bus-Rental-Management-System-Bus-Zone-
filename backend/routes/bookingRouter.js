import express from 'express';
import {
  createBooking,
  confirmBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  getAvailableBuses,
  updateBooking,
  getBookingStats,
  getBookingsByDateRange,
  verifyBooking
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/available', getAvailableBuses);
router.get('/verify/:bookingId', verifyBooking);

// Protected routes
router.get('/my-bookings', protect, getUserBookings);
router.post('/', protect, createBooking);
router.post('/confirm', protect, confirmBooking);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/admin/all', protect, admin, getAllBookings);
router.get('/admin/stats', protect, admin, getBookingStats);
router.get('/admin/date-range', protect, admin, getBookingsByDateRange);

export default router;