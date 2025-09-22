// routes/bookingRouter.js
import express from 'express';
import {
  getAvailableBuses,
  createBooking,
  confirmBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBooking,
  getBookingStats,
  getBookingsByDateRange,
  verifyBooking,
  calculateFare,
  processBookingPayment,
  getBookingInvoice
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
router.post('/:id/payment', protect, processBookingPayment);
router.get('/:id/invoice', protect, getBookingInvoice);

// Admin routes
router.get('/admin/all', protect, admin, getAllBookings);
router.get('/admin/stats', protect, admin, getBookingStats);
router.get('/admin/date-range', protect, admin, getBookingsByDateRange);

export default router;