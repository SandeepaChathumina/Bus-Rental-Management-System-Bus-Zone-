// src/pages/ViewMyBookings.jsx - Complete Booking Management Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateBookingInvoicePDF, generateSimpleBookingPDF } from '../utils/pdfGenerator';
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
    <div className="bg-slate-800/50 rounded-2xl p-6 shadow-lg border border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:border-blue-500/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {booking.bus?.busType || 'Standard'} Coach
            </h3>
            <p className="text-sm text-blue-400 font-mono font-medium">{booking.bookingId}</p>
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
        <div className="flex items-center text-slate-300">
          <MapPin className="h-4 w-4 mr-2 text-blue-400" />
          <span className="font-medium">{booking.route?.from}</span>
          <span className="mx-2 text-slate-500">→</span>
          <span className="font-medium">{booking.route?.to}</span>
        </div>
      </div>

      {/* Travel Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center text-slate-300">
          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400">Travel Date</p>
            <p className="text-sm font-medium text-white">{formatDate(booking.travelDate)}</p>
          </div>
        </div>

        {booking.returnDate && (
          <div className="flex items-center text-slate-300">
            <Calendar className="h-4 w-4 mr-2 text-green-400" />
            <div>
              <p className="text-xs text-slate-400">Return Date</p>
              <p className="text-sm font-medium text-white">{formatDate(booking.returnDate)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center text-slate-300">
          <Clock className="h-4 w-4 mr-2 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400">Departure</p>
            <p className="text-sm font-medium text-white">{formatTime(booking.departureTime)}</p>
          </div>
        </div>

        <div className="flex items-center text-slate-300">
          <Users className="h-4 w-4 mr-2 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400">Passengers</p>
            <p className="text-sm font-medium text-white">{booking.numberOfPassengers}</p>
          </div>
        </div>
      </div>

      {/* Seats Information */}
      {booking.seats && booking.seats.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">Assigned Seats:</p>
          <div className="flex flex-wrap gap-2">
            {booking.seats.map((seat, index) => (
              <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm font-medium border border-blue-500/30">
                {seat.seatNumber}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="flex items-center justify-between mb-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
          <div>
            <p className="text-sm text-slate-300 font-medium">Payment Status</p>
            <p className={`text-sm font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300 font-medium">Total Amount</p>
          <p className="text-lg font-bold text-white">
            LKR {booking.totalAmount?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </button>

        {booking.paymentStatus === 'Paid' && (
          <button
            onClick={() => onDownloadInvoice(booking)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </button>
        )}

        {canCancelBooking(booking) && (
          <button
            onClick={() => onCancelBooking(booking)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-red-500/25 border border-red-500/20"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Booking
          </button>
        )}

        {!canCancelBooking(booking) && booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && (
          <div className="flex items-center px-4 py-2 bg-gray-600/50 text-gray-400 rounded-lg text-sm font-medium border border-gray-500/30 cursor-not-allowed">
            <X className="h-4 w-4 mr-2" />
            <span className="text-xs">
              {booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Completed' 
                ? 'Cannot cancel' 
                : 'Cancel not available (within 24h)'}
            </span>
          </div>
        )}
      </div>

      {/* Booking Created Date and Cancellation Info */}
      <div className="mt-4 pt-4 border-t border-slate-600/50 space-y-2">
        <p className="text-xs text-slate-400 font-medium">
          Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        
        {canCancelBooking(booking) && (
          <div className="flex items-center text-xs text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Can be cancelled until 24 hours before travel</span>
          </div>
        )}
        
        {!canCancelBooking(booking) && booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && (
          <div className="flex items-center text-xs text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            <span>Cannot cancel (within 24 hours of travel)</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Booking Details Modal Component
const BookingDetailsModal = ({ booking, isOpen, onClose, onDownloadInvoice, onCancelBooking }) => {
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

            {/* Cancel Booking Button in Modal */}
            {(() => {
              const canCancel = () => {
                if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Completed') {
                  return false;
                }
                
                const travelDate = new Date(booking.travelDate);
                const now = new Date();
                const hoursUntilTravel = (travelDate - now) / (1000 * 60 * 60);
                
                return hoursUntilTravel > 24;
              };

              return canCancel() ? (
                <button
                  onClick={() => {
                    onClose();
                    onCancelBooking(booking);
                  }}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Booking
                </button>
              ) : (
                <div className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed opacity-50">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Not Available
                </div>
              );
            })()}
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
    const confirmMessage = `Are you sure you want to cancel this booking?\n\nBooking ID: ${booking.bookingId}\nRoute: ${booking.route?.from} → ${booking.route?.to}\nTravel Date: ${new Date(booking.travelDate).toLocaleDateString()}\n\nThis action cannot be undone and you will receive a refund.`;
    
    if (!window.confirm(confirmMessage)) {
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
        alert('✅ Booking cancelled successfully! You will receive a refund within 3-5 business days.');
      } else {
        alert(`❌ ${response.data.message || 'Failed to cancel booking'}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleDownloadInvoice = async (booking) => {
    try {
      console.log('Starting invoice download for booking:', booking.bookingId);
      
      // Generate simple PDF first (more reliable)
      const fileName = generateSimpleBookingPDF(booking);
      console.log('PDF generated successfully:', fileName);
      
      alert(`✅ Invoice downloaded successfully!\nFile: ${fileName}`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert(`❌ Failed to download invoice: ${error.message}`);
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
      <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Loader className="h-12 w-12 text-blue-400 mx-auto animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Bookings</h2>
          <p className="text-slate-400">Please wait while we fetch your booking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Bookings</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchBookings}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/bus')}
              className="w-full border border-blue-300 text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Book a New Trip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/booking')}
              className="flex items-center px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
              <p className="text-slate-400">Manage and track all your bus bookings</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/booking')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center"
          >
            <Bus className="h-5 w-5 mr-2" />
            Book New Trip
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-300 font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-300 font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-400">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-300 font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-300 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

       {/* Filters */}
<div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700/50 mb-8">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
      <input
        type="text"
        placeholder="Search bookings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-slate-400"
      />
    </div>

    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-700 text-white"
      >
        <option value="">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 pointer-events-none" />
    </div>

    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-700 text-white"
      >
        <option value="createdAt">Sort by Booking Date</option>
        <option value="travelDate">Sort by Travel Date</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 pointer-events-none" />
    </div>

    <button
      onClick={fetchBookings}
      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
    >
      <RefreshCw className="h-5 w-5 mr-2" />
      Refresh
    </button>
  </div>
</div>

{/* Results Count */}
<div className="flex items-center justify-between mb-6">
  <p className="text-slate-400">
    Showing {filteredBookings.length} of {bookings.length} bookings
  </p>
  {searchTerm && (
    <button
      onClick={() => setSearchTerm('')}
      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
    >
      Clear search
      <X className="h-4 w-4 ml-1" />
    </button>
  )}
</div>

{/* Bookings List */}
{filteredBookings.length === 0 ? (
  <div className="text-center py-16 bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700/50">
    {bookings.length === 0 ? (
      <>
        <Receipt className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
        <p className="text-slate-400 mb-6">You haven't made any bookings yet. Start your journey with us!</p>
        <button
          onClick={() => navigate('/bus')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center mx-auto"
        >
          <Bus className="h-5 w-5 mr-2" />
          Book Your First Trip
        </button>
      </>
    ) : (
      <>
        <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Matching Bookings</h3>
        <p className="text-slate-400 mb-6">Try adjusting your search criteria or filters</p>
        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
          }}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
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
  onCancelBooking={handleCancelBooking}
/>

{/* Support Information */}
<div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
  <div className="flex items-start">
    <Phone className="h-6 w-6 text-blue-400 mr-3 mt-1 flex-shrink-0" />
    <div>
      <h4 className="text-lg font-semibold text-white mb-2">Need Help with Your Bookings?</h4>
      <p className="text-slate-300 mb-3">
        Our customer support team is here to assist you with any questions about your bookings, 
        cancellations, or travel plans.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-white">Contact Support</p>
          <p className="text-slate-300">support@buszone.com</p>
          <p className="text-slate-300">+94 704 222 777</p>
        </div>
        <div>
          <p className="font-medium text-white">Support Hours</p>
          <p className="text-slate-300">24/7 Customer Support</p>
          <p className="text-slate-300">Emergency: +94 704 222 888</p>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Footer Note */}
<div className="mt-6 text-center text-sm text-slate-400">
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