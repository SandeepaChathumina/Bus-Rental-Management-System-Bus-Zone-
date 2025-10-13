import React, { useState, useEffect } from "react";
import {
  Bell, ChevronLeft, Search, Clock,
  Users, Sparkles, Eye, Trash2, Battery, Zap, Gift, AlertCircle, Star, Package
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dummy notifications data
  const dummyNotifications = [
    {
      _id: '1',
      title: 'Charging Complete',
      message: 'Your vehicle is fully charged and ready for your next trip. Battery level is at 100%.',
      type: 'charging',
      targetAudience: 'passengers',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      createdBy: 'system'
    },
    {
      _id: '2',
      title: 'Spacious Ride Available',
      message: 'Extra legroom available in your selected ride category. Upgrade now for more comfort!',
      type: 'spacious',
      targetAudience: 'passengers',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      createdBy: 'system'
    },
    {
      _id: '3',
      title: 'Special Discount',
      message: 'Get 20% off on your next booking. Use code: BUS20 at checkout. Limited time offer!',
      type: 'discount',
      targetAudience: 'all',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      createdBy: 'admin'
    },
    {
      _id: '4',
      title: 'Booking Confirmed',
      message: 'Your booking #BUS12345 has been confirmed. Departure: Tomorrow 8:00 AM from Colombo Fort.',
      type: 'booking',
      targetAudience: 'passengers',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      createdBy: 'system'
    },
    {
      _id: '5',
      title: 'Security Alert',
      message: 'Please verify your account for enhanced security. Click here to complete verification.',
      type: 'alert',
      targetAudience: 'all',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      createdBy: 'admin'
    },
    {
      _id: '6',
      title: 'New Package Available',
      message: 'Check out our new premium package with additional amenities and luxury services.',
      type: 'package',
      targetAudience: 'passengers',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      createdBy: 'admin'
    }
  ];

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token || !user) {
        // If no user/token, use dummy data
        console.log('🔔 Using dummy notifications data');
        setNotifications(dummyNotifications);
        return;
      }

      console.log('🔔 NotificationBell: Fetching notifications...');
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
      console.log('🔔 NotificationBell: Raw notifications:', notificationsData);

      // If no notifications from backend, use dummy data
      let finalData = notificationsData;
      if (notificationsData.length === 0) {
        console.log('🔔 No notifications from backend, using dummy data');
        finalData = dummyNotifications;
      }
      
      console.log('🔔 NotificationBell: Using notifications:', finalData);

      const sortedData = finalData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sortedData);
    } catch (error) {
      console.error('Error fetching notifications, using dummy data:', error);
      // Use dummy data if API fails
      setNotifications(dummyNotifications);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Auto refresh + instant on login
  useEffect(() => {
    if (user) {
      fetchNotifications(); // run immediately
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];

    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filter !== "all") {
      filtered = filtered.filter((n) => n.type === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.message.toLowerCase().includes(term) ||
          n.type.toLowerCase().includes(term)
      );
    }

    setFilteredNotifications(filtered);
  }, [searchTerm, filter, notifications]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      // Only call API if it's a real notification (not dummy)
      if (!id.startsWith('dummy-')) {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      // Only call API if it's a real notification (not dummy)
      if (!id.startsWith('dummy-')) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "charging": return Battery;
      case "spacious": return Zap;
      case "discount": return Gift;
      case "alert": return AlertCircle;
      case "booking": return Bell;
      case "package": return Package;
      case "promotional": return Star;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "charging": return "from-blue-600 to-cyan-600";
      case "spacious": return "from-green-600 to-emerald-600";
      case "discount": return "from-yellow-600 to-amber-600";
      case "alert": return "from-red-600 to-pink-600";
      case "promotional": return "from-purple-600 to-indigo-600";
      case "booking": return "from-indigo-600 to-blue-600";
      case "package": return "from-orange-600 to-red-600";
      default: return "from-gray-600 to-slate-600";
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case "charging": return "bg-gradient-to-r from-blue-500/10 to-cyan-500/10";
      case "spacious": return "bg-gradient-to-r from-green-500/10 to-emerald-500/10";
      case "discount": return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10";
      case "alert": return "bg-gradient-to-r from-red-500/10 to-pink-500/10";
      default: return "bg-gradient-to-r from-gray-500/10 to-slate-500/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
          >
            <ChevronLeft className="h-5 w-5 text-gray-300" />
          </button>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-400" /> Notifications
          </h1>
          <div className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "unread", "charging", "spacious", "discount", "alert", "booking", "package"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-full transition font-medium ${
                  filter === f
                    ? `bg-gradient-to-r ${getNotificationColor(f)} text-white shadow`
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-green-400">
                {notifications.filter(n => n.isRead).length} read
              </span>
              <span className="text-blue-400">
                {notifications.filter(n => !n.isRead).length} unread
              </span>
            </div>
            <button 
              onClick={() => {
                const unreadNotifications = notifications.filter(n => !n.isRead);
                unreadNotifications.forEach(notification => markAsRead(notification._id));
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="mx-auto h-16 w-16 text-blue-400 animate-bounce mb-4" />
              <p className="text-xl font-semibold">No notifications found</p>
              <p className="text-gray-400 mt-2">
                {searchTerm ? "Try adjusting your search" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const IconComponent = getNotificationIcon(n.type);
              return (
                <div
                  key={n._id}
                  className={`p-4 rounded-2xl shadow-md border transition-all hover:scale-[1.01] hover:shadow-lg ${
                    !n.isRead ? "border-blue-400" : "border-gray-700"
                  } ${getNotificationBgColor(n.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${getNotificationColor(
                        n.type
                      )} text-white shadow flex-shrink-0`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-lg ${
                              !n.isRead ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {n.title}
                          </h3>
                          <p className="text-gray-400 mt-1 text-sm leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap ml-4">
                          <Clock className="h-3 w-3" />
                          {formatTime(n.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> 
                            <span className="capitalize">{n.targetAudience}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            n.type === 'charging' ? 'bg-blue-500/20 text-blue-300' :
                            n.type === 'spacious' ? 'bg-green-500/20 text-green-300' :
                            n.type === 'discount' ? 'bg-yellow-500/20 text-yellow-300' :
                            n.type === 'alert' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {n.type}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!n.isRead && (
                            <button
                              onClick={() => markAsRead(n._id)}
                              className="px-3 py-1 rounded bg-blue-900 text-blue-300 hover:bg-blue-800 transition flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Mark read
                            </button>
                          )}
                          {/* Only allow admins or creators to delete notifications */}
                          {(user.role === "admin" || n.createdBy === user.id) && (
                            <button
                              onClick={() => deleteNotification(n._id)}
                              className="px-3 py-1 rounded bg-red-900 text-red-300 hover:bg-red-800 transition flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer">Debug Information</summary>
            <div className="mt-2 space-y-2">
              <p>Total notifications: {notifications.length}</p>
              <p>Filtered notifications: {filteredNotifications.length}</p>
              <p>Current filter: {filter}</p>
              <p>User role: {user?.role}</p>
              <p>Using dummy data: {notifications.some(n => dummyNotifications.find(d => d._id === n._id)) ? 'Yes' : 'No'}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;