import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import Invoice from '../models/invoice.js';
import Booking from '../models/booking.js';
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

// Generate invoice function (automatically called on successful payment)
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

// Process payment for booking - SINGLE DEFINITION
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
      description: `Payment for booking ${booking.bookingId}`
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

// Get user's payments
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .populate('booking', 'bookingId travelDate')
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
    const payments = await Payment.find()
      .populate('booking', 'bookingId')
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
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