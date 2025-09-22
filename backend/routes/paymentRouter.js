// routes/paymentRouter.js
import express from 'express';
import {
  // Stripe Payment Methods
  createStripePaymentIntent,
  confirmStripePayment,
  processDirectCardPayment,
  handleStripeWebhook,
  
  // Original Payment Methods
  processPayment,
  processMaintenancePayment,
  getPaymentStatus,
  processRefund,
  getUserPayments,
  getPaymentById,
  getAllPayments,
  getAllBookingPayments,
  getAllMaintenancePayments,
  getPaymentStatistics,
  getInvoice,
  softDeletePayment,
  restorePayment,
  getRecycleBinPayments,
  permanentDeletePayment,
  processDriverSalary,
  getDriverSalaries,
  getAllSalaryPayments,
  getSalaryInvoice,
  getDriverSalaryInvoices
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// STRIPE PAYMENT ROUTES

// Webhook endpoint (must be raw body parser)
router.post('/webhook/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);

// Stripe payment routes
router.post('/stripe/create-intent', protect, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);
router.post('/stripe/direct-payment', protect, processDirectCardPayment);

// PAYMENT STATUS & MANAGEMENT
router.get('/status/:paymentId', protect, getPaymentStatus);
router.post('/:paymentId/refund', protect, processRefund);

// CLIENT PAYMENT ROUTES
router.post('/booking', protect, processPayment);
router.post('/maintenance', protect, processMaintenancePayment);
router.get('/my-payments', protect, getUserPayments);
router.get('/invoice/:paymentId', protect, getInvoice);

// Salary payment routes
router.post('/salary', protect, admin, processDriverSalary);
router.get('/salary/my-salaries', protect, getDriverSalaries);
router.get('/salary/all', protect, admin, getAllSalaryPayments);
router.get('/salary/invoice/:paymentId', protect, getSalaryInvoice);
router.get('/salary/invoices/my-invoices', protect, getDriverSalaryInvoices);

// ADMIN PAYMENT ROUTES
router.get('/admin/all', protect, admin, getAllPayments);
router.get('/admin/bookings', protect, admin, getAllBookingPayments);
router.get('/admin/maintenance', protect, admin, getAllMaintenancePayments);
router.get('/admin/stats', protect, admin, getPaymentStatistics);
router.get('/admin/:id', protect, admin, getPaymentById);

// RECYCLE BIN ROUTES (Admin only)
router.patch('/admin/:id/soft-delete', protect, admin, softDeletePayment);
router.patch('/admin/:id/restore', protect, admin, restorePayment);
router.get('/admin/recycle-bin/all', protect, admin, getRecycleBinPayments);
router.delete('/admin/:id/permanent-delete', protect, admin, permanentDeletePayment);

export default router;