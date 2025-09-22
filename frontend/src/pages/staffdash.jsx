import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import StaffProfile from '../components/StaffProfile';
import { useNavigate } from 'react-router-dom';
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
  MoreVertical,
  Menu,
  Home,
  LogOut,
  Bell,
  Settings,
  Users,
  BookOpen,
  UserCheck,
  MessageSquare,
  FileText,
  Sheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
// Fixed PDF imports - using dynamic import to avoid SSR issues
let jsPDF;
let autoTable;

if (typeof window !== 'undefined') {
  import('jspdf').then((module) => {
    jsPDF = module.default;
  });
  import('jspdf-autotable').then((module) => {
    autoTable = module.default;
  });
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const StaffDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('maintenance');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Maintenance state
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
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
  const [maintenanceActiveTab, setMaintenanceActiveTab] = useState('list');
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

  // Refs for cursor position tracking
  const estimatedCostRef = useRef(null);
  const actualCostRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'buses', label: 'Bus View', icon: Bus },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenances();
      fetchActiveBuses();
      fetchStats();
      fetchCostStats();
    }
  }, [activeTab]);

  useEffect(() => {
    filterMaintenances();
  }, [maintenances, searchTerm, filterStatus, filterPriority]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get tomorrow's date for minimum completion date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.user.trim()) newErrors.user = 'Staff ID is required';
    if (!formData.bus) newErrors.bus = 'Bus selection is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Estimated cost validation
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'Valid estimated cost is required';
    }

    // Date validation
    if (formData.estimatedCompletionDate) {
      const estDate = new Date(formData.estimatedCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (estDate < today) {
        newErrors.estimatedCompletionDate = 'Estimated completion date cannot be in the past';
      }
    }

    // Actual completion date validation (only for completed status)
    if (formData.status === 'Completed') {
      if (!formData.actualCompletionDate) {
        newErrors.actualCompletionDate = 'Actual completion date is required for completed requests';
      } else {
        const actualDate = new Date(formData.actualCompletionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (actualDate > today) {
          newErrors.actualCompletionDate = 'Actual completion date cannot be in the future';
        }
      }

      if (!formData.actualCost || parseFloat(formData.actualCost) <= 0) {
        newErrors.actualCost = 'Valid actual cost is required for completed requests';
      }
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

  const fetchActiveBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/active-buses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveBuses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch active buses', error);
      toast.error('Failed to fetch active buses');
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
    }
  };

  const filterMaintenances = () => {
    let filtered = maintenances;

    if (searchTerm) {
      filtered = filtered.filter(maintenance =>
        maintenance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (maintenance.user && (
          maintenance.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (maintenance.user.staffProfile && maintenance.user.staffProfile.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
        )) ||
        (maintenance.bus && (
          maintenance.bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.bus.busType.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Fixed PDF export function
  const exportToPDF = async () => {
    try {
      // Dynamically import jsPDF and autoTable
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('MAINTENANCE REQUESTS REPORT', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      doc.text(`Total Records: ${filteredMaintenances.length}`, 105, 28, { align: 'center' });
      
      // Prepare table data
      const tableData = filteredMaintenances.map((maintenance, index) => [
        index + 1,
        maintenance.maintenanceId || 'N/A',
        maintenance.description.substring(0, 50) + (maintenance.description.length > 50 ? '...' : ''),
        maintenance.user && maintenance.user.staffProfile ? maintenance.user.staffProfile.employeeId : 'N/A',
        maintenance.bus ? maintenance.bus.numberPlate : 'N/A',
        maintenance.priority,
        maintenance.status,
        formatCurrency(maintenance.estimatedCost),
        formatDate(maintenance.estimatedCompletionDate)
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [['#', 'Request ID', 'Description', 'Staff ID', 'Bus', 'Priority', 'Status', 'Est. Cost', 'Est. Completion']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 25 },
          8: { cellWidth: 30 }
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      doc.save(`maintenance-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Prepare worksheet data
      const worksheetData = [
        ['MAINTENANCE REQUESTS REPORT'],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [`Total Records: ${filteredMaintenances.length}`],
        [''], // Empty row for spacing
        ['#', 'Request ID', 'Description', 'Staff ID', 'Bus Number', 'Bus Type', 'Priority', 'Status', 'Estimated Cost', 'Estimated Completion', 'Actual Cost', 'Actual Completion']
      ];

      // Add data rows
      filteredMaintenances.forEach((maintenance, index) => {
        worksheetData.push([
          index + 1,
          maintenance.maintenanceId || 'N/A',
          maintenance.description,
          maintenance.user && maintenance.user.staffProfile ? maintenance.user.staffProfile.employeeId : 'N/A',
          maintenance.bus ? maintenance.bus.numberPlate : 'N/A',
          maintenance.bus ? maintenance.bus.busType : 'N/A',
          maintenance.priority,
          maintenance.status,
          maintenance.estimatedCost,
          formatDate(maintenance.estimatedCompletionDate),
          maintenance.actualCost || 'N/A',
          maintenance.actualCompletionDate ? formatDate(maintenance.actualCompletionDate) : 'N/A'
        ]);
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      const colWidths = [
        { wch: 5 },  // #
        { wch: 15 }, // Request ID
        { wch: 40 }, // Description
        { wch: 15 }, // Staff ID
        { wch: 15 }, // Bus Number
        { wch: 15 }, // Bus Type
        { wch: 12 }, // Priority
        { wch: 15 }, // Status
        { wch: 15 }, // Estimated Cost
        { wch: 20 }, // Estimated Completion
        { wch: 15 }, // Actual Cost
        { wch: 20 }  // Actual Completion
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Requests');

      // Generate and download file
      XLSX.writeFile(wb, `maintenance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel report generated successfully');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel report');
    }
  };

  // Export dropdown component
  const ExportDropdown = () => {
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setExportDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
          className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {exportDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => {
                exportToPDF();
                setExportDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-3" />
              Export as PDF
            </button>
            <button
              onClick={() => {
                exportToExcel();
                setExportDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Sheet className="w-4 h-4 mr-3" />
              Export as Excel
            </button>
          </div>
        )}
      </div>
    );
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
      toast.error(error.response?.data?.message || 'Failed to save maintenance request');
    }
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      user: maintenance.user._id,
      bus: maintenance.bus._id,
      description: maintenance.description,
      priority: maintenance.priority,
      estimatedCost: maintenance.estimatedCost,
      estimatedCompletionDate: maintenance.estimatedCompletionDate ? new Date(maintenance.estimatedCompletionDate).toISOString().split('T')[0] : '',
      status: maintenance.status,
      actualCost: maintenance.actualCost || '',
      actualCompletionDate: maintenance.actualCompletionDate ? new Date(maintenance.actualCompletionDate).toISOString().split('T')[0] : ''
    });
    setErrors({});
    setShowModal(true);
  };

  // Fixed input change handler - using standard input type="number" for better cursor behavior
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
      setErrors(prev => ({
        ...prev,
        actualCost: '',
        actualCompletionDate: ''
      }));
    }
  };

  // Fixed number input handler - using proper controlled component pattern
  const handleNumberInput = (e) => {
    const { name, value, selectionStart } = e.target;
    
    // Store cursor position before update
    const cursorPosition = selectionStart;
    
    // Allow only numbers and decimal point
    let sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Restore cursor position after state update
    setTimeout(() => {
      const inputRef = name === 'estimatedCost' ? estimatedCostRef.current : actualCostRef.current;
      if (inputRef) {
        inputRef.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
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
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const StatCard = ({ title, value, icon: Icon, trend, onClick }) => (
    <div
      onClick={onClick}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900/30">
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      </div>
    </div>
  );

  const MaintenanceContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance Management</h2>
          <p className="text-slate-400">Manage bus maintenance requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          className={`px-4 py-2 font-medium ${maintenanceActiveTab === 'list' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMaintenanceActiveTab('list')}
        >
          Maintenance List
        </button>
        <button
          className={`px-4 py-2 font-medium ${maintenanceActiveTab === 'stats' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMaintenanceActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`px-4 py-2 font-medium ${maintenanceActiveTab === 'cost' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setMaintenanceActiveTab('cost')}
        >
          Cost Analysis
        </button>
      </div>

      {maintenanceActiveTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by description, staff ID, or bus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-slate-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <ExportDropdown />
          </div>

          {/* Maintenance List */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Staff ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Est. Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Est. Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredMaintenances.map((maintenance) => (
                    <tr key={maintenance._id} className="hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{maintenance.maintenanceId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{maintenance.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {maintenance.user && maintenance.user.staffProfile 
                          ? maintenance.user.staffProfile.employeeId 
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {maintenance.bus ? `${maintenance.bus.numberPlate} (${maintenance.bus.busType})` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(maintenance.priority)}`}>
                          {maintenance.priority}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                          {getStatusIcon(maintenance.status)}
                          <span className="ml-1.5">{maintenance.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatCurrency(maintenance.estimatedCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatDate(maintenance.estimatedCompletionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(maintenance)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
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
            
            {filteredMaintenances.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-400">No maintenance requests found</h3>
                <p className="text-slate-500 mt-1">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first maintenance request'
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {maintenanceActiveTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={BarChart3}
          />
          <StatCard
            title="Pending"
            value={stats.summary.pending}
            icon={AlertCircle}
          />
          <StatCard
            title="In Progress"
            value={stats.summary.inProgress}
            icon={Clock}
          />
          <StatCard
            title="Completed"
            value={stats.summary.completed}
            icon={CheckCircle}
          />

          <div className="md:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Requests by Status</h3>
            <div className="space-y-3">
              {stats.byStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-slate-300">{status._id}</span>
                  <div className="flex items-center">
                    <span className="text-white font-medium mr-2">{status.count}</span>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(status._id).split(' ')[0]}`}
                        style={{ width: `${(status.count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Requests by Priority</h3>
            <div className="space-y-3">
              {stats.byPriority.map((priority) => (
                <div key={priority._id} className="flex items-center justify-between">
                  <span className="text-slate-300">{priority._id}</span>
                  <div className="flex items-center">
                    <span className="text-white font-medium mr-2">{priority.count}</span>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPriorityColor(priority._id).split(' ')[0]}`}
                        style={{ width: `${(priority.count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {maintenanceActiveTab === 'cost' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Spent</span>
                <span className="text-white font-bold">{formatCurrency(costStats.overall.totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Average Cost</span>
                <span className="text-white font-bold">{formatCurrency(costStats.overall.averageCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Requests</span>
                <span className="text-white font-bold">{costStats.overall.totalRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Min Cost</span>
                <span className="text-white font-bold">{formatCurrency(costStats.overall.minCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Max Cost</span>
                <span className="text-white font-bold">{formatCurrency(costStats.overall.maxCost)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Cost by Priority</h3>
            <div className="space-y-4">
              {costStats.byPriority.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item._id)}`}>
                    {item._id}
                  </span>
                  <div className="text-right">
                    <div className="text-white font-bold">{formatCurrency(item.totalCost)}</div>
                    <div className="text-slate-400 text-xs">{item.count} requests</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Costs</h3>
            {costStats.monthly.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Period</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Total Cost</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costStats.monthly.map((month) => (
                      <tr key={`${month._id.year}-${month._id.month}`} className="border-b border-slate-700">
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-medium">
                          {formatCurrency(month.totalCost)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {month.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No cost data available</p>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => {
            setShowModal(false);
            setEditingMaintenance(null);
            setErrors({});
          }}></div>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingMaintenance ? 'Edit Maintenance Request' : 'Create Maintenance Request'}
                </h3>
                <button
                  onClick={() => {
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
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Staff ID *</label>
                    <input
                      type="text"
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.user ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Enter staff ID"
                      required
                      disabled={editingMaintenance}
                    />
                    {errors.user && <p className="text-red-400 text-xs mt-1">{errors.user}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bus *</label>
                    <select
                      name="bus"
                      value={formData.bus}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.bus ? 'border-red-500' : 'border-slate-600'
                      }`}
                      required
                      disabled={editingMaintenance}
                    >
                      <option value="">Select Bus</option>
                      {activeBuses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.numberPlate} ({bus.busType} - {bus.capacity} seats)
                        </option>
                      ))}
                    </select>
                    {errors.bus && <p className="text-red-400 text-xs mt-1">{errors.bus}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Describe the maintenance issue..."
                    rows={3}
                    required
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Cost ($) *</label>
                    <input
                      ref={estimatedCostRef}
                      type="text" // Changed to text for better cursor control
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleNumberInput}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.estimatedCost ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="0.00"
                      required
                    />
                    {errors.estimatedCost && <p className="text-red-400 text-xs mt-1">{errors.estimatedCost}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Completion Date</label>
                    <input
                      type="date"
                      name="estimatedCompletionDate"
                      value={formData.estimatedCompletionDate}
                      onChange={handleInputChange}
                      min={getTomorrowDate()}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.estimatedCompletionDate ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    {errors.estimatedCompletionDate && (
                      <p className="text-red-400 text-xs mt-1">{errors.estimatedCompletionDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {editingMaintenance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Actual Cost ($)</label>
                      <input
                        ref={actualCostRef}
                        type="text" // Changed to text for better cursor control
                        name="actualCost"
                        value={formData.actualCost}
                        onChange={handleNumberInput}
                        className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.actualCost ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.actualCost && <p className="text-red-400 text-xs mt-1">{errors.actualCost}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Actual Completion Date</label>
                      <input
                        type="date"
                        name="actualCompletionDate"
                        value={formData.actualCompletionDate}
                        onChange={handleInputChange}
                        max={getTodayDate()}
                        className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.actualCompletionDate ? 'border-red-500' : 'border-slate-600'
                        }`}
                      />
                      {errors.actualCompletionDate && (
                        <p className="text-red-400 text-xs mt-1">{errors.actualCompletionDate}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingMaintenance ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // UserProfileDropdown component remains the same...
  const UserProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-white">
              {authUser?.firstName} {authUser?.lastName}
            </div>
            <div className="text-xs text-slate-400 capitalize">
              {authUser?.role?.toLowerCase()}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-slate-700">
              <div className="text-sm font-medium text-white">
                {authUser?.firstName} {authUser?.lastName}
              </div>
              <div className="text-xs text-slate-400">{authUser?.email}</div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('profile');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <User className="w-4 h-4 mr-3" />
              My Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('settings');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </button>
            <div className="border-t border-slate-700 my-1"></div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading Dashboard...</h2>
          <p className="text-slate-400 mt-2">Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Staff Portal</h1>
                <p className="text-xs text-slate-400">Maintenance System</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-slate-700">
          <UserProfileDropdown />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-300" />
              </button>
              <h1 className="text-xl font-semibold text-white capitalize">
                {activeTab === 'maintenance' ? 'Maintenance Management' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-slate-400">Last login:</span>
                <span className="text-slate-300">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'maintenance' && <MaintenanceContent />}
          {activeTab === 'profile' && <StaffProfile />}
          
          {activeTab !== 'maintenance' && activeTab !== 'profile' && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'dashboard' && <Home className="w-12 h-12 text-slate-600" />}
                {activeTab === 'buses' && <Bus className="w-12 h-12 text-slate-600" />}
                {activeTab === 'schedule' && <Calendar className="w-12 h-12 text-slate-600" />}
                {activeTab === 'reports' && <BarChart3 className="w-12 h-12 text-slate-600" />}
                {activeTab === 'settings' && <Settings className="w-12 h-12 text-slate-600" />}
              </div>
              <h2 className="text-2xl font-bold text-slate-400 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h2>
              <p className="text-slate-500">
                This section is under development and will be available soon.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;