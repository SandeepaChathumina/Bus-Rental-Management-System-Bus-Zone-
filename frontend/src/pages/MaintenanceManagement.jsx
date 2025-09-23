import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Download,
  Save,
  X,
  Wrench,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Bus,
  Calendar,
  DollarSign,
  BarChart3,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MaintenanceManagement = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [staffUsers, setStaffUsers] = useState([]);
  const [activeBuses, setActiveBuses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: [],
    byPriority: [],
    summary: { pending: 0, inProgress: 0, completed: 0 }
  });
  const [costStats, setCostStats] = useState({
    overall: { totalSpent: 0, averageCost: 0, totalRequests: 0, minCost: 0, maxCost: 0 },
    monthly: [],
    byPriority: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    user: '',
    bus: '',
    description: '',
    priority: 'Medium',
    estimatedCost: '',
    estimatedCompletionDate: '',
    status: 'Pending',
    actualCost: '',
    actualCompletionDate: ''
  });

  useEffect(() => {
    fetchMaintenances();
    fetchStaffUsers();
    fetchActiveBuses();
    fetchStats();
    fetchCostStats();
  }, []);

  useEffect(() => {
    filterMaintenances();
  }, [maintenances, searchTerm, filterStatus, filterPriority]);

  // Get today's date in YYYY-MM-DD format for date validation
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get tomorrow's date for minimum completion date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get date one year from now for maximum date validation
  const getOneYearFromNow = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.user) newErrors.user = 'Staff member is required';
    if (!formData.bus) newErrors.bus = 'Bus selection is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Estimated cost validation
    if (!formData.estimatedCost || formData.estimatedCost.trim() === '') {
      newErrors.estimatedCost = 'Estimated cost is required';
    } else {
      const estimatedCostValue = parseFloat(formData.estimatedCost);
      if (isNaN(estimatedCostValue) || estimatedCostValue <= 0) {
        newErrors.estimatedCost = 'Valid estimated cost is required (greater than 0)';
      } else if (estimatedCostValue > 1000000) {
        newErrors.estimatedCost = 'Estimated cost cannot exceed $1,000,000';
      }
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.estimatedCompletionDate) {
      const estDate = new Date(formData.estimatedCompletionDate);
      estDate.setHours(0, 0, 0, 0);
      
      if (estDate < today) {
        newErrors.estimatedCompletionDate = 'Estimated completion date cannot be in the past';
      }
      
      // Validate that estimated date is not more than 1 year in the future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(0, 0, 0, 0);
      
      if (estDate > oneYearFromNow) {
        newErrors.estimatedCompletionDate = 'Estimated completion date cannot be more than 1 year in the future';
      }
    } else {
      newErrors.estimatedCompletionDate = 'Estimated completion date is required';
    }

    // Actual completion date validation (only for completed status)
    if (formData.status === 'Completed') {
      if (!formData.actualCompletionDate) {
        newErrors.actualCompletionDate = 'Actual completion date is required for completed requests';
      } else {
        const actualDate = new Date(formData.actualCompletionDate);
        actualDate.setHours(0, 0, 0, 0);
        
        if (actualDate > today) {
          newErrors.actualCompletionDate = 'Actual completion date cannot be in the future';
        }
        
        // Validate that actual date is not before the request creation date (if editing)
        if (editingMaintenance && editingMaintenance.createdAt) {
          const createdDate = new Date(editingMaintenance.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          
          if (actualDate < createdDate) {
            newErrors.actualCompletionDate = 'Actual completion date cannot be before the request creation date';
          }
        }
      }

      // Actual cost validation for completed requests
      if (!formData.actualCost || formData.actualCost.trim() === '') {
        newErrors.actualCost = 'Actual cost is required for completed requests';
      } else {
        const actualCostValue = parseFloat(formData.actualCost);
        if (isNaN(actualCostValue) || actualCostValue <= 0) {
          newErrors.actualCost = 'Valid actual cost is required (greater than 0)';
        } else if (actualCostValue > 1000000) {
          newErrors.actualCost = 'Actual cost cannot exceed $1,000,000';
        }
      }
    }

    // Description length validation
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchMaintenances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenances(response.data.maintenances || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch maintenance requests', error);
      toast.error('Failed to fetch maintenance requests');
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/users/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle different response structures
      if (Array.isArray(response.data)) {
        setStaffUsers(response.data);
      } else if (response.data.users) {
        setStaffUsers(response.data.users);
      } else if (response.data.staffUsers) {
        setStaffUsers(response.data.staffUsers);
      } else {
        setStaffUsers([]);
        console.warn('Unexpected staff users response structure:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch staff users', error);
      
      // Fallback to mock data for demonstration
      const mockStaffUsers = [
        { _id: '1', firstName: 'John', lastName: 'Doe', staffProfile: { employeeId: 'EMP001' } },
        { _id: '2', firstName: 'Jane', lastName: 'Smith', staffProfile: { employeeId: 'EMP002' } },
        { _id: '3', firstName: 'Mike', lastName: 'Johnson', staffProfile: { employeeId: 'EMP003' } }
      ];
      setStaffUsers(mockStaffUsers);
      
      toast.error('Using demo staff data. Check backend endpoint: /api/users/staff');
    }
  };

  const fetchActiveBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/buses/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle different response structures
      if (Array.isArray(response.data)) {
        setActiveBuses(response.data);
      } else if (response.data.buses) {
        setActiveBuses(response.data.buses);
      } else if (response.data.activeBuses) {
        setActiveBuses(response.data.activeBuses);
      } else {
        setActiveBuses([]);
        console.warn('Unexpected active buses response structure:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch active buses', error);
      
      // Fallback to mock data for demonstration
      const mockBuses = [
        { _id: 'bus1', numberPlate: 'ABC123', busType: 'School Bus' },
        { _id: 'bus2', numberPlate: 'XYZ789', busType: 'Coach' },
        { _id: 'bus3', numberPlate: 'DEF456', busType: 'Minibus' }
      ];
      setActiveBuses(mockBuses);
      
      toast.error('Using demo bus data. Check backend endpoint: /api/buses/active');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance stats', error);
      // Set default stats
      setStats({
        total: maintenances.length,
        byStatus: [],
        byPriority: [],
        summary: { pending: 0, inProgress: 0, completed: 0 }
      });
    }
  };

  const fetchCostStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/cost-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCostStats(response.data);
    } catch (error) {
      console.error('Failed to fetch cost stats', error);
      // Set default cost stats
      setCostStats({
        overall: { totalSpent: 0, averageCost: 0, totalRequests: 0, minCost: 0, maxCost: 0 },
        monthly: [],
        byPriority: []
      });
    }
  };

  const filterMaintenances = () => {
    let filtered = maintenances;

    if (searchTerm) {
      filtered = filtered.filter(maintenance =>
        maintenance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (maintenance.user && (
          maintenance.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (maintenance.bus && (
          maintenance.bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.bus.busType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.bus._id.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.priority === filterPriority);
    }

    setFilteredMaintenances(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        userId: formData.user,
        busId: formData.bus,
        estimatedCost: parseFloat(formData.estimatedCost),
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined
      };

      if (editingMaintenance) {
        await axios.put(`${BACKEND_URL}/api/maintenance/${editingMaintenance._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Maintenance request updated successfully');
      } else {
        await axios.post(`${BACKEND_URL}/api/maintenance`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Maintenance request created successfully');
      }

      setShowModal(false);
      setEditingMaintenance(null);
      setFormData({
        user: '',
        bus: '',
        description: '',
        priority: 'Medium',
        estimatedCost: '',
        estimatedCompletionDate: '',
        status: 'Pending',
        actualCost: '',
        actualCompletionDate: ''
      });
      setErrors({});
      fetchMaintenances();
      fetchStats();
      fetchCostStats();
    } catch (error) {
      console.error('Failed to save maintenance request', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save maintenance request';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      user: maintenance.user?._id || '',
      bus: maintenance.bus?._id || '',
      description: maintenance.description || '',
      priority: maintenance.priority || 'Medium',
      estimatedCost: maintenance.estimatedCost || '',
      estimatedCompletionDate: maintenance.estimatedCompletionDate ? new Date(maintenance.estimatedCompletionDate).toISOString().split('T')[0] : '',
      status: maintenance.status || 'Pending',
      actualCost: maintenance.actualCost || '',
      actualCompletionDate: maintenance.actualCompletionDate ? new Date(maintenance.actualCompletionDate).toISOString().split('T')[0] : ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Maintenance request deleted successfully');
      fetchMaintenances();
      fetchStats();
      fetchCostStats();
    } catch (error) {
      console.error('Failed to delete maintenance request', error);
      toast.error('Failed to delete maintenance request');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Additional validation for status changes
    if (name === 'status' && value !== 'Completed') {
      setFormData(prev => ({
        ...prev,
        actualCost: '',
        actualCompletionDate: ''
      }));
      setErrors(prev => ({
        ...prev,
        actualCost: '',
        actualCompletionDate: ''
      }));
    }
  };

  // Improved number input handler with better validation
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    const finalValue = decimalCount > 1 ? 
      sanitizedValue.substring(0, sanitizedValue.lastIndexOf('.')) : 
      sanitizedValue;

    // Limit to 2 decimal places
    const decimalParts = finalValue.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
      decimalParts[1] = decimalParts[1].substring(0, 2);
    }
    const limitedValue = decimalParts.join('.');

    setFormData(prev => ({
      ...prev,
      [name]: limitedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-900/30 text-green-400';
      case 'In Progress':
        return 'bg-blue-900/30 text-blue-400';
      case 'Pending':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'Cancelled':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-900/30 text-red-400';
      case 'High':
        return 'bg-orange-900/30 text-orange-400';
      case 'Medium':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'Low':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Export to PDF function
  const exportToPDF = () => {
    try {
      // Create a simple PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      const tableContent = document.querySelector('table')?.outerHTML || '<p>No data available</p>';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Maintenance Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Maintenance Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            ${tableContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('PDF export failed');
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ['Bus Number', 'Bus Type', 'Description', 'Staff', 'Priority', 'Status', 'Estimated Cost', 'Actual Cost', 'Estimated Date', 'Actual Date'];
      const csvContent = [
        headers.join(','),
        ...filteredMaintenances.map(maintenance => [
          maintenance.bus?.numberPlate || 'N/A',
          maintenance.bus?.busType || 'N/A',
          `"${(maintenance.description || '').replace(/"/g, '""')}"`,
          `"${maintenance.user?.firstName || ''} ${maintenance.user?.lastName || ''}"`.trim(),
          maintenance.priority || 'N/A',
          maintenance.status || 'N/A',
          maintenance.estimatedCost || '0',
          maintenance.actualCost || 'N/A',
          maintenance.estimatedCompletionDate ? formatDate(maintenance.estimatedCompletionDate) : 'N/A',
          maintenance.actualCompletionDate ? formatDate(maintenance.actualCompletionDate) : 'N/A'
        ].join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `maintenance-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel/CSV file downloaded successfully');
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Excel export failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading maintenance requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance Management</h1>
          <p className="text-slate-400">Manage and track bus maintenance requests</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {['overview', 'list', 'statistics', 'cost-analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Total Requests</h3>
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            <p className="text-slate-400 text-sm mt-1">All maintenance requests</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Pending</h3>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.summary.pending}</p>
            <p className="text-slate-400 text-sm mt-1">Awaiting action</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Total Cost</h3>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {formatCurrency(costStats.overall.totalSpent)}
            </p>
            <p className="text-slate-400 text-sm mt-1">Overall maintenance costs</p>
          </div>

          {/* Recent Activities */}
          <div className="md:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-medium text-white mb-4">Recent Maintenance Requests</h3>
            <div className="space-y-3">
              {maintenances.slice(0, 5).map((maintenance) => (
                <div key={maintenance._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(maintenance.status)}
                    <div>
                      <p className="text-white font-medium">{maintenance.description}</p>
                      <p className="text-slate-400 text-sm">
                        Bus: {maintenance.bus?.numberPlate} (ID: {maintenance.bus?._id?.substring(0, 8)}...)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{formatCurrency(maintenance.estimatedCost)}</p>
                    <p className="text-slate-400 text-sm">{formatDate(maintenance.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-medium text-white mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {stats.byStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-slate-300">{status._id}</span>
                  <span className="text-white font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View Tab */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by description, staff, bus, or bus ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bus Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredMaintenances.map((maintenance) => (
                    <tr key={maintenance._id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Bus className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <div className="text-white font-medium">{maintenance.bus?.numberPlate}</div>
                            <div className="text-slate-400 text-sm">ID: {maintenance.bus?._id?.substring(0, 8)}...</div>
                            <div className="text-slate-400 text-sm">{maintenance.bus?.busType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white max-w-xs truncate">{maintenance.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <div className="text-white">
                              {maintenance.user?.firstName} {maintenance.user?.lastName}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {maintenance.user?.staffProfile?.employeeId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(maintenance.priority)}`}>
                          {maintenance.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(maintenance.status)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                            {maintenance.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">{formatCurrency(maintenance.estimatedCost)}</div>
                        {maintenance.actualCost && (
                          <div className="text-slate-400 text-sm">Actual: {formatCurrency(maintenance.actualCost)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-300 text-sm">
                          <div>Est: {formatDate(maintenance.estimatedCompletionDate)}</div>
                          {maintenance.actualCompletionDate && (
                            <div>Actual: {formatDate(maintenance.actualCompletionDate)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(maintenance)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Statistics and Cost Analysis tabs would go here */}
      {/* ... existing stats and cost analysis code ... */}

      {/* Add/Edit Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900 opacity-75 z-40" onClick={() => {
            setShowModal(false);
            setEditingMaintenance(null);
            setErrors({});
          }}></div>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-slate-800 rounded-lg shadow-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingMaintenance ? 'Edit Maintenance Request' : 'Create New Maintenance Request'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingMaintenance(null);
                    setErrors({});
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staff Member Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Staff Member *
                    </label>
                    <select
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.user ? 'border-red-500' : 'border-slate-600'
                      }`}
                    >
                      <option value="">Select Staff Member</option>
                      {staffUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} 
                          {user.staffProfile?.employeeId ? ` (${user.staffProfile.employeeId})` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.user && (
                      <p className="text-red-400 text-sm mt-1">{errors.user}</p>
                    )}
                  </div>

                  {/* Bus Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Bus *
                    </label>
                    <select
                      name="bus"
                      value={formData.bus}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.bus ? 'border-red-500' : 'border-slate-600'
                      }`}
                    >
                      <option value="">Select Bus</option>
                      {activeBuses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.numberPlate} - {bus.busType} (ID: {bus._id.substring(0, 8)}...)
                        </option>
                      ))}
                    </select>
                    {errors.bus && (
                      <p className="text-red-400 text-sm mt-1">{errors.bus}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe the maintenance issue..."
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>{formData.description.length}/1000 characters</span>
                      {errors.description && (
                        <span className="text-red-400">{errors.description}</span>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Priority *
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Estimated Cost ($) *
                    </label>
                    <input
                      type="text"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleNumberInput}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.estimatedCost ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    {errors.estimatedCost && (
                      <p className="text-red-400 text-sm mt-1">{errors.estimatedCost}</p>
                    )}
                  </div>

                  {/* Estimated Completion Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Estimated Completion Date *
                    </label>
                    <input
                      type="date"
                      name="estimatedCompletionDate"
                      value={formData.estimatedCompletionDate}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                      max={getOneYearFromNow()}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.estimatedCompletionDate ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    {errors.estimatedCompletionDate && (
                      <p className="text-red-400 text-sm mt-1">{errors.estimatedCompletionDate}</p>
                    )}
                  </div>

                  {/* Actual Cost (only for completed status) */}
                  {formData.status === 'Completed' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Actual Cost ($) *
                      </label>
                      <input
                        type="text"
                        name="actualCost"
                        value={formData.actualCost}
                        onChange={handleNumberInput}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.actualCost ? 'border-red-500' : 'border-slate-600'
                        }`}
                      />
                      {errors.actualCost && (
                        <p className="text-red-400 text-sm mt-1">{errors.actualCost}</p>
                      )}
                    </div>
                  )}

                  {/* Actual Completion Date (only for completed status) */}
                  {formData.status === 'Completed' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Actual Completion Date *
                      </label>
                      <input
                        type="date"
                        name="actualCompletionDate"
                        value={formData.actualCompletionDate}
                        onChange={handleInputChange}
                        max={getTodayDate()}
                        min={editingMaintenance?.createdAt ? 
                          new Date(editingMaintenance.createdAt).toISOString().split('T')[0] : 
                          '2020-01-01'
                        }
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.actualCompletionDate ? 'border-red-500' : 'border-slate-600'
                        }`}
                      />
                      {errors.actualCompletionDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.actualCompletionDate}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMaintenance(null);
                      setErrors({});
                    }}
                    className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingMaintenance ? 'Update' : 'Create'} Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;