import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, Bell } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetUserType: 'all',
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchTerm, notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data);
      setFilteredNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (!searchTerm) {
      setFilteredNotifications(notifications);
      return;
    }

    const filtered = notifications.filter(notification =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.targetUserType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredNotifications(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotification) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${editingNotification._id}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Notification updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
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
      targetUserType: notification.targetUserType,
      expiryDate: notification.expiryDate ? notification.expiryDate.split('T')[0] : '',
      isActive: notification.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
      targetUserType: 'all',
      expiryDate: '',
      isActive: true
    });
    setEditingNotification(null);
    setShowForm(false);
  };

  const sendTestNotification = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/test`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const notificationTypes = [
    { value: 'general', label: 'General', color: 'bg-gray-500' },
    { value: 'discount', label: 'Discount', color: 'bg-green-500' },
    { value: 'package', label: 'Package', color: 'bg-blue-500' },
    { value: 'alert', label: 'Alert', color: 'bg-red-500' },
    { value: 'reminder', label: 'Reminder', color: 'bg-yellow-500' },
    { value: 'booking', label: 'Booking Confirmation', color: 'bg-indigo-500' },
    { value: 'promotional', label: 'Promotional', color: 'bg-purple-500' },
    { value: 'seasonal', label: 'Seasonal Offer', color: 'bg-amber-500' }
  ];

  const userTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'admin', label: 'Admins' },
    { value: 'driver', label: 'Drivers' },
    { value: 'staff', label: 'Staff' },
    { value: 'passenger', label: 'Passengers' }
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
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Notification</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target User Type</label>
                <select
                  value={formData.targetUserType}
                  onChange={(e) => setFormData({ ...formData, targetUserType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {userTypes.map(userType => (
                    <option key={userType.value} value={userType.value}>{userType.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
                Active
              </label>
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
        <div className="p-4 bg-slate-700">
          <h3 className="text-lg font-semibold text-white">
            Notifications ({filteredNotifications.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                    {searchTerm && (
                      <p className="text-sm mt-2">Try adjusting your search terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredNotifications.map(notification => {
                  const typeConfig = notificationTypes.find(t => t.value === notification.type);
                  return (
                    <tr key={notification._id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{notification.title}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{notification.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig?.color} text-white`}>
                          {typeConfig?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {userTypes.find(t => t.value === notification.targetUserType)?.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {notification.expiryDate ? new Date(notification.expiryDate).toLocaleDateString() : 'Never'}
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

export default AdminNotificationPanel;