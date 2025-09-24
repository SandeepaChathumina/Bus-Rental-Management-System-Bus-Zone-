// src/pages/ViewMyBookings.jsx - Complete Booking Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Bus,
  CreditCard,
  QrCode,
  Download,
  Mail,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  ArrowLeft,
  Loader,
  Phone,
  User,
  Receipt
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Booking Card Component
const BookingCard = ({ booking, onViewDetails, onCancelBooking, onDownloadInvoice }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'refunded':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Completed') {
      return false;
    }
    
    const travelDate = new Date(booking.travelDate);
    const now = new Date();
    const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);
    
    return hoursUntilTravel > 24;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {booking.bus?.busType || 'Standard'} Coach
            </h3>
            <p className="text-sm text-gray-600 font-mono">{booking.bookingId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.bookingStatus)}`}>
            {booking.bookingStatus}
          </span>
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-gray-700">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          <span className="font-medium">{booking.route?.from}</span>
          <span className="mx-2 text-gray-400">→</span>
          <span className="font-medium">{booking.route?.to}</span>
        </div>
      </div>

      {/* Travel Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Travel Date</p>
            <p className="text-sm font-medium">{formatDate(booking.travelDate)}</p>
          </div>
        </div>

        {booking.returnDate && (
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Return Date</p>
              <p className="text-sm font-medium">{formatDate(booking.returnDate)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Departure</p>
            <p className="text-sm font-medium">{formatTime(booking.departureTime)}</p>
          </div>
        </div>

        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Passengers</p>
            <p className="text-sm font-medium">{booking.numberOfPassengers}</p>
          </div>
        </div>
      </div>

      {/* Seats Information */}
      {booking.seats && booking.seats.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Assigned Seats:</p>
          <div className="flex flex-wrap gap-2">
            {booking.seats.map((seat, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                {seat.seatNumber}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <p className={`text-sm font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            LKR {booking.totalAmount?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </button>

        {booking.paymentStatus === 'Paid' && (
          <button
            onClick={() => onDownloadInvoice(booking)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </button>
        )}

        {canCancelBooking(booking) && (
          <button
            onClick={() => onCancelBooking(booking)}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        )}
      </div>

      {/* Booking Created Date */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

// Booking Details Modal Component
const BookingDetailsModal = ({ booking, isOpen, onClose, onDownloadInvoice }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking ID & Status */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Booking Reference
                </h3>
                <p className="text-2xl font-bold text-blue-600 font-mono">
                  {booking.bookingId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Status</p>
                <p className="text-lg font-semibold text-blue-900">
                  {booking.bookingStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Travel Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">{booking.route?.from} → {booking.route?.to}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="font-medium">{formatDate(booking.travelDate)}</p>
                </div>
              </div>

              {booking.returnDate && (
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Return Date</p>
                    <p className="font-medium">{formatDate(booking.returnDate)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Departure Time</p>
                  <p className="font-medium">{booking.departureTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bus Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Bus Information</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <Bus className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bus Type</p>
                    <p className="font-medium">{booking.bus?.busType || 'Standard'} Coach</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Receipt className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Number Plate</p>
                    <p className="font-medium">{booking.bus?.numberPlate || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          {booking.seats && booking.seats.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Passenger Information</h4>
              <div className="space-y-3">
                {booking.seats.map((seat, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{seat.passengerName}</p>
                          <p className="text-sm text-gray-600">
                            {seat.passengerAge} years, {seat.passengerGender}
                          </p>
                          <p className="text-sm text-gray-600">NIC: {seat.passengerNIC}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Seat</p>
                        <p className="text-lg font-bold text-blue-600">{seat.seatNumber}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h4>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <CreditCard className="h-5 w-5 mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-semibold text-green-600">{booking.paymentStatus}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Receipt className="h-5 w-5 mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">
                      LKR {booking.totalAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {booking.qrCode && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Boarding Pass</h4>
              <div className="text-center bg-white border-2 border-gray-200 rounded-xl p-6">
                <QrCode className="h-6 w-6 text-blue-600 mx-auto mb-3" />
                <img 
                  src={booking.qrCode} 
                  alt="QR Code" 
                  className="w-32 h-32 mx-auto mb-3"
                />
                <p className="text-sm text-gray-600">
                  Show this QR code when boarding the bus
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {booking.paymentStatus === 'Paid' && (
              <button
                onClick={() => onDownloadInvoice(booking)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Print Details
            </button>

            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
              <Mail className="h-4 w-4 mr-2" />
              Email Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ViewMyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your bookings');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        setError(response.data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to load bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route?.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route?.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bus?.numberPlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => 
        booking.bookingStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'travelDate':
          return new Date(b.travelDate) - new Date(a.travelDate);
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredBookings(filtered);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BACKEND_URL}/api/bookings/${booking._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Refresh bookings
        fetchBookings();
        alert('Booking cancelled successfully');
      } else {
        alert(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadInvoice = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BACKEND_URL}/api/bookings/${booking._id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // For now, just print the page
        // In a real implementation, you'd generate and download a PDF
        window.print();
        alert('Invoice downloaded successfully');
      } else {
        alert('Invoice not available for this booking');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const getStatsSummary = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
    const pending = bookings.filter(b => b.bookingStatus === 'Pending').length;
    const cancelled = bookings.filter(b => b.bookingStatus === 'Cancelled').length;

    return { total, confirmed, pending, cancelled };
  };

  const stats = getStatsSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Loader className="h-12 w-12 text-blue-600 mx-auto animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Bookings</h2>
          <p className="text-gray-600">Please wait while we fetch your booking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Bookings</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchBookings}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/bus')}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Book a New Trip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">Manage and track all your bus bookings</p>
          </div>
          <button
            onClick={() => navigate('/bus')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <Bus className="h-5 w-5 mr-2" />
            Book New Trip
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

       {/* Filters */}
<div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search bookings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
      >
        <option value="">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>

    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
      >
        <option value="createdAt">Sort by Booking Date</option>
        <option value="travelDate">Sort by Travel Date</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>

    <button
      onClick={fetchBookings}
      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    >
      <RefreshCw className="h-5 w-5 mr-2" />
      Refresh
    </button>
  </div>
</div>

{/* Results Count */}
<div className="flex items-center justify-between mb-6">
  <p className="text-gray-600">
    Showing {filteredBookings.length} of {bookings.length} bookings
  </p>
  {searchTerm && (
    <button
      onClick={() => setSearchTerm('')}
      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
    >
      Clear search
      <X className="h-4 w-4 ml-1" />
    </button>
  )}
</div>

{/* Bookings List */}
{filteredBookings.length === 0 ? (
  <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
    {bookings.length === 0 ? (
      <>
        <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
        <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start your journey with us!</p>
        <button
          onClick={() => navigate('/bus')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          <Bus className="h-5 w-5 mr-2" />
          Book Your First Trip
        </button>
      </>
    ) : (
      <>
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Matching Bookings</h3>
        <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
          }}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Clear All Filters
        </button>
      </>
    )}
  </div>
) : (
  <div className="grid grid-cols-1 gap-6">
    {filteredBookings.map((booking) => (
      <BookingCard
        key={booking._id}
        booking={booking}
        onViewDetails={handleViewDetails}
        onCancelBooking={handleCancelBooking}
        onDownloadInvoice={handleDownloadInvoice}
      />
    ))}
  </div>
)}

{/* Booking Details Modal */}
<BookingDetailsModal
  booking={selectedBooking}
  isOpen={showDetailsModal}
  onClose={() => setShowDetailsModal(false)}
  onDownloadInvoice={handleDownloadInvoice}
/>

{/* Support Information */}
<div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
  <div className="flex items-start">
    <Phone className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
    <div>
      <h4 className="text-lg font-semibold text-blue-900 mb-2">Need Help with Your Bookings?</h4>
      <p className="text-blue-700 mb-3">
        Our customer support team is here to assist you with any questions about your bookings, 
        cancellations, or travel plans.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-blue-900">Contact Support</p>
          <p className="text-blue-700">support@buszone.com</p>
          <p className="text-blue-700">+94 704 222 777</p>
        </div>
        <div>
          <p className="font-medium text-blue-900">Support Hours</p>
          <p className="text-blue-700">24/7 Customer Support</p>
          <p className="text-blue-700">Emergency: +94 704 222 888</p>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Footer Note */}
<div className="mt-6 text-center text-sm text-gray-500">
  <p>
    For any booking modifications or special requests, please contact our support team at least 
    24 hours before your scheduled departure.
  </p>
</div>
</div>
</div>
);
};

export default ViewMyBookings;