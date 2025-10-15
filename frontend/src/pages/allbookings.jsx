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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Booking Card Component for Admin
const AdminBookingCard = ({ booking, onViewDetails }) => {
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
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-sky-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-100 rounded-lg">
            <Bus className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {booking.bus?.busType || 'Standard'} Coach
            </h3>
            <p className="text-xs text-slate-500">
              by {booking.user?.firstName} {booking.user?.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.bookingStatus)}`}>
            {booking.bookingStatus}
          </span>
          {isUpcomingBooking(booking.travelDate) && (
            <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium">
              Upcoming
            </span>
          )}
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-slate-700">
          <MapPin className="h-4 w-4 mr-2 text-sky-500" />
          <span className="font-medium">{booking.route?.from}</span>
          <span className="mx-2 text-slate-400">→</span>
          <span className="font-medium">{booking.route?.to}</span>
        </div>
        <span className={`text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
          {booking.paymentStatus}
        </span>
      </div>

      {/* Travel Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center text-slate-600">
          <Calendar className="h-4 w-4 mr-2 text-sky-500" />
          <div>
            <p className="text-xs text-slate-500">Travel Date</p>
            <p className="text-sm font-medium">{formatDate(booking.travelDate)}</p>
          </div>
        </div>

        <div className="flex items-center text-slate-600">
          <Clock className="h-4 w-4 mr-2 text-sky-500" />
          <div>
            <p className="text-xs text-slate-500">Departure</p>
            <p className="text-sm font-medium">{booking.departureTime || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center text-slate-600">
          <Users className="h-4 w-4 mr-2 text-sky-500" />
          <div>
            <p className="text-xs text-slate-500">Passengers</p>
            <p className="text-sm font-medium">{booking.numberOfPassengers}</p>
          </div>
        </div>

        <div className="flex items-center text-slate-600">
          <CreditCard className="h-4 w-4 mr-2 text-sky-500" />
          <div>
            <p className="text-xs text-slate-500">Amount</p>
            <p className="text-sm font-medium">LKR {booking.totalAmount?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-500">Bus Plate</p>
          <p className="text-sm font-medium">{booking.bus?.numberPlate || 'N/A'}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-xs text-slate-500">Contact</p>
          <p className="text-sm font-medium">{booking.user?.email || 'N/A'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors shadow-md"
        >
          <Eye className="h-4 w-4 mr-2" />
          Details
        </button>

      </div>

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
          <span>Status: {booking.bookingStatus}</span>
        </div>
      </div>
    </div>
  );
};

// Admin Booking Details Modal
const AdminBookingDetailsModal = ({ booking, isOpen, onClose }) => {
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
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-200 via-blue-200 to-cyan-200 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Booking Management</h2>
            <p className="text-slate-600">Route: {booking.route?.from} → {booking.route?.to}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex space-x-1 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-sky-100 text-sky-700 border-b-2 border-sky-700'
                      : 'text-slate-500 hover:text-slate-700'
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
                <div className="bg-sky-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-sky-900 mb-3">Travel Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sky-700">Route:</span>
                      <span className="font-medium">{booking.route?.from} → {booking.route?.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-700">Travel Date:</span>
                      <span className="font-medium">{formatDate(booking.travelDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-700">Departure Time:</span>
                      <span className="font-medium">{booking.departureTime}</span>
                    </div>
                    {booking.returnDate && (
                      <div className="flex justify-between">
                        <span className="text-sky-700">Return Date:</span>
                        <span className="font-medium">{formatDate(booking.returnDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-emerald-900 mb-3">Bus Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Bus Type:</span>
                      <span className="font-medium">{booking.bus?.busType} Coach</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Number Plate:</span>
                      <span className="font-medium">{booking.bus?.numberPlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Capacity:</span>
                      <span className="font-medium">
                        {booking.bus?.capacity ? `${booking.bus.capacity} seats` : 'N/A seats'}
                        {console.log('Debug - Bus object:', booking.bus, 'Capacity:', booking.bus?.capacity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Status Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Booking Status</p>
                    <p className={`text-lg font-bold ${
                      booking.bookingStatus === 'Confirmed' ? 'text-emerald-600' :
                      booking.bookingStatus === 'Pending' ? 'text-amber-600' :
                      booking.bookingStatus === 'Cancelled' ? 'text-red-600' : 'text-sky-600'
                    }`}>
                      {booking.bookingStatus}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Payment Status</p>
                    <p className={`text-lg font-bold ${
                      booking.paymentStatus === 'Paid' ? 'text-emerald-600' :
                      booking.paymentStatus === 'Pending' ? 'text-amber-600' :
                      booking.paymentStatus === 'Failed' ? 'text-red-600' : 'text-sky-600'
                    }`}>
                      {booking.paymentStatus}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-lg font-bold text-slate-800">LKR {booking.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Passengers</p>
                    <p className="text-lg font-bold text-slate-800">{booking.numberOfPassengers}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passengers' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800">Passenger Details</h4>
              {booking.seats?.map((seat, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-3 text-sky-500" />
                      <div>
                        <p className="font-medium text-slate-800">{seat.passengerName}</p>
                        <p className="text-sm text-slate-600">
                          {seat.passengerAge} years, {seat.passengerGender} • NIC: {seat.passengerNIC}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Seat Number</p>
                      <p className="text-lg font-bold text-sky-600">{seat.seatNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-emerald-900 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-emerald-700">Payment Status</p>
                    <p className="text-xl font-bold text-emerald-600">{booking.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700">Total Amount</p>
                    <p className="text-xl font-bold text-emerald-600">LKR {booking.totalAmount?.toLocaleString()}</p>
                  </div>
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
  
  // Report generation state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);

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
        console.log('📊 Fetched bookings:', response.data.bookings.length);
        if (response.data.bookings.length > 0) {
          console.log('📊 First booking bus data:', response.data.bookings[0].bus);
          console.log('📊 First booking bus capacity:', response.data.bookings[0].bus?.capacity);
        }
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



  const exportCSV = (list) => {
    if (!list || list.length === 0) {
      toast.error("No data to export");
      return;
    }
    
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

    const csvData = list.map(booking => [
      booking.bookingId,
      `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim(),
      booking.user?.email || '',
      `${booking.route?.from || ''} → ${booking.route?.to || ''}`,
      new Date(booking.travelDate).toLocaleDateString(),
      booking.departureTime,
      booking.numberOfPassengers,
      booking.seats?.map(seat => seat.seatNumber).join('; ') || '',
      booking.bus?.busType || '',
      booking.bus?.numberPlate || '',
      booking.totalAmount,
      booking.bookingStatus,
      booking.paymentStatus,
      new Date(booking.createdAt).toLocaleString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${String(field || '')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BusZone_Bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV report generated!");
  };

  const exportPDF = (list) => {
    if (!list || list.length === 0) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table layout
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Add BusZone+ Header (without logo)
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text('BusZone+', margin, margin + 10);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('Premium Bus Rental Management System', margin, margin + 16);
    
    // Report title
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Booking Management Report', pageWidth / 2, margin + 22, { align: 'center' });
    
    // Report metadata
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    const currentDate = new Date();
    doc.text(`Generated on: ${currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${currentDate.toLocaleTimeString()}`, pageWidth / 2, margin + 28, { align: 'center' });
    
    // Statistics section
    const statsY = margin + 35;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Report Summary', margin, statsY);
    
    // Calculate statistics
    const totalBookings = list.length;
    const confirmedBookings = list.filter(b => b.bookingStatus?.toLowerCase() === 'confirmed').length;
    const pendingBookings = list.filter(b => b.bookingStatus?.toLowerCase() === 'pending').length;
    const cancelledBookings = list.filter(b => b.bookingStatus?.toLowerCase() === 'cancelled').length;
    // Simple revenue calculation: add for confirmed bookings, subtract for cancelled bookings
    const totalRevenue = list.reduce((sum, booking) => {
      const amount = booking.totalAmount || 0;
      if (booking.paymentStatus?.toLowerCase() === 'paid') {
        return sum + amount; // Add only paid bookings
      }
      return sum; // Don't add pending, cancelled, or other statuses
    }, 0);
    
    // Statistics boxes - reduced spacing
    const availableWidth = pageWidth - (margin * 2);
    const boxCount = 4;
    const boxSpacing = 6;
    const boxWidth = Math.min(40, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
    const boxHeight = 20;
    let currentX = margin;
    
    // Total Bookings box
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(currentX, statsY + 5, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(totalBookings.toString(), currentX + boxWidth/2, statsY + 14, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Total Bookings', currentX + boxWidth/2, statsY + 19, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Confirmed Bookings box
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(currentX, statsY + 5, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(confirmedBookings.toString(), currentX + boxWidth/2, statsY + 14, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Confirmed', currentX + boxWidth/2, statsY + 19, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Pending Bookings box
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(currentX, statsY + 5, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(pendingBookings.toString(), currentX + boxWidth/2, statsY + 14, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Pending', currentX + boxWidth/2, statsY + 19, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Revenue box
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(currentX, statsY + 5, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`LKR ${totalRevenue.toLocaleString()}`, currentX + boxWidth/2, statsY + 14, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Total Revenue', currentX + boxWidth/2, statsY + 19, { align: 'center' });

    // Add role distribution table to first page with more space
    const roleTableY = statsY + 40;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Booking Status Distribution', margin, roleTableY);
    
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['Confirmed', confirmedBookings.toString(), `${((confirmedBookings/totalBookings)*100).toFixed(1)}%`],
      ['Pending', pendingBookings.toString(), `${((pendingBookings/totalBookings)*100).toFixed(1)}%`],
      ['Cancelled', cancelledBookings.toString(), `${((cancelledBookings/totalBookings)*100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
      startY: roleTableY + 5,
      head: [statusData[0]],
      body: statusData.slice(1),
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto'
    });

    // Add new page for booking details table
    doc.addPage();
    
    // Add header to second page
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text('BusZone+', margin, margin + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('Premium Bus Rental Management System', margin, margin + 16);
    
    // Main booking data table
    const tableStartY = margin + 30;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Booking Details', margin, tableStartY);
    
    // Prepare table data with responsive formatting
    const tableColumns = [
      { header: 'Booking ID', dataKey: 'bookingId', width: 20 },
      { header: 'Customer', dataKey: 'customer', width: 35 },
      { header: 'From', dataKey: 'from', width: 25 },
      { header: 'To', dataKey: 'to', width: 25 },
      { header: 'Travel Date', dataKey: 'travelDate', width: 20 },
      { header: 'Amount', dataKey: 'amount', width: 18 },
      { header: 'Status', dataKey: 'status', width: 18 },
      { header: 'Payment', dataKey: 'payment', width: 18 }
    ];
    
    const tableRows = list.map((booking, index) => ({
      bookingId: booking.bookingId?.substring(0, 8) + '...',
      customer: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim().substring(0, 20),
      from: booking.route?.from?.substring(0, 20) || 'N/A',
      to: booking.route?.to?.substring(0, 20) || 'N/A',
      travelDate: new Date(booking.travelDate).toLocaleDateString('en-GB'),
      amount: `LKR ${booking.totalAmount?.toLocaleString() || '0'}`,
      status: booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1) || 'N/A',
      payment: booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'N/A'
    }));

    autoTable(doc, {
      startY: tableStartY + 8,
      columns: tableColumns,
      body: tableRows,
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        textColor: [30, 30, 30],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        bookingId: { halign: 'center', fontSize: 7, cellWidth: 20 },
        customer: { halign: 'left', fontSize: 8, cellWidth: 35, overflow: 'linebreak' },
        from: { halign: 'left', fontSize: 7, cellWidth: 25, overflow: 'linebreak' },
        to: { halign: 'left', fontSize: 7, cellWidth: 25, overflow: 'linebreak' },
        travelDate: { halign: 'center', fontSize: 7, cellWidth: 20 },
        amount: { halign: 'center', fontSize: 7, cellWidth: 18 },
        status: { halign: 'center', fontSize: 8, cellWidth: 18 },
        payment: { halign: 'center', fontSize: 8, cellWidth: 18 }
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      showHead: 'everyPage',
      didDrawPage: function (data) {
        // Add footer on each page
        const pageNumber = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${currentPage} of ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('BusZone+ Booking Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
    });

    // Add footer with company info
    const finalY = doc.lastAutoTable.finalY || pageHeight - 30;
    if (finalY < pageHeight - 40) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text('This report was generated by BusZone+ Management System', pageWidth / 2, finalY + 20, { align: 'center' });
      doc.text('For support, contact: info@buszoneplus.com | +94 704 222 777', pageWidth / 2, finalY + 25, { align: 'center' });
    }

    // Save the PDF
    const fileName = `BusZone_BookingReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
    doc.save(fileName);
    toast.success("PDF report generated successfully!");
  };

  if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <Loader className="h-12 w-12 text-sky-600 mx-auto animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Loading All Bookings</h2>
        <p className="text-slate-600">Please wait while we fetch booking information...</p>
      </div>
    </div>
  );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">{error}</h2>
          <p className="text-slate-600 mb-6">Unable to load booking data. Please check your permissions.</p>
          <div className="space-y-3">
            <button
              onClick={fetchAllBookings}
              className="w-full bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 pt-8 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-700 mb-2">Booking Management</h1>
            <p className="text-slate-600">Admin panel for managing all customer bookings</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => exportCSV(filteredBookings)}
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors flex items-center shadow-lg"
            >
              <DownloadCloud className="h-5 w-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => exportPDF(filteredBookings)}
              className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center shadow-lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              PDF Report
            </button>
            <button
              onClick={fetchAllBookings}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center shadow-lg"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sky-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sky-700 font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-sky-900">{stats.totalBookings || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-sky-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-800">{stats.confirmedBookings || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-800">{stats.pendingBookings || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-800">{stats.cancelledBookings || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-indigo-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-indigo-800">LKR {(stats.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>


        {/* Advanced Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sky-200/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              />
            </div>

            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white"
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
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm hover:bg-emerald-200 transition-colors"
            >
              Confirmed Only
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm hover:bg-sky-200 transition-colors"
            >
              Paid Only
            </button>
            <button
              onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Today's Travel
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
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
              className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center"
            >
              Clear all filters
              <X className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-200/50">
            <Receipt className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Bookings Found</h3>
            <p className="text-slate-600 mb-6">
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
              />
            ))}
          </div>
        )}

        {/* Admin Booking Details Modal */}
        <AdminBookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />

        {/* Report Export Information */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-sky-200/50">
          <div className="flex items-start">
            <FileText className="h-6 w-6 text-sky-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-sky-900 mb-2">Export Options</h4>
              <p className="text-sky-700 mb-3">
                Generate comprehensive reports for analysis and record-keeping. Export data in different formats
                based on your current filters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-sky-900">CSV Export</p>
                  <p className="text-sky-700">Basic booking data in spreadsheet format</p>
                </div>
                <div>
                  <p className="font-medium text-sky-900">Detailed Report</p>
                  <p className="text-sky-700">Complete data with statistics and breakdowns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Admin Dashboard • Booking Management System • Total Records: {bookings.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllBookings;