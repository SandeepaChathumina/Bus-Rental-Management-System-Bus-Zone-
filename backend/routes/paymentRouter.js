import express from 'express';
import {
  processPayment,
  getUserPayments,
  getPaymentById,
  getAllPayments,
  getInvoice,
  processRefund,
  softDeletePayment,
  restorePayment,
  getRecycleBinPayments,
  permanentDeletePayment
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Client endpoints
router.post('/booking', protect, processPayment);
router.get('/my-payments', protect, getUserPayments);
router.get('/invoice/:paymentId', protect, getInvoice);

// Admin endpoints
router.get('/all', protect, admin, getAllPayments);
router.get('/:id', protect, admin, getPaymentById);
router.post('/refund', protect, admin, processRefund);

// Soft delete routes
router.patch('/:id/soft-delete', protect, admin, softDeletePayment);
router.patch('/:id/restore', protect, admin, restorePayment);
router.get('/recycle-bin/all', protect, admin, getRecycleBinPayments);
router.delete('/:id/permanent', protect, admin, permanentDeletePayment);

export default router;