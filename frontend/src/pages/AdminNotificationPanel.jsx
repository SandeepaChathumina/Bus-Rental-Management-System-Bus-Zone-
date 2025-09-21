import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, Bell, Send, BarChart3, RefreshCw, Eye, Filter, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    deliveryChannel: 'in_app',
    isActive: true,
    isPublic: false,
    expiresAt: '',
    sendAt: '',
    status: 'draft'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchTerm, notifications, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const notificationsData = response.data.data || response.data.notifications || response.data || [];
      
      // Sort by creation date, newest first
      const sortedData = notificationsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(sortedData);
      setFilteredNotifications(sortedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      
      // Fallback to mock data if API fails
      const mockNotifications = [
        {
          _id: '1',
          title: 'hh',
          message: 'Test notification',
          type: 'general',
          targetAudience: 'all',
          deliveryChannel: 'in_app',
          isActive: true,
          status: 'active',
          expiresAt: '2025-09-11',
          createdAt: '2025-09-10'
        },
        {
          _id: '2',
          title: 'jiu',
          message: 'Another notification',
          type: '',
          targetAudience: '',
          deliveryChannel: '',
          isActive: false,
          status: 'draft',
          expiresAt: '',
          createdAt: '2025-09-15'
        },
        {
          _id: '3',
          title: 'mkjfvor',
          message: 'Package notification',
          type: 'package',
          targetAudience: 'all',
          deliveryChannel: 'in_app',
          isActive: true,
          status: 'scheduled',
          expiresAt: '2025-09-20',
          createdAt: '2025-09-18'
        }
      ];
      
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchNotifications();
    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/admin/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Create basic stats if API fails
      setStats({
        totalNotifications: notifications.length,
        readRate: 65,
        activeNotifications: notifications.filter(n => n.isActive).length,
        scheduled: notifications.filter(n => n.status === 'scheduled').length
      });
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.message && notification.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNotifications(filtered);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    if (!formData.type) {
      errors.type = 'Type is required';
    }
    
    if (!formData.targetAudience) {
      errors.targetAudience = 'Target audience is required';
    }
    
    if (!formData.deliveryChannel) {
      errors.deliveryChannel = 'Delivery channel is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      // Prepare data for API - match your database schema exactly
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetAudience: formData.targetAudience,
        deliveryChannel: formData.deliveryChannel,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        status: formData.status,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        sendAt: formData.sendAt ? new Date(formData.sendAt).toISOString() : null,
        // Add any additional fields your backend expects
        isSeasonal: false, // Default value
        readStatus: false, // Default value
        clickCount: 0, // Default value
      };

      const token = localStorage.getItem('token');
      
      if (editingNotification) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${editingNotification._id}`,
          notificationData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        toast.success('Notification updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          notificationData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        toast.success('Notification created successfully');
      }
      resetForm();
      refreshData();
    } catch (error) {
      console.error('Error saving notification:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data || 
                          'Failed to save notification';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'general',
      targetAudience: notification.targetAudience || 'all',
      deliveryChannel: notification.deliveryChannel || 'in_app',
      isActive: notification.isActive !== undefined ? notification.isActive : true,
      isPublic: notification.isPublic || false,
      status: notification.status || 'draft',
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
      sendAt: notification.sendAt ? new Date(notification.sendAt).toISOString().slice(0, 16) : '',
    });
    setFormErrors({});
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
      refreshData();
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
      isActive: true,
      isPublic: false,
      expiresAt: '',
      sendAt: '',
      status: 'draft'
    });
    setFormErrors({});
    setEditingNotification(null);
    setShowForm(false);
  };

  const sendNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Notification sent successfully');
      refreshData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const notification = notifications.find(n => n._id === id);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        { isActive: !notification.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status updated successfully');
      refreshData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
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

  const notificationTypes = [
    { value: 'general', label: 'General', color: 'bg-gray-500' },
    { value: 'promotional', label: 'Promotional', color: 'bg-purple-500' },
    { value: 'alert', label: 'Alert', color: 'bg-red-500' },
    { value: 'update', label: 'Update', color: 'bg-blue-500' },
    { value: 'package', label: 'Package', color: 'bg-amber-500' },
  ];

  const userTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'admins', label: 'Admins' },
    { value: 'drivers', label: 'Drivers' },
    { value: 'passengers', label: 'Passengers' }
  ];

  const statusTypes = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
    { value: 'sent', label: 'Sent', color: 'bg-purple-500' },
  ];

  const deliveryChannels = [
    { value: 'in_app', label: 'In-App' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notification' },
    { value: 'all', label: 'All Channels' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      case 'draft':
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
      case 'scheduled':
        return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
      case 'sent':
        return <div className="w-3 h-3 rounded-full bg-purple-500"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-4">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Bell className="h-6 w-6 mr-2 text-amber-400" />
          Notification Management
          <span className="ml-3 bg-amber-500 text-white text-sm font-medium px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={exportNotifications}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Notifications</p>
              <p className="text-xl font-bold text-white">{stats?.totalNotifications || notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active Notifications</p>
              <p className="text-xl font-bold text-white">{stats?.activeNotifications || notifications.filter(n => n.isActive).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-amber-500/20 rounded-lg mr-3">
              <Send className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Sent Notifications</p>
              <p className="text-xl font-bold text-white">{notifications.filter(n => n.status === 'sent').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <Bell className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Draft Notifications</p>
              <p className="text-xl font-bold text-white">{notifications.filter(n => n.status === 'draft').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {statusTypes.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

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
                  className={`w-full px-3 py-2 bg-slate-700 border ${formErrors.title ? 'border-red-500' : 'border-slate-600'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder="Enter notification title"
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-700 border ${formErrors.type ? 'border-red-500' : 'border-slate-600'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {formErrors.type && <p className="text-red-400 text-xs mt-1">{formErrors.type}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Message *</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 bg-slate-700 border ${formErrors.message ? 'border-red-500' : 'border-slate-600'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                placeholder="Enter notification message"
              />
              {formErrors.message && <p className="text-red-400 text-xs mt-1">{formErrors.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience *</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-700 border ${formErrors.targetAudience ? 'border-red-500' : 'border-slate-600'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                >
                  {userTypes.map(userType => (
                    <option key={userType.value} value={userType.value}>{userType.label}</option>
                  ))}
                </select>
                {formErrors.targetAudience && <p className="text-red-400 text-xs mt-1">{formErrors.targetAudience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Channel *</label>
                <select
                  value={formData.deliveryChannel}
                  onChange={(e) => setFormData({ ...formData, deliveryChannel: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-700 border ${formErrors.deliveryChannel ? 'border-red-500' : 'border-slate-600'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                >
                  {deliveryChannels.map(channel => (
                    <option key={channel.value} value={channel.value}>{channel.label}</option>
                  ))}
                </select>
                {formErrors.deliveryChannel && <p className="text-red-400 text-xs mt-1">{formErrors.deliveryChannel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Schedule Send (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.sendAt}
                  onChange={(e) => setFormData({ ...formData, sendAt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-600 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-slate-300">
                  Public Notification
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
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
            Notifications List
          </h3>
          <div className="text-sm text-slate-300">
            Showing {filteredNotifications.length} of {notifications.length} total
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">TITLE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">TYPE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">TARGET</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">CHANNEL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">EXPRESS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                      <p className="text-sm mt-2">Try adjusting your search or filter terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredNotifications.map(notification => {
                  const typeConfig = notificationTypes.find(t => t.value === notification.type);
                  const statusConfig = statusTypes.find(s => s.value === notification.status);
                  const channelConfig = deliveryChannels.find(c => c.value === notification.deliveryChannel);
                  
                  return (
                    <tr key={notification._id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          <strong>{notification.title}</strong>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeConfig ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color} text-white`}>
                            {typeConfig.label}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {userTypes.find(t => t.value === notification.targetAudience)?.label || notification.targetAudience || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {channelConfig?.label || notification.deliveryChannel || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(notification.status)}
                          <span className="ml-2 text-sm text-slate-300 capitalize">
                            {notification.status || 'draft'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatDate(notification.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(notification)}
                            className="text-indigo-400 hover:text-indigo-300 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {notification.status !== 'sent' && (
                            <button
                              onClick={() => sendNotification(notification._id)}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => toggleStatus(notification._id)}
                            className="text-amber-400 hover:text-amber-300 p-1"
                            title={notification.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Eye className="h-4 w-4" />
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

export default AdminNotificationPanel;