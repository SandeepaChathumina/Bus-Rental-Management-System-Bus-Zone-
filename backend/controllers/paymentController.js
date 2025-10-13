// controllers/paymentController.js
import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import Invoice from '../models/invoice.js';
import Booking from '../models/booking.js';
import Maintenance from '../models/maintenance.js';
import Schedule from '../models/schedule.js';
import User from '../models/user.js';
import DriverProfile from '../models/driverProfile.js';
import stripe from '../config/stripe.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { sendBookingConfirmation } from '../utils/emailService.js';

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

// Generate invoice function for bookings
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

// Generate salary invoice function
const generateSalaryInvoice = async (payment, schedule, driver, driverProfile) => {
  try {
    const invoice = new Invoice({
      invoiceNumber: `INV-SAL${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      payment: payment._id,
      schedule: schedule._id,
      user: payment.user,
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

// STRIPE PAYMENT INTEGRATION

// Create Stripe payment intent
// Fix for createStripePaymentIntent function in paymentController.js

export const createStripePaymentIntent = async (req, res) => {
  try {
    // Add debugging and validation
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { bookingId, amount, currency = 'lkr', description } = req.body;
    const userId = req.user._id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find booking if provided
    let booking = null;
    if (bookingId) {
      booking = await findBooking(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Validate booking ownership
      if (booking.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to pay for this booking'
        });
      }

      // Check if booking is already paid
      if (booking.paymentStatus === 'Paid') {
        return res.status(400).json({
          success: false,
          message: 'Booking is already paid'
        });
      }
    }

    const paymentAmount = amount || (booking ? booking.totalAmount : 0);
    
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const paymentDescription = description || (booking ? `Bus booking payment for ${booking.bookingId}` : 'Payment');

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description: paymentDescription,
      metadata: {
        userId: userId.toString(),
        bookingId: bookingId || 'none',
        type: bookingId ? 'booking' : 'other'
      },
      receipt_email: user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record in database
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      booking: bookingId ? booking._id : null,
      user: userId,
      amount: paymentAmount,
      currency: currency.toUpperCase(),
      paymentMethod: 'card',
      paymentGateway: 'stripe',
      transactionId: paymentIntent.id,
      description: paymentDescription,
      paymentType: bookingId ? 'booking' : 'other',
      status: 'pending',
      gatewayResponse: {
        gatewayId: paymentIntent.id,
        status: 'requires_payment_method',
        clientSecret: paymentIntent.client_secret,
        responseMessage: 'Payment intent created'
      }
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentAmount,
        currency: currency
      },
      payment: {
        paymentId: payment.paymentId,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Create Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Confirm Stripe payment
export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;
    const userId = req.user._id;

    // Find payment record
    const payment = await Payment.findOne({ 
      $or: [
        { paymentId: paymentId },
        { transactionId: paymentIntentId }
      ],
      user: userId 
    }).populate({
      path: 'booking',
      populate: {
        path: 'user',
        select: 'email firstName lastName'
      }
    }).populate('maintenance');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update payment status based on Stripe response
    payment.status = paymentIntent.status === 'succeeded' ? 'success' : 
                    paymentIntent.status === 'processing' ? 'processing' : 'failed';
    
    payment.gatewayResponse.status = paymentIntent.status;
    payment.gatewayResponse.responseMessage = `Payment ${paymentIntent.status}`;
    payment.gatewayResponse.rawResponse = paymentIntent;

    if (paymentIntent.status === 'succeeded') {
      // Handle successful payment based on payment type
      switch (payment.paymentType) {
        case 'booking':
          if (payment.booking) {
            payment.booking.paymentStatus = 'Paid';
            payment.booking.bookingStatus = 'Confirmed';
            
            // Generate QR code for booking
            try {
              const qrData = {
                bookingId: payment.booking.bookingId,
                passenger: payment.booking.seats[0]?.passengerName || 'Passenger',
                busNumber: payment.booking.bus?.numberPlate,
                travelDate: payment.booking.travelDate.toDateString(),
                seats: payment.booking.seats.map(seat => seat.seatNumber).join(', '),
                totalAmount: payment.booking.totalAmount
              };
              const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
              payment.booking.qrCode = qrCodeImage;
            } catch (qrError) {
              console.error('QR code generation error:', qrError);
            }
            
            await payment.booking.save();
            await generateInvoice(payment, payment.booking);
            
            // Send booking confirmation email with QR code
            try {
              console.log('📧 ===== PAYMENT CONTROLLER: SENDING BOOKING EMAIL =====');
              console.log('📧 Payment booking data:', {
                bookingId: payment.booking.bookingId,
                contactInfo: payment.booking.contactInfo,
                hasQRCode: !!payment.booking.qrCode,
                email: payment.booking.contactInfo?.email
              });
              
              // Check if we have the required data - try multiple possible locations for email
              const emailAddress = payment.booking.contactInfo?.email || payment.booking.user?.email;
              
              if (!emailAddress) {
                console.error('❌ PAYMENT CONTROLLER: NO EMAIL ADDRESS FOUND!');
                console.error('❌ contactInfo:', payment.booking.contactInfo);
                console.error('❌ user:', payment.booking.user);
                return;
              }
              
              console.log('📧 PAYMENT CONTROLLER: Using email address:', emailAddress);
              
              // Ensure the booking has all necessary data for email
              const bookingForEmail = {
                ...payment.booking.toObject(),
                contactInfo: payment.booking.contactInfo || {},
                user: payment.booking.user || {}
              };
              
              const emailResult = await sendBookingConfirmation(bookingForEmail);
              if (emailResult.success) {
                console.log('✅ PAYMENT CONTROLLER: Booking confirmation email sent successfully');
              } else {
                console.error('❌ PAYMENT CONTROLLER: Failed to send booking confirmation email:', emailResult.error);
              }
            } catch (emailError) {
              console.error('❌ PAYMENT CONTROLLER: Error sending booking confirmation email:', emailError);
              // Don't fail the payment if email fails
            }
          }
          break;

        case 'maintenance':
          if (payment.maintenance) {
            payment.maintenance.paymentStatus = 'Paid';
            await payment.maintenance.save();
            await generateMaintenanceInvoice(payment, payment.maintenance);
          }
          break;

        case 'salary':
          // Salary payments are handled separately
          break;
      }
    }

    await payment.save();

    res.json({
      success: paymentIntent.status === 'succeeded',
      message: `Payment ${paymentIntent.status}`,
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId,
        type: payment.paymentType
      },
      booking: payment.booking ? {
        bookingId: payment.booking.bookingId,
        status: payment.booking.bookingStatus
      } : null
    });

  } catch (error) {
    console.error('Confirm Stripe payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Process direct card payment
export const processDirectCardPayment = async (req, res) => {
  try {
    const { bookingId, cardDetails, paymentType = 'booking', maintenanceId } = req.body;
    const userId = req.user._id;

    let paymentData = {};
    let description = '';

    // Handle different payment types
    if (paymentType === 'booking' && bookingId) {
      const booking = await findBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      if (booking.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (booking.paymentStatus === 'Paid') {
        return res.status(400).json({ message: 'Booking already paid' });
      }

      paymentData.amount = booking.totalAmount;
      paymentData.metadata = { bookingId: booking.bookingId, type: 'booking' };
      description = `Payment for booking ${booking.bookingId}`;
      paymentData.booking = booking._id;

    } else if (paymentType === 'maintenance' && maintenanceId) {
      const maintenance = await findMaintenance(maintenanceId);
      if (!maintenance) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }
      if (maintenance.status !== 'Completed') {
        return res.status(400).json({ message: 'Maintenance must be completed before payment' });
      }

      const amount = maintenance.actualCost > 0 ? maintenance.actualCost : maintenance.estimatedCost;
      paymentData.amount = amount;
      paymentData.metadata = { maintenanceId: maintenance.maintenanceId, type: 'maintenance' };
      description = `Payment for maintenance #${maintenance.maintenanceId}`;
      paymentData.maintenance = maintenance._id;

    } else {
      return res.status(400).json({ message: 'Invalid payment type or missing ID' });
    }

    // Get user details
    const user = await User.findById(userId);

    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardDetails.cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(cardDetails.expiryDate.split('/')[0]),
        exp_year: parseInt(cardDetails.expiryDate.split('/')[1]),
        cvc: cardDetails.cvv,
      },
      billing_details: {
        name: cardDetails.cardHolder,
        email: user.email,
      },
    });

    // Create and confirm payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100),
      currency: 'lkr',
      payment_method: paymentMethod.id,
      confirm: true,
      description: description,
      metadata: paymentData.metadata,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
    });

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      booking: paymentData.booking,
      maintenance: paymentData.maintenance,
      user: userId,
      amount: paymentData.amount,
      currency: 'LKR',
      paymentMethod: 'card',
      paymentGateway: 'stripe',
      cardDetails: {
        cardNumber: `****${cardDetails.cardNumber.slice(-4)}`,
        cardHolder: cardDetails.cardHolder,
        expiryDate: cardDetails.expiryDate
      },
      transactionId: paymentIntent.id,
      description: description,
      paymentType: paymentType,
      status: paymentIntent.status === 'succeeded' ? 'success' : 'failed',
      gatewayResponse: {
        gatewayId: paymentIntent.id,
        status: paymentIntent.status,
        responseMessage: paymentIntent.status === 'succeeded' ? 'Success' : 'Failed'
      }
    });

    await payment.save();

    // Handle successful payment
    if (paymentIntent.status === 'succeeded') {
      if (paymentType === 'booking' && paymentData.booking) {
        const booking = await Booking.findById(paymentData.booking);
        booking.paymentStatus = 'Paid';
        booking.bookingStatus = 'Confirmed';
        await booking.save();
        await generateInvoice(payment, booking);
      } else if (paymentType === 'maintenance' && paymentData.maintenance) {
        const maintenance = await Maintenance.findById(paymentData.maintenance);
        maintenance.paymentStatus = 'Paid';
        await maintenance.save();
        await generateMaintenanceInvoice(payment, maintenance);
      }
    }

    res.json({
      success: paymentIntent.status === 'succeeded',
      message: paymentIntent.status === 'succeeded' ? 'Payment successful' : 'Payment failed',
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId
      }
    });

  } catch (error) {
    console.error('Direct card payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ORIGINAL PAYMENT FUNCTIONS

// Process payment for booking
export const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentGateway, cardDetails } = req.body;
    const userId = req.user._id;

    // Find the booking
    const booking = await findBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate ownership
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Use Stripe as default gateway if not specified
    const effectiveGateway = paymentGateway || 'stripe';

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      booking: booking._id,
      user: userId,
      amount: booking.totalAmount,
      currency: 'LKR',
      paymentMethod,
      paymentGateway: effectiveGateway,
      cardDetails: paymentMethod === 'card' ? {
        cardNumber: `****${cardDetails.cardNumber.slice(-4)}`,
        cardHolder: cardDetails.cardHolder,
        expiryDate: cardDetails.expiryDate
      } : undefined,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      description: `Payment for booking ${booking.bookingId}`,
      paymentType: 'booking'
    });

    // Process payment based on gateway
    if (effectiveGateway === 'stripe' && paymentMethod === 'card') {
      try {
        const user = await User.findById(userId);
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(booking.totalAmount * 100),
          currency: 'lkr',
          payment_method_data: {
            type: 'card',
            card: {
              number: cardDetails.cardNumber.replace(/\s/g, ''),
              exp_month: parseInt(cardDetails.expiryDate.split('/')[0]),
              exp_year: parseInt(cardDetails.expiryDate.split('/')[1]),
              cvc: cardDetails.cvv,
            },
          },
          confirm: true,
          description: `Booking payment for ${booking.bookingId}`,
          metadata: { bookingId: booking.bookingId },
          receipt_email: user.email,
        });

        payment.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';
        payment.transactionId = paymentIntent.id;
        payment.gatewayResponse = {
          gatewayId: paymentIntent.id,
          status: paymentIntent.status,
          responseCode: '200',
          responseMessage: paymentIntent.status === 'succeeded' ? 'Success' : 'Failed',
          rawResponse: paymentIntent
        };

      } catch (stripeError) {
        payment.status = 'failed';
        payment.gatewayResponse = {
          status: 'failed',
          responseMessage: stripeError.message
        };
      }
    } else {
      // For non-Stripe or non-card payments
      payment.status = 'pending';
    }

    await payment.save();

    // Handle successful payment
    if (payment.status === 'success') {
      booking.paymentStatus = 'Paid';
      booking.bookingStatus = 'Confirmed';
      await booking.save();
      await generateInvoice(payment, booking);
    }

    const response = {
      message: payment.status === 'success' ? 'Payment successful' : 
               payment.status === 'pending' ? 'Payment initiated' : 'Payment failed',
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount
      }
    };

    if (payment.status === 'success') {
      const invoice = await Invoice.findOne({ payment: payment._id });
      response.invoice = invoice;
      response.booking = {
        bookingId: booking.bookingId,
        status: booking.bookingStatus
      };
    }

    res.json(response);

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

    // Find the maintenance request
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

    // Use Stripe as default gateway
    const effectiveGateway = paymentGateway || 'stripe';

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      maintenance: maintenance._id,
      user: userId,
      amount: amount,
      currency: 'LKR',
      paymentMethod,
      paymentGateway: effectiveGateway,
      cardDetails: paymentMethod === 'card' ? {
        cardNumber: `****${cardDetails.cardNumber.slice(-4)}`,
        cardHolder: cardDetails.cardHolder,
        expiryDate: cardDetails.expiryDate
      } : undefined,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      description: `Payment for maintenance #${maintenance.maintenanceId}`,
      paymentType: 'maintenance'
    });

    // Process payment based on gateway
    if (effectiveGateway === 'stripe' && paymentMethod === 'card') {
      try {
        const user = await User.findById(userId);
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'lkr',
          payment_method_data: {
            type: 'card',
            card: {
              number: cardDetails.cardNumber.replace(/\s/g, ''),
              exp_month: parseInt(cardDetails.expiryDate.split('/')[0]),
              exp_year: parseInt(cardDetails.expiryDate.split('/')[1]),
              cvc: cardDetails.cvv,
            },
          },
          confirm: true,
          description: `Maintenance payment for #${maintenance.maintenanceId}`,
          metadata: { maintenanceId: maintenance.maintenanceId },
          receipt_email: user.email,
        });

        payment.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';
        payment.transactionId = paymentIntent.id;
        payment.gatewayResponse = {
          gatewayId: paymentIntent.id,
          status: paymentIntent.status,
          responseCode: '200',
          responseMessage: paymentIntent.status === 'succeeded' ? 'Success' : 'Failed',
          rawResponse: paymentIntent
        };

      } catch (stripeError) {
        payment.status = 'failed';
        payment.gatewayResponse = {
          status: 'failed',
          responseMessage: stripeError.message
        };
      }
    } else {
      payment.status = 'pending';
    }

    await payment.save();

    // Handle successful payment
    if (payment.status === 'success') {
      maintenance.paymentStatus = 'Paid';
      await maintenance.save();
      await generateMaintenanceInvoice(payment, maintenance);
    }

    const response = {
      message: payment.status === 'success' ? 'Payment successful' : 
               payment.status === 'pending' ? 'Payment initiated' : 'Payment failed',
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Maintenance payment processing error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findOne({ 
      paymentId: paymentId,
      user: userId 
    }).populate('booking').populate('maintenance');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If payment is pending and using Stripe, check with Stripe
    if (payment.status === 'pending' && payment.paymentGateway === 'stripe') {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);
        payment.status = paymentIntent.status === 'succeeded' ? 'success' : 
                        paymentIntent.status === 'processing' ? 'processing' : 'failed';
        payment.gatewayResponse.status = paymentIntent.status;
        await payment.save();
      } catch (error) {
        console.error('Error checking payment status with Stripe:', error);
      }
    }

    res.json({
      success: true,
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        paymentGateway: payment.paymentGateway,
        description: payment.description,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      },
      relatedEntity: payment.booking ? {
        type: 'booking',
        id: payment.booking.bookingId,
        status: payment.booking.bookingStatus
      } : payment.maintenance ? {
        type: 'maintenance',
        id: payment.maintenance.maintenanceId,
        status: payment.maintenance.status
      } : null
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Refund payment
export const processRefund = async (req, res) => {
  try {
    const { paymentId, reason, amount } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findOne({ 
      paymentId: paymentId 
    }).populate('booking').populate('maintenance');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ message: 'Only successful payments can be refunded' });
    }

    const refundAmount = amount || payment.amount;

    // Process refund based on payment gateway
    let refundResult;
    if (payment.paymentGateway === 'stripe') {
      refundResult = await stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: Math.round(refundAmount * 100),
        reason: 'requested_by_customer'
      });
    } else {
      // Manual refund for non-Stripe payments
      refundResult = { id: `manual_ref_${Date.now()}`, status: 'succeeded' };
    }

    // Update payment record
    payment.refunds.push({
      amount: refundAmount,
      reason: reason || 'Customer request',
      processedAt: new Date(),
      status: refundResult.status === 'succeeded' ? 'processed' : 'failed',
      refundId: refundResult.id
    });

    if (refundResult.status === 'succeeded') {
      payment.status = 'refunded';
      
      // Update related entity status
      if (payment.booking) {
        payment.booking.paymentStatus = 'Refunded';
        await payment.booking.save();
      }
      if (payment.maintenance) {
        payment.maintenance.paymentStatus = 'Refunded';
        await payment.maintenance.save();
      }
    }

    await payment.save();

    res.json({
      success: refundResult.status === 'succeeded',
      message: refundResult.status === 'succeeded' ? 'Refund processed successfully' : 'Refund failed',
      refund: {
        refundId: refundResult.id,
        amount: refundAmount,
        status: refundResult.status === 'succeeded' ? 'processed' : 'failed'
      }
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all booking payments (admin)
export const getAllBookingPayments = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate } = req.query;
    
    let filter = { paymentType: 'booking' };
    
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
      .populate('booking', 'bookingId travelDate routeId busId seats totalAmount')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('Get all booking payments error:', error);
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

    // Payment gateway breakdown
    const gatewayStats = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentGateway',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      period,
      total: totalStats[0] || { totalAmount: 0, totalCount: 0 },
      byType: typeStats,
      byMethod: methodStats,
      byGateway: gatewayStats
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
      currency: 'LKR',
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
    const driverProfile = await DriverProfile.findOne({ user: driverId });
    
    if (!driverProfile) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }
    
    const salaries = await Payment.find({ 
      driver: driverProfile._id, 
      paymentType: 'salary' 
    })
      .populate('schedule', 'scheduledStartTime scheduledEndTime startLocation destination')
      .populate('user', 'firstName lastName') // Admin who processed payment
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      salaries: salaries,
      count: salaries.length
    });
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
      const driverProfile = await DriverProfile.findOne({ user: driverId });
      if (driverProfile) {
        filter.driver = driverProfile._id;
      }
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

// Get salary invoice by payment ID
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
      .populate('user', 'firstName lastName');

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

// Get user's payments
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .populate({
        path: 'booking',
        select: 'bookingId bookingReference totalAmount numberOfPassengers travelDate departureTime returnDate returnTime seats contactInfo bookingStatus paymentStatus createdAt',
        populate: [
          {
            path: 'route',
            select: 'from to distance duration'
          },
          {
            path: 'bus',
            select: 'busType numberPlate capacity amenities'
          }
        ]
      })
      .populate('maintenance', 'maintenanceId description vehicleId status priority createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id })
      .populate({
        path: 'booking',
        populate: [
          {
            path: 'route',
            select: 'from to distance duration'
          },
          {
            path: 'bus',
            select: 'busType numberPlate capacity amenities'
          }
        ]
      })
      .populate('maintenance')
      .populate('user', 'firstName lastName email phone');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      success: true,
      payment: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all payments with complete booking details (admin)
export const getAllPaymentsWithBookings = async (req, res) => {
  try {
    const { type, status, paymentMethod, startDate, endDate } = req.query;
    
    let filter = {};
    if (type) filter.paymentType = type;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate({
        path: 'booking',
        select: 'bookingId bookingReference totalAmount numberOfPassengers travelDate departureTime returnDate returnTime seats contactInfo bookingStatus paymentStatus createdAt',
        populate: [
          {
            path: 'route',
            select: 'from to distance duration'
          },
          {
            path: 'bus',
            select: 'busType numberPlate capacity amenities'
          }
        ]
      })
      .populate('maintenance', 'maintenanceId description vehicleId status priority createdAt')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    // Get payment statistics
    const stats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      successPayments: payments.filter(p => p.status === 'success').length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      bookingPayments: payments.filter(p => p.paymentType === 'booking').length,
      maintenancePayments: payments.filter(p => p.paymentType === 'maintenance').length,
      salaryPayments: payments.filter(p => p.paymentType === 'salary').length
    };

    res.json({
      success: true,
      payments: payments,
      stats: stats,
      count: payments.length
    });
  } catch (error) {
    console.error('Get all payments with bookings error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { type, status, paymentMethod, startDate, endDate } = req.query;
    
    let filter = {};
    if (type) filter.paymentType = type;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate({
        path: 'booking',
        select: 'bookingId bookingReference totalAmount numberOfPassengers travelDate departureTime returnDate returnTime seats contactInfo bookingStatus paymentStatus createdAt',
        populate: [
          {
            path: 'route',
            select: 'from to distance duration'
          },
          {
            path: 'bus',
            select: 'busType numberPlate capacity amenities'
          }
        ]
      })
      .populate('maintenance', 'maintenanceId description vehicleId status priority createdAt')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Webhook handlers
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ transactionId: paymentIntent.id })
      .populate('booking')
      .populate('maintenance');

    if (payment && payment.status === 'pending') {
      payment.status = 'success';
      payment.gatewayResponse.status = 'succeeded';
      await payment.save();

      if (payment.booking) {
        payment.booking.paymentStatus = 'Paid';
        payment.booking.bookingStatus = 'Confirmed';
        await payment.booking.save();
        await generateInvoice(payment, payment.booking);
      }

      if (payment.maintenance) {
        payment.maintenance.paymentStatus = 'Paid';
        await payment.maintenance.save();
        await generateMaintenanceInvoice(payment, payment.maintenance);
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ transactionId: paymentIntent.id });
    if (payment) {
      payment.status = 'failed';
      payment.gatewayResponse.status = 'failed';
      payment.gatewayResponse.responseMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

const handleChargeRefunded = async (charge) => {
  try {
    const payment = await Payment.findOne({ transactionId: charge.payment_intent });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();

      if (payment.booking) {
        payment.booking.paymentStatus = 'Refunded';
        await payment.booking.save();
      }
      if (payment.maintenance) {
        payment.maintenance.paymentStatus = 'Refunded';
        await payment.maintenance.save();
      }
    }
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
};