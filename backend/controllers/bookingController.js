// controllers/bookingController.js - FIXED VERSION
import Booking from '../models/booking.js';
import Bus from '../models/bus.js';
import Schedule from '../models/schedule.js';
import User from '../models/user.js';
import Payment from '../models/payment.js';
import Invoice from '../models/invoice.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { sendBookingConfirmation } from '../utils/emailService.js';

// Check driver availability for booking considering round trips
const checkDriverAvailabilityForBooking = async (driverId, currentBooking) => {
  try {
    // Find all existing bookings assigned to this driver
    const existingBookings = await Booking.find({
      assignedDriver: driverId,
      bookingStatus: { $ne: 'Cancelled' },
      _id: { $ne: currentBooking._id } // Exclude current booking
    });

    const currentBookingStartDate = new Date(currentBooking.travelDate);
    const currentBookingEndDate = currentBooking.returnDate ? new Date(currentBooking.returnDate) : currentBookingStartDate;

    // Check for conflicts with existing bookings
    for (const existingBooking of existingBookings) {
      const existingStartDate = new Date(existingBooking.travelDate);
      const existingEndDate = existingBooking.returnDate ? new Date(existingBooking.returnDate) : existingStartDate;

      // Check if dates overlap
      const hasOverlap = (
        (currentBookingStartDate <= existingStartDate && currentBookingEndDate >= existingStartDate) ||
        (currentBookingStartDate <= existingEndDate && currentBookingEndDate >= existingEndDate) ||
        (currentBookingStartDate >= existingStartDate && currentBookingEndDate <= existingEndDate)
      );

      if (hasOverlap) {
        return false; // Driver is not available
      }
    }

    return true; // Driver is available
  } catch (error) {
    console.error('Error checking driver availability:', error);
    return false; // Default to not available on error
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    console.log('User:', req.user);

    const { 
      busId, 
      travelDate, 
      seats, 
      numberOfPassengers, 
      route,
      contactInfo,
      tripType = 'one-way',
      returnDate,
      departureTime = '08:00'
    } = req.body;
    
    const userId = req.user._id;

    // Validate required fields
    if (!busId || !travelDate || !seats || !numberOfPassengers || !route) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: busId, travelDate, seats, numberOfPassengers, route' 
      });
    }

    // Validate route object
    if (!route.from || !route.to) {
      return res.status(400).json({ 
        success: false,
        message: 'Route must contain both from and to locations' 
      });
    }

    // Check if bus exists and is available
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ 
        success: false,
        message: 'Bus not found' 
      });
    }

    if (!bus.isActive || bus.status !== 'Available') {
      return res.status(400).json({ 
        success: false,
        message: 'Bus is not available for booking' 
      });
    }

    // Validate seats don't exceed bus capacity
    if (seats.length > bus.capacity) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot book more than ${bus.capacity} seats` 
      });
    }

    // Validate seats data structure
    const validSeats = seats.every(seat => 
      seat.seatNumber && seat.passengerName && seat.passengerAge && seat.passengerGender
    );

    if (!validSeats) {
      return res.status(400).json({ 
        success: false,
        message: 'All seat information must include seatNumber, passengerName, passengerAge, and passengerGender' 
      });
    }

    // Check for duplicate seat numbers
    const seatNumbers = seats.map(seat => seat.seatNumber);
    const uniqueSeats = new Set(seatNumbers);
    if (uniqueSeats.size !== seatNumbers.length) {
      return res.status(400).json({ 
        success: false,
        message: 'Duplicate seat numbers are not allowed' 
      });
    }

    // Check if seats are already booked for this date
    const travelDateTime = new Date(travelDate);
    const existingBookings = await Booking.find({
      bus: busId,
      travelDate: {
        $gte: new Date(travelDateTime.setHours(0, 0, 0, 0)),
        $lt: new Date(travelDateTime.setHours(23, 59, 59, 999))
      },
      bookingStatus: { $ne: 'Cancelled' }
    });

    const bookedSeats = existingBookings.flatMap(booking => 
      booking.seats.map(seat => seat.seatNumber)
    );

    const conflictingSeats = seatNumbers.filter(seat => 
      bookedSeats.includes(seat)
    );

    if (conflictingSeats.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Seats ${conflictingSeats.join(', ')} are already booked for this date` 
      });
    }

    // Calculate pricing based on trip type and duration
    const pricing = calculatePricing(bus.pricePerDay, travelDate, returnDate, tripType);
    console.log('Calculated pricing:', pricing);

    // Generate unique booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 3)}`;

    // Prepare booking data
    const bookingData = {
      bookingId,
      user: userId,
      bus: busId,
      travelDate: new Date(travelDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      tripType,
      numberOfDays: pricing.numberOfDays,
      departureTime: departureTime,
      seats: seats.map(seat => ({
        seatNumber: seat.seatNumber,
        passengerName: seat.passengerName,
        passengerNIC: seat.passengerNIC,
        passengerAge: parseInt(seat.passengerAge),
        passengerGender: seat.passengerGender
      })),
      numberOfPassengers: parseInt(numberOfPassengers),
      route: {
        from: route.from,
        to: route.to,
        distance: route.distance || null,
        estimatedDuration: route.estimatedDuration || null
      },
      contactInfo: contactInfo,
      totalAmount: pricing.totalAmount,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending'
    };

    console.log('Final booking data:', bookingData);

    // Create booking
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    
    console.log('Booking saved successfully:', savedBooking);

    // Populate bus and user details for response
    const bookingWithDetails = await Booking.findById(savedBooking._id)
      .populate('bus', 'busId busType numberPlate capacity pricePerDay')
      .populate('user', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully (Pending Payment)',
      booking: bookingWithDetails,
      pricing: pricing
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid booking ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Get booking invoice
export const getBookingInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(id)
      .populate('bus')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this invoice' 
      });
    }

    const payment = await Payment.findOne({ booking: booking._id });
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found for this booking' 
      });
    }

    const invoice = await Invoice.findOne({ payment: payment._id })
      .populate('payment')
      .populate('booking')
      .populate('user');

    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: 'Invoice not found' 
      });
    }

    res.json({
      success: true,
      invoice: invoice
    });

  } catch (error) {
    console.error('Get booking invoice error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Confirm booking and generate QR code
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false,
        message: 'Booking ID is required' 
      });
    }

    const booking = await Booking.findOne({ bookingId, user: userId })
      .populate('bus', 'numberPlate busType');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    if (booking.paymentStatus !== 'Paid') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking must be paid before confirmation' 
      });
    }

    // Generate QR code data
    const qrData = {
      bookingId: booking.bookingId,
      passenger: booking.seats[0]?.passengerName || 'Passenger',
      busNumber: booking.bus.numberPlate,
      busType: booking.bus.busType,
      travelDate: booking.travelDate.toDateString(),
      seats: booking.seats.map(seat => seat.seatNumber).join(', '),
      totalAmount: booking.totalAmount
    };

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));

    // Update booking with QR code
    booking.qrCode = qrCodeImage;
    booking.bookingStatus = 'Confirmed';

    const confirmedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Booking confirmed and QR code generated',
      booking: confirmedBooking,
      qrCode: qrCodeImage
    });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to cancel this booking' 
      });
    }

    // Check if booking can be cancelled (not already cancelled or completed)
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking is already cancelled' 
      });
    }

    // Check if it's too late to cancel (within 24 hours of travel)
    const travelDate = new Date(booking.travelDate);
    const now = new Date();
    const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);

    if (hoursUntilTravel < 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Bookings can only be cancelled at least 24 hours before travel' 
      });
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    
    await booking.save();

    // Update the associated payment status to refunded
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      { 
        status: 'refunded',
        $push: {
          refunds: {
            amount: booking.totalAmount,
            reason: 'Booking cancelled by user',
            processedAt: new Date(),
            refundId: `REF-${Date.now()}`,
            status: 'processed'
          }
        }
      },
      { new: true }
    );

    res.json({ 
      success: true,
      message: 'Booking cancelled successfully',
      booking: booking 
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid booking ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { seats, specialRequests, contactInfo } = req.body;
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Check if booking can be updated
    if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update cancelled or completed bookings'
      });
    }

    if (seats) {
      // Validate seats
      if (seats.length !== booking.numberOfPassengers) {
        return res.status(400).json({
          success: false,
          message: 'Number of seats must match number of passengers'
        });
      }

      const seatNumbers = seats.map(seat => seat.seatNumber);
      const uniqueSeats = new Set(seatNumbers);
      if (uniqueSeats.size !== seatNumbers.length) {
        return res.status(400).json({ 
          success: false,
          message: 'Duplicate seat numbers are not allowed' 
        });
      }

      booking.seats = seats;
    }

    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }

    if (contactInfo) {
      booking.contactInfo = contactInfo;
    }

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;
    
    let filter = {};
    
    // Add status filter if provided
    if (status) {
      filter.bookingStatus = status;
    }
    
    // Add payment status filter if provided
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
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

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('bus', 'busType numberPlate capacity')
      .sort({ createdAt: -1 });

    console.log('🔍 Admin getAllBookings - Found bookings:', bookings.length);
    if (bookings.length > 0) {
      console.log('📊 First booking status:', bookings[0].bookingStatus);
      console.log('📊 First booking payment status:', bookings[0].paymentStatus);
      console.log('📊 First booking bus data:', bookings[0].bus);
      console.log('📊 First booking bus capacity:', bookings[0].bus?.capacity);
    }

    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get total bookings count
    const totalBookings = await Booking.countDocuments();
    
    // Revenue calculation: add paid bookings, subtract only cancelled bookings that were paid
    const revenueStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'Paid'] },
                '$totalAmount',
                0
              ]
            }
          },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    // Get bookings by status
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly revenue trend (only paid bookings)
    const monthlyTrend = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { 
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'Paid'] },
                '$totalAmount',
                0
              ]
            }
          },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const stats = {
      totalBookings,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      confirmedBookings: statusStats.find(s => s._id === 'Confirmed')?.count || 0,
      cancelledBookings: statusStats.find(s => s._id === 'Cancelled')?.count || 0,
      pendingBookings: statusStats.find(s => s._id === 'Pending')?.count || 0,
      monthlyTrend
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Get bookings by date range
export const getBookingsByDateRange = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query = {
      travelDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('bus', 'busType numberPlate')
      .sort({ travelDate: 1 });

    res.json({
      success: true,
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Get bookings by date range error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Verify booking by QR code
export const verifyBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId })
      .populate('user', 'firstName lastName')
      .populate('bus', 'numberPlate busType');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookingStatus !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not confirmed'
      });
    }

    res.json({
      success: true,
      booking: {
        bookingId: booking.bookingId,
        passenger: booking.seats[0]?.passengerName,
        busNumber: booking.bus.numberPlate,
        seats: booking.seats.map(seat => seat.seatNumber),
        travelDate: booking.travelDate
      },
      message: 'Booking verified successfully'
    });
  } catch (error) {
    console.error('Verify booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

export const calculateFare = async (req, res) => {
  try {
    const { from, to, busType, passengers } = req.body;
    
    if (!from || !to || !busType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, busType'
      });
    }
    
    // This is a simplified fare calculation
    // In a real implementation, you might calculate based on distance
    const fareRates = {
      'standard': 2000,
      'deluxe': 3500,
      'luxury': 5000,
      'mini': 1500,
      'double decker': 4000
    };
    
    const baseFare = fareRates[busType.toLowerCase()] || fareRates.standard;
    const totalFare = baseFare * (passengers || 1);
    
    res.json({
      success: true,
      data: {
        baseFare: baseFare,
        total: totalFare
      }
    });
  } catch (error) {
    console.error('Fare calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating fare: ' + error.message
    });
  }
};

// Calculate pricing based on trip type and duration
const calculatePricing = (basePrice, travelDate, returnDate, tripType) => {
  const basePriceNum = parseFloat(basePrice) || 0;
  let numberOfDays = 1;
  
  if (tripType === 'round-trip' && returnDate) {
    const startDate = new Date(travelDate);
    const endDate = new Date(returnDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both days
  }
  
  // Calculate total amount: basePrice + (basePrice * 1/4) for each additional day
  let totalAmount = basePriceNum;
  
  if (numberOfDays > 1) {
    totalAmount = basePriceNum + (basePriceNum * 0.25 * (numberOfDays - 1));
  }
  
  return {
    basePrice: basePriceNum,
    numberOfDays,
    totalAmount: Math.round(totalAmount),
    tripType
  };
};

// Process booking payment 
export const processBookingPayment = async (req, res) => {
  try {
    const { id: bookingId } = req.params; // Use id from params, not bookingId
    const { paymentMethod = 'card', paymentGateway = 'stripe', cardDetails } = req.body;
    const userId = req.user._id;

    console.log('Processing payment for booking:', bookingId);

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('bus')
      .populate('user');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if booking belongs to user
    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to process payment for this booking' 
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking is already paid' 
      });
    }

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY${uuidv4().slice(0, 8).toUpperCase()}`,
      booking: booking._id,
      user: userId,
      amount: booking.totalAmount,
      currency: 'LKR',
      paymentMethod,
      paymentGateway: paymentGateway,
      cardDetails: paymentMethod === 'card' && cardDetails ? {
        cardNumber: `****${cardDetails.cardNumber.slice(-4)}`,
        cardHolder: cardDetails.cardHolder,
        expiryDate: cardDetails.expiryDate
      } : undefined,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      description: `Payment for booking ${booking.bookingId}`,
      paymentType: 'booking',
      status: 'success' // For demo purposes, mark as successful
    });

    // Simulate payment gateway response
    payment.gatewayResponse = {
      gatewayId: `GATEWAY${Date.now()}`,
      status: 'completed',
      responseCode: '200',
      responseMessage: 'Success',
      rawResponse: { demo: true }
    };

    await payment.save();
    console.log('Payment saved:', payment);

    // Update booking status
    console.log('📊 ProcessBookingPayment: Before update - Booking status:', booking.bookingStatus, 'Payment status:', booking.paymentStatus);
    booking.paymentStatus = 'Paid';
    booking.bookingStatus = 'Confirmed';
    console.log('📊 ProcessBookingPayment: After update - Booking status:', booking.bookingStatus, 'Payment status:', booking.paymentStatus);
    
    // Generate QR code
    const qrData = {
      bookingId: booking.bookingId,
      passenger: booking.seats[0]?.passengerName || 'Passenger',
      busNumber: booking.bus.numberPlate,
      busType: booking.bus.busType,
      travelDate: booking.travelDate.toDateString(),
      seats: booking.seats.map(seat => seat.seatNumber).join(', '),
      totalAmount: booking.totalAmount
    };

    console.log('📱 QR Code Data to be encoded:', JSON.stringify(qrData, null, 2));

    try {
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
      booking.qrCode = qrCodeImage;
      console.log('✅ QR code generated successfully');
      console.log('📱 QR code length:', qrCodeImage.length);
      console.log('📱 QR code starts with:', qrCodeImage.substring(0, 50));
      console.log('📱 QR code is data URL:', qrCodeImage.startsWith('data:image/'));
      console.log('📱 QR code contains valid booking data:', {
        bookingId: qrData.bookingId,
        passenger: qrData.passenger,
        busNumber: qrData.busNumber,
        travelDate: qrData.travelDate,
        seats: qrData.seats
      });
    } catch (qrError) {
      console.error('❌ QR code generation error:', qrError);
    }

    await booking.save();
    console.log('💾 ProcessBookingPayment: Booking saved to database with status:', booking.bookingStatus, 'Payment status:', booking.paymentStatus);

    // Generate invoice
    const invoice = await generateInvoice(payment, booking);
    console.log('Invoice generated:', invoice);
    
    // Send booking confirmation email with QR code
    try {
      console.log('📧 ===== ATTEMPTING TO SEND BOOKING EMAIL =====');
      console.log('📧 Full booking object:', JSON.stringify(booking, null, 2));
      console.log('📧 Booking object structure:', {
        _id: booking._id,
        bookingId: booking.bookingId,
        contactInfo: booking.contactInfo,
        hasQRCode: !!booking.qrCode,
        route: booking.route,
        travelDate: booking.travelDate,
        seats: booking.seats?.length || 0
      });
      
      // Check if we have the required data - try multiple possible locations for email
      let emailAddress = booking.contactInfo?.email || booking.user?.email;
      
      if (!emailAddress) {
        console.error('❌ NO EMAIL ADDRESS FOUND IN BOOKING!');
        console.error('❌ contactInfo:', booking.contactInfo);
        console.error('❌ user:', booking.user);
        console.error('❌ Available booking fields:', Object.keys(booking));
        return; // Don't try to send email without email address
      }
      
      console.log('📧 Email address found:', emailAddress);
      
      const emailResult = await sendBookingConfirmation(booking);
      if (emailResult.success) {
        console.log('✅ Booking confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send booking confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending booking confirmation email:', emailError);
      // Don't fail the payment if email fails
    }

    const responseData = {
      success: true,
      message: 'Payment successful',
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId
      },
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        qrCode: booking.qrCode
      },
      invoice: invoice
    };

    res.json(responseData);

  } catch (error) {
    console.error('Booking payment processing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Generate invoice function
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

// Get available buses for a route and date
export const getAvailableBuses = async (req, res) => {
  try {
    const { from, to, travelDate, passengers } = req.query;

    if (!from || !to || !travelDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, travelDate'
      });
    }

    // Convert travelDate to Date object
    const searchDate = new Date(travelDate);
    const dayOfWeek = searchDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find buses that are available and not booked for the specified date
    const availableBuses = await Bus.find({ 
      status: 'Available',
      isActive: true
    });

    // For now, return sample data with actual bus data
    const busesWithAvailability = await Promise.all(
      availableBuses.map(async (bus) => {
        // Check for existing bookings on this date
        const existingBookings = await Booking.find({
          bus: bus._id,
          travelDate: {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            $lt: new Date(searchDate.setHours(23, 59, 59, 999))
          },
          bookingStatus: { $ne: 'Cancelled' }
        });

        const bookedSeats = existingBookings.reduce((total, booking) => 
          total + booking.seats.length, 0
        );

        const availableSeats = bus.capacity - bookedSeats;

        return {
          _id: bus._id,
          busId: bus.busId,
          busType: bus.busType,
          numberPlate: bus.numberPlate,
          capacity: bus.capacity,
          availableSeats: availableSeats,
          pricePerDay: bus.pricePerDay,
          amenities: getBusAmenities(bus.busType),
          vehiclePhoto: bus.vehiclePhoto,
          status: bus.status
        };
      })
    );

    // Filter buses with available seats
    const filteredBuses = busesWithAvailability.filter(bus => 
      bus.availableSeats >= parseInt(passengers || 1)
    );

    res.json({
      success: true,
      availableBuses: filteredBuses,
      count: filteredBuses.length,
      message: 'Buses found successfully'
    });

  } catch (error) {
    console.error('Get available buses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Helper function to get bus amenities
const getBusAmenities = (busType) => {
  const amenitiesMap = {
    'Standard': ['ac', 'charging'],
    'Deluxe': ['wifi', 'ac', 'refreshments', 'charging'],
    'Luxury': ['wifi', 'ac', 'refreshments', 'leather', 'entertainment', 'charging'],
    'Mini': ['ac', 'charging'],
    'Double Decker': ['wifi', 'ac', 'refreshments', 'entertainment', 'charging']
  };
  return amenitiesMap[busType] || ['ac', 'charging'];
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate('user', 'firstName lastName email phone')
      .populate('bus', 'busType numberPlate capacity')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('bus', 'busType numberPlate capacity amenities');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this booking' 
      });
    }

    res.json({
      success: true,
      booking: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid booking ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Assign driver to booking
export const assignDriverToBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { driverId, resetDriverResponse } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId)
      .populate('bus')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Handle driver assignment removal (when driverId is null)
    if (driverId === null || driverId === undefined) {
      booking.assignedDriver = null;
      booking.driverResponse = null;
      booking.driverResponseTime = null;
      
      await booking.save();

      return res.json({
        success: true,
        message: 'Driver assignment removed successfully',
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
          assignedDriver: booking.assignedDriver,
          driverResponse: booking.driverResponse,
          driverResponseTime: booking.driverResponseTime
        }
      });
    }

    // Handle driver assignment (when driverId is provided)
    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required for assignment'
      });
    }

    // Check if driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({
        success: false,
        message: 'Driver not found or invalid driver'
      });
    }

    // Check driver availability for the booking dates
    const isDriverAvailable = await checkDriverAvailabilityForBooking(driverId, booking);
    if (!isDriverAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available for the selected dates'
      });
    }

    // Update booking with assigned driver
    booking.assignedDriver = driverId;
    
    // Reset driver response if flag is set
    if (resetDriverResponse) {
      booking.driverResponse = 'pending';
      booking.driverResponseTime = null;
    }
    
    await booking.save();

    res.json({
      success: true,
      message: 'Driver assigned successfully',
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        assignedDriver: booking.assignedDriver,
        driverResponse: booking.driverResponse,
        driverResponseTime: booking.driverResponseTime
      }
    });

  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Get driver schedules
export const getDriverSchedules = async (req, res) => {
  try {
    const driverId = req.user.id; // Get driver ID from authenticated user

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID not found'
      });
    }

    // Find all bookings assigned to this driver
    const bookings = await Booking.find({ 
      assignedDriver: driverId,
      bookingStatus: { $in: ['Confirmed', 'In Progress', 'Completed'] }
    })
    .populate('user', 'firstName lastName email phone')
    .populate('bus', 'numberPlate busType capacity')
    .sort({ travelDate: 1, departureTime: 1 });

    // Get driver profile for license number
    const DriverProfile = (await import('../models/driverProfile.js')).default;
    const mongoose = (await import('mongoose')).default;
    
    // Convert driverId to ObjectId if it's a string
    const driverObjectId = typeof driverId === 'string' ? new mongoose.Types.ObjectId(driverId) : driverId;
    const driverProfile = await DriverProfile.findOne({ user: driverObjectId });

    console.log(`Found ${bookings.length} bookings for driver ${driverId}`);
    console.log('Driver profile found:', driverProfile ? 'Yes' : 'No');
    console.log('License number:', driverProfile?.licenseNumber);
    console.log('Driver ID type:', typeof driverId);
    console.log('Driver ID value:', driverId);
    console.log('Driver ObjectId:', driverObjectId);
    
    if (!driverProfile) {
      console.log('No driver profile found for user:', driverId);
      // Try to find any driver profiles to see if they exist
      const allProfiles = await DriverProfile.find({}).limit(3);
      console.log('Total driver profiles in database:', allProfiles.length);
      if (allProfiles.length > 0) {
        console.log('Sample profile user ID:', allProfiles[0].user);
      }
    }

    // Transform data to match driver dashboard format
    const schedules = bookings.map(booking => {
      // Debug logging
      console.log('Processing booking:', {
        id: booking._id,
        travelDate: booking.travelDate,
        departureTime: booking.departureTime,
        arrivalTime: booking.arrivalTime,
        bookingStatus: booking.bookingStatus,
        departureTimeType: typeof booking.departureTime,
        arrivalTimeType: typeof booking.arrivalTime
      });

      let status = 'Scheduled';
      
      // Determine status based on booking status and times
      if (booking.bookingStatus === 'Completed') {
        status = 'Completed';
      } else if (booking.bookingStatus === 'In Progress') {
        status = 'In Progress';
      } else {
        try {
          const now = new Date();
          const travelDate = new Date(booking.travelDate);
          const departureTime = new Date(`${booking.travelDate}T${booking.departureTime}`);
          
          if (now > departureTime) {
            status = 'In Progress';
          }
        } catch (error) {
          console.error('Error parsing dates for booking:', booking._id, error);
          // Keep status as 'Scheduled' if date parsing fails
        }
      }

      // Safely create date strings with error handling
      let scheduledStartTime, scheduledEndTime;
      
      // Helper function to create valid date
      const createValidDate = (dateStr, timeStr) => {
        try {
          // Handle different time formats
          let formattedTime = timeStr;
          if (timeStr && !timeStr.includes(':')) {
            // If time is in HHMM format, convert to HH:MM
            if (timeStr.length === 4) {
              formattedTime = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
            }
          }
          
          // Ensure we have a valid time format
          if (!formattedTime || formattedTime === 'undefined') {
            formattedTime = '00:00';
          }
          
          const dateTimeStr = `${dateStr}T${formattedTime}:00`;
          const date = new Date(dateTimeStr);
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.error('Invalid date created from:', dateStr, timeStr, '->', dateTimeStr);
            throw new Error('Invalid date');
          }
          
          return date.toISOString();
        } catch (error) {
          console.error('Error creating date from:', dateStr, timeStr, error);
          return new Date().toISOString();
        }
      };

      scheduledStartTime = createValidDate(booking.travelDate, booking.departureTime);
      scheduledEndTime = createValidDate(booking.travelDate, booking.arrivalTime);

      return {
        _id: booking._id,
        bookingId: {
          bookingId: booking.bookingId,
          route: `${booking.route?.from || 'N/A'} - ${booking.route?.to || 'N/A'}`,
          passengers: booking.numberOfPassengers || 0
        },
        busId: {
          busId: booking.bus?._id || 'N/A',
          numberPlate: booking.bus?.numberPlate || 'N/A',
          busType: booking.bus?.busType || 'N/A'
        },
        driverId: {
          firstName: req.user?.firstName || 'N/A',
          lastName: req.user?.lastName || 'N/A',
          licenseNumber: driverProfile?.licenseNumber || `No Profile (ID: ${driverId})`
        },
        startLocation: booking.route?.from || 'N/A',
        destination: booking.route?.to || 'N/A',
        scheduledStartTime: scheduledStartTime,
        scheduledEndTime: scheduledEndTime,
        status: status,
        actualStartTime: booking.actualStartTime || null,
        actualEndTime: booking.actualEndTime || null,
        travelDate: booking.travelDate,
        returnDate: booking.returnDate || null,
        tripType: booking.tripType || 'one-way',
        departureTime: booking.departureTime,
        arrivalTime: booking.arrivalTime,
        route: booking.route,
        driverResponse: booking.driverResponse || 'pending',
        driverResponseTime: booking.driverResponseTime || null
      };
    });

    res.json({
      success: true,
      schedules: schedules,
      message: schedules.length === 0 ? 'No schedules found for this driver' : `Found ${schedules.length} schedules`
    });

  } catch (error) {
    console.error('Get driver schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Update schedule status (start trip, complete trip, etc.)
export const updateScheduleStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action } = req.body; // 'start', 'complete', 'update'
    const driverId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      assignedDriver: driverId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you'
      });
    }

    const now = new Date();

    switch (action) {
      case 'start':
        booking.actualStartTime = now;
        booking.bookingStatus = 'In Progress';
        break;
      case 'complete':
        booking.actualEndTime = now;
        booking.bookingStatus = 'Completed';
        break;
      case 'end':
        booking.actualEndTime = now;
        booking.bookingStatus = 'Ended';
        break;
      case 'update':
        // For future use - could update progress, location, etc.
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await booking.save();

    res.json({
      success: true,
      message: `Trip ${action}ed successfully`,
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.bookingStatus,
        actualStartTime: booking.actualStartTime,
        actualEndTime: booking.actualEndTime
      }
    });

  } catch (error) {
    console.error('Update schedule status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Driver accept/decline booking assignment
export const driverRespondToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const driverId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      assignedDriver: driverId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you'
      });
    }

    if (action === 'accept') {
      booking.driverResponse = 'accepted';
      booking.driverResponseTime = new Date();
    } else if (action === 'decline') {
      booking.driverResponse = 'declined';
      booking.driverResponseTime = new Date();
      // Optionally unassign the driver
      booking.assignedDriver = null;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "accept" or "decline"'
      });
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking ${action}ed successfully`,
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        driverResponse: booking.driverResponse,
        driverResponseTime: booking.driverResponseTime
      }
    });

  } catch (error) {
    console.error('Driver respond to booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};