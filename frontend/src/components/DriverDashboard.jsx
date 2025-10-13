// src/components/DriverDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  User,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock,
  BarChart3,
  Shield,
  HelpCircle,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Bus,
  Map,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DriverProfile from './driverProfile';
import axios from 'axios';
import toast from 'react-hot-toast';

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

// Separate Password Change Modal Component to prevent re-renders
const PasswordChangeModal = React.memo(({ 
  isOpen, 
  onClose, 
  onChangePassword 
}) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChar: false
    }
  });

  const handleInputChange = useCallback((field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate new password when it changes
    if (field === 'newPassword') {
      setPasswordValidation(validatePassword(value));
    }
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);
  

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Please ensure your password meets all requirements');
      return;
    }

    setChangingPassword(true);
    try {
      await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password updated successfully!');
      onClose();
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordValidation({
        isValid: false,
        requirements: {
          minLength: false,
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumbers: false,
          hasSpecialChar: false
        }
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  }, [passwordData, passwordValidation, onChangePassword, onClose]);

  const handleClose = useCallback(() => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordValidation({
      isValid: false,
      requirements: {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false
      }
    });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {passwordData.newPassword && (
              <div className="mt-2 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-sm text-slate-300 mb-2">Password must contain:</p>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center ${passwordValidation.requirements.minLength ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${passwordValidation.requirements.hasUpperCase ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    One uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center ${passwordValidation.requirements.hasLowerCase ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    One lowercase letter (a-z)
                  </div>
                  <div className={`flex items-center ${passwordValidation.requirements.hasNumbers ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    One number (0-9)
                  </div>
                  <div className={`flex items-center ${passwordValidation.requirements.hasSpecialChar ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    One special character (!@#$%^&* etc.)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                    ? 'border-red-500' 
                    : 'border-slate-600'
                }`}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changingPassword || !passwordValidation.isValid || passwordData.newPassword !== passwordData.confirmPassword}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {changingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Separate Settings Content Component
const SettingsContent = React.memo(({ onPasswordChangeClick }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
    <div className="space-y-6">
      {/* Password Change Card */}
      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Password & Security</h3>
              <p className="text-gray-600 text-sm">Update your password to keep your account secure</p>
            </div>
          </div>
          <button
            onClick={onPasswordChangeClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Lock className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-green-600 text-sm font-semibold">Last Changed</div>
            <div className="text-gray-600 text-xs mt-1">2 months ago</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-blue-600 text-sm font-semibold">Password Strength</div>
            <div className="text-gray-600 text-xs mt-1">Strong</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-purple-600 text-sm font-semibold">Two-Factor</div>
            <div className="text-gray-600 text-xs mt-1">Disabled</div>
          </div>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Bell className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-gray-600 text-sm">Manage how you receive notifications</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <div className="text-gray-900 font-medium">Email Notifications</div>
              <div className="text-gray-600 text-sm">Receive updates via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <div className="text-gray-900 font-medium">SMS Notifications</div>
              <div className="text-gray-600 text-sm">Receive text message alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <div className="text-gray-900 font-medium">Push Notifications</div>
              <div className="text-gray-600 text-sm">Browser and app notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings Card */}
      <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
            <p className="text-gray-600 text-sm">Control your privacy preferences</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <div className="text-gray-900 font-medium">Profile Visibility</div>
              <div className="text-gray-600 text-sm">Who can see your profile</div>
            </div>
            <select className="bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Only Me</option>
              <option>Administrators</option>
              <option>All Staff</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <div className="text-gray-900 font-medium">Activity Tracking</div>
              <div className="text-gray-600 text-sm">Track your driving activity</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Schedule Management Component
const ScheduleManagement = React.memo(() => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/bookings/driver/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSchedules(response.data.schedules || []);
        if (response.data.schedules?.length === 0) {
          console.log('No schedules found for this driver');
        }
      } else {
        setError(response.data.message || 'Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch schedules';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const toggleExpand = (scheduleId) => {
    setExpandedSchedules(prev => ({
      ...prev,
      [scheduleId]: !prev[scheduleId]
    }));
  };


  const respondToBooking = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${BACKEND_URL}/api/bookings/${bookingId}/driver-response`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh schedules
        fetchSchedules();
      } else {
        toast.error('Failed to respond to booking');
      }
    } catch (error) {
      console.error('Error responding to booking:', error);
      toast.error('Failed to respond to booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      schedule.bookingId.bookingId.toLowerCase().includes(searchLower) ||
      schedule.startLocation.toLowerCase().includes(searchLower) ||
      schedule.destination.toLowerCase().includes(searchLower) ||
      schedule.busId.numberPlate.toLowerCase().includes(searchLower) ||
      schedule.status.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'started': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'ended': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateTimeString, error);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return 'Invalid Time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', dateTimeString, error);
      return 'Invalid Time';
    }
  };

  const formatTimeFromString = (timeString) => {
    try {
      if (!timeString) return 'N/A';
      
      // Handle different time formats
      let formattedTime = timeString;
      
      // If time is in HHMM format (4 digits), convert to HH:MM
      if (timeString.length === 4 && !timeString.includes(':')) {
        formattedTime = `${timeString.substring(0, 2)}:${timeString.substring(2, 4)}`;
      }
      
      // If time is in HH:MM format, use it directly
      if (timeString.includes(':')) {
        return timeString;
      }
      
      return formattedTime;
    } catch (error) {
      console.error('Error formatting time string:', timeString, error);
      return 'Invalid Time';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
          <p className="text-gray-600">View and manage your driving schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-red-700 font-medium">Error Loading Schedules</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchSchedules}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Schedules</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSchedules.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredSchedules.filter(s => s.status === 'Scheduled').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredSchedules.filter(s => s.status === 'In Progress').length}
              </p>
            </div>
            <User className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredSchedules.filter(s => s.status === 'Completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {schedules.length === 0 ? 'No Schedules Found' : 'No Matching Schedules'}
            </h3>
            <p className="text-slate-400">
              {schedules.length === 0 
                ? "You don't have any schedules assigned yet." 
                : "Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div key={schedule._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center border ${getStatusColor(schedule.status)}`}>
                      {schedule.status === 'In Progress' && <div className="w-2 h-2 rounded-full bg-orange-400 mr-2 animate-pulse"></div>}
                      {schedule.status}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeFromString(schedule.departureTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(schedule.travelDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-700">
                      <User className="w-4 h-4 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">{schedule.driverId.firstName} {schedule.driverId.lastName}</p>
                        <p className="text-gray-500 text-sm">License: {schedule.driverId.licenseNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Bus className="w-4 h-4 mr-3 text-green-500" />
                      <div>
                        <p className="font-medium">{schedule.busId.numberPlate}</p>
                        <p className="text-gray-500 text-sm">{schedule.busId.busType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-3 text-red-500" />
                      <div>
                        <p className="font-medium">{schedule.startLocation} → {schedule.destination}</p>
                        <p className="text-gray-500 text-sm">{schedule.bookingId.route}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Booking: {schedule.bookingId.bookingId}</span>
                    <span>Passengers: {schedule.bookingId.passengers}</span>
                    <span>Route: {schedule.startLocation} → {schedule.destination}</span>
                  </div>

                  {expandedSchedules[schedule._id] && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Route:</span>
                          <p className="text-gray-900 font-medium">
                            {schedule.startLocation} → {schedule.destination}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Departure Time:</span>
                          <p className="text-gray-900 font-medium">
                            {formatTimeFromString(schedule.departureTime)}
                          </p>
                        </div>
                        {schedule.actualStartTime && (
                          <div>
                            <span className="text-gray-600">Actual Start Time:</span>
                            <p className="text-gray-900 font-medium">{formatDateTime(schedule.actualStartTime)}</p>
                          </div>
                        )}
                        {schedule.actualEndTime && (
                          <div>
                            <span className="text-gray-600">Actual End Time:</span>
                            <p className="text-gray-900 font-medium">{formatDateTime(schedule.actualEndTime)}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Bus Details:</span>
                          <p className="text-gray-900 font-medium">
                            {schedule.busId.busId} - {schedule.busId.busType}
                          </p>
                        </div>
                      </div>
                      
                      {/* Driver Response Buttons for New Assignments */}
                      {schedule.driverResponse === 'pending' && (
                        <div className="flex space-x-3 pt-2">
                          <button 
                            onClick={() => respondToBooking(schedule._id, 'accept')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Accept Assignment
                          </button>
                          <button 
                            onClick={() => respondToBooking(schedule._id, 'decline')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Decline Assignment
                          </button>
                        </div>
                      )}


                      {/* Show Response Status */}
                      {schedule.driverResponse && schedule.driverResponse !== 'pending' && (
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            schedule.driverResponse === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {schedule.driverResponse === 'accepted' ? '✓ Accepted' : '✗ Declined'}
                          </span>
                        </div>
                      )}

                      {/* Show Trip Status */}
                      {(schedule.status === 'In Progress' || schedule.status === 'Started') && (
                        <div className="mt-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            🚌 Trip Started
                          </span>
                        </div>
                      )}

                      {schedule.status === 'Ended' && (
                        <div className="mt-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            ✅ Trip Ended
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleExpand(schedule._id)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {expandedSchedules[schedule._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upcoming Schedule Highlight */}
      {filteredSchedules.filter(s => s.status === 'Scheduled').length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Schedule</h3>
              <p className="text-blue-600">
                Departure: {formatTimeFromString(filteredSchedules.filter(s => s.status === 'Scheduled')[0].departureTime)} - {formatDate(filteredSchedules.filter(s => s.status === 'Scheduled')[0].travelDate)}
              </p>
              <p className="text-gray-700 mt-1">
                {filteredSchedules.filter(s => s.status === 'Scheduled')[0].startLocation} → {filteredSchedules.filter(s => s.status === 'Scheduled')[0].destination}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">Bus</p>
              <p className="text-gray-900 font-medium">{filteredSchedules.filter(s => s.status === 'Scheduled')[0].busId.numberPlate}</p>
              <p className="text-gray-700 text-sm">{filteredSchedules.filter(s => s.status === 'Scheduled')[0].busId.busType}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const DriverDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [notificationCount] = useState(3);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Stable password change handler
  const handlePasswordChange = useCallback(async (currentPassword, newPassword) => {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/update-password`,
      {
        currentPassword,
        newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <DriverProfile />;
      case 'schedule':
        return <ScheduleManagement />;
      case 'settings':
        return <SettingsContent onPasswordChangeClick={() => setShowPasswordModal(true)} />;
      default:
        return <ScheduleManagement />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onChangePassword={handlePasswordChange}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-white/95 backdrop-blur-lg border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                BusZone
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'schedule'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="font-semibold text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 mt-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeTab === 'schedule' ? 'Schedule Management' : 
                   activeTab === 'profile' ? 'Driver Profile' : 
                   activeTab === 'settings' ? 'Account Settings' : 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Driver</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-white text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DriverDashboard;