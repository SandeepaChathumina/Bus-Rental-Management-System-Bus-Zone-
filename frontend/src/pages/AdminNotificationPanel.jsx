import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Bell, Search, Filter, Eye, X, Save
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
  const [viewingNotification, setViewingNotification] = useState(null);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let notificationsData = [];
      if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data?.data) {
        notificationsData = response.data.data;
      } else if (response.data?.notifications) {
        notificationsData = response.data.notifications;
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

    if (filter !== 'all') {
      filtered = filtered.filter(notification => {
        if (filter === 'active') return notification.isActive;
        if (filter === 'inactive') return !notification.isActive;
        return notification.type === filter;
      });
    }

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

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
        newNotification,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Notification created successfully!');
        setShowCreateModal(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'general',
          targetAudience: 'all',
          expiresAt: '',
          isActive: true
        });
        fetchNotifications();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setError('Failed to create notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${editingNotification._id}`,
        editingNotification,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Notification updated successfully!');
        setEditingNotification(null);
        fetchNotifications();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setError('Failed to update notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Notification deleted successfully!');
        fetchNotifications();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`Notification ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchNotifications();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling notification status:', error);
      setError('Failed to update notification status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const NotificationForm = ({ notification, onSubmit, onCancel, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={notification.title}
                  onChange={(e) => setEditingNotification({...notification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  required
                  value={notification.message}
                  onChange={(e) => setEditingNotification({...notification, message: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={notification.type}
                  onChange={(e) => setEditingNotification({...notification, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="discount">Discount</option>
                  <option value="promotional">Promotional</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                <select
                  value={notification.targetAudience}
                  onChange={(e) => setEditingNotification({...notification, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="all">All Users</option>
                  <option value="customer">Customers Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date</label>
                <input
                  type="datetime-local"
                  value={notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditingNotification({...notification, expiresAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={notification.isActive}
                  onChange={(e) => setEditingNotification({...notification, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Active Notification
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const NotificationDetailModal = ({ notification, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <p className="text-gray-900 dark:text-white">{notification.title}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{notification.message}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <p className="text-gray-900 dark:text-white capitalize">{notification.type}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                <p className="text-gray-900 dark:text-white capitalize">{notification.targetAudience}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                  notification.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {notification.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                <p className="text-gray-900 dark:text-white">{new Date(notification.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {notification.expiresAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At</label>
                <p className="text-gray-900 dark:text-white">{new Date(notification.expiresAt).toLocaleString()}</p>
              </div>
            )}
            
            {notification.createdBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created By</label>
                <p className="text-gray-900 dark:text-white">
                  {notification.createdBy.firstName} {notification.createdBy.lastName}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center">
            <Bell className="h-10 w-10 text-blue-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Create and manage notifications for all users</p>
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

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white appearance-none"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="general">General</option>
                  <option value="discount">Discount</option>
                  <option value="promotional">Promotional</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No notifications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Title & Message
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Target</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-gray-200 font-semibold">{notification.title}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs">
                          {notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {notification.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{notification.targetAudience}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(notification._id, notification.isActive)}
                          className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full cursor-pointer ${
                            notification.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => setViewingNotification(notification)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Eye className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => setEditingNotification({...notification})}
                          className="text-yellow-500 hover:text-yellow-700"
                        >
                          <Edit className="h-5 w-5 inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <NotificationForm
          notification={newNotification}
          onSubmit={handleCreateNotification}
          onCancel={() => setShowCreateModal(false)}
          title="Create New Notification"
        />
      )}

      {/* Edit Notification Modal */}
      {editingNotification && (
        <NotificationForm
          notification={editingNotification}
          onSubmit={handleUpdateNotification}
          onCancel={() => setEditingNotification(null)}
          title="Edit Notification"
        />
      )}

      {/* View Notification Detail Modal */}
      {viewingNotification && (
        <NotificationDetailModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
        />
      )}
    </div>
  );
};

export default AdminNotificationPanel;