import express from 'express';
import {
  createBooking,
  confirmBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.post('/confirm', protect, confirmBooking); // New endpoint for confirmation
router.get('/my-bookings', protect, getUserBookings);
router.get('/all', protect, admin, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

export default router;