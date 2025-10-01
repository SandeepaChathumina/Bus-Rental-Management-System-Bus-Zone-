import React, { useState, useEffect } from "react";
import {
  Bell,
  ChevronLeft,
  Search,
  Clock,
  Users,
  Sparkles,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Gift,
  Package,
  Shield,
  BarChart3,
  Share
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
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    readRate: 100
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter categories with icons
  const filterCategories = [
    { id: "all", label: "All", icon: Bell },
    { id: "unread", label: "Unread", icon: EyeOff },
    { id: "alert", label: "Alerts", icon: AlertCircle },
    { id: "discount", label: "Discounts", icon: Star },
    { id: "promotional", label: "Promotional", icon: Gift },
    { id: "seasonal", label: "Seasonal", icon: Calendar },
    { id: "booking", label: "Bookings", icon: CheckCircle },
    { id: "reminder", label: "Reminders", icon: Clock },
    { id: "package", label: "Packages", icon: Package },
    { id: "security", label: "Security", icon: Shield }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
    calculateStats();
  }, [searchTerm, filter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log('🔔 Frontend: Fetching notifications...');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/my-notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('🔔 Frontend: Response received:', response.data);
      const notificationsData = response.data.data || [];
      console.log('🔔 Frontend: Notifications data:', notificationsData);
      const userRole = user?.role || "passenger";

      // Backend already handles filtering, so use data directly
      const filteredData = notificationsData;

      const sortedData = filteredData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sortedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const readRate = total > 0 ? ((total - unread) / total * 100).toFixed(1) : 100;
    
    setStats({
      total,
      unread,
      readRate
    });
  };

  const filterNotifications = () => {
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
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(
        notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAsUnread = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/unread`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(
        notifications.map((n) =>
          n._id === id ? { ...n, isRead: false } : n
        )
      );
    } catch (error) {
      console.error("Error marking as unread:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
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
      case "alert":
        return AlertCircle;
      case "discount":
        return Star;
      case "promotional":
        return Gift;
      case "seasonal":
        return Calendar;
      case "booking":
        return CheckCircle;
      case "security":
        return Shield;
      case "reminder":
        return Clock;
      case "package":
        return Package;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "alert":
        return "bg-red-900/30 text-red-400";
      case "discount":
        return "bg-green-900/30 text-green-400";
      case "promotional":
        return "bg-purple-900/30 text-purple-400";
      case "seasonal":
        return "bg-amber-900/30 text-amber-400";
      case "booking":
        return "bg-blue-900/30 text-blue-400";
      case "security":
        return "bg-gray-800 text-gray-400";
      case "reminder":
        return "bg-cyan-900/30 text-cyan-400";
      case "package":
        return "bg-indigo-900/30 text-indigo-400";
      default:
        return "bg-gray-800 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg font-medium">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-6 text-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-gray-800 shadow-sm hover:bg-gray-700 transition"
            >
              <ChevronLeft className="h-5 w-5 text-gray-300" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 md:h-8 md:w-8 text-blue-400" /> Notifications
            </h1>
            <div className="text-sm text-gray-300 bg-blue-900/30 px-3 py-1 rounded-full">
              {stats.total} notification{stats.total !== 1 ? 's' : ''}
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg shadow-sm hover:bg-gray-700 text-gray-200">
            <Share className="h-4 w-4" /> Share
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with stats and filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics Card */}
            <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700">
              <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" /> Total Notifications
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Read Rate</span>
                  <span className="font-bold text-green-400">{stats.readRate}%</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.readRate}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{stats.total - stats.unread} read</span>
                  <span>{stats.unread} unread</span>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-700">
              <h2 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-400" /> Filter by Category
              </h2>
              
              <div className="space-y-2">
                {filterCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilter(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                        filter === category.id
                          ? "bg-blue-900/30 text-blue-300 font-medium"
                          : "text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, message, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-700 text-gray-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-300">
                {filteredNotifications.length} items
              </h3>
              
              <button 
                onClick={markAllAsRead}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Mark all as read
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 rounded-xl shadow-sm border border-gray-700">
                  <Sparkles className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                  <p className="text-lg font-medium text-gray-400">
                    No notifications found
                  </p>
                  <p className="text-gray-500 mt-2">
                    {searchTerm ? "Try adjusting your search" : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const IconComponent = getNotificationIcon(n.type);
                  return (
                    <div
                      key={n._id}
                      className={`p-5 rounded-xl shadow-sm bg-gray-800 border-l-4 ${
                        !n.isRead ? "border-blue-500" : "border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${getNotificationColor(n.type)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-medium ${!n.isRead ? "text-white" : "text-gray-300"}`}>
                                {n.title}
                              </h3>
                              <p className="text-gray-400 mt-1 text-sm">{n.message}</p>
                            </div>
                            
                            <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {formatTime(n.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="h-3 w-3" /> {n.targetAudience}
                            </span>
                            
                            <div className="flex gap-2">
                              {!n.isRead ? (
                                <button
                                  onClick={() => markAsRead(n._id)}
                                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Mark as read
                                </button>
                              ) : (
                                <button
                                  onClick={() => markAsUnread(n._id)}
                                  className="text-xs text-gray-400 hover:text-gray-300 font-medium flex items-center gap-1"
                                >
                                  <EyeOff className="h-3.5 w-3.5" /> Mark as unread
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;