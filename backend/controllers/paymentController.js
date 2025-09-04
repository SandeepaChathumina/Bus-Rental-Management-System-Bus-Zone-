import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import Invoice from '../models/invoice.js';
import Booking from '../models/booking.js';
import Maintenance from '../models/maintenance.js';
import Schedule from '../models/schedule.js';
import User from '../models/user.js';
import { PaymentGatewayService } from '../utils/paymentGateway.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to find booking
const findBooking = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await Booking.findById(identifier);
  } else {
    return await Booking.findOne({
      $or: [
        { bookingReference: identifier },
        { bookingId: identifier }
      ]
    });
  }
};

// Helper function to find maintenance request
const findMaintenance = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await Maintenance.findById(identifier);
  } else {
    return await Maintenance.findOne({
      $or: [
        { maintenanceId: identifier }
      ]
    });
  }
};

// Generate invoice function for bookings (automatically called on successful payment)
const generateInvoice = async (payment, booking) => {
  try {
    const invoice = new Invoice({
      invoiceNumber: `INV${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      payment: payment._id,
      booking: booking._id,
      user: payment.user,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [{
        description: `Bus Booking - ${booking.bookingId}`,
        quantity: booking.seats.length,
        unitPrice: booking.totalAmount / booking.seats.length,
        total: booking.totalAmount
      }],
      subtotal: booking.totalAmount,
      tax: 0,
      discount: 0,
      totalAmount: booking.totalAmount,
      status: 'paid'
    });

    await invoice.save();
    return invoice;
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw error;
  }
};

// Generate maintenance invoice function
const generateMaintenanceInvoice = async (payment, maintenance) => {
  try {
    const invoice = new Invoice({
      invoiceNumber: `INV-M${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      payment: payment._id,
      maintenance: maintenance._id,
      user: payment.user,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [{
        description: `Maintenance Service - #${maintenance.maintenanceId}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      tax: 0,
      discount: 0,
      totalAmount: payment.amount,
      status: payment.status === 'success' ? 'paid' : 'pending'
    });

    await invoice.save();
    return invoice;
  } catch (error) {
    console.error('Maintenance invoice generation error:', error);
    throw error;
  }
};

// Process payment for booking
export const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentGateway, cardDetails } = req.body;
    const userId = req.user._id;

    // Find the booking using helper function
    const booking = await findBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate payment method
    if (!['card', 'bank_transfer', 'cash', 'wallet'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Validate card details if payment method is card
    if (paymentMethod === 'card') {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardHolder || 
          !cardDetails.expiryDate || !cardDetails.cvv) {
        return res.status(400).json({ message: 'Card details are required' });
      }

      // Simple card validation
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        return res.status(400).json({ message: 'Invalid card number' });
      }
      if (cardDetails.cvv.length !== 3 && cardDetails.cvv.length !== 4) {
        return res.status(400).json({ message: 'Invalid CVV' });
      }
    }

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      booking: booking._id, // Use the actual booking object's ID
      user: userId,
      amount: booking.totalAmount,
      currency: 'USD',
      paymentMethod,
      paymentGateway: paymentGateway || 'none',
      cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      description: `Payment for booking ${booking.bookingId}`,
      paymentType: 'booking'
    });

    let gatewayResponse = null;

    // Process payment through gateway if specified
    if (paymentGateway && paymentGateway !== 'none') {
      const paymentData = {
        amount: booking.totalAmount,
        currency: 'USD',
        cardDetails,
        description: `Payment for booking ${booking.bookingId}`,
        paymentId: payment.paymentId
      };

      switch (paymentGateway) {
        case 'stripe':
          gatewayResponse = await PaymentGatewayService.processStripePayment(paymentData);
          break;
        case 'paypal':
          gatewayResponse = await PaymentGatewayService.processPayPalPayment(paymentData);
          break;
        case 'razorpay':
          gatewayResponse = await PaymentGatewayService.processRazorpayPayment(paymentData);
          break;
        default:
          gatewayResponse = { success: false, error: 'Unsupported payment gateway' };
      }

      payment.gatewayResponse = {
        gatewayId: gatewayResponse.gatewayId,
        status: gatewayResponse.status,
        responseCode: gatewayResponse.success ? '200' : '400',
        responseMessage: gatewayResponse.error || 'Success',
        rawResponse: gatewayResponse.response
      };

      payment.status = gatewayResponse.success ? 'success' : 'failed';
    } else {
      // For cash or bank transfer, mark as pending
      payment.status = 'pending';
    }

    // If payment is successful, update booking and generate invoice
    if (payment.status === 'success') {
      booking.paymentStatus = 'Paid';
      booking.bookingStatus = 'Confirmed';
      await booking.save();

      // Generate invoice automatically
      await generateInvoice(payment, booking);
    }

    await payment.save();

    if (payment.status === 'success') {
      const invoice = await Invoice.findOne({ payment: payment._id });
      res.json({
        message: 'Payment successful',
        payment,
        invoice
      });
    } else if (payment.status === 'pending') {
      res.json({
        message: 'Payment initiated. Please complete the process.',
        payment
      });
    } else {
      res.status(400).json({
        message: gatewayResponse?.error || 'Payment failed. Please try again.',
        payment
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Process payment for maintenance
export const processMaintenancePayment = async (req, res) => {
  try {
    const { maintenanceId, paymentMethod, paymentGateway, cardDetails } = req.body;
    const userId = req.user._id;

    // Find the maintenance request using helper function
    const maintenance = await findMaintenance(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Check if maintenance is approved for payment
    if (maintenance.status !== 'Completed') {
      return res.status(400).json({ 
        message: 'Maintenance must be completed before payment can be processed' 
      });
    }

    // Use actual cost if available, otherwise use estimated cost
    const amount = maintenance.actualCost > 0 ? maintenance.actualCost : maintenance.estimatedCost;

    // Validate payment method
    if (!['card', 'bank_transfer', 'cash', 'wallet'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Validate card details if payment method is card
    if (paymentMethod === 'card') {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardHolder || 
          !cardDetails.expiryDate || !cardDetails.cvv) {
        return res.status(400).json({ message: 'Card details are required' });
      }

      // Simple card validation
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        return res.status(400).json({ message: 'Invalid card number' });
      }
      if (cardDetails.cvv.length !== 3 && cardDetails.cvv.length !== 4) {
        return res.status(400).json({ message: 'Invalid CVV' });
      }
    }

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      maintenance: maintenance._id,
      user: userId,
      amount: amount,
      currency: 'USD',
      paymentMethod,
      paymentGateway: paymentGateway || 'none',
      cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      description: `Payment for maintenance #${maintenance.maintenanceId}`,
      paymentType: 'maintenance'
    });

    let gatewayResponse = null;

    // Process payment through gateway if specified
    if (paymentGateway && paymentGateway !== 'none') {
      const paymentData = {
        amount: amount,
        currency: 'USD',
        cardDetails,
        description: `Payment for maintenance #${maintenance.maintenanceId}`,
        paymentId: payment.paymentId
      };

      switch (paymentGateway) {
        case 'stripe':
          gatewayResponse = await PaymentGatewayService.processStripePayment(paymentData);
          break;
        case 'paypal':
          gatewayResponse = await PaymentGatewayService.processPayPalPayment(paymentData);
          break;
        case 'razorpay':
          gatewayResponse = await PaymentGatewayService.processRazorpayPayment(paymentData);
          break;
        default:
          gatewayResponse = { success: false, error: 'Unsupported payment gateway' };
      }

      payment.gatewayResponse = {
        gatewayId: gatewayResponse.gatewayId,
        status: gatewayResponse.status,
        responseCode: gatewayResponse.success ? '200' : '400',
        responseMessage: gatewayResponse.error || 'Success',
        rawResponse: gatewayResponse.response
      };

      payment.status = gatewayResponse.success ? 'success' : 'failed';
    } else {
      // For cash or bank transfer, mark as pending
      payment.status = 'pending';
    }

    // If payment is successful, update maintenance status and generate invoice
    if (payment.status === 'success') {
      maintenance.paymentStatus = 'Paid';
      await maintenance.save();
      
      // Generate invoice automatically
      await generateMaintenanceInvoice(payment, maintenance);
    }

    await payment.save();

    if (payment.status === 'success') {
      res.json({
        message: 'Maintenance payment successful',
        payment
      });
    } else if (payment.status === 'pending') {
      res.json({
        message: 'Maintenance payment initiated. Please complete the process.',
        payment
      });
    } else {
      res.status(400).json({
        message: gatewayResponse?.error || 'Payment failed. Please try again.',
        payment
      });
    }

  } catch (error) {
    console.error('Maintenance payment processing error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get user's payments
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .populate('booking', 'bookingId travelDate')
      .populate('maintenance', 'maintenanceId description')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    // Use findOne with your custom paymentId field instead of findById
    const payment = await Payment.findOne({ paymentId: req.params.id })
      .populate('booking')
      .populate('maintenance')
      .populate('user', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { type } = req.query; // 'booking', 'maintenance', or undefined for all
    
    let filter = {};
    if (type) {
      filter.paymentType = type;
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingId')
      .populate('maintenance', 'maintenanceId description')
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all booking payments (admin) - DEBUG VERSION
export const getAllBookingPayments = async (req, res) => {
  try {
    console.log('🔍 Checking for booking payments...');
    
    // First, let's see what's actually in the database
    const allPayments = await Payment.find({}).select('paymentType booking status amount createdAt').limit(10);
    console.log('📊 All payments in database:', allPayments);
    
    // Check different filter approaches
    const paymentsWithBookingType = await Payment.find({ paymentType: 'booking' });
    const paymentsWithBookingRef = await Payment.find({ booking: { $exists: true, $ne: null } });
    
    console.log('🎫 Payments with paymentType "booking":', paymentsWithBookingType.length);
    console.log('📋 Payments with booking reference:', paymentsWithBookingRef.length);
    
    // Try different filter approaches
    let filter;
    
    if (paymentsWithBookingType.length > 0) {
      filter = { paymentType: 'booking' };
      console.log('✅ Using paymentType filter');
    } else if (paymentsWithBookingRef.length > 0) {
      filter = { booking: { $exists: true, $ne: null } };
      console.log('✅ Using booking reference filter');
    } else {
      // Show all payments for debugging
      filter = {};
      console.log('⚠️  No booking payments found, showing all payments for debugging');
    }
    
    const { status, paymentMethod, startDate, endDate } = req.query;
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Add payment method filter if provided
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    console.log('🔍 Final filter:', filter);

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingId travelDate routeId busId seats totalAmount')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    console.log('📦 Found payments:', payments.length);

    res.json({
      success: true,
      count: payments.length,
      payments,
      debug: { // Added debug information
        totalPaymentsInDB: await Payment.countDocuments({}),
        paymentsWithBookingType: paymentsWithBookingType.length,
        paymentsWithBookingRef: paymentsWithBookingRef.length,
        filterUsed: filter
      }
    });

  } catch (error) {
    console.error('❌ Get all booking payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all maintenance payments (admin)
export const getAllMaintenancePayments = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate } = req.query;
    
    let filter = { paymentType: 'maintenance' };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Add payment method filter if provided
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const payments = await Payment.find(filter)
      .populate('maintenance', 'maintenanceId description vehicleId actualCost estimatedCost')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('Get all maintenance payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get payment statistics (admin dashboard)
export const getPaymentStatistics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Total payments count and amount
    const totalStats = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    // Payment type breakdown
    const typeStats = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentType',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment method breakdown
    const methodStats = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily/weekly/monthly trend
    let groupFormat;
    switch (period) {
      case 'day':
        groupFormat = { hour: { $hour: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'month':
        groupFormat = { day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'year':
        groupFormat = { month: { $month: '$createdAt' } };
        break;
      default:
        groupFormat = { day: { $dayOfMonth: '$createdAt' } };
    }

    const trendStats = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      period,
      total: totalStats[0] || { totalAmount: 0, totalCount: 0 },
      byType: typeStats,
      byMethod: methodStats,
      trend: trendStats
    });

  } catch (error) {
    console.error('Get payment statistics error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get invoice for payment
export const getInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    let invoice;
    
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      // If it's a valid ObjectId, search directly
      invoice = await Invoice.findOne({ payment: paymentId })
        .populate('payment')
        .populate('booking')
        .populate('maintenance')
        .populate('user', 'firstName lastName email phone');
    } else {
      // If it's a custom payment ID, find the payment first
      const payment = await Payment.findOne({ paymentId: paymentId });
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      invoice = await Invoice.findOne({ payment: payment._id })
        .populate('payment')
        .populate('booking')
        .populate('maintenance')
        .populate('user', 'firstName lastName email phone');
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { paymentId, reason, amount } = req.body;

    // Find the payment
    const payment = await Payment.findOne({ paymentId: paymentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment can be refunded
    if (payment.status !== 'success') {
      return res.status(400).json({ 
        message: 'Only successful payments can be refunded' 
      });
    }

    // Add refund to refunds array
    const refund = {
      amount: amount || payment.amount,
      reason: reason || 'Customer request',
      processedAt: new Date(),
      status: 'processed'
    };

    payment.refunds.push(refund);
    payment.status = 'refunded';
    await payment.save();

    res.json({
      message: 'Refund processed successfully',
      refund,
      payment
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Soft delete payment (move to recycle bin)
export const softDeletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.isDeleted) {
      return res.status(400).json({ message: 'Payment is already deleted' });
    }

    if (payment.status === 'success') {
      return res.status(400).json({ 
        message: 'Cannot delete successful payments. Process refund instead.' 
      });
    }

    // Soft delete - move to recycle bin
    payment.isDeleted = true;
    payment.deletedAt = new Date();
    payment.deletedBy = req.user._id;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment moved to recycle bin',
      payment
    });

  } catch (error) {
    console.error('Soft delete payment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Restore payment from recycle bin
export const restorePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!payment.isDeleted) {
      return res.status(400).json({ message: 'Payment is not deleted' });
    }

    // Restore from recycle bin
    payment.isDeleted = false;
    payment.deletedAt = null;
    payment.deletedBy = null;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment restored from recycle bin',
      payment
    });

  } catch (error) {
    console.error('Restore payment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get recycle bin payments (admin only)
export const getRecycleBinPayments = async (req, res) => {
  try {
    const deletedPayments = await Payment.find({ isDeleted: true })
      .populate('booking', 'bookingId travelDate')
      .populate('maintenance', 'maintenanceId description')
      .populate('user', 'firstName lastName')
      .populate('deletedBy', 'firstName lastName')
      .sort({ deletedAt: -1 });

    res.json({
      success: true,
      count: deletedPayments.length,
      payments: deletedPayments
    });

  } catch (error) {
    console.error('Get recycle bin error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Permanent delete from recycle bin (admin only)
export const permanentDeletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      paymentId: req.params.id, 
      isDeleted: true 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found in recycle bin' });
    }

    // PERMANENT delete from recycle bin
    await Payment.deleteOne({ paymentId: req.params.id });

    res.json({
      success: true,
      message: 'Payment permanently deleted from recycle bin',
      deletedPaymentId: req.params.id
    });

  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Process driver salary payment (admin only) with invoice generation
export const processDriverSalary = async (req, res) => {
  try {
    const { scheduleId, driverId, amount, paymentMethod, description } = req.body;
    const adminId = req.user._id;

    // Validate required fields
    if (!scheduleId || !driverId || !amount) {
      return res.status(400).json({ message: 'Schedule ID, driver ID, and amount are required' });
    }

    // Check if schedule exists and is completed
    const schedule = await Schedule.findById(scheduleId)
      .populate('busId', 'busId numberPlate')
      .populate('driverId', 'firstName lastName');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.status !== 'Completed') {
      return res.status(400).json({ message: 'Salary can only be paid for completed trips' });
    }

    // Check if driver exists and get driver profile
    const driver = await User.findById(driverId);
    const driverProfile = await DriverProfile.findOne({ user: driverId });
    
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (!driverProfile) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // Verify the driver in schedule matches the provided driver
    if (schedule.driverId._id.toString() !== driverId) {
      return res.status(400).json({ 
        message: 'Driver does not match the scheduled driver for this trip' 
      });
    }

    // Check if salary already paid for this schedule
    const existingSalaryPayment = await Payment.findOne({ 
      schedule: scheduleId, 
      paymentType: 'salary' 
    });
    
    if (existingSalaryPayment) {
      return res.status(400).json({ message: 'Salary already paid for this schedule' });
    }

    // Create salary payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      driver: driverProfile._id,
      schedule: scheduleId,
      user: adminId,
      amount: amount,
      currency: 'USD',
      paymentMethod: paymentMethod || 'bank_transfer',
      paymentGateway: 'none',
      transactionId: `SAL${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      description: description || `Salary payment for trip from ${schedule.startLocation} to ${schedule.destination}`,
      paymentType: 'salary',
      status: 'success'
    });

    await payment.save();

    // Generate salary invoice automatically
    try {
      const invoice = await generateSalaryInvoice(payment, schedule, driver, driverProfile);
      
      res.json({
        message: 'Driver salary paid successfully',
        payment: {
          _id: payment._id,
          paymentId: payment.paymentId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          description: payment.description
        },
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          issueDate: invoice.issueDate
        }
      });
      
    } catch (invoiceError) {
      console.error('Invoice generation failed:', invoiceError);
      // Still return success but warn about invoice issue
      res.json({
        message: 'Driver salary paid successfully but invoice generation failed',
        payment: {
          _id: payment._id,
          paymentId: payment.paymentId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          description: payment.description
        },
        warning: 'Invoice could not be generated. Please contact administrator.'
      });
    }

  } catch (error) {
    console.error('Salary payment processing error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
// Get driver's salary payments
export const getDriverSalaries = async (req, res) => {
  try {
    const driverId = req.user._id;
    
    const salaries = await Payment.find({ 
      driver: driverId, 
      paymentType: 'salary' 
    })
      .populate('schedule', 'scheduledStartTime scheduledEndTime startLocation destination')
      .populate('user', 'firstName lastName') // Admin who processed payment
      .sort({ createdAt: -1 });

    res.json(salaries);
  } catch (error) {
    console.error('Get driver salaries error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all salary payments (admin)
export const getAllSalaryPayments = async (req, res) => {
  try {
    const { driverId, startDate, endDate } = req.query;
    
    let filter = { paymentType: 'salary' };
    
    // Add driver filter if provided
    if (driverId) {
      filter.driver = driverId;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const salaries = await Payment.find(filter)
      .populate('driver', 'firstName lastName')
      .populate('schedule', 'scheduledStartTime scheduledEndTime startLocation destination')
      .populate('user', 'firstName lastName') // Admin who processed payment
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: salaries.length,
      salaries
    });
  } catch (error) {
    console.error('Get all salary payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Generate salary invoice function
// Generate salary invoice function
const generateSalaryInvoice = async (payment, schedule, driver, driverProfile) => {
  try {
    const invoice = new Invoice({
      invoiceNumber: `INV-SAL${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      payment: payment._id,
      schedule: schedule._id,
      user: payment.user, // Admin who processed payment
      driver: driverProfile._id,
      issueDate: new Date(),
      dueDate: new Date(),
      items: [{
        description: `Driver Salary - Trip #${schedule._id.toString().slice(-6)}`,
        details: `From ${schedule.startLocation} to ${schedule.destination}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      tax: 0,
      discount: 0,
      totalAmount: payment.amount,
      status: 'paid',
      invoiceType: 'salary',
      metadata: {
        busId: schedule.busId?._id,
        busNumber: schedule.busId?.numberPlate,
        tripDate: schedule.scheduledStartTime,
        driverHourlyRate: driverProfile.hourlyRate,
        duration: schedule.scheduledEndTime - schedule.scheduledStartTime
      }
    });

    await invoice.save();
    return invoice;
  } catch (error) {
    console.error('Salary invoice generation error:', error);
    throw error;
  }
};
// Get salary invoice by payment ID - Driver can view own, admin can view any
export const getSalaryInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Find the payment
    const payment = await Payment.findOne({ paymentId })
      .populate('driver')
      .populate('schedule');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions
    if (user.role === 'driver') {
      const driverProfile = await DriverProfile.findOne({ user: userId });
      if (!driverProfile || payment.driver._id.toString() !== driverProfile._id.toString()) {
        return res.status(403).json({ 
          message: 'Access denied. You can only view your own salary invoices.' 
        });
      }
    }

    // Find the invoice
    const invoice = await Invoice.findOne({ payment: payment._id })
      .populate('driver')
      .populate('schedule', 'scheduledStartTime scheduledEndTime startLocation destination busId')
      .populate('user', 'firstName lastName'); // Admin who processed payment

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found for this payment' });
    }

    // Get driver details for the invoice
    const driverProfile = await DriverProfile.findById(invoice.driver)
      .populate('user', 'firstName lastName email phone');

    const invoiceWithDetails = {
      ...invoice.toObject(),
      driverDetails: driverProfile ? {
        firstName: driverProfile.user.firstName,
        lastName: driverProfile.user.lastName,
        email: driverProfile.user.email,
        phone: driverProfile.user.phone,
        licenseNumber: driverProfile.licenseNumber,
        hourlyRate: driverProfile.hourlyRate
      } : null
    };

    res.json({
      success: true,
      invoice: invoiceWithDetails
    });

  } catch (error) {
    console.error('Get salary invoice error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all salary invoices for driver
export const getDriverSalaryInvoices = async (req, res) => {
  try {
    const driverId = req.user._id;
    const driverProfile = await DriverProfile.findOne({ user: driverId });

    if (!driverProfile) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const invoices = await Invoice.find({ 
      driver: driverProfile._id,
      invoiceType: 'salary'
    })
      .populate('payment', 'paymentId amount paymentMethod createdAt')
      .populate('schedule', 'scheduledStartTime scheduledEndTime startLocation destination busId')
      .populate('user', 'firstName lastName')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices
    });

  } catch (error) {
    console.error('Get driver salary invoices error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};