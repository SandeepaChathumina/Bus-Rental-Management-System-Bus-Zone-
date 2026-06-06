// src/pages/bookingContainer/Booking.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingSearch from './BookingSearch';
import { 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  LogOut, 
  Bell,
  Bus,
  Calendar,
  Clock,
  Shield,
  Wifi,
  Coffee,
  Snowflake,
  Sparkles,
  X,
  Eye,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// NotificationBell Component
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch from API first
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/my-notifications`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Handle different response structures
        const notificationsData = response.data.data || response.data.notifications || response.data || [];
        
        // Filter notifications to only show active ones and those targeted to the user
        const userRole = user?.role || 'passenger';
        const filteredData = notificationsData.filter(notification => 
          notification.isActive && 
          (notification.targetAudience === 'all' || 
           notification.targetAudience === userRole ||
           notification.targetAudience === 'all_users')
        );
        
        // Sort by creation date, newest first
        const sortedData = filteredData.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5);
        
        setNotifications(sortedData);
        
        // Calculate unread count
        const unread = sortedData.filter(n => 
          !n.readBy?.includes(user._id) && 
          !n.readStatus && 
          !n.isRead
        ).length;
        setUnreadCount(unread);
        return;
      } catch (apiError) {
        console.error('API fetch failed, using sample data:', apiError);
      }
      
      // Fallback to sample data
      const sampleNotifications = [
        {
          _id: '1',
          title: 'Welcome to BusZone+',
          message: 'Your account has been successfully created. Start exploring our services!',
          type: 'general',
          readBy: [],
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Special Discount',
          message: 'Get 15% off on your first booking. Use code: WELCOME15',
          type: 'discount',
          readBy: ['user123'],
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.readBy.includes(user?._id) && !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      // Try API call first
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (apiError) {
        console.error('API call failed, updating locally:', apiError);
      }
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === id ? { 
          ...n, 
          readBy: [...(n.readBy || []), user._id], 
          readStatus: true,
          isRead: true 
        } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(notifications.map(n => 
        n._id === id ? { 
          ...n, 
          readBy: [...(n.readBy || []), user._id], 
          readStatus: true,
          isRead: true 
        } : n
      ));
      setUnreadCount(prev => prev - 1);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try API call first
      try {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-all`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (apiError) {
        console.error('API call failed, updating locally:', apiError);
      }
      
      // Update all notifications as read
      setNotifications(notifications.map(n => ({ 
        ...n, 
        readBy: [...(n.readBy || []), user._id],
        readStatus: true,
        isRead: true 
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(notifications.map(n => ({ 
        ...n, 
        readBy: [...(n.readBy || []), user._id],
        readStatus: true,
        isRead: true 
      })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      // Try API call first
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (apiError) {
        console.error('API call failed, updating locally:', apiError);
      }
      
      // Update local state
      const wasUnread = notifications.find(n => 
        n._id === id && 
        !n.readBy?.includes(user._id) && 
        !n.readStatus && 
        !n.isRead
      );
      setNotifications(notifications.filter(n => n._id !== id));
      if (wasUnread) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      const wasUnread = notifications.find(n => 
        n._id === id && 
        !n.readBy?.includes(user._id) && 
        !n.readStatus && 
        !n.isRead
      );
      setNotifications(notifications.filter(n => n._id !== id));
      if (wasUnread) {
        setUnreadCount(prev => prev - 1);
      }
    }
  };

  const getNotificationIconColor = (type) => {
    switch (type) {
      case 'discount': return 'text-green-600';
      case 'alert': return 'text-red-600';
      case 'promotional': return 'text-purple-600';
      case 'seasonal_offer': return 'text-amber-600';
      case 'booking_confirmation': return 'text-indigo-600';
      case 'reminder': return 'text-yellow-600';
      case 'package': return 'text-blue-600';
      default: return 'text-blue-600';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Recently';
    
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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 group"
      >
        <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-blue-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-blue-200 flex justify-between items-center bg-blue-50/50">
            <h3 className="font-semibold text-gray-800 text-lg">Notifications</h3>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  title="Mark all as read"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark all
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              notifications.map(notification => {
                const isRead = notification.readBy?.includes(user._id) || 
                               notification.readStatus || 
                               notification.isRead;
                
                return (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-blue-100 hover:bg-blue-50/50 transition-all duration-200 group ${
                      !isRead ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => !isRead && markAsRead(notification._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                            !isRead ? 'bg-blue-500 animate-pulse' : 'bg-transparent'
                          }`}></div>
                          <h4 className={`text-sm font-semibold truncate ${getNotificationIconColor(notification.type)}`}>
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                                title="Mark as read"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-3 border-t border-blue-200 bg-blue-50/50">
            <button 
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 rounded-lg hover:bg-blue-100/50 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Component
const Category = () => {
  return (
    <div className='w-full px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-50 to-sky-50'>
      <div className="max-w-7xl mx-auto">
        <div className="w-full items-center flex justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-800">
            Browse by Category
          </h2>
          <Link to={"/bus"} className='text-blue-600 hover:text-sky-600 transition-colors font-medium'>
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Standard', color: 'from-blue-500 to-blue-600' },
            { name: 'Mini', color: 'from-sky-500 to-blue-500' },
            { name: 'Luxury', color: 'from-blue-500 to-indigo-500' }
          ].map((category, index) => (
            <div key={index} className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg border border-blue-200/50">
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <div className="h-40 mb-4 flex items-center justify-center">
                <Bus className="h-20 w-20 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center">{category.name}</h3>
              <div className="flex justify-center mt-4">
                <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Seasonal Offers Preview Component
const SeasonalOffersPreview = () => {
  return (
    <div className='w-full px-6 lg:px-8 py-16 bg-gradient-to-b from-sky-50 to-blue-50'>
      <div className="max-w-7xl mx-auto">
        <div className="w-full items-center flex justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-800">
            Seasonal Offers
          </h2>
          <Link to={"/offers"} className="flex items-center text-blue-600 hover:text-sky-600 transition-colors font-medium">
            View All
            <Sparkles className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summer Offer */}
          <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300 border border-amber-200/50">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-200 rounded-full opacity-30 group-hover:opacity-40 transition-opacity"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full mb-3">
                  ☀️ Summer Special
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  25% Off Coastal Destinations
                </h3>
                <p className="text-gray-600 mb-4">
                  Beat the heat with our summer special! Perfect for family vacations.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Valid until: Aug 31, 2024</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-lg font-bold px-4 py-2 rounded-lg">
                25%
              </div>
            </div>
          </div>
          
          {/* Winter Offer */}
          <div className="relative bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300 border border-blue-200/50">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-200 rounded-full opacity-30 group-hover:opacity-40 transition-opacity"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-3">
                  ❄️ Winter Holiday
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  30% Off Mountain Getaways
                </h3>
                <p className="text-gray-600 mb-4">
                  Cozy up this winter with special holiday packages for Christmas.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Valid until: Dec 25, 2024</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-lg font-bold px-4 py-2 rounded-lg">
                30%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
const BookingNavbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? You will be redirected to the login page.')) {
      logout();
      setShowProfileDropdown(false);
      navigate('/login');
    }
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleMyBookingsClick = () => {
    navigate('/mybookings');
  };

  const handleFeedbackClick = () => {
    navigate('/feedback');
  };

  const handleLostFoundClick = () => {
    navigate('/lost-found');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <div className='w-full h-[80px] bg-white/95 backdrop-blur-xl border-b border-blue-200/50 flex items-center px-6 lg:px-8 fixed top-0 z-50 shadow-lg'>
      {/* Logo section */}
      <Link to={"/"} className='mr-16 flex items-center space-x-3'>
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-500 to-sky-500 p-2 rounded-xl shadow-lg">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-sky-400 w-3 h-3 rounded-full"></div>
        </div>
        <div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            BusZone+
          </div>
          <div className="text-xs text-gray-600">
            Premium Bus Rentals
          </div>
        </div>
      </Link>

      {/* Right side section */}
      <div className="flex items-center space-x-6 ml-auto">
        {/* My Bookings Button */}
        <button 
          onClick={handleMyBookingsClick}
          className="hidden md:flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl transition-all duration-300 border border-blue-200"
        >
          <span className="text-sm font-medium">My Bookings</span>
        </button>

        {/* Feedback Button */}
        <button 
          onClick={handleFeedbackClick}
          className="hidden md:flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl transition-all duration-300 border border-blue-200"
        >
          <span className="text-sm font-medium">Feedback</span>
        </button>

        {/* Lost & Found Button */}
        <button 
          onClick={handleLostFoundClick}
          className="hidden md:flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl transition-all duration-300 border border-blue-200"
        >
          <span className="text-sm font-medium">Lost & Found</span>
        </button>

        {/* Notification Bell */}
        <NotificationBell />
        
        {/* Contact Info */}
        <div className="hidden md:flex items-center space-x-2 text-gray-600 group">
          <div className="relative">
            <Phone className="h-4 w-4 text-blue-500 group-hover:animate-bounce" />
            <div className="absolute -top-1 -right-1 bg-blue-500 w-2 h-2 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm group-hover:text-blue-600 transition-colors">
            +94 704 222 777
          </span>
        </div>
        
        {/* User section */}
        {user ? (
          <div className="flex items-center space-x-3 profile-dropdown">
            {/* Profile Icon with Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 flex items-center justify-center text-white font-semibold shadow-lg hover:scale-105 transition-transform"
                title="View Profile"
              >
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-blue-200">
                  <div className="px-4 py-2 border-b border-blue-200">
                    <p className="text-sm font-medium text-gray-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Hero Section
const BookingHero = () => {
  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden bg-gradient-to-br from-blue-50 to-sky-100 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 border border-blue-300/50 mb-6">
              <span className="text-blue-700 font-semibold">Book Your Journey</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Luxury Bus <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">Travel</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Experience premium comfort with our luxury fleet. Book your next journey with ease and enjoy world-class amenities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Book Now
              </button>
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-300 shadow-md">
                View Fleet
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-sky-400/30 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/50 shadow-xl">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Wifi, label: "Free WiFi", color: "text-blue-600" },
                  { icon: Coffee, label: "Refreshments", color: "text-sky-600" },
                  { icon: Snowflake, label: "AC & Heating", color: "text-blue-600" },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`${item.color} p-2 rounded-xl bg-blue-50 w-fit mx-auto mb-2`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-4 mb-6 border border-blue-200/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-800 font-semibold">Premium Features</h3>
                  <Shield className="h-5 w-5 text-sky-600" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Leather Seats", "Entertainment", "USB Charging", "Spacious"].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-sky-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="w-full px-6 lg:px-8 py-12 bg-gradient-to-br from-blue-100 to-cyan-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="space-y-5 col-span-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-cyan-400 w-4 h-4 rounded-full"></div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                BusZone+
              </div>
              <div className="text-xs text-blue-600/70">
                Premium Bus Rentals
              </div>
            </div>
          </div>
          <p className="text-slate-600 text-base font-normal pr-10">
            Experience luxury, reliability, and comfort with our premium bus rental services. 
            We provide exceptional transportation solutions for all your needs.
          </p>
        </div>

        <div className="space-y-5">
          <h1 className="text-lg font-medium text-slate-800">About Us</h1>
          <ul className="space-y-3 text-slate-600 text-base font-normal">
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>About Us</a>
            </li>
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Contact Us</a>
            </li>
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Privacy Policy</a>
            </li>
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Terms and Conditions</a>
            </li>
          </ul>
        </div>

        <div className="space-y-5">
          <h1 className="text-lg font-medium text-slate-800">Services</h1>
          <ul className="space-y-3 text-slate-600 text-base font-normal">
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Safety Guarantee</a>
            </li>
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>FAQ & Support</a>
            </li>
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Luxury Buses</a>
            </li>
            <li>
              <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Enough Facilities</a>
            </li>
          </ul>
        </div>

        <div className="space-y-5">
          <h1 className="text-lg font-medium text-slate-800">Get In Touch</h1>
          <div className="space-y-4">
            <div className="flex gap-x-3">
              <MapPin className='text-lg text-blue-600 mt-1 flex-shrink-0' />
              <div className="flex flex-col">
                <p className="text-sm text-slate-600">
                  For Support & Reservations
                </p>
                <p className="text-sm text-slate-700">
                  123, Main Street, Anytown, USA
                </p>
              </div>
            </div>

            <div className="flex gap-x-3">
              <Phone className='text-lg text-blue-600 mt-1 flex-shrink-0' />
              <div className="flex flex-col">
                <p className="text-sm text-slate-600">
                  Call Us Anytime
                </p>
                <p className="text-sm text-slate-700">
                  +94 704 222 777
                </p>
              </div>
            </div>

            <div className="flex gap-x-3">
              <Mail className='text-lg text-blue-600 mt-1 flex-shrink-0' />
              <div className="flex flex-col">
                <p className="text-sm text-slate-600">
                  Email Us
                </p>
                <p className="text-sm text-slate-700">
                  info@buszoneplus.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-blue-200 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} BusZone+. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// Main Booking Component
const Booking = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <BookingNavbar />
      <BookingHero />
      <BookingSearch />
      <Category />
      <SeasonalOffersPreview />
      
      {/* Features Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Our buses are regularly maintained and drivers are highly trained for your safety.",
                color: "text-blue-600"
              },
              {
                icon: Clock,
                title: "On Time Always",
                description: "We pride ourselves on punctuality with a 98% on-time arrival record.",
                color: "text-sky-600"
              },
              {
                icon: Wifi,
                title: "Stay Connected",
                description: "Free WiFi available on all our premium buses to keep you connected.",
                color: "text-blue-600"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`${feature.color} p-3 rounded-xl w-fit mx-auto mb-4 bg-blue-50`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Booking;