// src/pages/admin/AllBookings.jsx - Complete Admin Booking Management Page
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
  Receipt,
  Shield,
  BarChart3,
  FileText,
  Send,
  Edit3,
  MoreVertical,
  TrendingUp,
  DownloadCloud,
  Printer
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Booking Card Component for Admin
const AdminBookingCard = ({ booking, onViewDetails, onUpdateStatus, onSendNotification, onDownloadReport }) => {
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
        return 'text-green-600 bg-green-50 px-2 py-1 rounded';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded';
      case 'failed':
        return 'text-red-600 bg-red-50 px-2 py-1 rounded';
      case 'refunded':
        return 'text-blue-600 bg-blue-50 px-2 py-1 rounded';
      default:
        return 'text-gray-600 bg-gray-50 px-2 py-1 rounded';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcomingBooking = (travelDate) => {
    const today = new Date();
    const travel = new Date(travelDate);
    return travel >= today;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
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
            <p className="text-xs text-gray-500">
              by {booking.user?.firstName} {booking.user?.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.bookingStatus)}`}>
            {booking.bookingStatus}
          </span>
          {isUpcomingBooking(booking.travelDate) && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Upcoming
            </span>
          )}
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-700">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          <span className="font-medium">{booking.route?.from}</span>
          <span className="mx-2 text-gray-400">→</span>
          <span className="font-medium">{booking.route?.to}</span>
        </div>
        <span className={`text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
          {booking.paymentStatus}
        </span>
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

        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Departure</p>
            <p className="text-sm font-medium">{booking.departureTime || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Passengers</p>
            <p className="text-sm font-medium">{booking.numberOfPassengers}</p>
          </div>
        </div>

        <div className="flex items-center text-gray-600">
          <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-medium">LKR {booking.totalAmount?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Bus Plate</p>
          <p className="text-sm font-medium">{booking.bus?.numberPlate || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Contact</p>
          <p className="text-sm font-medium">{booking.user?.email || 'N/A'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          Details
        </button>

        <button
          onClick={() => onUpdateStatus(booking)}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Update
        </button>

        <button
          onClick={() => onSendNotification(booking)}
          className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Send className="h-4 w-4 mr-2" />
          Notify
        </button>

        <button
          onClick={() => onDownloadReport(booking)}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <DownloadCloud className="h-4 w-4 mr-2" />
          Report
        </button>
      </div>

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
          <span>ID: {booking._id?.slice(-8) || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

// Admin Booking Details Modal
const AdminBookingDetailsModal = ({ booking, isOpen, onClose, onUpdateStatus, onSendNotification }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'details', label: 'Booking Details', icon: FileText },
    { id: 'passengers', label: 'Passengers', icon: Users },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'actions', label: 'Admin Actions', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
            <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Travel Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Route:</span>
                      <span className="font-medium">{booking.route?.from} → {booking.route?.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Travel Date:</span>
                      <span className="font-medium">{formatDate(booking.travelDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Departure Time:</span>
                      <span className="font-medium">{booking.departureTime}</span>
                    </div>
                    {booking.returnDate && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Return Date:</span>
                        <span className="font-medium">{formatDate(booking.returnDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-green-900 mb-3">Bus Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">Bus Type:</span>
                      <span className="font-medium">{booking.bus?.busType} Coach</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Number Plate:</span>
                      <span className="font-medium">{booking.bus?.numberPlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Capacity:</span>
                      <span className="font-medium">{booking.bus?.capacity} seats</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Status Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Booking Status</p>
                    <p className={`text-lg font-bold ${
                      booking.bookingStatus === 'Confirmed' ? 'text-green-600' :
                      booking.bookingStatus === 'Pending' ? 'text-yellow-600' :
                      booking.bookingStatus === 'Cancelled' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {booking.bookingStatus}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`text-lg font-bold ${
                      booking.paymentStatus === 'Paid' ? 'text-green-600' :
                      booking.paymentStatus === 'Pending' ? 'text-yellow-600' :
                      booking.paymentStatus === 'Failed' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {booking.paymentStatus}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">LKR {booking.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Passengers</p>
                    <p className="text-lg font-bold text-gray-900">{booking.numberOfPassengers}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passengers' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Passenger Details</h4>
              {booking.seats?.map((seat, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{seat.passengerName}</p>
                        <p className="text-sm text-gray-600">
                          {seat.passengerAge} years, {seat.passengerGender} • NIC: {seat.passengerNIC}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Seat Number</p>
                      <p className="text-lg font-bold text-blue-600">{seat.seatNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Payment Status</p>
                    <p className="text-xl font-bold text-green-600">{booking.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">LKR {booking.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-red-900 mb-3">Admin Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => onUpdateStatus(booking)}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-5 w-5 mr-2" />
                    Update Status
                  </button>
                  <button
                    onClick={() => onSendNotification(booking)}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Notification
                  </button>
                </div>
              </div>

              {/* Quick Status Update */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Status Update</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Confirmed', 'Pending', 'Cancelled', 'Completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(booking, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        booking.bookingStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const AllBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAllBookings();
    fetchBookingStats();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, paymentFilter, dateFilter, sortBy]);

  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/bookings/admin/all`, {
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
        setError('Admin access required');
        navigate('/dashboard');
      } else if (error.response?.status === 403) {
        setError('Insufficient permissions');
        navigate('/dashboard');
      } else {
        setError(error.response?.data?.message || 'Failed to load bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/bookings/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        booking.bus?.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => 
        booking.bookingStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply payment filter
    if (paymentFilter) {
      filtered = filtered.filter(booking => 
        booking.paymentStatus.toLowerCase() === paymentFilter.toLowerCase()
      );
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.travelDate);
        return bookingDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'travelDate':
          return new Date(b.travelDate) - new Date(a.travelDate);
        case 'amount':
          return b.totalAmount - a.totalAmount;
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

  const handleUpdateStatus = async (booking, newStatus) => {
    if (!newStatus) {
      newStatus = prompt('Enter new status (Confirmed, Pending, Cancelled, Completed):');
      if (!newStatus) return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BACKEND_URL}/api/bookings/${booking._id}`,
        { bookingStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        fetchAllBookings();
        alert(`Booking status updated to ${newStatus}`);
      } else {
        alert(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSendNotification = (booking) => {
    const message = prompt('Enter notification message:');
    if (message) {
      // In a real implementation, this would send an email/SMS
      alert(`Notification sent to ${booking.user?.email}: ${message}`);
    }
  };

  const handleDownloadReport = (booking) => {
    // Generate individual booking report
    const reportData = {
      bookingId: booking.bookingId,
      customer: `${booking.user?.firstName} ${booking.user?.lastName}`,
      email: booking.user?.email,
      route: `${booking.route?.from} → ${booking.route?.to}`,
      travelDate: new Date(booking.travelDate).toLocaleDateString(),
      departureTime: booking.departureTime,
      passengers: booking.numberOfPassengers,
      seats: booking.seats?.map(seat => seat.seatNumber).join(', '),
      busType: booking.bus?.busType,
      numberPlate: booking.bus?.numberPlate,
      totalAmount: booking.totalAmount,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      createdAt: new Date(booking.createdAt).toLocaleString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-report-${booking.bookingId}.json`;
    link.click();
  };

  const exportAllBookings = () => {
    // Generate CSV export
    const csvHeaders = [
      'Booking ID',
      'Customer Name',
      'Email',
      'Route',
      'Travel Date',
      'Departure Time',
      'Passengers',
      'Seats',
      'Bus Type',
      'Number Plate',
      'Amount (LKR)',
      'Booking Status',
      'Payment Status',
      'Created At'
    ];

    const csvData = filteredBookings.map(booking => [
      booking.bookingId,
      `${booking.user?.firstName} ${booking.user?.lastName}`,
      booking.user?.email,
      `${booking.route?.from} → ${booking.route?.to}`,
      new Date(booking.travelDate).toLocaleDateString(),
      booking.departureTime,
      booking.numberOfPassengers,
      booking.seats?.map(seat => seat.seatNumber).join('; '),
      booking.bus?.busType,
      booking.bus?.numberPlate,
      booking.totalAmount,
      booking.bookingStatus,
      booking.paymentStatus,
      new Date(booking.createdAt).toLocaleString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportDetailedReport = () => {
    // Generate detailed JSON report
    const detailedReport = {
      exportDate: new Date().toISOString(),
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
      statusBreakdown: {
        confirmed: filteredBookings.filter(b => b.bookingStatus === 'Confirmed').length,
        pending: filteredBookings.filter(b => b.bookingStatus === 'Pending').length,
        cancelled: filteredBookings.filter(b => b.bookingStatus === 'Cancelled').length,
        completed: filteredBookings.filter(b => b.bookingStatus === 'Completed').length,
      },
      paymentBreakdown: {
        paid: filteredBookings.filter(b => b.paymentStatus === 'Paid').length,
        pending: filteredBookings.filter(b => b.paymentStatus === 'Pending').length,
        failed: filteredBookings.filter(b => b.paymentStatus === 'Failed').length,
        refunded: filteredBookings.filter(b => b.paymentStatus === 'Refunded').length,
      },
      bookings: filteredBookings.map(booking => ({
        bookingId: booking.bookingId,
        customer: {
          name: `${booking.user?.firstName} ${booking.user?.lastName}`,
          email: booking.user?.email
        },
        route: {
          from: booking.route?.from,
          to: booking.route?.to
        },
        travelDate: booking.travelDate,
        departureTime: booking.departureTime,
        passengers: booking.numberOfPassengers,
        seats: booking.seats?.map(seat => ({
          seatNumber: seat.seatNumber,
          passengerName: seat.passengerName,
          passengerNIC: seat.passengerNIC
        })),
        bus: {
          type: booking.bus?.busType,
          numberPlate: booking.bus?.numberPlate
        },
        amount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      }))
    };

    const dataStr = JSON.stringify(detailedReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailed-bookings-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Loader className="h-12 w-12 text-blue-600 mx-auto animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading All Bookings</h2>
          <p className="text-gray-600">Please wait while we fetch booking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Unable to load booking data. Please check your permissions.</p>
          <div className="space-y-3">
            <button
              onClick={fetchAllBookings}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Management</h1>
            <p className="text-gray-600">Admin panel for managing all customer bookings</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportAllBookings}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
            >
              <DownloadCloud className="h-5 w-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportDetailedReport}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              Detailed Report
            </button>
            <button
              onClick={fetchAllBookings}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">LKR {(stats.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="createdAt">Sort by Date Created</option>
                <option value="travelDate">Sort by Travel Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter('');
                setPaymentFilter('');
                setDateFilter('');
                setSearchTerm('');
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              Confirmed Only
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              Paid Only
            </button>
            <button
              onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              Today's Travel
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          {(searchTerm || statusFilter || paymentFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
                setDateFilter('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              Clear all filters
              <X className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              {bookings.length === 0 
                ? 'No bookings have been made yet.' 
                : 'No bookings match your current filters. Try adjusting the search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <AdminBookingCard
                key={booking._id}
                booking={booking}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
                onSendNotification={handleSendNotification}
                onDownloadReport={handleDownloadReport}
              />
            ))}
          </div>
        )}

        {/* Admin Booking Details Modal */}
        <AdminBookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={handleUpdateStatus}
          onSendNotification={handleSendNotification}
        />

        {/* Report Export Information */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start">
            <FileText className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Export Options</h4>
              <p className="text-blue-700 mb-3">
                Generate comprehensive reports for analysis and record-keeping. Export data in different formats
                based on your current filters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-900">CSV Export</p>
                  <p className="text-blue-700">Basic booking data in spreadsheet format</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Detailed Report</p>
                  <p className="text-blue-700">Complete data with statistics and breakdowns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Admin Dashboard • Booking Management System • Total Records: {bookings.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllBookings;