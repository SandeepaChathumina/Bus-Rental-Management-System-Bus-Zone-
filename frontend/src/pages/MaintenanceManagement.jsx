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
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'stats', 'cost'

  const [formData, setFormData] = useState({
    user: '',
    bus: '',
    description: '',
    priority: 'Medium',
    estimatedCost: '',
    estimatedCompletionDate: '',
    status: 'Pending'
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

    // Filter by search term
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

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.priority === filterPriority);
    }

    setFilteredMaintenances(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        userId: formData.user,
        busId: formData.bus,
        estimatedCost: parseFloat(formData.estimatedCost)
      };

      if (editingMaintenance) {
        // Update existing maintenance
        await axios.put(`${BACKEND_URL}/api/maintenance/${editingMaintenance._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Maintenance request updated successfully');
      } else {
        // Create new maintenance
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
        status: 'Pending'
      });
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance Management</h2>
          <p className="text-slate-400">Manage bus maintenance requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'list' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('list')}
        >
          Maintenance List
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'cost' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('cost')}
        >
          Cost Analysis
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by description, staff, or bus..."
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
            <button className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>

          {/* Maintenance List */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Staff</th>
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
                    <tr key={maintenance._id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{maintenance.maintenanceId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{maintenance.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {maintenance.user ? `${maintenance.user.firstName} ${maintenance.user.lastName}` : 'N/A'}
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
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(maintenance._id)}
                            className="text-red-400 hover:text-red-300"
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

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Total Requests</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900/30">
                <BarChart3 className="w-6 h-6 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Pending</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.summary.pending}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-900/30">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">In Progress</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.summary.inProgress}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-900/30">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Completed</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.summary.completed}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-900/30">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

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

      {activeTab === 'cost' && (
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
          <div className="fixed inset-0 bg-slate-900 opacity-75 z-40" onClick={() => setShowModal(false)}></div>
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
                      status: 'Pending'
                    });
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
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bus *</label>
                    <select
                      name="bus"
                      value={formData.bus}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the maintenance issue..."
                    rows={3}
                    required
                  />
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
                      type="number"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
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
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                        type="number"
                        name="actualCost"
                        value={formData.actualCost || ''}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Actual Completion Date</label>
                      <input
                        type="date"
                        name="actualCompletionDate"
                        value={formData.actualCompletionDate || ''}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                        status: 'Pending'
                      });
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