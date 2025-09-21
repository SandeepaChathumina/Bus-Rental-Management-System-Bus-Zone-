import React, { useState, useEffect } from "react";
import {
  Bell, ChevronLeft, Search, Clock,
  Users, Sparkles, Eye, Trash2
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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const notificationsData = response.data.data || [];
      const userRole = user?.role || "passenger";

      // Filter notifications based on user role
      const filteredData = notificationsData.filter(
        (n) =>
          n.isActive &&
          (n.targetAudience === "all" ||
           n.targetAudience === "all_users" ||
           n.targetAudience === userRole ||
           (userRole === "admin" && n.createdBy === user.id) || // Admins see their own notifications
           (n.specificUsers && n.specificUsers.includes(user.id))) // Notifications for specific users
      );

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
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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

  const getNotificationColor = (type) => {
    switch (type) {
      case "alert": return "from-red-600 to-pink-600";
      case "discount": return "from-green-600 to-emerald-600";
      case "promotional": return "from-purple-600 to-indigo-600";
      case "seasonal": return "from-amber-600 to-orange-600";
      case "booking": return "from-indigo-600 to-blue-600";
      default: return "from-gray-600 to-slate-600";
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
            {["all", "unread", "alert", "discount", "promotional"].map((f) => (
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

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="mx-auto h-16 w-16 text-blue-400 animate-bounce mb-4" />
              <p className="text-xl font-semibold">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-2xl shadow-md bg-gray-800 border transition hover:scale-[1.01] ${
                  !n.isRead ? "border-blue-400" : "border-gray-700"
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-r ${getNotificationColor(
                      n.type
                    )} text-white shadow`}
                  >
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-semibold ${
                          !n.isRead ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {n.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">{n.message}</p>

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {n.targetAudience}
                      </span>
                      <div className="flex gap-2">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="px-2 py-1 rounded bg-blue-900 text-blue-300 hover:bg-blue-800 transition"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                        {/* Only allow admins or creators to delete notifications */}
                        {(user.role === "admin" || n.createdBy === user.id) && (
                          <button
                            onClick={() => deleteNotification(n._id)}
                            className="px-2 py-1 rounded bg-red-900 text-red-300 hover:bg-red-800 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;