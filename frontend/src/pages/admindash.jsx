// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import AttendanceManagement from '../components/AttendanceManagement'; 
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
  ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(null);
  const navigate = useNavigate();

  const [dashboardStats] = useState({
    totalBuses: 48,
    activeBookings: 156,
    maintenanceRequests: 12,
    revenue: 1256000,
    occupancyRate: 78
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchTotalUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
        if (!mounted) return;
        const arr = res.data || [];
        setTotalUsers(Array.isArray(arr) ? arr.length : (arr.count || 0));
      } catch (err) {
        console.error('Failed to fetch total users', err);
        if (mounted) setTotalUsers(0);
      }
    };
    fetchTotalUsers();
    return () => { mounted = false; };
  }, []);

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
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'attendance', label: 'Attendance', icon: Clock },
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
        {/* Quick Actions */}
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
            <button className="flex flex-col items-center justify-center p-4 bg-green-900/20 rounded-lg">
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

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <p className="text-slate-400">Latest system events will show here (plug notifications as needed).</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'buses':
        return <div className="text-white">Bus Management (placeholder)</div>;
      case 'maintenance':
        return <div className="text-white">Maintenance (placeholder)</div>;
      case 'attendance':
        return <AttendanceManagement />;
      default:
        return <div className="text-white">Module under development</div>;
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

      {/* Main */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-800 text-white mr-4">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white capitalize">{menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h2>
            </div>

            {/* Right side */}
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
