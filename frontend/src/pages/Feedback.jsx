// src/pages/Feedback.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Feedback = () => {
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
    booking_reference: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch feedbacks from backend and get user ID
  useEffect(() => {
    fetchFeedbacks();
    // Get user ID from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id || user._id || user.userId);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    // If not found in user object, try to get from token
    if (!userId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Simple token parsing to get user ID (assuming it's stored in token)
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserId(payload.id || payload.userId || payload._id);
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      }
    }
  }, []);

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
          'Authorization': `Bearer ${token}`
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
      setFeedbacks(data);
      setFilteredFeedbacks(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load feedbacks');
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

      // Prepare payload - use booking_reference instead of booking_id
      const payload = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        ...(formData.booking_reference && formData.booking_reference.trim() !== '' ? { 
          booking_reference: formData.booking_reference 
        } : {})
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
      
      toast.success(isEditing ? 'Feedback updated successfully!' : 'Thank you for your feedback!');
      
      // Reset form
      setFormData({
        type: 'feedback',
        title: '',
        description: '',
        booking_reference: ''
      });
      
      // Refresh feedback list
      fetchFeedbacks();
      
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
      booking_reference: feedback.booking_reference || feedback.booking_id || ''
    });
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
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete feedback');
      }

      toast.success('Feedback deleted successfully!');
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.message || 'Error deleting feedback. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getTypeIcon = (type) => {
    return type === 'complaint' 
      ? <AlertTriangle className="h-5 w-5 text-rose-500" /> 
      : <MessageSquare className="h-5 w-5 text-amber-500" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if feedback can be edited (no admin reply)
  const canEditFeedback = (feedback) => {
    return !feedback.admin_reply && feedback.status !== 'closed';
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
        >
          Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback & Complaints</h1>
            
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search feedbacks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
            </p>
          )}
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
              {searchTerm ? 'No matching feedback found' : 'No feedback yet'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'Share your experience with us to help us improve our services.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Add Your First Feedback
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {getTypeIcon(feedback.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {feedback.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {feedback.type} • {formatDate(feedback.send_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canEditFeedback(feedback) ? (
                      <button
                        onClick={() => handleEdit(feedback)}
                        className="p-2 text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                        title="Edit feedback"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        className="p-2 text-slate-400 cursor-not-allowed"
                        title="Cannot edit after admin response"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    )}
                    
                    {canEditFeedback(feedback) ? (
                      <button
                        onClick={() => handleDelete(feedback)}
                        className="p-2 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        title="Delete feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        className="p-2 text-slate-400 cursor-not-allowed"
                        title="Cannot delete after admin response"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                  {feedback.description}
                </p>

                {/* Booking Reference Section - Fixed */}
                {(feedback.booking_reference || feedback.booking_id) && (
                  <div className="mb-4">
                    <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm px-3 py-1 rounded-full">
                      Booking Reference: {feedback.booking_reference || feedback.booking_id}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>You (ID: {feedback.user_id || userId || 'Unknown'})</span>
                    </div>
                    
                    {(feedback.booking_reference || feedback.booking_id) && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Booking: {feedback.booking_reference || feedback.booking_id}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${
                    feedback.status === 'replied' 
                      ? 'text-emerald-500' 
                      : feedback.status === 'closed'
                      ? 'text-slate-500'
                      : 'text-amber-500'
                  }`}>
                    {feedback.status === 'replied' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : feedback.status === 'closed' ? (
                      <XCircle className="h-4 w-4" />
                    ) : null}
                    <span className="capitalize">{feedback.status}</span>
                  </div>
                </div>

                {feedback.admin_reply && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                      <span>Admin Response</span>
                      <span className="text-slate-500 dark:text-slate-400">• {formatDate(feedback.reply_date)}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {feedback.admin_reply}
                    </p>
                    
                    {feedback.status === 'replied' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            // Handle reopen functionality if needed
                            toast.success('Feedback reopened');
                          }}
                          className="flex items-center space-x-1 text-xs text-amber-500 hover:text-amber-600"
                        >
                          <span>Reopen</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Feedback' : 'Share Your Feedback'}
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
                    booking_reference: ''
                  });
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Feedback Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Brief title of your feedback"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Please share your experience in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Booking Reference (Optional)
                </label>
                <input
                  type="text"
                  name="booking_reference"
                  value={formData.booking_reference}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter booking reference if applicable"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                      booking_reference: ''
                    });
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting...' : (isEditing ? 'Update Feedback' : 'Submit Feedback')}</span>
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