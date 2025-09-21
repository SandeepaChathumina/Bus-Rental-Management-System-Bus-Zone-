// src/components/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  BarChart3,
  Shield,
  HelpCircle,
  ChevronDown,
  Download,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DriverDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [notificationCount, setNotificationCount] = useState(3);

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

  const driverProfile = user.driverProfile || {};
  const licenseNumber = driverProfile.licenseNumber || '—';
  const licenseExpiry = driverProfile.licenseExpiry
    ? new Date(driverProfile.licenseExpiry).toLocaleDateString()
    : '—';
  const contact = user.phone || user.contactNumber || '—';
  const email = user.email || '—';
  const nic = driverProfile.nic || '—';
  const assignedBus = driverProfile.assignedBus || '—';

  // 🚨 Replace these with real fetched data when backend endpoints exist
  const scheduleData = driverProfile.schedule || [
    { id: 1, route: 'Colombo to Kandy', departure: '08:00 AM', arrival: '11:30 AM', status: 'Scheduled' }
  ];

  const salaryData = driverProfile.salary || {
    currentMonth: 'N/A',
    lastMonth: 'N/A',
    upcomingPayment: 'N/A',
    hoursLogged: 'N/A'
  };

  // Overlay for mobile when sidebar is open
  const overlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={overlayClick}
        ></div>
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
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {[
            { id: 'schedule', icon: Calendar, label: 'My Schedule' },
            { id: 'salary', icon: DollarSign, label: 'Salary Details' },
            { id: 'profile', icon: User, label: 'Driver Profile' },
            { id: 'performance', icon: BarChart3, label: 'Performance' },
            { id: 'safety', icon: Shield, label: 'Safety Guidelines' },
            { id: 'help', icon: HelpCircle, label: 'Help & Support' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
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
            onClick={logout}
            className="w-full flex items-center p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
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
            {activeTab === 'settings' && 'Settings'}
          </h1>

          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
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
                  <div className="text-xs text-slate-400">{driverId}</div>
                </div>
              )}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          {/* Schedule View */}
          {activeTab === 'schedule' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4">Today's Schedule</h2>
              {scheduleData.length === 0 ? (
                <p className="text-slate-400">No trips assigned.</p>
              ) : (
                scheduleData.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 p-4 rounded-xl mb-3 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white">{item.route}</h3>
                    <div className="flex items-center text-slate-300 text-sm mt-1">
                      <Clock className="h-4 w-4 mr-1 text-blue-400" />
                      <span>
                        {item.departure} - {item.arrival}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Salary View */}
          {activeTab === 'salary' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Earnings Overview</h2>
              <p className="text-white">Current Month: {salaryData.currentMonth}</p>
              <p className="text-white">Last Month: {salaryData.lastMonth}</p>
              <p className="text-white">Next Payment: {salaryData.upcomingPayment}</p>
              <p className="text-white">Hours Logged: {salaryData.hoursLogged}</p>
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Driver Profile</h2>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="w-20 h-20 rounded-full border-4 border-blue-500 mb-4"
                  />
                  <h3 className="text-lg font-bold text-white">{fullName}</h3>
                  <p className="text-slate-400 text-sm">ID: {driverId}</p>
                  <p className="text-slate-400 text-sm">Email: {email}</p>
                  <p className="text-slate-400 text-sm">Phone: {contact}</p>
                  <p className="text-slate-400 text-sm">NIC: {nic}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-4">License Info</h3>
                  <p className="text-white">Number: {licenseNumber}</p>
                  <p className="text-white">Expiry: {licenseExpiry}</p>
                  <p className="text-white">Assigned Bus: {assignedBus}</p>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs */}
          {activeTab !== 'schedule' && activeTab !== 'salary' && activeTab !== 'profile' && (
            <div className="bg-slate-800 rounded-2xl p-5 text-center text-white">
              Section under development
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
