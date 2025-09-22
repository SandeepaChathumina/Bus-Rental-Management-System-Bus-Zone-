import Booking from '../models/booking.js';
import Bus from '../models/bus.js';
import Schedule from '../models/schedule.js';
import User from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

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

    // For now, return sample data since we don't have schedules implemented
    const sampleBuses = [
      {
        _id: '1',
        busType: 'Deluxe',
        numberPlate: 'CAB-1234',
        capacity: 45,
        amenities: ['wifi', 'ac', 'refreshments'],
        availableSeats: 35,
        departureTime: '08:00',
        arrivalTime: '12:00',
        fare: 1200
      },
      {
        _id: '2',
        busType: 'Luxury',
        numberPlate: 'CAB-5678',
        capacity: 30,
        amenities: ['wifi', 'ac', 'refreshments', 'entertainment'],
        availableSeats: 25,
        departureTime: '14:00',
        arrivalTime: '18:00',
        fare: 1800
      }
    ];

    res.json({
      success: true,
      availableBuses: sampleBuses,
      count: sampleBuses.length,
      message: 'Buses found'
    });

  } catch (error) {
    console.error('Get available buses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { busId, travelDate, seats, totalAmount, numberOfPassengers, route } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!busId || !travelDate || !seats || !totalAmount || !numberOfPassengers || !route) {
      return res.status(400).json({ 
        message: 'Missing required fields: busId, travelDate, seats, totalAmount, numberOfPassengers, route' 
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
      numberOfPassengers,
      route,
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

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { seats, specialRequests } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
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

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Sample statistics data
    const stats = {
      totalBookings: 150,
      totalRevenue: 125000,
      confirmedBookings: 120,
      cancelledBookings: 15,
      pendingBookings: 15
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

// Calculate fare based on distance and bus type
export const calculateFare = async (req, res) => {
  try {
    const { from, to, busType, passengers } = req.body;
    
    if (!from || !to || !busType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, busType'
      });
    }
    
    // Get coordinates for cities
    const originCoords = await DistanceService.getCityCoordinates(from);
    const destinationCoords = await DistanceService.getCityCoordinates(to);
    
    // Calculate distance
    const { distance, duration } = await DistanceService.calculateDistance(
      originCoords, 
      destinationCoords
    );
    
    // Calculate fare based on bus type and distance
    const fareRates = {
      'standard': 25, // Rs per km
      'deluxe': 35,
      'luxury': 50
    };
    
    const baseFare = fareRates[busType.toLowerCase()] || fareRates.standard;
    const totalFare = Math.round(baseFare * distance);
    
    res.json({
      success: true,
      data: {
        distance: Math.round(distance),
        duration: Math.round(duration),
        fare: totalFare,
        total: totalFare * (passengers || 1)
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