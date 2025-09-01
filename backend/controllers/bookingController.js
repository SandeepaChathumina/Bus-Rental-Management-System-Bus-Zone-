import Booking from '../models/booking.js';
import Bus from '../models/bus.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { busId, travelDate, seats, totalAmount } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!busId || !travelDate || !seats || !totalAmount) {
      return res.status(400).json({ 
        message: 'Missing required fields: busId, travelDate, seats, totalAmount' 
      });
    }

    // Check if bus exists and is available
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (!bus.isActive) {
      return res.status(400).json({ message: 'Bus is not active' });
    }

    if (bus.status !== 'Available') {
      return res.status(400).json({ message: 'Bus is not available for booking' });
    }

    // Validate seats don't exceed bus capacity
    if (seats.length > bus.capacity) {
      return res.status(400).json({ 
        message: `Cannot book more than ${bus.capacity} seats` 
      });
    }

    // Check for duplicate seat numbers
    const seatNumbers = seats.map(seat => seat.seatNumber);
    const uniqueSeats = new Set(seatNumbers);
    if (uniqueSeats.size !== seatNumbers.length) {
      return res.status(400).json({ 
        message: 'Duplicate seat numbers are not allowed' 
      });
    }

    // Generate unique booking ID
    const bookingId = `BK${uuidv4().slice(0, 8).toUpperCase()}`;

    const booking = new Booking({
      bookingId,
      user: userId,
      bus: busId,
      travelDate,
      seats,
      totalAmount,
      paymentStatus: 'Pending'
    });

    const savedBooking = await booking.save();
    
    // Populate bus details for response
    const bookingWithBus = await Booking.findById(savedBooking._id)
      .populate('bus', 'busId busType numberPlate capacity status');
    
    res.status(201).json({
      message: 'Booking created successfully (Pending Payment)',
      booking: bookingWithBus
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    
    // Handle MongoDB CastError (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid bus ID format' 
      });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Confirm booking and generate QR code (call this after payment success)
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId).populate('bus', 'numberPlate busType');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
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

    // Update booking with payment success and QR code
    booking.paymentStatus = 'Paid';
    booking.bookingStatus = 'Confirmed';
    booking.qrCode = qrCodeImage;

    const confirmedBooking = await booking.save();

    res.json({
      message: 'Booking confirmed and QR code generated',
      booking: confirmedBooking,
      qrCode: qrCodeImage
    });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate('bus', 'busType numberPlate capacity')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .populate('bus', 'busType numberPlate')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('bus', 'busType numberPlate capacity');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking can be cancelled (not already cancelled or completed)
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'Cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};