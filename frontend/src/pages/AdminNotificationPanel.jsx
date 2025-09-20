import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  Search, 
  Filter,
  BarChart3,
  Users,
  Calendar,
  Send,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    expiresAt: '',
    isActive: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchTerm, filter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Handle different response structures
      let notificationsData = [];
      
      if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        notificationsData = response.data.data;
      } else if (response.data && response.data.notifications) {
        notificationsData = response.data.notifications;
      } else if (response.data && response.data.success) {
        notificationsData = response.data.data || [];
      }
      
      setNotifications(notificationsData);
      setError('');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(notification => {
        if (filter === 'active') return notification.isActive;
        if (filter === 'inactive') return !notification.isActive;
        return notification.type === filter;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTermLower) ||
        notification.message.toLowerCase().includes(searchTermLower) ||
        (notification.type && notification.type.toLowerCase().includes(searchTermLower))
      );
    }

    setFilteredNotifications(filtered);
  };

  const createNotification = async () => {
    try {
      // Validate required fields
      if (!newNotification.title.trim() || !newNotification.message.trim()) {
        setError('Title and message are required');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Prepare data for API
      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        targetAudience: newNotification.targetAudience,
        isActive: newNotification.isActive,
        expiresAt: newNotification.expiresAt || null
      };

      console.log('Sending notification data:', notificationData);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
        notificationData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Response from server:', response.data);
      
      // Handle response
      if (response.data && response.data.success) {
        const createdNotification = response.data.data;
        setNotifications(prev => [createdNotification, ...prev]);
        
        setShowCreateModal(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'general',
          targetAudience: 'all',
          expiresAt: '',
          isActive: true
        });
        setError('');
        setSuccess('Notification created successfully!');
        
        // Auto hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to create notification: Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        setError(error.response.data.message || 'Failed to create notification');
      } else {
        setError('Failed to create notification: Network error');
      }
    }
  };

  const updateNotification = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        updates,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle different response structures
      let updatedNotification = null;
      
      if (response.data && response.data.success) {
        updatedNotification = response.data.data;
      } else if (response.data) {
        updatedNotification = response.data.data || response.data.notification || response.data;
      }
      
      if (updatedNotification) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === id ? updatedNotification : notification
          )
        );
        setSuccess('Notification updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        fetchNotifications();
      }
      
      setEditingNotification(null);
      setError('');
    } catch (error) {
      console.error('Error updating notification:', error);
      setError(error.response?.data?.message || 'Failed to update notification');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      setSuccess('Notification deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  const toggleNotificationStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/status`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Handle different response structures
      let updatedNotification = null;
      
      if (response.data && response.data.success) {
        updatedNotification = response.data.data;
      } else if (response.data) {
        updatedNotification = response.data.data || response.data.notification || response.data;
      }
      
      if (updatedNotification) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === id ? updatedNotification : notification
          )
        );
        setSuccess(`Notification ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        fetchNotifications();
      }
      setError('');
    } catch (error) {
      console.error('Error toggling notification status:', error);
      setError(error.response?.data?.message || 'Failed to update notification status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError('')} className="absolute top-0 right-0 p-3">
              <span className="text-red-700">×</span>
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{success}</span>
            <button onClick={() => setSuccess('')} className="absolute top-0 right-0 p-3">
              <span className="text-green-700">×</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center">
            <Bell className="h-10 w-10 text-blue-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
              <p className="text-gray-600">Create and manage notifications for all users</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mt-4 lg:mt-0"
          >
            <Plus className="h-5 w-5" />
            <span>Create Notification</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Notifications</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title, message, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Notifications</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="all">All Notifications</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="general">General</option>
                  <option value="discount">Discounts</option>
                  <option value="promotional">Promotional</option>
                  <option value="alert">Alerts</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notifications found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Notification
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {notification.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.targetAudience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notification.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingNotification({...notification})}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleNotificationStatus(notification._id, notification.isActive)}
                            className={notification.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this notification?')) {
                                deleteNotification(notification._id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Create New Notification</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification message"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="discount">Discount</option>
                    <option value="promotional">Promotional</option>
                    <option value="alert">Alert</option>
                    <option value="booking">Booking</option>
                    <option value="reminder">Reminder</option>
                    <option value="package">Package</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={newNotification.targetAudience}
                    onChange={(e) => setNewNotification({...newNotification, targetAudience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="passengers">Passengers Only</option>
                    <option value="drivers">Drivers Only</option>
                    <option value="staff">Staff Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newNotification.expiresAt}
                    onChange={(e) => setNewNotification({...newNotification, expiresAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newNotification.isActive}
                    onChange={(e) => setNewNotification({...newNotification, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Notification Modal */}
        {editingNotification && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Edit Notification</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={editingNotification.title}
                    onChange={(e) => setEditingNotification({...editingNotification, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={editingNotification.message}
                    onChange={(e) => setEditingNotification({...editingNotification, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingNotification.type}
                    onChange={(e) => setEditingNotification({...editingNotification, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="discount">Discount</option>
                    <option value="promotional">Promotional</option>
                    <option value="alert">Alert</option>
                    <option value="booking">Booking</option>
                    <option value="reminder">Reminder</option>
                    <option value="package">Package</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={editingNotification.targetAudience}
                    onChange={(e) => setEditingNotification({...editingNotification, targetAudience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="passengers">Passengers Only</option>
                    <option value="drivers">Drivers Only</option>
                    <option value="staff">Staff Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={editingNotification.expiresAt ? new Date(editingNotification.expiresAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingNotification({...editingNotification, expiresAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingNotification.isActive}
                    onChange={(e) => setEditingNotification({...editingNotification, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingNotification(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateNotification(editingNotification._id, editingNotification)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationPanel;