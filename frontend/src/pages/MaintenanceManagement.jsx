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
  const [activeTab, setActiveTab] = useState('list');
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

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.user) newErrors.user = 'Staff member is required';
    if (!formData.bus) newErrors.bus = 'Bus selection is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
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

  const fetchStaffUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/staff-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch staff users', error);
      toast.error('Failed to fetch staff users');
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
          maintenance.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
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
      setErrors(prev => ({
        ...prev,
        actualCost: '',
        actualCompletionDate: ''
      }));
    }
  };

  // Improved number input handler with better cursor behavior
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    const finalValue = decimalCount > 1 ? 
      sanitizedValue.substring(0, sanitizedValue.lastIndexOf('.')) : 
      sanitizedValue;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
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
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      {/* Header and Tabs remain the same */}
      {/* ... existing header and tabs code ... */}

      {activeTab === 'list' && (
        <>
          {/* Filters and Table remain the same */}
          {/* ... existing filters and table code ... */}
        </>
      )}

      {/* Statistics and Cost Analysis tabs remain the same */}
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
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Staff Member *</label>
                    <select
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.user ? 'border-red-500' : 'border-slate-600'
                      }`}
                      required
                      disabled={editingMaintenance}
                    >
                      <option value="">Select Staff Member</option>
                      {staffUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.staffProfile?.employeeId || 'N/A'})
                        </option>
                      ))}
                    </select>
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
                      type="text"
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
                        type="text"
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
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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