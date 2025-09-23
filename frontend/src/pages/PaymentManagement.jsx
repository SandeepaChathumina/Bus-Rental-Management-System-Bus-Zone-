// src/pages/admin/PaymentManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  Wrench, 
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MoreVertical,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import axios from 'axios';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState('');
  
  // New payment form state
  const [newPayment, setNewPayment] = useState({
    type: '',
    amount: '',
    description: '',
    employeeId: '',
    maintenanceId: '',
    paymentMethod: 'bank_transfer',
    date: new Date().toISOString().split('T')[0]
  });

  // Payment types - Income vs Expense
  const paymentTypes = [
    { value: 'all', label: 'All Payments', icon: DollarSign, color: 'blue', category: 'all' },
    { value: 'booking', label: 'Bookings', icon: CreditCard, color: 'green', category: 'income' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'orange', category: 'expense' },
    { value: 'salary', label: 'Salaries', icon: User, color: 'purple', category: 'expense' }
  ];

  // New payment types for the form
  const newPaymentTypes = [
    { value: '', label: 'Select Payment Type', disabled: true },
    { value: 'salary', label: 'Salary Payment (Expense)', category: 'expense' },
    { value: 'maintenance', label: 'Maintenance Payment (Expense)', category: 'expense' }
  ];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success', color: 'green' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'refunded', label: 'Refunded', color: 'gray' }
  ];

  // Fetch payments data
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/payments/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics with income/expense breakdown
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payments/admin/stats?period=month', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // Fallback stats calculation from payments data
      const income = payments.filter(p => p.paymentType === 'booking' && p.status === 'success')
                           .reduce((sum, p) => sum + p.amount, 0);
      const expense = payments.filter(p => (p.paymentType === 'salary' || p.paymentType === 'maintenance') && p.status === 'success')
                            .reduce((sum, p) => sum + p.amount, 0);
      const revenue = income - expense;

      setStats({
        total: { totalAmount: income + expense, totalCount: payments.length },
        income,
        expense,
        revenue,
        successCount: payments.filter(p => p.status === 'success').length,
        pendingCount: payments.filter(p => p.status === 'pending').length
      });
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      fetchStatistics();
    }
  }, [payments]);

  // Filter payments
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.maintenance?.maintenanceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(payment => payment.paymentType === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(payment => 
          new Date(payment.createdAt) >= startDate
        );
      }
    }

    setFilteredPayments(filtered);
  }, [payments, filters, searchTerm]);

  // Calculate current stats from filtered payments
  const calculateCurrentStats = () => {
    const income = filteredPayments.filter(p => p.paymentType === 'booking' && p.status === 'success')
                                 .reduce((sum, p) => sum + p.amount, 0);
    const expense = filteredPayments.filter(p => (p.paymentType === 'salary' || p.paymentType === 'maintenance') && p.status === 'success')
                                  .reduce((sum, p) => sum + p.amount, 0);
    const revenue = income - expense;

    return {
      income,
      expense,
      revenue,
      total: income + expense,
      count: filteredPayments.length
    };
  };

  const currentStats = calculateCurrentStats();

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: RefreshCw },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get payment type badge with income/expense indicator
  const getTypeBadge = (type) => {
    const typeConfig = {
      booking: { color: 'bg-green-100 text-green-800', label: 'Booking', icon: TrendingUp, category: 'income' },
      maintenance: { color: 'bg-orange-100 text-orange-800', label: 'Maintenance', icon: TrendingDown, category: 'expense' },
      salary: { color: 'bg-purple-100 text-purple-800', label: 'Salary', icon: TrendingDown, category: 'expense' }
    };

    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type, category: 'other' };
    const IconComponent = config.icon || DollarSign;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle new payment type selection
  const handleNewPaymentTypeChange = (type) => {
    setNewPaymentType(type);
    setNewPayment(prev => ({
      ...prev,
      type: type,
      employeeId: '',
      maintenanceId: ''
    }));
  };

  // Handle create new payment
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/payments/admin/create', 
        {
          ...newPayment,
          amount: parseFloat(newPayment.amount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowNewPaymentModal(false);
        setNewPayment({
          type: '',
          amount: '',
          description: '',
          employeeId: '',
          maintenanceId: '',
          paymentMethod: 'bank_transfer',
          date: new Date().toISOString().split('T')[0]
        });
        setNewPaymentType('');
        fetchPayments();
        alert('Payment created successfully!');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment: ' + error.response?.data?.message || error.message);
    }
  };

  // Handle payment action
  const handlePaymentAction = async (paymentId, action) => {
    try {
      const token = localStorage.getItem('token');
      
      switch (action) {
        case 'view':
          const payment = payments.find(p => p._id === paymentId);
          setSelectedPayment(payment);
          setShowPaymentModal(true);
          break;
          
        case 'refund':
          if (window.confirm('Are you sure you want to process a refund for this payment?')) {
            await axios.post(`/api/payments/${paymentId}/refund`, 
              { reason: 'Admin initiated refund' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPayments();
          }
          break;
          
        case 'delete':
          if (window.confirm('Are you sure you want to move this payment to recycle bin?')) {
            await axios.patch(`/api/payments/admin/${paymentId}/soft-delete`, 
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPayments();
          }
          break;
      }
    } catch (error) {
      console.error('Error performing payment action:', error);
      alert('Error performing action: ' + error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600">Manage income, expenses, and track revenue</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button 
                onClick={() => setShowNewPaymentModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Income/Expense Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className={`text-2xl font-bold ${
                  currentStats.revenue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(currentStats.revenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Income: {formatCurrency(currentStats.income)} | Expense: {formatCurrency(currentStats.expense)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(currentStats.income)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => p.paymentType === 'booking' && p.status === 'success').length} successful bookings
                </p>
              </div>
            </div>
          </div>

          {/* Total Expense */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expense</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(currentStats.expense)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => (p.paymentType === 'salary' || p.paymentType === 'maintenance') && p.status === 'success').length} payments
                </p>
              </div>
            </div>
          </div>

          {/* Total Payments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentStats.count}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => p.status === 'success').length} successful
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search payments, users, IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                {/* Payment Type Filter */}
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                {/* Date Range Filter */}
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User/Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paymentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.transactionId || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Method: {payment.paymentMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeBadge(payment.paymentType)}
                        <span className={`text-xs px-2 py-1 rounded ${
                          payment.paymentType === 'booking' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {payment.paymentType === 'booking' ? 'INCOME' : 'EXPENSE'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {payment.paymentType === 'booking' && payment.booking?.bookingId && (
                          <>Booking: {payment.booking.bookingId}</>
                        )}
                        {payment.paymentType === 'maintenance' && payment.maintenance?.maintenanceId && (
                          <>Maintenance: {payment.maintenance.maintenanceId}</>
                        )}
                        {payment.paymentType === 'salary' && payment.employee && (
                          <>Salary: {payment.employee.firstName} {payment.employee.lastName}</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.paymentType === 'booking' ? (
                          <>
                            {payment.user?.firstName} {payment.user?.lastName}
                            <div className="text-sm text-gray-500">
                              {payment.user?.email}
                            </div>
                          </>
                        ) : payment.paymentType === 'salary' ? (
                          <>
                            {payment.employee?.firstName} {payment.employee?.lastName}
                            <div className="text-sm text-gray-500">
                              Employee ID: {payment.employee?.employeeId}
                            </div>
                          </>
                        ) : (
                          <>
                            Maintenance Service
                            <div className="text-sm text-gray-500">
                              Vendor: {payment.maintenance?.vendorName}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        payment.paymentType === 'booking' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.paymentType === 'booking' ? '+' : '-'} {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePaymentAction(payment._id, 'view')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.status === 'success' && payment.paymentType === 'booking' && (
                          <button
                            onClick={() => handlePaymentAction(payment._id, 'refund')}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded"
                            title="Process Refund"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePaymentAction(payment._id, 'delete')}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your filters or search terms
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredPayments.length}</span> of{' '}
                <span className="font-medium">{payments.length}</span> payments
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Payment Modal */}
      {showNewPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create New Payment</h3>
                <button
                  onClick={() => {
                    setShowNewPaymentModal(false);
                    setNewPaymentType('');
                    setNewPayment({
                      type: '',
                      amount: '',
                      description: '',
                      employeeId: '',
                      maintenanceId: '',
                      paymentMethod: 'bank_transfer',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type *
                  </label>
                  <select
                    value={newPaymentType}
                    onChange={(e) => handleNewPaymentTypeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {newPaymentTypes.map(type => (
                      <option key={type.value} value={type.value} disabled={type.disabled}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newPaymentType === 'salary' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={newPayment.employeeId}
                      onChange={(e) => setNewPayment(prev => ({...prev, employeeId: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter employee ID"
                      required
                    />
                  </div>
                )}

                {newPaymentType === 'maintenance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Request ID *
                    </label>
                    <input
                      type="text"
                      value={newPayment.maintenanceId}
                      onChange={(e) => setNewPayment(prev => ({...prev, maintenanceId: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter maintenance request ID"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({...prev, amount: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({...prev, description: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Payment description..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={newPayment.paymentMethod}
                    onChange={(e) => setNewPayment(prev => ({...prev, paymentMethod: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={newPayment.date}
                    onChange={(e) => setNewPayment(prev => ({...prev, date: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Process Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Payment Details</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment ID</label>
                    <p className="text-sm font-medium">{selectedPayment.paymentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                    <p className="text-sm">{selectedPayment.transactionId || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className={`text-sm font-medium ${
                      selectedPayment.paymentType === 'booking' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedPayment.paymentType === 'booking' ? '+' : '-'} {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        selectedPayment.paymentType === 'booking' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPayment.paymentType === 'booking' ? 'INCOME' : 'EXPENSE'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <div className="mt-1">{getTypeBadge(selectedPayment.paymentType)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm">{selectedPayment.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-sm capitalize">{selectedPayment.paymentMethod?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Gateway</label>
                    <p className="text-sm capitalize">{selectedPayment.paymentGateway || 'Manual'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-sm">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Updated</label>
                    <p className="text-sm">{formatDate(selectedPayment.updatedAt)}</p>
                  </div>
                </div>

                {/* Related Information */}
                {selectedPayment.paymentType === 'booking' && selectedPayment.booking && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Booking Information</h4>
                    <p className="text-sm">Booking ID: {selectedPayment.booking.bookingId}</p>
                    <p className="text-sm">Vehicle: {selectedPayment.booking.vehicle?.make} {selectedPayment.booking.vehicle?.model}</p>
                  </div>
                )}

                {selectedPayment.paymentType === 'salary' && selectedPayment.employee && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Employee Information</h4>
                    <p className="text-sm">Name: {selectedPayment.employee.firstName} {selectedPayment.employee.lastName}</p>
                    <p className="text-sm">Employee ID: {selectedPayment.employee.employeeId}</p>
                  </div>
                )}

                {selectedPayment.paymentType === 'maintenance' && selectedPayment.maintenance && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Maintenance Information</h4>
                    <p className="text-sm">Maintenance ID: {selectedPayment.maintenance.maintenanceId}</p>
                    <p className="text-sm">Vendor: {selectedPayment.maintenance.vendorName}</p>
                    <p className="text-sm">Service: {selectedPayment.maintenance.serviceType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;