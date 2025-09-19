// pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Search, 
  Trash2, 
  Filter, 
  ChevronLeft,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Clock,
  Sparkles,
  AlertCircle,
  Tag,
  Megaphone,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchTerm, filter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const notificationsData = response.data.notifications || [];
      setNotifications(notificationsData);
      setFilteredNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to enhanced mock data
      const mockNotifications = [
        {
          _id: '1',
          title: '🚀 System Maintenance Scheduled',
          message: 'The system will undergo maintenance this Saturday from 2:00 AM to 4:00 AM. Please plan accordingly.',
          type: 'alert',
          targetUserType: 'all',
          expiryDate: '2024-12-31T23:59:59',
          isRead: false,
          isActive: true,
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: '🎉 New Features Available!',
          message: 'We\'ve launched exciting new dashboard features including advanced analytics and real-time tracking.',
          type: 'general',
          targetUserType: 'admin',
          expiryDate: null,
          isRead: true,
          isActive: true,
          priority: 'medium',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          title: '💰 Holiday Special Discount',
          message: 'Enjoy 25% off on all bookings during the festive season. Use code: HOLIDAY25 at checkout.',
          type: 'discount',
          targetUserType: 'passenger',
          expiryDate: '2024-12-25T23:59:59',
          isRead: false,
          isActive: true,
          priority: 'high',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          title: '📢 Summer Promotion Live',
          message: 'Summer travel packages are now available with exclusive benefits for premium members.',
          type: 'promotional',
          targetUserType: 'passenger',
          expiryDate: '2024-08-31T23:59:59',
          isRead: false,
          isActive: true,
          priority: 'medium',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          title: '⚠️ Service Interruption',
          message: 'Temporary service interruption expected in Northern routes due to weather conditions.',
          type: 'alert',
          targetUserType: 'passenger',
          expiryDate: '2024-01-15T23:59:59',
          isRead: true,
          isActive: true,
          priority: 'critical',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
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

    // Filter by type
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(notification => !notification.isRead);
      } else {
        filtered = filtered.filter(notification => notification.type === filter);
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const toggleNotificationSelection = (id) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    }
  };

  const markSelectedAsRead = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-multiple`, {
        ids: Array.from(selectedNotifications)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => 
        selectedNotifications.has(n._id) ? { ...n, isRead: true } : n
      ));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setNotifications(notifications.map(n => 
        selectedNotifications.has(n._id) ? { ...n, isRead: true } : n
      ));
      setSelectedNotifications(new Set());
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
      setSelectedNotifications(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(notifications.filter(n => n._id !== id));
    }
  };

  const deleteSelectedNotifications = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.size} notifications?`)) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        data: { ids: Array.from(selectedNotifications) },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.filter(n => !selectedNotifications.has(n._id)));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error deleting notifications:', error);
      setNotifications(notifications.filter(n => !selectedNotifications.has(n._id)));
      setSelectedNotifications(new Set());
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications([]);
      setFilteredNotifications([]);
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      setNotifications([]);
      setFilteredNotifications([]);
      setSelectedNotifications(new Set());
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert': return AlertCircle;
      case 'discount': return Tag;
      case 'promotional': return Megaphone;
      case 'seasonal': return Sun;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All', icon: Bell, color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { value: 'unread', label: 'Unread', icon: Eye, color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
    { value: 'alert', label: 'Alerts', icon: AlertCircle, color: 'bg-gradient-to-r from-red-500 to-pink-500' },
    { value: 'discount', label: 'Discounts', icon: Tag, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { value: 'promotional', label: 'Promotional', icon: Megaphone, color: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
    { value: 'seasonal', label: 'Seasonal', icon: Sun, color: 'bg-gradient-to-r from-yellow-500 to-amber-500' }
  ];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-lg text-slate-300 mb-2">Loading your notifications</p>
          <p className="text-sm text-slate-500">We're gathering your latest updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="relative">
                <Bell className="h-10 w-10 text-amber-400 mr-3" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-slate-400 text-sm">
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
                  {selectedNotifications.size > 0 && ` • ${selectedNotifications.size} selected`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>

            {selectedNotifications.size > 0 ? (
              <>
                <button
                  onClick={markSelectedAsRead}
                  className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <EyeOff className="h-4 w-4" />
                  <span>Mark Read</span>
                </button>
                <button
                  onClick={deleteSelectedNotifications}
                  className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  disabled={notifications.filter(n => !n.isRead).length === 0}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">🔍 Search Notifications</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title, message, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">🎚️ Filter by Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {notificationTypes.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      filter === value 
                        ? `${color} text-white shadow-lg` 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List/Grid */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <Bell className="h-24 w-24 text-slate-600/50 mx-auto" />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-300 mb-3">
              {searchTerm || filter !== 'all' ? 'No matching notifications' : 'All caught up! 🎉'}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'You\'re all up to date! New notifications will appear here when they arrive.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotifications.map(notification => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                    !notification.isRead 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-400/30 shadow-2xl' 
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-amber-400/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification._id)}
                    onChange={() => toggleNotificationSelection(notification._id)}
                    className="absolute top-4 right-4 w-5 h-5 rounded border-slate-600 bg-slate-700/50 focus:ring-amber-500"
                  />
                  
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-xl mr-4 ${
                      notification.type === 'discount' ? 'bg-green-500/20' :
                      notification.type === 'alert' ? 'bg-red-500/20' :
                      notification.type === 'promotional' ? 'bg-purple-500/20' :
                      notification.type === 'seasonal' ? 'bg-amber-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1 leading-tight">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {notification.targetUserType}
                    </span>
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded-md bg-amber-400/10 transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-md bg-red-400/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredNotifications.map(notification => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl group ${
                    !notification.isRead 
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-400/30 shadow-xl' 
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-amber-400/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification._id)}
                    onChange={() => toggleNotificationSelection(notification._id)}
                    className="absolute top-6 right-6 w-5 h-5 rounded border-slate-600 bg-slate-700/50 focus:ring-amber-500"
                  />
                  
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-xl mr-4 ${
                      notification.type === 'discount' ? 'bg-green-500/20' :
                      notification.type === 'alert' ? 'bg-red-500/20' :
                      notification.type === 'promotional' ? 'bg-purple-500/20' :
                      notification.type === 'seasonal' ? 'bg-amber-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-slate-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {notification.targetUserType}
                      </span>
                      {notification.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      )}
                      {notification.expiryDate && (
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expires: {new Date(notification.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-sm text-amber-400 hover:text-amber-300 px-3 py-1 rounded-md bg-amber-400/10 transition-colors hover:bg-amber-400/20"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded-md bg-red-400/10 transition-colors hover:bg-red-400/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;