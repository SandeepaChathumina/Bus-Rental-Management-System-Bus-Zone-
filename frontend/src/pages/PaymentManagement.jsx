// src/pages/admin/PaymentManagement.jsx - Admin Payment Management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Car,
  X
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Export Modal Component
const ExportModal = ({ 
  show, 
  onClose, 
  format, 
  setFormat, 
  itemCount, 
  onExport, 
  loading 
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white border border-blue-200 rounded-xl p-6 z-60 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Export Payment Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setFormat("csv")}
            className={`p-3 border-2 rounded-lg ${
              format === "csv"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-blue-300 text-gray-600 hover:bg-blue-50"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-1" /> CSV
          </button>
          <button
            onClick={() => setFormat("pdf")}
            className={`p-3 border-2 rounded-lg ${
              format === "pdf"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-blue-300 text-gray-600 hover:bg-blue-50"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-1" /> PDF
          </button>
        </div>
        <div className="bg-blue-50 rounded p-2 text-sm text-gray-700 mb-4">
          <Calendar className="inline w-4 h-4 mr-1" /> Report will include {itemCount} payments
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={onExport}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md"
          >
            {loading ? "Generating..." : "Export Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
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

      {/* Related Entity Info */}
      {payment.booking && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center text-blue-800">
            <Bus className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              Booking Payment
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Travel Date: {new Date(payment.booking.travelDate).toLocaleDateString()}
          </p>
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

        {(payment.status === 'cancelled' || payment.status === 'refunded') && (
          <button
            onClick={() => onProcessRefund(payment)}
            disabled={payment.status === 'refunded' && payment.refunds && payment.refunds.length > 0}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              payment.status === 'refunded' && payment.refunds && payment.refunds.length > 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <ArrowDownRight className="h-4 w-4 mr-2" />
            {payment.status === 'refunded' && payment.refunds && payment.refunds.length > 0 ? 'Refunded' : 'Refund'}
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
                  <p className="text-sm text-blue-600">Travel Date</p>
                  <p className="font-medium text-blue-900">
                    {new Date(payment.booking.travelDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Payment Type</p>
                  <p className="font-medium text-blue-900">Booking Payment</p>
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
            {(payment.status === 'cancelled' || payment.status === 'refunded') && (
              <button
                onClick={() => onProcessRefund(payment)}
                disabled={payment.status === 'refunded' && payment.refunds && payment.refunds.length > 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  payment.status === 'refunded' && payment.refunds && payment.refunds.length > 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <ArrowDownRight className="h-4 w-4 mr-2" />
                {payment.status === 'refunded' && payment.refunds && payment.refunds.length > 0 ? 'Already Refunded' : 'Process Refund'}
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

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);

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
    // Show payment details for admin review
    const paymentDetails = `
Payment Details:
- Payment ID: ${payment.paymentId}
- Amount: LKR ${payment.amount.toLocaleString()}
- Payment Method: ${payment.paymentMethod}
- Payment Gateway: ${payment.paymentGateway}
- Transaction ID: ${payment.transactionId}

Customer: ${payment.user?.firstName} ${payment.user?.lastName}
Email: ${payment.user?.email}
    `;

    if (!confirm(`${paymentDetails}\n\nDo you want to process a refund for this payment?`)) {
      return;
    }

    const reason = prompt('Enter refund reason:');
    if (!reason) return;

    const amount = prompt(`Enter refund amount (max: LKR ${payment.amount.toLocaleString()}):`);
    if (!amount || isNaN(amount) || parseFloat(amount) > payment.amount) {
      alert('Invalid amount');
      return;
    }

    // Show final confirmation with refund details
    const refundDetails = `
Refund Details:
- Refund Amount: LKR ${parseFloat(amount).toLocaleString()}
- Reason: ${reason}
- Payment Gateway: ${payment.paymentGateway}
- Transaction ID: ${payment.transactionId}

${payment.paymentGateway === 'stripe' 
  ? 'This will process an automatic refund through Stripe to the customer\'s original payment method.'
  : 'This will mark the payment for manual refund processing. Please process the refund through your bank/payment system.'
}

Are you sure you want to proceed?
    `;

    if (!confirm(refundDetails)) {
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
        const refundInfo = response.data.refund;
        const isStripeRefund = refundInfo?.gateway === 'stripe';
        const processingNote = refundInfo?.processingNote || '';
        
        alert(`Refund processed successfully!\n\nRefund ID: ${refundInfo?.refundId || 'N/A'}\nAmount: LKR ${parseFloat(amount).toLocaleString()}\nGateway: ${refundInfo?.gateway || payment.paymentGateway}\n\n${isStripeRefund 
          ? 'The refund has been automatically processed to the customer\'s payment method.' 
          : `Manual refund processed. ${processingNote ? `\nNote: ${processingNote}` : ''}\nPlease process the refund through your bank/payment system.`
        }`);
        fetchAllPayments();
        fetchPaymentStats();
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

  // Enhanced PDF Report Generation
  const generatePDFReport = () => {
    if (!filteredPayments || filteredPayments.length === 0) {
      alert("No payment data to export");
      return;
    }

    setExporting(true);

    try {
      console.log('Starting PDF generation...', filteredPayments.length, 'payments');
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table layout
    
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Add BusZone+ Header
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
      doc.setFontSize(20);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Management Report', pageWidth / 2, margin + 25, { align: 'center' });
      
      // Report metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      const currentDate = new Date();
      doc.text(`Generated on: ${currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} at ${currentDate.toLocaleTimeString()}`, pageWidth / 2, margin + 32, { align: 'center' });
      
      // Statistics section
      const statsY = margin + 40;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Report Summary', margin, statsY);
      
      // Calculate statistics
      const totalPayments = filteredPayments.length;
      const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const successPayments = filteredPayments.filter(p => p.status === 'success').length;
      const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
      const failedPayments = filteredPayments.filter(p => p.status === 'failed').length;
      const refundedPayments = filteredPayments.filter(p => p.status === 'refunded').length;
      const bookingPayments = filteredPayments.filter(p => p.paymentType === 'booking').length;
      const maintenancePayments = filteredPayments.filter(p => p.paymentType === 'maintenance').length;
      const salaryPayments = filteredPayments.filter(p => p.paymentType === 'salary').length;
      
      // Statistics boxes - responsive layout
      const availableWidth = pageWidth - (margin * 2);
      const boxCount = 4;
      const boxSpacing = 6;
      const boxWidth = Math.min(35, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
      const boxHeight = 25;
      let currentX = margin;
      
      // Total Payments box - Blue theme
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total Payments', currentX + 2, statsY + 15);
      doc.setFontSize(16);
      doc.text(totalPayments.toString(), currentX + 2, statsY + 22);
      currentX += boxWidth + boxSpacing;
      
      // Total Revenue box - Green theme
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total Revenue', currentX + 2, statsY + 15);
      doc.setFontSize(14);
      doc.text(`LKR ${totalAmount.toLocaleString()}`, currentX + 2, statsY + 22);
      currentX += boxWidth + boxSpacing;
      
      // Success Rate box - Green theme
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Success Rate', currentX + 2, statsY + 15);
      doc.setFontSize(16);
      const successRate = totalPayments > 0 ? Math.round((successPayments / totalPayments) * 100) : 0;
      doc.text(`${successRate}%`, currentX + 2, statsY + 22);
      currentX += boxWidth + boxSpacing;
      
      // Average Amount box - Purple theme
      doc.setFillColor(147, 51, 234);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Avg Amount', currentX + 2, statsY + 15);
      doc.setFontSize(14);
      const avgAmount = totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0;
      doc.text(`LKR ${avgAmount.toLocaleString()}`, currentX + 2, statsY + 22);
      
      // Breakdown section
      const breakdownY = statsY + 45;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Status Breakdown', margin, breakdownY);
      
      // Status breakdown boxes
      const statusBoxWidth = 25;
      const statusBoxHeight = 20;
      let statusX = margin;
      
      // Success
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(statusX, breakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Success', statusX + 2, breakdownY + 15);
      doc.setFontSize(14);
      doc.text(successPayments.toString(), statusX + 2, breakdownY + 22);
      statusX += statusBoxWidth + 4;
      
      // Pending
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(statusX, breakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Pending', statusX + 2, breakdownY + 15);
      doc.setFontSize(14);
      doc.text(pendingPayments.toString(), statusX + 2, breakdownY + 22);
      statusX += statusBoxWidth + 4;
      
      // Failed
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(statusX, breakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Failed', statusX + 2, breakdownY + 15);
      doc.setFontSize(14);
      doc.text(failedPayments.toString(), statusX + 2, breakdownY + 22);
      statusX += statusBoxWidth + 4;
      
      // Refunded
      doc.setFillColor(147, 51, 234);
      doc.roundedRect(statusX, breakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Refunded', statusX + 2, breakdownY + 15);
      doc.setFontSize(14);
      doc.text(refundedPayments.toString(), statusX + 2, breakdownY + 22);
      
      // Payment type breakdown
      const typeBreakdownY = breakdownY + 40;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Type Breakdown', margin, typeBreakdownY);
      
      // Type breakdown boxes
      let typeX = margin;
      
      // Booking
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(typeX, typeBreakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Booking', typeX + 2, typeBreakdownY + 15);
      doc.setFontSize(14);
      doc.text(bookingPayments.toString(), typeX + 2, typeBreakdownY + 22);
      typeX += statusBoxWidth + 4;
      
      // Maintenance
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(typeX, typeBreakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Maintenance', typeX + 2, typeBreakdownY + 15);
      doc.setFontSize(14);
      doc.text(maintenancePayments.toString(), typeX + 2, typeBreakdownY + 22);
      typeX += statusBoxWidth + 4;
      
      // Salary
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(typeX, typeBreakdownY + 8, statusBoxWidth, statusBoxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Salary', typeX + 2, typeBreakdownY + 15);
      doc.setFontSize(14);
      doc.text(salaryPayments.toString(), typeX + 2, typeBreakdownY + 22);
      
      // Main payment data table
      const tableStartY = typeBreakdownY + 40;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Details', margin, tableStartY);
      
      // Prepare table data
      const tableColumns = [
        { header: 'Payment ID', dataKey: 'paymentId', width: 25 },
        { header: 'Customer', dataKey: 'customer', width: 35 },
        { header: 'Amount', dataKey: 'amount', width: 25 },
        { header: 'Status', dataKey: 'status', width: 20 },
        { header: 'Type', dataKey: 'type', width: 20 },
        { header: 'Method', dataKey: 'method', width: 20 },
        { header: 'Date', dataKey: 'date', width: 25 }
      ];
      
      const tableRows = filteredPayments.map((payment) => ({
        paymentId: payment.paymentId?.substring(0, 12) + '...',
        customer: `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim().substring(0, 20) || 'N/A',
        amount: `LKR ${payment.amount.toLocaleString()}`,
        status: payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'N/A',
        type: payment.paymentType?.charAt(0).toUpperCase() + payment.paymentType?.slice(1) || 'N/A',
        method: payment.paymentMethod?.charAt(0).toUpperCase() + payment.paymentMethod?.slice(1) || 'N/A',
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-GB') : 'N/A'
      }));

      // Use autoTable function properly
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
          paymentId: { halign: 'center', fontSize: 7, cellWidth: 25 },
          customer: { halign: 'left', fontSize: 8, cellWidth: 35, overflow: 'linebreak' },
          amount: { halign: 'right', fontSize: 8, cellWidth: 25 },
          status: { halign: 'center', fontSize: 8, cellWidth: 20 },
          type: { halign: 'center', fontSize: 8, cellWidth: 20 },
          method: { halign: 'center', fontSize: 8, cellWidth: 20 },
          date: { halign: 'center', fontSize: 7, cellWidth: 25 }
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
          doc.text('BusZone+ Payment Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
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
      const fileName = `BusZone_PaymentReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
      
      // Try to save the PDF
      try {
        doc.save(fileName);
        alert("PDF report generated successfully!");
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        // Fallback: Open PDF in new window for printing
        const pdfDataUri = doc.output('datauristring');
        const printWindow = window.open();
        printWindow.document.write(`
          <html>
            <head><title>Payment Management Report</title></head>
            <body style="margin:0; padding:0;">
              <iframe src="${pdfDataUri}" style="width:100%; height:100vh; border:none;"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
        alert("PDF opened in new window. You can print or save it from there.");
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
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
      payment.booking ? `Booking Payment` :
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
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (filteredPayments.length === 0) {
      alert('No payments to export');
      return;
    }

    setExporting(true);

    try {
      if (exportFormat === 'csv') {
        exportCSV();
        alert('CSV report downloaded successfully!');
      } else {
        generatePDFReport();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-8 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Management</h1>
            <p className="text-gray-600">Monitor and manage all payment transactions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Report
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

        {/* Export Modal */}
        <ExportModal
          show={showExportModal}
          onClose={() => setShowExportModal(false)}
          format={exportFormat}
          setFormat={setExportFormat}
          itemCount={filteredPayments.length}
          onExport={handleExport}
          loading={exporting}
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