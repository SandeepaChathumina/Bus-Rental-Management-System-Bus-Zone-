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
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DriverProfile from './DriverProfile';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  const handleInputChange = useCallback((field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
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

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
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
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  }, [passwordData, onChangePassword, onClose]);

  const handleClose = useCallback(() => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
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
                minLength={6}
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
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
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
              disabled={changingPassword}
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
  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
    <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
    <div className="space-y-6">
      {/* Password Change Card */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Lock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Password & Security</h3>
              <p className="text-slate-400 text-sm">Update your password to keep your account secure</p>
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
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <div className="text-green-400 text-sm font-semibold">Last Changed</div>
            <div className="text-slate-300 text-xs mt-1">2 months ago</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <div className="text-blue-400 text-sm font-semibold">Password Strength</div>
            <div className="text-slate-300 text-xs mt-1">Strong</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <div className="text-purple-400 text-sm font-semibold">Two-Factor</div>
            <div className="text-slate-300 text-xs mt-1">Disabled</div>
          </div>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Bell className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
            <p className="text-slate-400 text-sm">Manage how you receive notifications</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
            <div>
              <div className="text-white font-medium">Email Notifications</div>
              <div className="text-slate-400 text-sm">Receive updates via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
            <div>
              <div className="text-white font-medium">SMS Notifications</div>
              <div className="text-slate-400 text-sm">Receive text message alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
            <div>
              <div className="text-white font-medium">Push Notifications</div>
              <div className="text-slate-400 text-sm">Browser and app notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings Card */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Shield className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
            <p className="text-slate-400 text-sm">Control your privacy preferences</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
            <div>
              <div className="text-white font-medium">Profile Visibility</div>
              <div className="text-slate-400 text-sm">Who can see your profile</div>
            </div>
            <select className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Only Me</option>
              <option>Administrators</option>
              <option>All Staff</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
            <div>
              <div className="text-white font-medium">Activity Tracking</div>
              <div className="text-slate-400 text-sm">Track your driving activity</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
));

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

  const handlePasswordModalOpen = useCallback(() => {
    setShowPasswordModal(true);
  }, []);

  const handlePasswordModalClose = useCallback(() => {
    setShowPasswordModal(false);
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <div className="h-screen flex items-center justify-center text-white">No user data</div>;
  }

  // Extract real driver info
  const fullName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.username || 'Driver';
  const driverId = user._id || 'N/A';
  const profileImage =
    user.profileImage ||
    user.avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';

  // Overlay for mobile when sidebar is open
  const overlayClick = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle notification click
  const handleNotificationClick = useCallback(() => {
    navigate('/notifications');
  }, [navigate]);

  // Handle tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Render content based on active tab
  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'schedule':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Today's Schedule</h2>
            <p className="text-slate-400">Schedule information coming soon...</p>
          </div>
        );

      case 'salary':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Earnings Overview</h2>
            <p className="text-slate-400">Salary information coming soon...</p>
          </div>
        );

      case 'profile':
        return <DriverProfile />;

      case 'performance':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Performance Analytics</h2>
            <div className="text-center py-10">
              <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Performance analytics coming soon...</p>
            </div>
          </div>
        );

      case 'safety':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Safety Guidelines</h2>
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-2">Vehicle Safety</h3>
                <p className="text-slate-300">Always perform pre-trip inspections and maintain vehicle in optimal condition.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-2">Passenger Safety</h3>
                <p className="text-slate-300">Ensure all passengers are seated and follow safety protocols during transit.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-2">Road Safety</h3>
                <p className="text-slate-300">Adhere to traffic rules and maintain safe driving practices at all times.</p>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Help & Support</h2>
            <div className="text-center py-10">
              <HelpCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Contact support for assistance:</p>
              <p className="text-white font-semibold mt-2">support@buszone.com</p>
              <p className="text-white font-semibold">+1 (555) 123-4567</p>
            </div>
          </div>
        );

      case 'settings':
        return <SettingsContent onPasswordChangeClick={handlePasswordModalOpen} />;

      default:
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>
            <p className="text-slate-400">Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  }, [activeTab, handlePasswordModalOpen]);

  const menuItems = [
    { id: 'schedule', icon: Calendar, label: 'My Schedule' },
    { id: 'salary', icon: DollarSign, label: 'Salary Details' },
    { id: 'profile', icon: User, label: 'Driver Profile' },
    { id: 'performance', icon: BarChart3, label: 'Performance' },
    { id: 'safety', icon: Shield, label: 'Safety Guidelines' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onChangePassword={handlePasswordChange}
      />

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={overlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-slate-900 text-white transition-all duration-300 z-30 fixed md:relative h-full ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Driver Portal</span>
            </div>
          )}
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {activeTab === 'schedule' && 'Driver Schedule'}
            {activeTab === 'salary' && 'Salary Details'}
            {activeTab === 'profile' && 'Driver Profile'}
            {activeTab === 'performance' && 'Performance Analytics'}
            {activeTab === 'safety' && 'Safety Guidelines'}
            {activeTab === 'help' && 'Help & Support'}
            {activeTab === 'settings' && 'Account Settings'}
          </h1>

          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <Bell className="h-5 w-5 md:h-6 md:w-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full text-xs flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-xl">
              <img
                src={profileImage}
                alt={fullName}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-blue-500"
              />
              {!isMobile && (
                <div className="text-right">
                  <div className="text-white font-medium text-sm md:text-base">{fullName}</div>
                  <div className="text-xs text-slate-400">Driver ID: {driverId.slice(-6)}</div>
                </div>
              )}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default React.memo(DriverDashboard);