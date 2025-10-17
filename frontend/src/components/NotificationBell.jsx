import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ className = "" }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotificationCount = async () => {
    try {
      if (!user) {
        setNotificationCount(0);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setNotificationCount(0);
        setLoading(false);
        return;
      }

      console.log('🔔 NotificationBell: Fetching notification count...');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/my-notifications`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            role: user?.role,
            userType: user?.role
          }
        }
      );

      console.log('🔔 NotificationBell: Response received:', response.data);
      const notificationsData = response.data.data || [];
      
      // Count unread notifications
      const unreadCount = notificationsData.filter(notification => !notification.isRead).length;
      console.log('🔔 NotificationBell: Unread count:', unreadCount);
      
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch count on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      // Set up interval to refresh count every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Refresh count when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchNotificationCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const handleBellClick = () => {
    navigate('/notifications');
  };

  if (loading) {
    return (
      <button 
        onClick={handleBellClick}
        className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
          <button
      onClick={handleBellClick}
      className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {notificationCount > 99 ? '99+' : notificationCount}
                          </span>
      )}
                            </button>
  );
};

export default NotificationBell;