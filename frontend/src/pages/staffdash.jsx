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
  Banknote,
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
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const StaffDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('maintenance');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Notification state
  const [notificationCount, setNotificationCount] = useState(0);

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
  const [maintenanceActiveTab, setMaintenanceActiveTab] = useState('list');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
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
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
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
    }
  }, [activeTab]);

  useEffect(() => {
    filterMaintenances();
  }, [maintenances, searchTerm, filterStatus, filterPriority]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

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
    if (!formData.bus) newErrors.bus = 'Bus selection is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Estimated cost validation
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'Valid estimated cost is required';
    } else if (parseFloat(formData.estimatedCost) > 1000000) {
      newErrors.estimatedCost = 'Estimated cost cannot exceed $1,000,000';
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
      } else if (parseFloat(formData.actualCost) > 1000000) {
        newErrors.actualCost = 'Actual cost cannot exceed $1,000,000';
      }
    }

    // Description length validation
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
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


  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/notifications/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const notifications = response.data.data || [];
        const unreadCount = notifications.filter(n => !n.isRead).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotificationCount(0);
    }
  };

  const filterMaintenances = () => {
    let filtered = maintenances;

    if (searchTerm) {
      filtered = filtered.filter(maintenance =>
        maintenance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        user: authUser._id, // Use logged-in user's ID
        bus: formData.bus,
        estimatedCost: parseFloat(formData.estimatedCost),
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined
      };
      
      console.log('Staff dashboard payload:', payload); // Debug line

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
    } catch (error) {
      console.error('Failed to save maintenance request', error);
      toast.error(error.response?.data?.message || 'Failed to save maintenance request');
    }
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
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
        return <CheckCircle className="w-4 h-4 text-green-800" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-800" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-yellow-800" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-800" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-800" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, onClick, isCurrency = false }) => {
    let displayValue = value;
    
    if (isCurrency) {
      displayValue = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
      }).format(value || 0);
    }

    return (
      <div
        onClick={onClick}
        className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{displayValue}</h3>
            {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  // Bus Management Content Component (removed duplicate)
  // const BusManagementContent = () => (
    /* <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bus Management</h2>
          <p className="text-gray-600">View and manage bus fleet information</p>
        </div>
        <button
          onClick={() => setActiveTab('maintenance')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Wrench className="w-5 h-5 mr-2" />
          Maintenance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Buses</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">48</h3>
              <p className="text-xs text-gray-500 mt-1">Active fleet</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
              <Bus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">32</h3>
              <p className="text-xs text-gray-500 mt-1">Ready for service</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Service</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">12</h3>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800">Bus Fleet Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((bus) => (
              <div key={bus} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Bus {bus.toString().padStart(3, '0')}</h4>
                  <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-medium">Available</span>
                </div>
                <p className="text-sm text-gray-600">Standard Bus</p>
                <p className="text-sm text-gray-500">Capacity: 50 passengers</p>
                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded hover:from-blue-200 hover:to-blue-300 transition-all duration-200 font-medium">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded hover:from-orange-200 hover:to-orange-300 transition-all duration-200 font-medium">
                    Maintenance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ); */

  // Schedule Content Component (removed duplicate)
  // const ScheduleContent = () => (
    /* <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
          <p className="text-gray-600">View and manage bus schedules and routes</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-5 h-5 mr-2" />
          Add Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Routes</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">24</h3>
              <p className="text-xs text-gray-500 mt-1">Active routes</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">18</h3>
              <p className="text-xs text-gray-500 mt-1">Routes completed</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">4</h3>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">2</h3>
              <p className="text-xs text-gray-500 mt-1">Running late</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Departure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Arrival</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {[
                { route: 'Colombo - Kandy', bus: 'BUS-001', departure: '08:00', arrival: '10:30', status: 'Completed' },
                { route: 'Colombo - Galle', bus: 'BUS-002', departure: '09:15', arrival: '11:45', status: 'In Progress' },
                { route: 'Kandy - Nuwara Eliya', bus: 'BUS-003', departure: '10:30', arrival: '12:30', status: 'Delayed' },
                { route: 'Colombo - Negombo', bus: 'BUS-004', departure: '11:00', arrival: '12:00', status: 'Scheduled' }
              ].map((schedule, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{schedule.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{schedule.bus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{schedule.departure}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{schedule.arrival}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      schedule.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      schedule.status === 'Delayed' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ); */

  // Attendance Content Component (removed duplicate)
  // const AttendanceContent = () => (
    /* <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Driver Attendance</h2>
          <p className="text-gray-600">Manage driver attendance and schedules</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-5 h-5 mr-2" />
          Mark Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">24</h3>
              <p className="text-xs text-gray-500 mt-1">Drivers present</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">3</h3>
              <p className="text-xs text-gray-500 mt-1">Drivers absent</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">2</h3>
              <p className="text-xs text-gray-500 mt-1">Late today</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">89%</h3>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800">Today's Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus Assigned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {[
                { name: 'John Smith', bus: 'BUS-001', checkIn: '07:45', status: 'Present' },
                { name: 'Jane Doe', bus: 'BUS-002', checkIn: '08:00', status: 'Present' },
                { name: 'Mike Johnson', bus: 'BUS-003', checkIn: '08:15', status: 'Late' },
                { name: 'Sarah Wilson', bus: 'BUS-004', checkIn: '-', status: 'Absent' }
              ].map((driver, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.bus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.checkIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.status === 'Present' ? 'bg-green-100 text-green-800' :
                      driver.status === 'Late' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Notifications Content Component (removed duplicate)
  // const NotificationsContent = () => (
    /* <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-600">View and manage system notifications</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Bell className="w-5 h-5 mr-2" />
          Mark All Read
        </button>
      </div>

      <div className="space-y-4">
        {[
          { id: 1, title: 'Maintenance Request Created', message: 'New maintenance request for BUS-001 has been created', time: '2 minutes ago', type: 'info', unread: true },
          { id: 2, title: 'Driver Check-in', message: 'John Smith has checked in for his shift', time: '15 minutes ago', type: 'success', unread: true },
          { id: 3, title: 'Schedule Update', message: 'Route Colombo-Kandy has been updated', time: '1 hour ago', type: 'warning', unread: false },
          { id: 4, title: 'System Maintenance', message: 'Scheduled maintenance will occur tonight at 2 AM', time: '3 hours ago', type: 'info', unread: false }
        ].map((notification) => (
          <div key={notification.id} className={`bg-white rounded-xl p-6 border border-blue-200 shadow-lg ${notification.unread ? 'ring-2 ring-blue-200' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                  notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                </div>
              </div>
              {notification.unread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Reports Content Component (removed duplicate)
  // const ReportsContent = () => (
    /* <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-600">View operational reports and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">LKR 125,600</h3>
              <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">1,456</h3>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">78%</h3>
              <p className="text-xs text-gray-500 mt-1">Average occupancy</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Bus className="w-4 h-4 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">New bus added to fleet</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm text-gray-700">Maintenance completed</span>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-orange-600 mr-3" />
                <span className="text-sm text-gray-700">Schedule delay reported</span>
              </div>
              <span className="text-xs text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors">
              <Wrench className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-700">Maintenance Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Content Component (removed duplicate)
  // const SettingsContent = () => (
    /* <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={`${authUser?.firstName || ''} ${authUser?.lastName || ''}`}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={authUser?.email || ''}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={authUser?.role || 'Staff'}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Update Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Email Notifications</h4>
                <p className="text-xs text-gray-600">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Push Notifications</h4>
                <p className="text-xs text-gray-600">Receive push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Maintenance Alerts</h4>
                <p className="text-xs text-gray-600">Get notified about maintenance issues</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800">Version</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">v2.1.0</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800">Status</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">Online</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800">Last Update</h4>
            <p className="text-2xl font-bold text-purple-600 mt-1">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Content Component (removed duplicate)
  // const DashboardContent = () => (
    /* <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Buses"
          value={dashboardStats.totalBuses}
          icon={Bus}
          onClick={() => setActiveTab('buses')}
        />
        <StatCard
          title="Drivers Present"
          value={dashboardStats.driversPresent}
          icon={UserCheck}
          onClick={() => setActiveTab('attendance')}
        />
        <StatCard
          title="Routes Today"
          value={dashboardStats.routesToday}
          icon={Calendar}
          onClick={() => setActiveTab('schedule')}
        />
        <StatCard
          title="Maintenance Requests"
          value={dashboardStats.maintenanceRequests}
          icon={Wrench}
          onClick={() => setActiveTab('maintenance')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Completed Routes"
          value={dashboardStats.completedRoutes}
          icon={CheckCircle}
          onClick={() => setActiveTab('schedule')}
        />
        <StatCard
          title="Delayed Routes"
          value={dashboardStats.delayedRoutes}
          icon={AlertCircle}
          onClick={() => setActiveTab('schedule')}
        />
        <StatCard
          title="Active Bookings"
          value={dashboardStats.activeBookings}
          icon={BookOpen}
          onClick={() => setActiveTab('schedule')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="flex flex-col items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              onClick={() => setActiveTab('maintenance')}
            >
              <Wrench className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-700">Maintenance</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              onClick={() => setActiveTab('buses')}
            >
              <Bus className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">Bus Fleet</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              onClick={() => setActiveTab('attendance')}
            >
              <UserCheck className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-700">Attendance</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-700">Schedule</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Wrench className="w-4 h-4 text-orange-600 mr-3" />
                <span className="text-sm text-gray-700">New maintenance request created</span>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                <span className="text-sm text-gray-700">Route completed successfully</span>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-orange-600 mr-3" />
                <span className="text-sm text-gray-700">Schedule delay reported</span>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalBuses: 48,
    activeBookings: 156,
    maintenanceRequests: 12,
    driversPresent: 24,
    routesToday: 24,
    completedRoutes: 18,
    delayedRoutes: 2
  });

  // Render content function (removed duplicate)
  // const renderContent = () => {
    return (
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bus Management</h2>
          <p className="text-gray-600">Monitor and manage bus fleet</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-5 h-5 mr-2" />
          Add Bus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((bus) => (
          <div key={bus} className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Bus {bus.toString().padStart(3, '0')}</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plate Number:</span>
                <span className="text-sm font-medium text-gray-800">ABC-{bus.toString().padStart(3, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-800">Standard</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Capacity:</span>
                <span className="text-sm font-medium text-gray-800">50 seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium text-green-600">In Service</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  }; */

  // Schedule Content
  const ScheduleContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
          <p className="text-gray-600">View and manage bus schedules</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-5 h-5 mr-2" />
          Add Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Departure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Arrival</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {[1, 2, 3, 4, 5].map((schedule) => (
                <tr key={schedule} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">Colombo - Kandy</div>
                    <div className="text-xs text-gray-500">Route {schedule}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    Bus {schedule.toString().padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    08:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    12:00 PM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      On Time
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Attendance Content
  const AttendanceContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
          <p className="text-gray-600">Track driver and staff attendance</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-5 h-5 mr-2" />
          Mark Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Today's Attendance</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Present:</span>
              <span className="text-sm font-medium text-green-600">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Absent:</span>
              <span className="text-sm font-medium text-red-600">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Late:</span>
              <span className="text-sm font-medium text-orange-600">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">This Week</h3>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Days:</span>
              <span className="text-sm font-medium text-gray-800">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Present Days:</span>
              <span className="text-sm font-medium text-green-600">4.8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Attendance Rate:</span>
              <span className="text-sm font-medium text-blue-600">96%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
              Mark All Present
            </button>
            <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
              Generate Report
            </button>
            <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  // Reports Content
  const ReportsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-600">Generate and view detailed reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Maintenance Report</h3>
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">Monthly maintenance summary and costs</p>
          <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Report</h3>
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">Staff attendance and performance metrics</p>
          <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Revenue Report</h3>
            <Banknote className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">Financial performance and revenue analysis</p>
          <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  // Settings Content
  const SettingsContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={`${authUser?.firstName} ${authUser?.lastName}`}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={authUser?.email}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={authUser?.role}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">SMS Notifications</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Maintenance Alerts</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Schedule Updates</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content function
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'maintenance':
        return <MaintenanceContent />;
      case 'attendance':
        return <AttendanceContent />;
      case 'settings':
        return <SettingsContent />;
      case 'profile':
        return <StaffProfile />;
      default:
        return <DashboardContent />;
    }
  };

  // UserProfileDropdown component moved to top
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
          <div className="text-left">
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
          <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-600 rounded-lg shadow-2xl py-1 z-50">
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
              className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <User className="w-4 h-4 mr-3" />
              My Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('settings');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200"
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

  const MaintenanceContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Maintenance Management</h2>
          <p className="text-gray-600">Manage bus maintenance requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-200">
        <button
          className={`px-4 py-2 font-medium ${maintenanceActiveTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setMaintenanceActiveTab('list')}
        >
          Maintenance List
        </button>
        <button
          className={`px-4 py-2 font-medium ${maintenanceActiveTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => setMaintenanceActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      {maintenanceActiveTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by description or bus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-slate-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Maintenance List */}
          <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Est. Cost (LKR)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Est. Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {filteredMaintenances.map((maintenance) => (
                    <tr key={maintenance._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{maintenance.maintenanceId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{maintenance.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(maintenance.estimatedCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(maintenance.estimatedCompletionDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredMaintenances.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">No maintenance requests found</h3>
                <p className="text-gray-500 mt-1">Get started by creating a new maintenance request</p>
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
            icon={Wrench}
            trend="All time"
          />
          <StatCard
            title="Pending"
            value={stats.summary.pending}
            icon={Clock}
            trend="Awaiting action"
            onClick={() => setFilterStatus('Pending')}
          />
          <StatCard
            title="In Progress"
            value={stats.summary.inProgress}
            icon={AlertCircle}
            trend="Being worked on"
            onClick={() => setFilterStatus('In Progress')}
          />
          <StatCard
            title="Completed"
            value={stats.summary.completed}
            icon={CheckCircle}
            trend="Successfully resolved"
            onClick={() => setFilterStatus('Completed')}
          />
        </div>
      )}

    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-50 to-blue-100 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-blue-200 overflow-y-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-blue-500 w-4 h-4 rounded-full"></div>
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                BusZone+
              </div>
              <div className="text-xs text-gray-700">
                Staff Portal
              </div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-blue-200 text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-colors ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-blue-200 hover:text-blue-800'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="space-y-6">
        <header className="border-b border-blue-200 bg-white">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-blue-100 text-gray-600 mr-4">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 capitalize">{menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => navigate('/notifications')}
                  className="p-1 rounded-full hover:bg-blue-100"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                </button>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">
                    {authUser?.firstName} {authUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">{authUser?.role?.toLowerCase()}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main>
          {isLoading ? <div className="text-gray-600">Loading dashboard...</div> : renderContent()}
        </main>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-blue-100 bg-opacity-80 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-blue-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingMaintenance ? 'Edit Maintenance Request' : 'New Maintenance Request'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingMaintenance(null);
                    setFormData({
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
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bus Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bus"
                    value={formData.bus}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bus ? 'border-red-500' : 'border-blue-300'
                    }`}
                  >
                    <option value="">Select a bus</option>
                    {activeBuses.map((bus) => (
                      <option key={bus._id} value={bus._id}>
                        {bus.numberPlate} ({bus.busType})
                      </option>
                    ))}
                  </select>
                  {errors.bus && <p className="text-red-500 text-sm mt-1">{errors.bus}</p>}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Estimated Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost (LKR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={estimatedCostRef}
                      type="text"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleNumberInput}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.estimatedCost ? 'border-red-500' : 'border-blue-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.estimatedCost && <p className="text-red-400 text-sm mt-1">{errors.estimatedCost}</p>}
                </div>

                {/* Estimated Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="estimatedCompletionDate"
                    value={formData.estimatedCompletionDate}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.estimatedCompletionDate ? 'border-red-500' : 'border-blue-300'
                    }`}
                  />
                  {errors.estimatedCompletionDate && <p className="text-red-400 text-sm mt-1">{errors.estimatedCompletionDate}</p>}
                </div>

                {/* Status - Only show "Pending" when adding new request */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!editingMaintenance} // Disable status dropdown when adding new request
                  >
                    {editingMaintenance ? (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    ) : (
                      <option value="Pending">Pending</option>
                    )}
                  </select>
                  {!editingMaintenance && (
                    <p className="text-xs text-slate-400 mt-1">Status will be "Pending" for new requests</p>
                  )}
                </div>

                {/* Conditional fields for completed status */}
                {formData.status === 'Completed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Actual Cost (LKR) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={actualCostRef}
                          type="text"
                          name="actualCost"
                          value={formData.actualCost}
                          onChange={handleNumberInput}
                          className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.actualCost ? 'border-red-500' : 'border-slate-600'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.actualCost && <p className="text-red-400 text-sm mt-1">{errors.actualCost}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Actual Completion Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="actualCompletionDate"
                        value={formData.actualCompletionDate}
                        onChange={handleInputChange}
                        max={getTodayDate()}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.actualCompletionDate ? 'border-red-500' : 'border-slate-600'
                        }`}
                      />
                      {errors.actualCompletionDate && <p className="text-red-400 text-sm mt-1">{errors.actualCompletionDate}</p>}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formData.description.length}/500 characters
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-blue-300'
                  }`}
                  placeholder="Describe the maintenance issue (minimum 10 characters)..."
                  maxLength={500}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-blue-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMaintenance(null);
                    setFormData({
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
                  className="px-6 py-2 border border-blue-300 text-gray-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingMaintenance ? 'Update Request' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;