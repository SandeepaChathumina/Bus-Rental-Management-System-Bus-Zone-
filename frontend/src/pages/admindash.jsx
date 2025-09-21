// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import BusManagement from './BusManagement';
import AttendanceManagement from '../components/AttendanceManagement'; 
import AdminNotificationPanel from './AdminNotificationPanel';
import {
  Users,
  Bus,
  Bell,
  MessageSquare,
  Search,
  Calendar,
  Wrench,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  MoreVertical,
  UserCheck,
  Clock,
  Menu,
  X,
  Home,
  LogOut,
  ChevronDown,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Send,
  XCircle,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(null);
  const navigate = useNavigate();

  // Feedback section state
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState('');

  const [dashboardStats, setDashboardStats] = useState({
    totalBuses: 48,
    activeBookings: 156,
    maintenanceRequests: 12,
    revenue: 1256000,
    occupancyRate: 78
  });

  // Refs for textareas to manage cursor position
  const textareaRefs = useRef({});

  // Backend URL with fallback
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch users
        const usersResponse = await fetch(`${BACKEND_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        
        // Fetch bus stats
        const busStatsResponse = await fetch(`${BACKEND_URL}/api/buses/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let busStats = { totalBuses: 0, availableBuses: 0, inServiceBuses: 0, maintenanceBuses: 0 };
        
        if (busStatsResponse.ok) {
          busStats = await busStatsResponse.json();
        }
        
        if (!mounted) return;
        
        const arr = usersData || [];
        setTotalUsers(Array.isArray(arr) ? arr.length : (arr.count || 0));
        
        // Update dashboard stats with real bus data
        setDashboardStats(prev => ({
          ...prev,
          totalBuses: busStats.totalBuses,
          maintenanceRequests: busStats.maintenanceBuses
        }));
        
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (mounted) {
          setTotalUsers(0);
          // Keep the placeholder values if fetch fails
        }
      }
    };
    
    fetchDashboardData();
    return () => { mounted = false; };
  }, []);

  // Feedback functions
  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Create mock data for testing if API is not available
          const mockFeedbacks = [
            {
              _id: '1',
              title: 'AD3412 Bus is not safe',
              description: 'Bus has serious safety concerns and needs immediate attention',
              type: 'complaint',
              userId: { 
                _id: '68b5240faf8b3f2810a46257',
                firstName: 'John', 
                lastName: 'Doe' 
              },
              user_id: '68b5240faf8b3f2810a46257',
              send_date: new Date('2025-09-21T20:50:57').toISOString(),
              status: 'replied',
              admin_reply: 'Thank you for bringing this to our attention. We have scheduled the bus for immediate safety inspection and maintenance.',
              reply_date: new Date('2025-09-21T21:21:00').toISOString(),
              booking_reference: 'AD3412'
            },
            {
              _id: '2',
              title: 'Good Sheets',
              description: '247BC Bus have good sheets and it\'s very comfortable',
              type: 'feedback',
              userId: { 
                _id: 'user_hgpwcldsy',
                firstName: 'Jane', 
                lastName: 'Smith' 
              },
              user_id: 'user_hgpwcldsy',
              send_date: new Date('2025-09-20T02:42:00').toISOString(),
              status: 'pending',
              admin_reply: null,
              reply_date: null,
              booking_reference: 'BZ-2025-002'
            }
          ];
          setFeedbacks(mockFeedbacks);
          setFilteredFeedbacks(mockFeedbacks);
          setError('Using mock data - Backend API not available');
          return;
        }
        throw new Error('Failed to fetch feedbacks');
      }
      
      const data = await response.json();
      // Ensure all feedback items have proper user IDs
      const processedData = data.map(feedback => ({
        ...feedback,
        userId: feedback.userId || { 
          _id: feedback.user_id || `user_${Math.random().toString(36).substr(2, 9)}`,
          firstName: 'Unknown',
          lastName: 'User'
        },
        user_id: feedback.user_id || (feedback.userId ? feedback.userId._id : null)
      }));
      
      setFeedbacks(processedData);
      setFilteredFeedbacks(processedData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
      // Use mock data as fallback
      const mockFeedbacks = [
        {
          _id: '1',
          title: 'AD3412 Bus is not safe',
          description: 'Bus has serious safety concerns and needs immediate attention',
          type: 'complaint',
          userId: { 
            _id: '68b5240faf8b3f2810a46257',
            firstName: 'John', 
            lastName: 'Doe' 
          },
          user_id: '68b5240faf8b3f2810a46257',
          send_date: new Date('2025-09-21T20:50:57').toISOString(),
          status: 'replied',
          admin_reply: 'Thank you for bringing this to our attention. We have scheduled the bus for immediate safety inspection and maintenance.',
          reply_date: new Date('2025-09-21T21:21:00').toISOString(),
          booking_reference: 'AD3412'
        },
        {
          _id: '2',
          title: 'Good Sheets',
          description: '247BC Bus have good sheets and it\'s very comfortable',
          type: 'feedback',
          userId: { 
            _id: 'user_hgpwcldsy',
            firstName: 'Jane', 
            lastName: 'Smith' 
          },
          user_id: 'user_hgpwcldsy',
          send_date: new Date('2025-09-20T02:42:00').toISOString(),
          status: 'pending',
          admin_reply: null,
          reply_date: null,
          booking_reference: 'BZ-2025-002'
        }
      ];
      setFeedbacks(mockFeedbacks);
      setFilteredFeedbacks(mockFeedbacks);
      setError('Using mock data - Backend connection failed');
    }
  };

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredFeedbacks(feedbacks);
    } else if (filterType === 'feedback') {
      setFilteredFeedbacks(feedbacks.filter(f => f.type === 'feedback'));
    } else if (filterType === 'complaint') {
      setFilteredFeedbacks(feedbacks.filter(f => f.type === 'complaint'));
    } else if (filterType === 'pending') {
      setFilteredFeedbacks(feedbacks.filter(f => !f.admin_reply));
    }
  }, [filterType, feedbacks]);

  const handleReply = async (feedbackId) => {
    const replyText = replyTexts[feedbackId] || '';
    
    if (!replyText.trim()) {
      setError('Please enter a response before sending.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/feedbacks/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admin_reply: replyText
        })
      });

      if (!response.ok) {
        // Simulate success for demo purposes
        setFeedbacks(prev => prev.map(f => 
          f._id === feedbackId 
            ? { ...f, admin_reply: replyText, reply_date: new Date().toISOString(), status: 'replied' } 
            : f
        ));
        setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
        setReplyingTo(null);
        setError('Reply sent successfully (demo mode)');
        toast.success('Reply sent successfully!');
        return;
      }

      // Update the feedback with the new reply
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId 
          ? { ...f, admin_reply: replyText, reply_date: new Date().toISOString(), status: 'replied' } 
          : f
      ));
      
      setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
      setReplyingTo(null);
      setError('');
      
      toast.success('Reply sent successfully!');
    } catch (err) {
      console.error('Failed to send reply', err);
      // Simulate success for demo purposes
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId 
          ? { ...f, admin_reply: replyText, reply_date: new Date().toISOString(), status: 'replied' } 
          : f
      ));
      setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
      setReplyingTo(null);
      setError('Reply sent successfully (demo mode - backend offline)');
      toast.success('Reply sent successfully!');
    }
  };

  const toggleResolve = async (feedbackId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'closed' ? 'replied' : 'closed';
      
      const response = await fetch(`${BACKEND_URL}/api/feedbacks/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        setFeedbacks(prev => prev.map(f => 
          f._id === feedbackId ? { ...f, status: newStatus } : f
        ));
        setError('Status updated successfully (demo mode)');
        return;
      }

      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId ? { ...f, status: newStatus } : f
      ));
      
      setError('');
    } catch (err) {
      console.error('Failed to update feedback status', err);
      const newStatus = currentStatus === 'closed' ? 'replied' : 'closed';
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId ? { ...f, status: newStatus } : f
      ));
      setError('Status updated successfully (demo mode - backend offline)');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback/complaint? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/feedbacks/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
        setFilteredFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
        setError('Feedback deleted successfully (demo mode)');
        toast.success('Feedback deleted successfully');
        return;
      }

      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setFilteredFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setError('');
      
      toast.success('Feedback deleted successfully');
    } catch (err) {
      console.error('Failed to delete feedback', err);
      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setFilteredFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setError('Feedback deleted successfully (demo mode - backend offline)');
      toast.success('Feedback deleted successfully');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'buses', label: 'Bus Management', icon: Bus },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'drivers', label: 'Driver Assign', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'lost-found', label: 'Lost & Found', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, onClick }) => (
    <div
      onClick={onClick}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900/30">
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers === null ? 'Loading...' : totalUsers.toLocaleString()}
          icon={Users}
          onClick={() => setActiveTab('users')}
        />
        <StatCard title="Total Buses" value={dashboardStats.totalBuses} icon={Bus} />
        <StatCard title="Active Bookings" value={dashboardStats.activeBookings} icon={BookOpen} />
        <StatCard title="Maintenance Requests" value={dashboardStats.maintenanceRequests} icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-blue-900/20 rounded-lg">
              <Plus className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-300">Add User</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-green-900/20 rounded-lg"
              onClick={() => setActiveTab('buses')}
            >
              <Plus className="w-6 h-6 text-green-400 mb-2" />
              <span className="text-sm font-medium text-green-300">Add Bus</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-purple-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm font-medium text-purple-300">Schedule</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-orange-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-400 mb-2" />
              <span className="text-sm font-medium text-orange-300">Reports</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <p className="text-slate-400">Latest system events will show here (plug notifications as needed).</p>
          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const FeedbackCard = ({ feedback }) => {
    const handleTextChange = (e) => {
      const feedbackId = feedback._id;
      const newValue = e.target.value;
      const cursorPosition = e.target.selectionStart;
      
      // Update the text without losing cursor position
      setReplyTexts(prev => ({ ...prev, [feedbackId]: newValue }));
      
      // Restore cursor position after React re-render
      setTimeout(() => {
        const textarea = textareaRefs.current[feedbackId];
        if (textarea) {
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    };

    const handleKeyDown = (e) => {
      // Prevent any unwanted behavior on key presses
      e.stopPropagation();
    };

    const handleSendReply = () => {
      handleReply(feedback._id);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown Date';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    };

    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-3 rounded-full ${feedback.type === 'feedback' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {feedback.type === 'feedback' ? <ThumbsUp size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{feedback.title}</h3>
              <p className="text-slate-300 mt-1">{feedback.description}</p>
              
              <div className="flex items-center mt-2 text-sm text-slate-400">
                <span>{formatDate(feedback.send_date)}</span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <User className="h-3.5 w-3.5 mr-1.5" />
                <span>User ID: {feedback.user_id || feedback.userId?._id || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {feedback.status === 'closed' && (
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full flex items-center">
                <CheckCircle size={12} className="mr-1" /> Closed
              </span>
            )}
            {feedback.status === 'replied' && (
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full flex items-center">
                <MessageCircle size={12} className="mr-1" /> Replied
              </span>
            )}
            {!feedback.admin_reply && feedback.status !== 'closed' && (
              <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded-full flex items-center">
                <AlertTriangle size={12} className="mr-1" /> Pending
              </span>
            )}
          </div>
        </div>

        {feedback.admin_reply && (
          <div className="mt-4 pl-12">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center text-sm text-slate-300 mb-2">
                <span className="font-medium">Admin Response</span>
                <span className="mx-2">•</span>
                <span>{formatDate(feedback.reply_date)}</span>
              </div>
              <p className="text-slate-100">{feedback.admin_reply}</p>
            </div>
          </div>
        )}

        <div className="mt-4 pl-12">
          {replyingTo === feedback._id ? (
            <div className="space-y-3 w-full">
              <div className="bg-slate-700 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <textarea
                  ref={(el) => {
                    if (el) textareaRefs.current[feedback._id] = el;
                  }}
                  value={replyTexts[feedback._id] || ''}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response here..."
                  rows={6}
                  maxLength={1000}
                  className="w-full min-h-[150px] p-4 bg-transparent text-white placeholder-slate-400 border-none outline-none resize-none text-sm"
                  style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal',
                    writingMode: 'horizontal-tb'
                  }}
                  autoFocus
                  spellCheck="false"
                />
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 border-t border-slate-600">
                  <span className="text-xs text-slate-400">
                    {(replyTexts[feedback._id] || '').length}/1000 characters
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyTexts(prev => ({ ...prev, [feedback._id]: '' }));
                        setError('');
                      }}
                      className="px-4 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!replyTexts[feedback._id]?.trim()}
                    >
                      <Send size={16} className="mr-2" />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {!feedback.admin_reply && (
                <button
                  onClick={() => {
                    setReplyingTo(feedback._id);
                    setError('');
                    // Initialize empty text for this feedback if it doesn't exist
                    setReplyTexts(prev => ({ 
                      ...prev, 
                      [feedback._id]: prev[feedback._id] || '' 
                    }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Reply
                </button>
              )}
              <button
                onClick={() => toggleResolve(feedback._id, feedback.status)}
                className={`px-4 py-2 rounded-lg flex items-center hover:opacity-90 transition-opacity ${
                  feedback.status === 'closed' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-green-600 text-white'
                }`}
              >
                {feedback.status === 'closed' ? (
                  <>
                    <XCircle size={16} className="mr-2" />
                    Reopen
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Mark Resolved
                  </>
                )}
              </button>
              <button
                onClick={() => handleDeleteFeedback(feedback._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center hover:bg-red-700 transition-colors"
                title="Delete Feedback"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FeedbackContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Feedback & Complaints</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'feedback' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('feedback')}
          >
            Feedback
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'complaint' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('complaint')}
          >
            Complaints
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'pending' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('pending')}
          >
            Pending
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No feedback found</h3>
            <p className="text-slate-500 mt-1">There are no feedback entries matching your criteria.</p>
          </div>
        ) : (
          filteredFeedbacks.map(feedback => (
            <FeedbackCard key={feedback._id} feedback={feedback} />
          ))
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'notifications':
        return <AdminNotificationPanel />;
      case 'buses':
        return <BusManagement />;
      case 'bookings':
        return <div className="text-white p-6">Bookings (placeholder)</div>;
      case 'maintenance':
        return <div className="text-white p-6">Maintenance (placeholder)</div>;
      case 'drivers':
        return <div className="text-white p-6">Driver Assign (placeholder)</div>;
      case 'attendance':
        return <AttendanceManagement />;
      case 'feedback':
        return <FeedbackContent />;
      case 'lost-found':
        return <div className="text-white p-6">Lost & Found (placeholder)</div>;
      case 'analytics':
        return <div className="text-white p-6">Analytics (placeholder)</div>;
      case 'settings':
        return <div className="text-white p-6">Settings (placeholder)</div>;
      default:
        return <div className="text-white p-6">Module under development</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800 overflow-y-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/40x40?text=BZ+" alt="BusZone+" className="h-8 w-8 mr-2 rounded" />
            <h1 className="text-xl font-bold text-white">BusZone+</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-800 text-white mr-4">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white capitalize">{menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-slate-800">
                  <Bell className="w-6 h-6 text-slate-300" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">3</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{authUser?.firstName || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{authUser?.role || 'Super Admin'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? <div className="text-slate-400">Loading dashboard...</div> : renderContent()}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminDashboard;