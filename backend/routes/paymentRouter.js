import express from 'express';
import {
  processPayment,
  processMaintenancePayment,
  getUserPayments,
  getPaymentById,
  getAllPayments,
  getAllBookingPayments,
  getAllMaintenancePayments,
  getPaymentStatistics,
  getInvoice,
  processRefund,
  softDeletePayment,
  restorePayment,
  getRecycleBinPayments,
  permanentDeletePayment
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Client endpoints (require authentication)
router.post('/booking', protect, processPayment);
router.post('/maintenance', protect, processMaintenancePayment);
router.get('/my-payments', protect, getUserPayments);
router.get('/invoice/:paymentId', protect, getInvoice);

// Admin endpoints (require authentication + admin privileges)
router.get('/all', protect, admin, getAllPayments);
router.get('/bookings/all', protect, admin, getAllBookingPayments);
router.get('/maintenance/all', protect, admin, getAllMaintenancePayments);
router.get('/stats/overview', protect, admin, getPaymentStatistics);
router.get('/:id', protect, admin, getPaymentById);
router.post('/:id/refund', protect, admin, processRefund);

// Soft delete and recycle bin routes (admin only)
router.patch('/:id/soft-delete', protect, admin, softDeletePayment);
router.patch('/:id/restore', protect, admin, restorePayment);
router.get('/recycle-bin/all', protect, admin, getRecycleBinPayments);
router.delete('/:id/permanent-delete', protect, admin, permanentDeletePayment);

export default router;