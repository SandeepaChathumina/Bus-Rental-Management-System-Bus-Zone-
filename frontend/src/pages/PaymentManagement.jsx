// src/pages/admin/PaymentManagement.jsx - Admin Payment Management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Printer,
  FileText,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Ban,
  RotateCcw,
  Trash2,
  MoreVertical,
  MapPin,
  Bus,
  Wrench,
  Car
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: RotateCcw };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      case 'refunded':
        return { bg: 'bg-purple-100', text: 'text-purple-800', icon: ArrowDownRight };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Ban };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Payment Type Icon Component
const PaymentTypeIcon = ({ type }) => {
  switch (type) {
    case 'booking':
      return <Bus className="h-4 w-4 text-blue-600" />;
    case 'maintenance':
      return <Wrench className="h-4 w-4 text-orange-600" />;
    case 'salary':
      return <Car className="h-4 w-4 text-green-600" />;
    default:
      return <Wallet className="h-4 w-4 text-gray-600" />;
  }
};

// Payment Card Component
const PaymentCard = ({ payment, onViewDetails, onProcessRefund, onSoftDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodDisplay = (method) => {
    return method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <PaymentTypeIcon type={payment.paymentType} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {payment.paymentId}
            </h3>
            <p className="text-sm text-gray-600">
              {payment.user?.firstName} {payment.user?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PaymentStatusBadge status={payment.status} />
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="text-lg font-bold text-gray-900">
            LKR {payment.amount?.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Method</p>
          <p className="text-sm font-medium text-gray-700">
            {getPaymentMethodDisplay(payment.paymentMethod)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Gateway</p>
          <p className="text-sm font-medium text-gray-700 capitalize">
            {payment.paymentGateway}
          </p>
        </div>
      </div>

      {/* Related Entity Info - Enhanced for Successful Payments */}
      {payment.booking && (
        <div className={`rounded-lg p-4 mb-4 ${
          payment.status === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' 
            : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-blue-800">
              <Bus className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Booking: {payment.booking.bookingId}
              </span>
            </div>
            {payment.status === 'success' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                Confirmed
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-blue-600">Travel Date</p>
              <p className="text-sm font-medium text-blue-900">
                {new Date(payment.booking.travelDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Route</p>
              <p className="text-sm font-medium text-blue-900">
                {payment.booking.route?.from} → {payment.booking.route?.to || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Passengers</p>
              <p className="text-sm font-medium text-blue-900">
                {payment.booking.passengers?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Total Amount</p>
              <p className="text-sm font-medium text-blue-900">
                LKR {payment.booking.totalAmount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Enhanced Details for Successful Payments */}
          {payment.status === 'success' && payment.booking.passengers && payment.booking.passengers.length > 0 && (
            <div className="mt-4 pt-3 border-t border-green-200">
              <h5 className="text-sm font-medium text-green-800 mb-2">Passenger Details</h5>
              <div className="space-y-2">
                {payment.booking.passengers.map((passenger, index) => (
                  <div key={index} className="bg-white/60 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {passenger.firstName} {passenger.lastName}
                        </p>
                        <p className="text-xs text-slate-600">
                          Seat: {passenger.seatNumber || 'N/A'} | Age: {passenger.age || 'N/A'} | {passenger.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {payment.maintenance && (
        <div className="bg-orange-50 rounded-lg p-3 mb-4">
          <div className="flex items-center text-orange-800">
            <Wrench className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Maintenance: {payment.maintenance.maintenanceId}
            </span>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            {payment.maintenance.description}
          </p>
        </div>
      )}

      {/* Transaction Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Transaction ID:</span>
            <p className="font-mono text-gray-800 truncate">
              {payment.transactionId}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="text-gray-800">
              {formatDate(payment.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onViewDetails(payment)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          Details
        </button>

        {payment.status === 'success' && (
          <button
            onClick={() => onProcessRefund(payment)}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Refund
          </button>
        )}

        {(payment.status === 'failed' || payment.status === 'cancelled') && (
          <button
            onClick={() => onSoftDelete(payment)}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Archive
          </button>
        )}
      </div>
    </div>
  );
};

// Payment Details Modal
const PaymentDetailsModal = ({ payment, isOpen, onClose, onProcessRefund }) => {
  if (!isOpen || !payment) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-gray-600">{payment.paymentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  LKR {payment.amount?.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <div className="flex items-center justify-center">
                  <PaymentTypeIcon type={payment.paymentType} />
                  <span className="ml-2 font-medium capitalize">{payment.paymentType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {payment.user?.firstName} {payment.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{payment.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {payment.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gateway</p>
                <p className="font-medium text-gray-900 capitalize">
                  {payment.paymentGateway}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="font-medium text-gray-900">{payment.currency}</p>
              </div>
            </div>
            
            {payment.cardDetails && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Card Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Card Number: </span>
                    <span className="font-mono">{payment.cardDetails.cardNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Card Holder: </span>
                    <span>{payment.cardDetails.cardHolder}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900">{payment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm text-gray-900">{payment.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="text-sm text-gray-900">{formatDate(payment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Updated At</p>
                  <p className="text-sm text-gray-900">{formatDate(payment.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Response */}
          {payment.gatewayResponse && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gateway Response</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Gateway ID</p>
                  <p className="font-mono text-gray-900">{payment.gatewayResponse.gatewayId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Response Message</p>
                  <p className="text-gray-900">{payment.gatewayResponse.responseMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Entity Details */}
          {payment.booking && (
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Bus className="h-5 w-5 mr-2" />
                Related Booking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Booking ID</p>
                  <p className="font-medium text-blue-900">{payment.booking.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Travel Date</p>
                  <p className="font-medium text-blue-900">
                    {new Date(payment.booking.travelDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.maintenance && (
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Related Maintenance
              </h3>
              <div>
                <p className="text-sm text-orange-600">Maintenance ID</p>
                <p className="font-medium text-orange-900">{payment.maintenance.maintenanceId}</p>
                <p className="text-sm text-orange-600 mt-2">Description</p>
                <p className="text-orange-900">{payment.maintenance.description}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {payment.status === 'success' && (
              <button
                onClick={() => onProcessRefund(payment)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Process Refund
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Payment Management Component
const PaymentManagement = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  
  // Modal states
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAllPayments();
    fetchPaymentStats();
  }, []);

  useEffect(() => {
    filterAndSortPayments();
  }, [payments, searchTerm, statusFilter, typeFilter, methodFilter, dateFilter, sortBy]);

  const fetchAllPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/payments/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPayments(response.data.payments);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        navigate('/dashboard');
      } else {
        setError(error.response?.data?.message || 'Failed to load payments');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/payments/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const filterAndSortPayments = () => {
    let filtered = [...payments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.maintenance?.maintenanceId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (statusFilter) {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(payment => payment.paymentType === typeFilter);
    }

    if (methodFilter) {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredPayments(filtered);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleProcessRefund = async (payment) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;

    const amount = prompt(`Enter refund amount (max: ${payment.amount}):`);
    if (!amount || isNaN(amount) || parseFloat(amount) > payment.amount) {
      alert('Invalid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/${payment.paymentId}/refund`,
        {
          reason: reason,
          amount: parseFloat(amount)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Refund processed successfully');
        fetchAllPayments();
      } else {
        alert(response.data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(error.response?.data?.message || 'Failed to process refund');
    }
  };

  const handleSoftDelete = async (payment) => {
    if (!confirm(`Are you sure you want to archive payment ${payment.paymentId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${BACKEND_URL}/api/payments/admin/${payment.paymentId}/soft-delete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Payment archived successfully');
        fetchAllPayments();
      } else {
        alert(response.data.message || 'Failed to archive payment');
      }
    } catch (error) {
      console.error('Error archiving payment:', error);
      alert(error.response?.data?.message || 'Failed to archive payment');
    }
  };

  const generatePDFReport = () => {
    // Create comprehensive PDF report using HTML content that can be printed as PDF
    const reportData = {
      title: 'Payment Management Report',
      generatedAt: new Date().toLocaleString(),
      totalPayments: filteredPayments.length,
      totalAmount: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
      statusBreakdown: {
        success: filteredPayments.filter(p => p.status === 'success').length,
        pending: filteredPayments.filter(p => p.status === 'pending').length,
        failed: filteredPayments.filter(p => p.status === 'failed').length,
        refunded: filteredPayments.filter(p => p.status === 'refunded').length,
      },
      typeBreakdown: {
        booking: filteredPayments.filter(p => p.paymentType === 'booking').length,
        maintenance: filteredPayments.filter(p => p.paymentType === 'maintenance').length,
        salary: filteredPayments.filter(p => p.paymentType === 'salary').length,
      },
      payments: filteredPayments.map(payment => ({
        paymentId: payment.paymentId,
        customerName: `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim(),
        email: payment.user?.email || 'N/A',
        amount: payment.amount,
        status: payment.status,
        paymentType: payment.paymentType,
        paymentMethod: payment.paymentMethod,
        gateway: payment.paymentGateway,
        transactionId: payment.transactionId,
        createdAt: new Date(payment.createdAt).toLocaleDateString(),
        relatedEntity: payment.booking ? `Booking: ${payment.booking.bookingId}` :
                     payment.maintenance ? `Maintenance: ${payment.maintenance.maintenanceId}` :
                     payment.schedule ? `Schedule: ${payment.schedule._id?.slice(-6)}` :
                     'N/A'
      }))
    };

    // Create HTML content for PDF generation
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Management Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .report-meta {
            font-size: 14px;
            color: #666;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            background: #F9FAFB;
        }
        .summary-title {
            font-size: 14px;
            font-weight: bold;
            color: #6B7280;
            margin-bottom: 10px;
        }
        .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1F2937;
        }
        .breakdown-section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1F2937;
        }
        .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .breakdown-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #F3F4F6;
            border-radius: 6px;
        }
        .table-container {
            margin-top: 30px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        th, td {
            border: 1px solid #E5E7EB;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #F3F4F6;
            font-weight: bold;
            color: #374151;
        }
        tr:nth-child(even) {
            background-color: #F9FAFB;
        }
        .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
        }
        .status-success { background: #D1FAE5; color: #065F46; }
        .status-pending { background: #FEF3C7; color: #92400E; }
        .status-failed { background: #FEE2E2; color: #991B1B; }
        .status-refunded { background: #E0E7FF; color: #3730A3; }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">BusZone Management System</div>
        <div class="report-title">Payment Management Report</div>
        <div class="report-meta">
            Generated on: ${reportData.generatedAt}<br>
            Report Period: ${filteredPayments.length > 0 ? 
              `${new Date(Math.min(...filteredPayments.map(p => new Date(p.createdAt)))).toLocaleDateString()} - ${new Date(Math.max(...filteredPayments.map(p => new Date(p.createdAt)))).toLocaleDateString()}` 
              : 'No data available'}
        </div>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <div class="summary-title">Total Payments</div>
            <div class="summary-value">${reportData.totalPayments}</div>
        </div>
        <div class="summary-card">
            <div class="summary-title">Total Revenue</div>
            <div class="summary-value">LKR ${reportData.totalAmount.toLocaleString()}</div>
        </div>
        <div class="summary-card">
            <div class="summary-title">Success Rate</div>
            <div class="summary-value">${reportData.totalPayments > 0 ? Math.round((reportData.statusBreakdown.success / reportData.totalPayments) * 100) : 0}%</div>
        </div>
        <div class="summary-card">
            <div class="summary-title">Average Amount</div>
            <div class="summary-value">LKR ${reportData.totalPayments > 0 ? Math.round(reportData.totalAmount / reportData.totalPayments).toLocaleString() : '0'}</div>
        </div>
    </div>

    <div class="breakdown-section">
        <div class="section-title">Payment Status Breakdown</div>
        <div class="breakdown-grid">
            <div class="breakdown-item">
                <span>Successful</span>
                <span class="status status-success">${reportData.statusBreakdown.success}</span>
            </div>
            <div class="breakdown-item">
                <span>Pending</span>
                <span class="status status-pending">${reportData.statusBreakdown.pending}</span>
            </div>
            <div class="breakdown-item">
                <span>Failed</span>
                <span class="status status-failed">${reportData.statusBreakdown.failed}</span>
            </div>
            <div class="breakdown-item">
                <span>Refunded</span>
                <span class="status status-refunded">${reportData.statusBreakdown.refunded}</span>
            </div>
        </div>
    </div>

    <div class="breakdown-section">
        <div class="section-title">Payment Type Breakdown</div>
        <div class="breakdown-grid">
            <div class="breakdown-item">
                <span>Booking Payments</span>
                <span>${reportData.typeBreakdown.booking}</span>
            </div>
            <div class="breakdown-item">
                <span>Maintenance Payments</span>
                <span>${reportData.typeBreakdown.maintenance}</span>
            </div>
            <div class="breakdown-item">
                <span>Salary Payments</span>
                <span>${reportData.typeBreakdown.salary}</span>
            </div>
        </div>
    </div>

    <div class="table-container">
        <div class="section-title">Detailed Payment Records</div>
        <table>
            <thead>
                <tr>
                    <th>Payment ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Amount (LKR)</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Method</th>
                    <th>Gateway</th>
                    <th>Date</th>
                    <th>Related Entity</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.payments.map(payment => `
                    <tr>
                        <td>${payment.paymentId}</td>
                        <td>${payment.customerName}</td>
                        <td>${payment.email}</td>
                        <td>${payment.amount.toLocaleString()}</td>
                        <td><span class="status status-${payment.status}">${payment.status.toUpperCase()}</span></td>
                        <td>${payment.paymentType}</td>
                        <td>${payment.paymentMethod.replace('_', ' ')}</td>
                        <td>${payment.gateway}</td>
                        <td>${payment.createdAt}</td>
                        <td>${payment.relatedEntity}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>This report contains ${reportData.totalPayments} payment records as of ${reportData.generatedAt}</p>
        <p>Generated by BusZone Payment Management System</p>
        <p><strong>Confidential:</strong> This report contains sensitive financial information</p>
    </div>
</body>
</html>
    `;

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close the window after printing (optional)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  };

  const exportCSV = () => {
    const csvHeaders = [
      'Payment ID',
      'Customer Name',
      'Email',
      'Amount (LKR)',
      'Status',
      'Payment Type',
      'Payment Method',
      'Gateway',
      'Transaction ID',
      'Related Entity',
      'Created At'
    ];

    const csvData = filteredPayments.map(payment => [
      payment.paymentId,
      `${payment.user?.firstName} ${payment.user?.lastName}`,
      payment.user?.email,
      payment.amount,
      payment.status,
      payment.paymentType,
      payment.paymentMethod,
      payment.paymentGateway,
      payment.transactionId,
      payment.booking ? `Booking: ${payment.booking.bookingId}` :
      payment.maintenance ? `Maintenance: ${payment.maintenance.maintenanceId}` :
      'N/A',
      new Date(payment.createdAt).toLocaleString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Payment Data</h2>
          <p className="text-gray-600">Please wait while we fetch payment information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Unable to load payment data. Please check your permissions.</p>
          <div className="space-y-3">
            <button
              onClick={fetchAllPayments}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-blue-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Management</h1>
            <p className="text-gray-600">Monitor and manage all payment transactions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generatePDFReport}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              PDF Report
            </button>
            <button
              onClick={exportCSV}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={fetchAllPayments}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  LKR {(stats.total?.totalAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From {stats.total?.totalCount || 0} payments
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-blue-600">
                  {payments.filter(p => p.status === 'success').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completed payments</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed/Refunded</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'failed' || p.status === 'refunded').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Issues to review</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Payment Types
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center">
                  <Bus className="h-4 w-4 mr-2 text-blue-600" />
                  Bookings
                </span>
                <span className="font-medium">{payments.filter(p => p.paymentType === 'booking').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center">
                  <Wrench className="h-4 w-4 mr-2 text-orange-600" />
                  Maintenance
                </span>
                <span className="font-medium">{payments.filter(p => p.paymentType === 'maintenance').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center">
                  <Car className="h-4 w-4 mr-2 text-green-600" />
                  Salaries
                </span>
                <span className="font-medium">{payments.filter(p => p.paymentType === 'salary').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Payment Methods
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Card</span>
                <span className="font-medium">{payments.filter(p => p.paymentMethod === 'card').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bank Transfer</span>
                <span className="font-medium">{payments.filter(p => p.paymentMethod === 'bank_transfer').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash</span>
                <span className="font-medium">{payments.filter(p => p.paymentMethod === 'cash').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Payments</span>
                <span className="font-medium">
                  {payments.filter(p => 
                    new Date(p.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-medium">
                  {payments.filter(p => {
                    const paymentDate = new Date(p.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return paymentDate >= weekAgo;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Amount</span>
                <span className="font-medium">
                  LKR {payments.length > 0 ? 
                    Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length).toLocaleString() : 
                    '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Successful Payments - Highlighted Section */}
        {payments.filter(p => p.status === 'success').length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-lg border border-green-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-800 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Recent Successful Payments
              </h3>
              <button
                onClick={() => setStatusFilter('success')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                View All Success
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments
                .filter(p => p.status === 'success')
                .slice(0, 6)
                .map((payment) => (
                  <div key={payment._id} className="bg-white/80 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Bus className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-sm font-medium text-slate-800">
                          {payment.paymentId}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Success
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-600 mb-1">
                      LKR {payment.amount?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      {payment.user?.firstName} {payment.user?.lastName}
                    </div>
                    {payment.booking && (
                      <div className="text-xs text-slate-500">
                        Booking: {payment.booking.bookingId}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDate(payment.createdAt)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="booking">Booking</option>
                <option value="maintenance">Maintenance</option>
                <option value="salary">Salary</option>
              </select>
            </div>

            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Methods</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
                setMethodFilter('');
                setDateFilter('');
                setSearchTerm('');
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              Success Only
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
            >
              Pending Only
            </button>
            <button
              onClick={() => setTypeFilter('booking')}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              Bookings Only
            </button>
            <button
              onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              Today Only
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredPayments.length} of {payments.length} payments
          </p>
          <div className="text-sm text-gray-500">
            Total Amount: LKR {filteredPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-blue-200">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Payments Found</h3>
            <p className="text-gray-600 mb-6">
              {payments.length === 0 
                ? 'No payments have been processed yet.' 
                : 'No payments match your current filters. Try adjusting the search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment._id}
                payment={payment}
                onViewDetails={handleViewDetails}
                onProcessRefund={handleProcessRefund}
                onSoftDelete={handleSoftDelete}
              />
            ))}
          </div>
        )}

        {/* Payment Details Modal */}
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onProcessRefund={handleProcessRefund}
        />

        {/* Report Information */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-start">
            <Receipt className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Report Generation</h4>
              <p className="text-gray-600 mb-3">
                Generate comprehensive payment reports for financial analysis and audit purposes.
                Reports include payment summaries, status breakdowns, and detailed transaction records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-800">PDF Report Features</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    <li>Executive summary with key metrics</li>
                    <li>Detailed payment breakdowns</li>
                    <li>Status and type analysis</li>
                    <li>Transaction history</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-800">CSV Export Features</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    <li>Raw payment data for analysis</li>
                    <li>Compatible with Excel and other tools</li>
                    <li>Filtered data based on current view</li>
                    <li>Complete transaction details</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Payment Management System • Total Records: {payments.length} • 
            Last Updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;