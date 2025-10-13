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
  Clock
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
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'title':
        if (!value || value.trim().length === 0) {
          error = 'Title is required';
        } else if (value.trim().length < 3) {
          error = 'Title must be at least 3 characters long';
        } else if (value.trim().length > 100) {
          error = 'Title must be less than 100 characters';
        }
        break;
      case 'description':
        if (!value || value.trim().length === 0) {
          error = 'Description is required';
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters long';
        } else if (value.trim().length > 1000) {
          error = 'Description must be less than 1000 characters';
        }
        break;
      case 'rating':
        if (formData.type === 'feedback' && (!value || value < 1 || value > 5)) {
          error = 'Please select a valid rating (1-5)';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const errors = {};
    
    // Only validate required fields for basic submission
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    
    // Only validate rating if it's feedback type and user has interacted with it
    if (formData.type === 'feedback' && touched.rating && (!formData.rating || formData.rating < 1 || formData.rating > 5)) {
      errors.rating = 'Please select a valid rating (1-5)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing and validate the field
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Stats for the header
  const stats = [
    {
      number: "1,250+",
      label: "Feedbacks Resolved",
      icon: CheckCircle,
      color: "text-emerald-400",
    },
    {
      number: "98%",
      label: "Satisfaction Rate",
      icon: Star,
      color: "text-amber-400",
    },
    {
      number: "24/7",
      label: "Support Available",
      icon: Clock,
      color: "text-blue-400",
    },
    {
      number: "99.9%",
      label: "Response Rate",
      icon: Shield,
      color: "text-cyan-400",
    },
  ];

  // Fetch feedbacks from backend and get user ID
  useEffect(() => {
    fetchFeedbacks();
    // Get user ID from authenticated user context
    if (authUser) {
      setUserId(authUser.id || authUser._id || authUser.userId);
    } else {
      // Fallback to localStorage if authUser is not available yet
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

  // Filter feedbacks based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFeedbacks(feedbacks);
    } else {
      const filtered = feedbacks.filter(feedback => 
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.booking_reference && feedback.booking_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.booking_id && feedback.booking_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        feedback.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFeedbacks(filtered);
    }
  }, [searchTerm, feedbacks]);

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
      // Sort by newest first by default
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        const dateA = new Date(a.send_date || a.createdAt || 0);
        const dateB = new Date(b.send_date || b.createdAt || 0);
        return dateB - dateA;
      }) : [];
      
      setFeedbacks(sortedData);
      
      // Save to localStorage for HomePage.jsx to access
      localStorage.setItem('buszone_feedbacks', JSON.stringify(sortedData));
    } catch (err) {
      setError(err.message);
      // Use mock data for demo purposes with real user info
      const currentUserId = userId || '68b5240faf8b3f2810a46257';
      const currentUserName = authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : 'Unknown User';
      
      const mockFeedbacks = [
        {
          _id: '1',
          title: 'Bad bus',
          description: 'bus is uncomfortable',
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
          admin_reply: 'I fixed it',
          reply_date: new Date('2025-09-20T02:01:00').toISOString()
        },
        {
          _id: '2',
          title: 'Great service',
          description: 'The bus was clean and arrived on time',
          type: 'feedback',
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
          rating: 5
        }
      ];
      setFeedbacks(mockFeedbacks);
      
      // Save mock data to localStorage for HomePage.jsx to access
      localStorage.setItem('buszone_feedbacks', JSON.stringify(mockFeedbacks));
      
      toast.error('Using demo data - Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to submit feedback');
        return;
      }

      // Validate form data
      if (!validateForm()) {
        setSubmitting(false);
        toast.error('Please fix the errors before submitting');
        return;
      }

      // Prepare payload with user information
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
          ? 'Thank you for your complaint!'
          : 'Thank you for your feedback!';
      
      toast.success(successMessage);
      
      // Reset form
      setFormData({
        type: 'feedback',
        title: '',
        description: '',
        rating: 5
      });
      setFormErrors({});
      setTouched({});
      
      // Refresh feedback list
      await fetchFeedbacks();
      
      // Also save to localStorage for HomePage.jsx
      const updatedFeedbacks = [...feedbacks, result];
      localStorage.setItem('buszone_feedbacks', JSON.stringify(updatedFeedbacks));
      
      // Dispatch event to notify admin dashboard of feedback update
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
    // Check if feedback can be edited (no admin reply)
    if (feedback.admin_reply) {
      toast.error('Cannot edit feedback after admin response');
      return;
    }
    
    setCurrentFeedback(feedback);
    setFormData({
      type: feedback.type,
      title: feedback.title,
      description: feedback.description,
      rating: feedback.rating || 5
    });
    setFormErrors({});
    setTouched({});
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (feedback) => {
    // Check if feedback can be deleted (no admin reply)
    if (feedback.admin_reply) {
      toast.error('Cannot delete feedback after admin response');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

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
        throw new Error(errorData.message || 'Failed to delete feedback');
      }

      toast.success('Feedback deleted successfully!');
      await fetchFeedbacks();
      
      // Dispatch event to notify admin dashboard of feedback deletion
      window.dispatchEvent(new CustomEvent('feedbackUpdated'));
    } catch (err) {
      toast.error(err.message || 'Error deleting feedback. Please try again.');
    }
  };

  const handleChange = (e) => {
    handleFieldChange(e);
  };

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating: rating
    });
    
    // Mark rating as touched and clear any errors
    setTouched(prev => ({ ...prev, rating: true }));
    setFormErrors(prev => ({
      ...prev,
      rating: ''
    }));
  };

  const getTypeIcon = (type) => {
    return type === 'complaint' 
      ? <AlertTriangle className="h-5 w-5 text-rose-500" /> 
      : <MessageSquare className="h-5 w-5 text-blue-500" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-slate-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
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

  // Check if feedback can be edited (no admin reply)
  const canEditFeedback = (feedback) => {
    return !feedback.admin_reply && feedback.status !== 'closed';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Feedback & Support</h1>
              <p className="text-blue-100">Share your experience with us</p>
            </div>
            
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all shadow-md hover:shadow-lg backdrop-blur-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Feedback or Complaint</span>
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center"
                >
                  <div className={`${stat.color} mb-2 flex justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-10">
        {/* Feedback List */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white/80 rounded-2xl shadow-lg border border-blue-200/50">
            <MessageSquare className="h-20 w-20 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-600 mb-2">
              No feedback yet
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Share your experience with us to help us improve our services.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Share Your First Feedback or Complaint
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-white/80 rounded-2xl p-6 shadow-lg border border-blue-200/50 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${feedback.type === 'complaint' ? 'bg-rose-100' : 'bg-blue-100'}`}>
                      {getTypeIcon(feedback.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {feedback.title}
                      </h3>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${feedback.type === 'complaint' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                          {feedback.type}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDate(feedback.send_date || feedback.createdAt)}
                        </span>
                        {feedback.rating && (
                          <div className="flex items-center">
                            {renderRatingStars(feedback.rating)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canEditFeedback(feedback) ? (
                      <button
                        onClick={() => handleEdit(feedback)}
                        className="p-2 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit feedback"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        className="p-2 text-slate-400 cursor-not-allowed rounded-lg"
                        title="Cannot edit after admin response"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    )}
                    
                    {canEditFeedback(feedback) ? (
                      <button
                        onClick={() => handleDelete(feedback)}
                        className="p-2 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Delete feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        className="p-2 text-slate-400 cursor-not-allowed rounded-lg"
                        title="Cannot delete after admin response"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">
                  {feedback.description}
                </p>

                {/* Booking Reference Section - Only show if exists */}
                {(feedback.booking_reference || feedback.booking_id) && (
                  <div className="mb-4">
                    <span className="inline-flex items-center bg-blue-50 text-slate-700 text-sm px-3 py-1.5 rounded-full">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      Booking: {feedback.booking_reference || feedback.booking_id}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>
                      {feedback.client_id?.firstName && feedback.client_id?.lastName 
                        ? `${feedback.client_id.firstName} ${feedback.client_id.lastName}`
                        : feedback.client_id?.username 
                        ? feedback.client_id.username
                        : authUser?.firstName && authUser?.lastName
                        ? `${authUser.firstName} ${authUser.lastName}`
                        : authUser?.username
                        ? authUser.username
                        : 'You'
                      } (ID: {feedback.client_id?._id || feedback.user_id || userId || 'Unknown'})
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-1.5 font-medium ${feedback.status === 'replied' 
                      ? 'text-emerald-600' 
                      : feedback.status === 'closed'
                      ? 'text-slate-500'
                      : 'text-amber-600'}`}>
                    {getStatusIcon(feedback.status)}
                    <span className="capitalize">{feedback.status}</span>
                  </div>
                </div>

                {feedback.admin_reply && (
                  <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 text-sm font-medium text-blue-900 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Admin Response</span>
                      <span className="text-blue-600">• {formatDate(feedback.reply_date)}</span>
                    </div>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                      {feedback.admin_reply}
                    </p>
                    
                    {feedback.status === 'replied' && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            // Handle reopen functionality if needed
                            toast.success('Feedback reopened');
                          }}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>Reopen Feedback</span>
                        </button>
                        </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-blue-200/50">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">
                {isEditing 
                  ? `Edit ${formData.type === 'complaint' ? 'Complaint' : 'Feedback'}`
                  : formData.type === 'complaint' 
                    ? 'Share Your Complaint' 
                    : 'Share Your Feedback'
                }
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setIsEditing(false);
                  setCurrentFeedback(null);
                  setFormData({
                    type: 'feedback',
                    title: '',
                    description: '',
                    rating: 5
                  });
                  setFormErrors({});
                  setTouched({});
                }}
                className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'feedback'})}
                    className={`p-3 rounded-xl border transition-all ${formData.type === 'feedback' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Feedback</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'complaint'})}
                    className={`p-3 rounded-xl border transition-all ${formData.type === 'complaint' 
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' 
                      : 'border-slate-300 bg-white text-slate-700 hover:border-rose-400'}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ThumbsDown className="h-4 w-4" />
                      <span>Complaint</span>
                    </div>
                  </button>
                </div>
              </div>

              {formData.type === 'feedback' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex space-x-1 justify-center p-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= formData.rating 
                            ? 'text-amber-500 fill-amber-500' 
                            : 'text-slate-300 hover:text-amber-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">
                      {formData.rating === 1 && "Very Poor"}
                      {formData.rating === 2 && "Poor"}
                      {formData.rating === 3 && "Average"}
                      {formData.rating === 4 && "Good"}
                      {formData.rating === 5 && "Excellent"}
                    </p>
                    {touched.rating && formErrors.rating && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.rating}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  required
                  maxLength={100}
                  className={`w-full border rounded-xl px-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
                    touched.title && formErrors.title
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  placeholder="Brief title of your feedback"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-500">
                    {formData.title.length}/100 characters
                  </p>
                  {touched.title && formErrors.title && (
                    <p className="text-xs text-red-500">{formErrors.title}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  required
                  rows={4}
                  maxLength={1000}
                  className={`w-full border rounded-xl px-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                    touched.description && formErrors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                  placeholder="Please share your experience in detail..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-500">
                    {formData.description.length}/1000 characters
                  </p>
                  {touched.description && formErrors.description && (
                    <p className="text-xs text-red-500">{formErrors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
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
                      rating: 5
                    });
                    setFormErrors({});
                    setTouched({});
                  }}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-800 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{isEditing ? `Update ${formData.type === 'complaint' ? 'Complaint' : 'Feedback'}` : `Submit ${formData.type === 'complaint' ? 'Complaint' : 'Feedback'}`}</span>
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