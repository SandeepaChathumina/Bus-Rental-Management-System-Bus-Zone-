// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import AttendanceManagement from '../components/AttendanceManagement'; 
import {
  Users,
  Bus,
  Bell,
  MessageSquare,
  Search,
  Calendar,
  Wrench,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  MoreVertical,
  UserCheck,
  Clock,
  Menu,
  X,
  Home,
  LogOut,
  ChevronDown,
  Edit,
  Trash2,
  Filter,
  Download,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(null);
  const navigate = useNavigate();

  const [dashboardStats] = useState({
    totalBuses: 48,
    activeBookings: 156,
    maintenanceRequests: 12,
    revenue: 1256000,
    occupancyRate: 78
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchTotalUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
        if (!mounted) return;
        const arr = res.data || [];
        setTotalUsers(Array.isArray(arr) ? arr.length : (arr.count || 0));
      } catch (err) {
        console.error('Failed to fetch total users', err);
        if (mounted) setTotalUsers(0);
      }
    };
    fetchTotalUsers();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'buses', label: 'Bus Management', icon: Bus },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'drivers', label: 'Driver Assign', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'lost-found', label: 'Lost & Found', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers === null ? 'Loading...' : totalUsers.toLocaleString()}
          icon={Users}
          onClick={() => setActiveTab('users')}
        />
        <StatCard title="Total Buses" value={dashboardStats.totalBuses} icon={Bus} />
        <StatCard title="Active Bookings" value={dashboardStats.activeBookings} icon={BookOpen} />
        <StatCard title="Maintenance Requests" value={dashboardStats.maintenanceRequests} icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-blue-900/20 rounded-lg">
              <Plus className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-300">Add User</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-green-900/20 rounded-lg">
              <Plus className="w-6 h-6 text-green-400 mb-2" />
              <span className="text-sm font-medium text-green-300">Add Bus</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-purple-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm font-medium text-purple-300">Schedule</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-orange-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-400 mb-2" />
              <span className="text-sm font-medium text-orange-300">Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <p className="text-slate-400">Latest system events will show here (plug notifications as needed).</p>
        </div>
      </div>
    </div>
  );

  const AdminNotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [loading, setLoading] = useState(true);
  
    const [formData, setFormData] = useState({
      title: '',
      message: '',
      type: 'general',
      targetAudience: 'all',
      deliveryChannel: 'in_app',
      expiresAt: '',
      isActive: true
    });
  
    useEffect(() => {
      fetchNotifications();
    }, []);
  
    useEffect(() => {
      filterNotifications();
    }, [searchTerm, statusFilter, typeFilter, notifications]);
  
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data.data || response.data);
        setFilteredNotifications(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to fetch notifications');
        // Fallback to mock data if API fails
        const mockNotifications = [
          {
            _id: '1',
            title: 'System Maintenance',
            message: 'The system will be down for maintenance on Saturday from 2-4 AM',
            type: 'alert',
            targetAudience: 'all',
            deliveryChannel: 'in_app',
            expiresAt: '2023-12-31T23:59:59',
            isActive: true,
            createdAt: '2023-10-15T08:30:00'
          },
          {
            _id: '2',
            title: 'New Features Released',
            message: 'Check out the new dashboard features we just released',
            type: 'general',
            targetAudience: 'admins',
            deliveryChannel: 'email',
            expiresAt: null,
            isActive: true,
            createdAt: '2023-10-10T10:15:00'
          }
        ];
        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };
  
    const filterNotifications = () => {
      let filtered = notifications;
  
      if (searchTerm) {
        filtered = filtered.filter(notification =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      if (statusFilter !== 'all') {
        filtered = filtered.filter(notification => 
          statusFilter === 'active' ? notification.isActive : !notification.isActive
        );
      }
  
      if (typeFilter !== 'all') {
        filtered = filtered.filter(notification => notification.type === typeFilter);
      }
  
      setFilteredNotifications(filtered);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        
        if (editingNotification) {
          await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${editingNotification._id}`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Notification updated successfully');
        } else {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Notification created successfully');
        }
        
        resetForm();
        fetchNotifications();
      } catch (error) {
        console.error('Error saving notification:', error);
        toast.error('Failed to save notification');
      }
    };
  
    const handleEdit = (notification) => {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        targetAudience: notification.targetAudience,
        deliveryChannel: notification.deliveryChannel,
        expiresAt: notification.expiresAt ? notification.expiresAt.split('T')[0] : '',
        isActive: notification.isActive
      });
      setShowForm(true);
    };
  
    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this notification?')) return;
      
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Notification deleted successfully');
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
    };
  
    const resetForm = () => {
      setFormData({
        title: '',
        message: '',
        type: 'general',
        targetAudience: 'all',
        deliveryChannel: 'in_app',
        expiresAt: '',
        isActive: true
      });
      setEditingNotification(null);
      setShowForm(false);
    };
  
    const sendTestNotification = async (id) => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/test`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Test notification sent successfully');
      } catch (error) {
        console.error('Error sending test notification:', error);
        toast.error('Failed to send test notification');
      }
    };
  
    const exportNotifications = () => {
      const data = filteredNotifications.map(notification => ({
        Title: notification.title,
        Message: notification.message,
        Type: notification.type,
        Target: notification.targetAudience,
        Channel: notification.deliveryChannel,
        Status: notification.isActive ? 'Active' : 'Inactive',
        'Expiry Date': notification.expiresAt ? new Date(notification.expiresAt).toLocaleDateString() : 'Never',
        'Created At': new Date(notification.createdAt).toLocaleString()
      }));
  
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'notifications.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    };
  
    const convertToCSV = (data) => {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(','));
      return [headers, ...rows].join('\n');
    };
  
    const toggleNotificationStatus = async (id) => {
      try {
        const token = localStorage.getItem('token');
        const notification = notifications.find(n => n._id === id);
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
          { isActive: !notification.isActive },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Notification status updated');
        fetchNotifications();
      } catch (error) {
        console.error('Error updating notification status:', error);
        toast.error('Failed to update notification status');
      }
    };
  
    const notificationTypes = [
      { value: 'general', label: 'General', color: 'bg-gray-500' },
      { value: 'discount', label: 'Discount', color: 'bg-green-500' },
      { value: 'package', label: 'Package', color: 'bg-blue-500' },
      { value: 'alert', label: 'Alert', color: 'bg-red-500' },
      { value: 'reminder', label: 'Reminder', color: 'bg-yellow-500' },
      { value: 'booking', label: 'Booking', color: 'bg-indigo-500' },
      { value: 'promotional', label: 'Promotional', color: 'bg-purple-500' },
      { value: 'seasonal', label: 'Seasonal', color: 'bg-amber-500' }
    ];
  
    const userTypes = [
      { value: 'all', label: 'All Users' },
      { value: 'passengers', label: 'Passengers' },
      { value: 'drivers', label: 'Drivers' },
      { value: 'staff', label: 'Staff' },
      { value: 'admins', label: 'Admins' }
    ];

    const deliveryChannels = [
      { value: 'in_app', label: 'In-App' },
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS' },
      { value: 'push', label: 'Push Notification' },
      { value: 'all_channels', label: 'All Channels' }
    ];
  
    if (loading) {
      return (
        <div className="p-8 text-center text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4">Loading notifications...</p>
        </div>
      );
    }
  
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Bell className="h-6 w-6 mr-2 text-amber-400" />
            Notification Management
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={exportNotifications}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Notification</span>
            </button>
          </div>
        </div>
  
        {/* Search and Filter Section */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
  
        {/* Notification Form */}
        {showForm && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingNotification ? 'Edit Notification' : 'Create New Notification'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter notification title"
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter notification message"
                />
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {userTypes.map(userType => (
                      <option key={userType.value} value={userType.value}>{userType.label}</option>
                    ))}
                  </select>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Channel</label>
                  <select
                    value={formData.deliveryChannel}
                    onChange={(e) => setFormData({ ...formData, deliveryChannel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {deliveryChannels.map(channel => (
                      <option key={channel.value} value={channel.value}>{channel.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
  
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300">
                  Active Notification
                </label>
              </div>
  
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-500 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingNotification ? 'Update' : 'Create'} Notification</span>
                </button>
              </div>
            </form>
          </div>
        )}
  
        {/* Notifications List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Notifications ({filteredNotifications.length})
            </h3>
            <div className="flex items-center space-x-2 text-slate-300">
              <Filter className="h-4 w-4" />
              <span>Filtered</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications found</p>
                      {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                        <p className="text-sm mt-2">Try adjusting your filters</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map(notification => {
                    const typeConfig = notificationTypes.find(t => t.value === notification.type);
                    return (
                      <tr key={notification._id} className="hover:bg-slate-750">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{notification.title}</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">{notification.message}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig?.color} text-white`}>
                            {typeConfig?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {userTypes.find(t => t.value === notification.targetAudience)?.label}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {deliveryChannels.find(c => c.value === notification.deliveryChannel)?.label}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleNotificationStatus(notification._id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notification.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notification.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {notification.expiresAt ? new Date(notification.expiresAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(notification)}
                              className="text-indigo-400 hover:text-indigo-300 p-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => sendTestNotification(notification._id)}
                              className="text-amber-400 hover:text-amber-300 p-1"
                              title="Send Test"
                            >
                              <Bell className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'notifications':
        return <AdminNotificationPanel />;
      case 'buses':
        return <div className="text-white p-6">Bus Management (placeholder)</div>;
      case 'bookings':
        return <div className="text-white p-6">Bookings (placeholder)</div>;
      case 'maintenance':
        return <div className="text-white p-6">Maintenance (placeholder)</div>;
      case 'drivers':
        return <div className="text-white p-6">Driver Assign (placeholder)</div>;
      case 'attendance':
        return <AttendanceManagement />;
      case 'feedback':
        return <div className="text-white p-6">Feedback (placeholder)</div>;
      case 'lost-found':
        return <div className="text-white p-6">Lost & Found (placeholder)</div>;
      case 'analytics':
        return <div className="text-white p-6">Analytics (placeholder)</div>;
      case 'settings':
        return <div className="text-white p-6">Settings (placeholder)</div>;
      default:
        return <div className="text-white p-6">Module under development</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800 overflow-y-auto`}>

        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/40x40?text=BZ+" alt="BusZone+" className="h-8 w-8 mr-2 rounded" />
            <h1 className="text-xl font-bold text-white">BusZone+</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-800 text-white mr-4">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white capitalize">{menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h2>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-slate-800">
                  <Bell className="w-6 h-6 text-slate-300" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">3</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{authUser?.firstName || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{authUser?.role || 'Super Admin'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? <div className="text-slate-400">Loading dashboard...</div> : renderContent()}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );

  
};

export default AdminDashboard;