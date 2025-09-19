// components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time updates with WebSocket or polling
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/my-notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const notificationsData = response.data.data || response.data.notifications || [];
      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock data for demo
      const mockNotifications = [
        {
          _id: '1',
          title: 'Welcome to BusZone+',
          message: 'Your account has been successfully created. Start exploring our services!',
          type: 'general',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Special Discount',
          message: 'Get 15% off on your first booking. Use code: WELCOME15',
          type: 'discount',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally if API fails
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Update locally if API fails
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
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
      
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      setNotifications(notifications.filter(n => n._id !== id));
      if (wasUnread) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Update locally if API fails
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      setNotifications(notifications.filter(n => n._id !== id));
      if (wasUnread) {
        setUnreadCount(prev => prev - 1);
      }
    }
  };

  const getNotificationIconColor = (type) => {
    switch (type) {
      case 'discount': return 'text-green-400';
      case 'alert': return 'text-red-400';
      case 'promotional': return 'text-purple-400';
      case 'seasonal': return 'text-amber-400';
      default: return 'text-blue-400';
    }
  };

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

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all duration-300 group"
      >
        <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <h3 className="font-semibold text-white text-lg">Notifications</h3>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center"
                  title="Mark all as read"
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Mark all
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
                <p className="text-slate-400 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No notifications yet</p>
                <p className="text-sm text-slate-500 mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-800/30 transition-all duration-200 group ${
                    !notification.isRead ? 'bg-slate-800/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                          !notification.isRead ? 'bg-amber-400 animate-pulse' : 'bg-transparent'
                        }`}></div>
                        <h4 className={`text-sm font-semibold truncate ${getNotificationIconColor(notification.type)}`}>
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-slate-700 bg-slate-800/50">
            <button 
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-center text-amber-400 hover:text-amber-300 text-sm font-medium py-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;