// src/pages/Feedback.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Plus,
  ArrowLeft,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Send,
  Lock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Clock,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Feedback = () => {
  const { user: authUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [formData, setFormData] = useState({
    type: 'feedback',
    title: '',
    description: '',
    rating: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const navigate = useNavigate();

  // Enhanced mock data with more realistic feedback examples
  const enhancedMockFeedbacks = (currentUserId, currentUserName) => [
    {
      _id: '1',
      title: 'Bus is very uncomfortable',
      description: 'The seats were broken and the bus was very dirty. AC was not working properly. Very bad experience. The journey was supposed to be comfortable but turned out to be the worst travel experience I have ever had.',
      type: 'complaint',
      client_id: { 
        _id: currentUserId,
        firstName: authUser?.firstName || 'Unknown', 
        lastName: authUser?.lastName || 'User' 
      },
      user_id: currentUserId,
      user_name: currentUserName,
      send_date: new Date('2025-09-20T01:58:00').toISOString(),
      status: 'replied',
      admin_reply: 'We apologize for the inconvenience. We have reported this issue to our maintenance team and the bus has been taken for servicing. As compensation, we are offering you a 20% discount on your next booking.',
      reply_date: new Date('2025-09-20T02:01:00').toISOString(),
      priority: 'high',
      booking_reference: 'BZ-2025-7890',
      category: 'comfort'
    },
    {
      _id: '2',
      title: 'Driver was very rude',
      description: 'The driver was shouting at passengers and driving recklessly. Very unsafe and unprofessional behavior.',
      type: 'complaint',
      client_id: { 
        _id: currentUserId,
        firstName: authUser?.firstName || 'Unknown', 
        lastName: authUser?.lastName || 'User' 
      },
      user_id: currentUserId,
      user_name: currentUserName,
      send_date: new Date('2025-09-19T10:30:00').toISOString(),
      status: 'pending',
      admin_reply: null,
      reply_date: null,
      priority: 'high',
      booking_reference: 'BZ-2025-7845',
      category: 'staff'
    },
    {
      _id: '3',
      title: 'Excellent service!',
      description: 'The bus was very clean, comfortable and arrived exactly on time. Driver was very professional and helpful. Will definitely use this service again for my future travels. The entertainment system was great and the seats were very comfortable for the long journey.',
      type: 'feedback',
      client_id: { 
        _id: currentUserId,
        firstName: authUser?.firstName || 'Unknown', 
        lastName: authUser?.lastName || 'User' 
      },
      user_id: currentUserId,
      user_name: currentUserName,
      send_date: new Date('2025-09-18T15:20:00').toISOString(),
      status: 'replied',
      admin_reply: 'Thank you for your positive feedback! We are happy to hear that you had a great experience. We look forward to serving you again.',
      reply_date: new Date('2025-09-18T16:45:00').toISOString(),
      rating: 5,
      priority: 'low',
      booking_reference: 'BZ-2025-7821',
      category: 'service'
    },
    {
      _id: '4',
      title: 'Bus was 1 hour late',
      description: 'The bus arrived very late without any prior notification. This caused me to miss an important meeting.',
      type: 'complaint',
      client_id: { 
        _id: currentUserId,
        firstName: authUser?.firstName || 'Unknown', 
        lastName: authUser?.lastName || 'User' 
      },
      user_id: currentUserId,
      user_name: currentUserName,
      send_date: new Date('2025-09-17T09:15:00').toISOString(),
      status: 'closed',
      admin_reply: 'We sincerely apologize for the delay. There was an unexpected traffic jam due to an accident. We have processed a 50% refund for your booking.',
      reply_date: new Date('2025-09-17T11:30:00').toISOString(),
      priority: 'medium',
      booking_reference: 'BZ-2025-7798',
      category: 'punctuality'
    },
    {
      _id: '5',
      title: 'Good value for money',
      description: 'Affordable price and decent service. Seats were comfortable enough for the journey. The staff was friendly and the bus was reasonably clean. For the price paid, it was a good experience overall.',
      type: 'feedback',
      client_id: { 
        _id: currentUserId,
        firstName: authUser?.firstName || 'Unknown', 
        lastName: authUser?.lastName || 'User' 
      },
      user_id: currentUserId,
      user_name: currentUserName,
      send_date: new Date('2025-09-16T14:40:00').toISOString(),
      status: 'pending',
      admin_reply: null,
      reply_date: null,
      rating: 4,
      priority: 'low',
      booking_reference: 'BZ-2025-7765',
      category: 'value'
    }
  ];

  // Fetch feedbacks from backend and get user ID
  useEffect(() => {
    fetchFeedbacks();
    if (authUser) {
      setUserId(authUser.id || authUser._id || authUser.userId);
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserId(user.id || user._id || user.userId);
        } catch (err) {
          console.error('Error parsing user data:', err);
          setUserId(null);
        }
      }
    }
  }, [authUser]);

  // Filter feedbacks based on search term and filters
  useEffect(() => {
    let filtered = feedbacks;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(feedback => 
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.booking_reference && feedback.booking_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        feedback.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.category && feedback.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(feedback => feedback.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === filterStatus);
    }

    setFilteredFeedbacks(filtered);
  }, [searchTerm, filterType, filterStatus, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your feedback');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/feedbacks/my-feedbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
        } else {
          throw new Error('Failed to fetch feedbacks');
        }
        return;
      }
      
      const data = await response.json();
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        const dateA = new Date(a.send_date || a.createdAt || 0);
        const dateB = new Date(b.send_date || b.createdAt || 0);
        return dateB - dateA;
      }) : [];
      
      setFeedbacks(sortedData);
      localStorage.setItem('buszone_feedbacks', JSON.stringify(sortedData));
    } catch (err) {
      setError(err.message);
      const currentUserId = userId || '68b5240faf8b3f2810a46257';
      const currentUserName = authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : 'Unknown User';
      
      const mockFeedbacks = enhancedMockFeedbacks(currentUserId, currentUserName);
      setFeedbacks(mockFeedbacks);
      localStorage.setItem('buszone_feedbacks', JSON.stringify(mockFeedbacks));
      
      toast.error('Using demo data - Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Feedback Box Component with better user display
  const FeedbackBox = ({ feedback }) => {
    const [expanded, setExpanded] = useState(false);
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'replied': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'closed': return 'bg-slate-100 text-slate-800 border-slate-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    };

    const getTypeColor = (type) => {
      return type === 'complaint' 
        ? 'bg-rose-100 text-rose-800 border-rose-200' 
        : 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'bg-rose-500';
        case 'medium': return 'bg-amber-500';
        case 'low': return 'bg-emerald-500';
        default: return 'bg-slate-500';
      }
    };

    const getCategoryColor = (category) => {
      switch (category) {
        case 'comfort': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'staff': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'service': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
        case 'punctuality': return 'bg-red-100 text-red-800 border-red-200';
        case 'value': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getTypeIcon = (type) => {
      return type === 'complaint' 
        ? <AlertTriangle className="h-5 w-5 text-rose-500" /> 
        : <MessageSquare className="h-5 w-5 text-blue-500" />;
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'replied': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        case 'closed': return <XCircle className="h-4 w-4 text-slate-500" />;
        default: return <Clock className="h-4 w-4 text-amber-500" />;
      }
    };

    // Enhanced user information functions
    const getUserInitials = (feedbackUser) => {
      if (feedbackUser?.firstName && feedbackUser?.lastName) {
        return `${feedbackUser.firstName.charAt(0)}${feedbackUser.lastName.charAt(0)}`.toUpperCase();
      }
      if (feedbackUser?.username) {
        return feedbackUser.username.charAt(0).toUpperCase();
      }
      if (authUser?.firstName && authUser?.lastName) {
        return `${authUser.firstName.charAt(0)}${authUser.lastName.charAt(0)}`.toUpperCase();
      }
      return 'U';
    };

    const getUserName = (feedbackUser) => {
      // First priority: feedback user data
      if (feedbackUser?.firstName && feedbackUser?.lastName) {
        return `${feedbackUser.firstName} ${feedbackUser.lastName}`;
      }
      if (feedbackUser?.username) {
        return feedbackUser.username;
      }
      
      // Second priority: logged in user data
      if (authUser?.firstName && authUser?.lastName) {
        return `${authUser.firstName} ${authUser.lastName}`;
      }
      if (authUser?.username) {
        return authUser.username;
      }
      
      // Fallback
      return 'You';
    };

    const getUserAvatar = (feedbackUser) => {
      const initials = getUserInitials(feedbackUser);
      const colors = [
        'bg-gradient-to-br from-blue-500 to-cyan-600',
        'bg-gradient-to-br from-purple-500 to-pink-600',
        'bg-gradient-to-br from-green-500 to-emerald-600',
        'bg-gradient-to-br from-orange-500 to-red-600',
        'bg-gradient-to-br from-indigo-500 to-purple-600'
      ];
      
      // Simple hash function for consistent color
      const hash = feedbackUser?._id?.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0) || 0;
      
      const colorIndex = Math.abs(hash) % colors.length;
      
      return (
        <div className={`w-10 h-10 ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md`}>
          {initials}
        </div>
      );
    };

    const renderRatingStars = (rating) => {
      if (!rating) return null;
      
      return (
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
            />
          ))}
          <span className="ml-1 text-sm text-slate-500">({rating}/5)</span>
        </div>
      );
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

    const canEditFeedback = (feedback) => {
      return !feedback.admin_reply && feedback.status !== 'closed';
    };

    const toggleExpand = () => {
      setExpanded(!expanded);
      setExpandedFeedback(expanded ? null : feedback._id);
    };

    // Get the user data from feedback
    const feedbackUser = feedback.client_id || feedback.user_id || authUser;

    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
        feedback.type === 'complaint' 
          ? 'border-rose-100 hover:border-rose-200' 
          : 'border-blue-100 hover:border-blue-200'
      }`}>
        
        {/* User Info Section - Always at the top */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            {getUserAvatar(feedbackUser)}
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {getUserName(feedbackUser)}
              </h3>
              <p className="text-sm text-slate-500">
                {formatDate(feedback.send_date || feedback.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {feedback.priority && (
              <div 
                className={`w-3 h-3 rounded-full ${getPriorityColor(feedback.priority)}`} 
                title={`${feedback.priority} priority`} 
              />
            )}
            {feedback.rating && renderRatingStars(feedback.rating)}
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-4">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <h4 className="font-bold text-slate-900 text-xl flex-1">
              {feedback.title}
            </h4>
          </div>
          
          {/* Tags Row */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getTypeColor(feedback.type)}`}>
              {feedback.type}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(feedback.status)}`}>
              {feedback.status}
            </span>
            {feedback.category && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(feedback.category)}`}>
                {feedback.category}
              </span>
            )}
          </div>

          {/* Description Section - Expandable */}
          <div className={`transition-all duration-300 ${
            expanded ? 'max-h-96 opacity-100' : 'max-h-24 opacity-90'
          } overflow-hidden`}>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {feedback.description}
            </p>
          </div>

          {/* Expand/Collapse Button */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={toggleExpand}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{expanded ? 'Show Less' : 'Show More'}</span>
            </button>
          </div>
        </div>

        {/* Booking Reference */}
        {feedback.booking_reference && (
          <div className="mb-4">
            <div className="inline-flex items-center bg-slate-50 text-slate-700 text-sm px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Booking: {feedback.booking_reference}
            </div>
          </div>
        )}

        {/* Actions and Status Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 pt-4 border-t border-slate-200">
          <div className={`flex items-center space-x-1.5 font-medium ${
            feedback.status === 'replied' 
              ? 'text-emerald-600' 
              : feedback.status === 'closed'
              ? 'text-slate-500'
              : 'text-amber-600'
          }`}>
            {getStatusIcon(feedback.status)}
            <span className="capitalize">{feedback.status}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEditFeedback(feedback) && (
              <>
                <button
                  onClick={() => handleEdit(feedback)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-slate-600 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 border border-slate-300"
                  title="Edit feedback"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(feedback)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-slate-600 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100 border border-slate-300"
                  title="Delete feedback"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Admin Reply Section - Expandable */}
        {feedback.admin_reply && (
          <div className={`mt-4 transition-all duration-300 ${
            expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2 text-sm font-medium text-blue-900 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Admin Response</span>
                <span className="text-blue-600">• {formatDate(feedback.reply_date)}</span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                {feedback.admin_reply}
              </p>
              
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      setSubmitting(false);
      return;
    }


    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to submit feedback');
        return;
      }

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        rating: formData.type === 'feedback' ? formData.rating : undefined,
        user_id: userId,
        user_name: authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : 'Unknown User'
      };

      const url = isEditing 
        ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/feedbacks/${currentFeedback._id}`
        : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/feedbacks`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      const result = await response.json();
      
      const successMessage = isEditing 
        ? `${formData.type === 'complaint' ? 'Complaint' : 'Feedback'} updated successfully!`
        : formData.type === 'complaint' 
          ? 'Thank you for your complaint! We will address this issue promptly.'
          : 'Thank you for your feedback! We appreciate your input.';
      
      toast.success(successMessage);
      
      setFormData({
        type: 'feedback',
        title: '',
        description: '',
        rating: 0
      });
      
      await fetchFeedbacks();
      
      if (isEditing) {
        window.dispatchEvent(new CustomEvent('feedbackUpdated'));
      } else {
        window.dispatchEvent(new CustomEvent('feedbackCreated'));
      }
      
      setTimeout(() => {
        setIsFormOpen(false);
        setIsEditing(false);
        setCurrentFeedback(null);
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feedback) => {
    if (feedback.admin_reply) {
      toast.error('Cannot edit feedback after admin response');
      return;
    }
    
    setCurrentFeedback(feedback);
    setFormData({
      type: feedback.type,
      title: feedback.title,
      description: feedback.description,
      rating: feedback.rating || 0
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (feedback) => {
    const itemType = feedback.type === 'complaint' ? 'complain' : 'feedback';
    
    if (feedback.admin_reply) {
      toast.error(`Cannot delete ${itemType} after admin response`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/feedbacks/${feedback._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete ${itemType}`);
      }

      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
      await fetchFeedbacks();
      window.dispatchEvent(new CustomEvent('feedbackUpdated'));
    } catch (err) {
      toast.error(err.message || `Error deleting ${itemType}. Please try again.`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    // If clicking on the same rating that's already selected, set it to 0
    const newRating = formData.rating === rating ? 0 : rating;
    setFormData({
      ...formData,
      rating: newRating
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
  };

  // Get counts for stats
  const getFeedbackStats = () => {
    const total = feedbacks.length;
    const complaints = feedbacks.filter(f => f.type === 'complaint').length;
    const feedbacksCount = feedbacks.filter(f => f.type === 'feedback').length;
    const pending = feedbacks.filter(f => f.status === 'pending').length;
    const replied = feedbacks.filter(f => f.status === 'replied').length;

    return { total, complaints, feedbacksCount, pending, replied };
  };

  const statsData = getFeedbackStats();

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-600">Loading your feedback...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-white/80 rounded-xl shadow-lg border border-blue-200/50">
        <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
        >
          Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* Clean Header Section without Statistics */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left flex-1">
            <button
              onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-6 lg:mb-8"
            >
              <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back</span>
            </button>
            
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Feedback Hub
              </h1>
              <p className="text-blue-100 text-lg lg:text-xl max-w-2xl">
                Share your journey experiences and help us improve our services. Your feedback matters to us.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
                <Plus className="h-5 w-5" />
                <span>New Feedback or Complain</span>
            </button>
          </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Search feedbacks by title, description, or booking reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>

              {/* Type Filter */}
              <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
              </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="replied">Replied</option>
              </select>
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>


              {/* Clear Filters */}
              {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-3 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-blue-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-12 w-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-700 mb-4">
              {feedbacks.length === 0 ? 'No Feedback Yet' : 'No Matching Results'}
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
              {feedbacks.length === 0 
                ? 'Be the first to share your travel experience and help us improve our services.'
                : 'Try adjusting your search criteria or filters to find what you are looking for.'
              }
            </p>
            {feedbacks.length === 0 && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Share Your First Experience
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredFeedbacks.map((feedback) => (
              <FeedbackBox key={feedback._id} feedback={feedback} />
            ))}
          </div>
        )}
      </div>

      {/* Feedback Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {isEditing ? 'Edit Feedback' : 'Share Your Feedback'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setIsEditing(false);
                  setCurrentFeedback(null);
                  setFormData({
                    type: 'feedback',
                    title: '',
                    description: '',
                    rating: 0
                  });
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'feedback'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'feedback' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Feedback</div>
                    <div className="text-sm opacity-75">Share your experience</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'complaint'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'complaint' 
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Complaint</div>
                    <div className="text-sm opacity-75">Report an issue</div>
                  </button>
                </div>
              </div>

              {/* Rating (only for feedback) */}
              {formData.type === 'feedback' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= formData.rating 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-slate-500">
                      ({formData.rating}/5)
                    </span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a brief title for your feedback"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder={`Describe your ${formData.type} in detail...`}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setIsEditing(false);
                    setCurrentFeedback(null);
                    setFormData({
                      type: 'feedback',
                      title: '',
                      description: '',
                      rating: 0
                    });
                  }}
                  className="px-6 py-2.5 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>
                        {isEditing 
                          ? (formData.type === 'complaint' ? 'Update Complaint' : 'Update Feedback')
                          : formData.type === 'complaint' 
                            ? 'Submit Complaint' 
                            : 'Submit Feedback'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;