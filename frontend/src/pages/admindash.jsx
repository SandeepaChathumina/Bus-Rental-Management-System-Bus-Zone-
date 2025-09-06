import React, { useState, useEffect } from 'react';
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
  Edit,
  Trash2,
  Eye,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Menu,
  X,
  Home,
  LogOut,
  Image,
  ChevronDown,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Toggle expandable items
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Sample data with images
  const [dashboardStats] = useState({
    totalUsers: 1245,
    totalBuses: 48,
    activeBookings: 156,
    maintenanceRequests: 12,
    revenue: 1256000,
    occupancyRate: 78
  });

  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@email.com', 
      role: 'passenger', 
      status: 'active', 
      joinDate: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastLogin: '2 hours ago',
      trips: 12
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@email.com', 
      role: 'driver', 
      status: 'active', 
      joinDate: '2024-02-20',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastLogin: '5 hours ago',
      trips: 24
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@email.com', 
      role: 'staff', 
      status: 'inactive', 
      joinDate: '2024-03-10',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastLogin: '2 days ago',
      trips: 8
    }
  ]);

  const [buses, setBuses] = useState([
    { 
      id: 1, 
      busId: 'BS001', 
      type: 'Luxury', 
      numberPlate: 'ABC-1234', 
      capacity: 45, 
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      currentRoute: 'City A to City B',
      nextMaintenance: '2024-10-15'
    },
    { 
      id: 2, 
      busId: 'BS002', 
      type: 'Standard', 
      numberPlate: 'XYZ-5678', 
      capacity: 35, 
      status: 'In Service',
      image: 'https://images.unsplash.com/photo-1502550900787-e956c314a221?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      currentRoute: 'City C to City D',
      nextMaintenance: '2024-09-28'
    },
    { 
      id: 3, 
      busId: 'BS003', 
      type: 'Deluxe', 
      numberPlate: 'DEF-9012', 
      capacity: 40, 
      status: 'Maintenance',
      image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      currentRoute: 'N/A',
      nextMaintenance: '2024-09-20'
    }
  ]);

  const [notifications] = useState([
    { id: 1, title: 'New Booking Request', message: 'Booking #1234 requires approval', time: '2 min ago', type: 'info', read: false },
    { id: 2, title: 'Maintenance Alert', message: 'Bus BS003 maintenance overdue', time: '1 hour ago', type: 'warning', read: false },
    { id: 3, title: 'Payment Received', message: 'Payment for booking #1230 confirmed', time: '3 hours ago', type: 'success', read: true },
    { id: 4, title: 'Route Update', message: 'New route added: City E to City F', time: '5 hours ago', type: 'info', read: true }
  ]);

  const [maintenance] = useState([
    { id: 1, busId: 'BS003', issue: 'Engine Service', priority: 'High', status: 'Pending', cost: 15000, date: '2024-09-01', estimatedTime: '3 days' },
    { id: 2, busId: 'BS001', issue: 'Brake Check', priority: 'Medium', status: 'In Progress', cost: 8000, date: '2024-09-03', estimatedTime: '1 day' },
    { id: 3, busId: 'BS005', issue: 'Tire Replacement', priority: 'Low', status: 'Completed', cost: 12000, date: '2024-08-28', estimatedTime: '2 days' }
  ]);

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

  // Skeleton Loader Component
  const SkeletonLoader = ({ type = 'text', className = '' }) => (
    <div 
      className={`bg-gray-700 animate-pulse rounded-md ${type === 'text' ? 'h-4' : type === 'avatar' ? 'w-10 h-10 rounded-full' : type === 'image' ? 'w-full h-32' : ''} ${className}`}
    ></div>
  );

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue", index }) => {
    const colorMap = {
      blue: { bg: 'bg-blue-900/20', icon: 'text-blue-400', text: 'text-blue-300' },
      green: { bg: 'bg-green-900/20', icon: 'text-green-400', text: 'text-green-300' },
      purple: { bg: 'bg-purple-900/20', icon: 'text-purple-400', text: 'text-purple-300' },
      orange: { bg: 'bg-orange-900/20', icon: 'text-orange-400', text: 'text-orange-300' }
    };

    const colors = colorMap[color] || colorMap.blue;

    return (
      <div 
        className={`bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-${color}-500/50 relative overflow-hidden group`}
        style={{ 
          animationDelay: `${index * 100}ms`,
          animation: 'fadeInUp 0.6s ease-out forwards',
          opacity: 0
        }}
      >
        {/* Animated background effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colors.bg}`}></div>
        
        {isLoading ? (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SkeletonLoader className="w-24 h-4 mb-2" />
              <SkeletonLoader className="w-16 h-8 mb-2" />
              {trend && <SkeletonLoader className="w-20 h-3" />}
            </div>
            <SkeletonLoader type="avatar" className="w-12 h-12" />
          </div>
        ) : (
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
              {trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm font-medium">{trend}</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const DataTable = ({ data, columns, onEdit, onDelete, onView, isLoading, expandable }) => (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              {expandable && <th className="w-10 px-4 py-3"></th>}
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {isLoading ? (
              // Skeleton rows for loading state
              Array(5).fill(0).map((_, index) => (
                <tr key={index} className="hover:bg-slate-700/30 transition-colors duration-200">
                  {expandable && <td className="px-4 py-4"><SkeletonLoader className="w-4 h-4" /></td>}
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <SkeletonLoader className="w-3/4" />
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <SkeletonLoader className="w-6 h-6 rounded" />
                      <SkeletonLoader className="w-6 h-6 rounded" />
                      <SkeletonLoader className="w-6 h-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              data.map((row, index) => (
                <>
                  <tr 
                    key={index} 
                    className="hover:bg-slate-700/30 transition-colors duration-200 group"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeIn 0.5s ease-out forwards',
                      opacity: 0
                    }}
                  >
                    {expandable && (
                      <td className="px-4 py-4">
                        <button 
                          onClick={() => toggleExpand(row.id)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {expandedItems[row.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {onView && (
                          <button 
                            onClick={() => onView(row)}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 transform hover:scale-110"
                            aria-label={`View ${row.name || row.busId}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 transform hover:scale-110"
                            aria-label={`Edit ${row.name || row.busId}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(row)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 transform hover:scale-110"
                            aria-label={`Delete ${row.name || row.busId}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandable && expandedItems[row.id] && (
                    <tr className="bg-slate-750/50">
                      <td colSpan={columns.length + 2} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                          {row.additionalInfo && Object.entries(row.additionalInfo).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StatusBadge = ({ status, type = "default" }) => {
    const colors = {
      active: 'bg-green-900/30 text-green-400 border border-green-800/50',
      inactive: 'bg-red-900/30 text-red-400 border border-red-800/50',
      pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50',
      completed: 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
      available: 'bg-green-900/30 text-green-400 border border-green-800/50',
      maintenance: 'bg-orange-900/30 text-orange-400 border border-orange-800/50',
      'in service': 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
      high: 'bg-red-900/30 text-red-400 border border-red-800/50',
      medium: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50',
      low: 'bg-green-900/30 text-green-400 border border-green-800/50',
      default: 'bg-gray-900/30 text-gray-400 border border-gray-800/50'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status?.toLowerCase()] || colors.default}`}>
        {status}
      </span>
    );
  };

  const UserAvatar = ({ src, name, className = "" }) => {
    const [imgError, setImgError] = useState(false);
    
    return imgError || !src ? (
      <div className={`bg-blue-600 rounded-full flex items-center justify-center text-white font-medium ${className}`}>
        {name ? name.charAt(0).toUpperCase() : 'U'}
      </div>
    ) : (
      <img 
        src={src} 
        alt={name} 
        className={`rounded-full object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  };

  const BusImage = ({ src, busId, className = "" }) => {
    const [imgError, setImgError] = useState(false);
    
    return imgError || !src ? (
      <div className={`bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 ${className}`}>
        <Bus className="w-8 h-8" />
      </div>
    ) : (
      <img 
        src={src} 
        alt={`Bus ${busId}`} 
        className={`rounded-lg object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={dashboardStats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend="+12% this month"
          color="blue"
          index={0}
        />
        <StatCard 
          title="Total Buses" 
          value={dashboardStats.totalBuses} 
          icon={Bus} 
          trend="+3 new buses"
          color="green"
          index={1}
        />
        <StatCard 
          title="Active Bookings" 
          value={dashboardStats.activeBookings} 
          icon={BookOpen} 
          trend="+8% this week"
          color="purple"
          index={2}
        />
        <StatCard 
          title="Maintenance Requests" 
          value={dashboardStats.maintenanceRequests} 
          icon={Wrench} 
          color="orange"
          index={3}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Monthly Revenue" 
          value={`LKR ${dashboardStats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+5.2% from last month"
          color="green"
          index={4}
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${dashboardStats.occupancyRate}%`} 
          icon={TrendingUp} 
          trend="+3% from last week"
          color="blue"
          index={5}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-md transition-all duration-300 group"
          style={{ 
            animation: 'fadeIn 0.8s ease-out forwards',
            animationDelay: '400ms',
            opacity: 0
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg">
                  <SkeletonLoader type="avatar" className="w-2 h-2 mt-2" />
                  <div className="flex-1">
                    <SkeletonLoader className="w-32 h-4 mb-2" />
                    <SkeletonLoader className="w-48 h-3 mb-1" />
                    <SkeletonLoader className="w-20 h-3" />
                  </div>
                </div>
              ))
            ) : (
              notifications.slice(0, 5).map((notif, index) => (
                <div 
                  key={notif.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-slate-700/30 cursor-pointer ${notif.read ? 'opacity-70' : ''}`}
                  style={{ 
                    animationDelay: `${500 + index * 100}ms`,
                    animation: 'fadeInRight 0.5s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notif.type === 'success' ? 'bg-green-500' : 
                    notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{notif.title}</h4>
                    <p className="text-sm text-slate-300 truncate">{notif.message}</p>
                    <span className="text-xs text-slate-400">{notif.time}</span>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-md transition-all duration-300 group"
          style={{ 
            animation: 'fadeIn 0.8s ease-out forwards',
            animationDelay: '400ms',
            opacity: 0
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              Array(4).fill(0).map((_, index) => (
                <SkeletonLoader key={index} className="h-16 rounded-lg" />
              ))
            ) : (
              <>
                <button className="flex flex-col items-center justify-center p-4 bg-blue-900/20 rounded-lg hover:bg-blue-900/40 transition-all duration-200 transform hover:scale-105 border border-blue-800/30 group-hover:border-blue-700/50">
                  <Plus className="w-6 h-6 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-blue-300">Add User</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-green-900/20 rounded-lg hover:bg-green-900/40 transition-all duration-200 transform hover:scale-105 border border-green-800/30 group-hover:border-green-700/50">
                  <Plus className="w-6 h-6 text-green-400 mb-2" />
                  <span className="text-sm font-medium text-green-300">Add Bus</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-purple-900/20 rounded-lg hover:bg-purple-900/40 transition-all duration-200 transform hover:scale-105 border border-purple-800/30 group-hover:border-purple-700/50">
                  <Calendar className="w-6 h-6 text-purple-400 mb-2" />
                  <span className="text-sm font-medium text-purple-300">Schedule</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-orange-900/20 rounded-lg hover:bg-orange-900/40 transition-all duration-200 transform hover:scale-105 border border-orange-800/30 group-hover:border-orange-700/50">
                  <BarChart3 className="w-6 h-6 text-orange-400 mb-2" />
                  <span className="text-sm font-medium text-orange-300">Reports</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const UserManagement = () => {
    const userColumns = [
      { 
        key: 'name', 
        label: 'Name', 
        render: (value, row) => (
          <div className="flex items-center">
            <UserAvatar src={row.avatar} name={value} className="w-8 h-8 mr-3" />
            <div>
              <div className="font-medium text-white">{value}</div>
              <div className="text-xs text-slate-400">ID: {row.id}</div>
            </div>
          </div>
        )
      },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (value) => <StatusBadge status={value} /> },
      { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
      { key: 'joinDate', label: 'Join Date' }
    ];

    // Add additional info for expandable rows
    const usersWithAdditionalInfo = users.map(user => ({
      ...user,
      additionalInfo: {
        lastLogin: user.lastLogin,
        totalTrips: user.trips
      }
    }));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-blue-600/30">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors duration-200">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg shadow-green-600/30">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          
          <DataTable
            data={usersWithAdditionalInfo}
            columns={userColumns}
            onEdit={(user) => console.log('Edit user:', user)}
            onDelete={(user) => console.log('Delete user:', user)}
            onView={(user) => console.log('View user:', user)}
            isLoading={isLoading}
            expandable={true}
          />
        </div>
      </div>
    );
  };

  const BusManagement = () => {
    const busColumns = [
      { 
        key: 'busId', 
        label: 'Bus', 
        render: (value, row) => (
          <div className="flex items-center">
            <BusImage src={row.image} busId={value} className="w-12 h-12 mr-3" />
            <div>
              <div className="font-medium text-white">{value}</div>
              <div className="text-xs text-slate-400">{row.type}</div>
            </div>
          </div>
        )
      },
      { key: 'numberPlate', label: 'Number Plate' },
      { key: 'capacity', label: 'Capacity', render: (value) => `${value} seats` },
      { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
      { key: 'currentRoute', label: 'Current Route' }
    ];

    // Add additional info for expandable rows
    const busesWithAdditionalInfo = buses.map(bus => ({
      ...bus,
      additionalInfo: {
        nextMaintenance: bus.nextMaintenance
      }
    }));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Bus Management</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-green-600/30">
            <Plus className="w-4 h-4" />
            <span>Add Bus</span>
          </button>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <DataTable
            data={busesWithAdditionalInfo}
            columns={busColumns}
            onEdit={(bus) => console.log('Edit bus:', bus)}
            onDelete={(bus) => console.log('Delete bus:', bus)}
            onView={(bus) => console.log('View bus:', bus)}
            isLoading={isLoading}
            expandable={true}
          />
        </div>
      </div>
    );
  };

  const MaintenanceManagement = () => {
    const maintenanceColumns = [
      { key: 'busId', label: 'Bus ID' },
      { key: 'issue', label: 'Issue' },
      { key: 'priority', label: 'Priority', render: (value) => <StatusBadge status={value} /> },
      { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
      { key: 'cost', label: 'Cost', render: (value) => `LKR ${value.toLocaleString()}` },
      { key: 'date', label: 'Date' }
    ];

    // Add additional info for expandable rows
    const maintenanceWithAdditionalInfo = maintenance.map(item => ({
      ...item,
      additionalInfo: {
        estimatedTime: item.estimatedTime
      }
    }));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Maintenance Management</h2>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-orange-600/30">
            <Plus className="w-4 h-4" />
            <span>Add Request</span>
          </button>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <DataTable
            data={maintenanceWithAdditionalInfo}
            columns={maintenanceColumns}
            onEdit={(item) => console.log('Edit maintenance:', item)}
            onDelete={(item) => console.log('Delete maintenance:', item)}
            onView={(item) => console.log('View maintenance:', item)}
            isLoading={isLoading}
            expandable={true}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'buses':
        return <BusManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      default:
        return (
          <div 
            className="flex items-center justify-center h-96"
            style={{ 
              animation: 'fadeIn 0.8s ease-out forwards',
              opacity: 0
            }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
              <p className="text-slate-400">{menuItems.find(item => item.id === activeTab)?.label} module is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInRight {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from { 
            transform: translateX(-100%);
          }
          to { 
            transform: translateX(0);
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center">
            <img 
              src="https://via.placeholder.com/40x40?text=BZ+" 
              alt="BosZone+ Logo" 
              className="h-8 w-8 mr-2 rounded"
            />
            <h1 className="text-xl font-bold text-white">BosZone+</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInRight 0.5s ease-out forwards',
                  opacity: 0
                }}
              >
                <Icon className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
                {activeTab !== item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button 
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header 
          className="border-b border-slate-800 bg-slate-900"
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-slate-800 text-white mr-4 transition-colors duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white capitalize">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-slate-800 transition-colors duration-200">
                  <Bell className="w-6 h-6 text-slate-300 hover:text-white transition-colors duration-200" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">3</span>
              </div>
              <div className="flex items-center space-x-3 cursor-pointer group">
                <UserAvatar 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  name="Admin User" 
                  className="w-8 h-8" 
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400">Super Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {isLoading && activeTab === 'dashboard' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, index) => (
                  <SkeletonLoader key={index} className="h-32 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonLoader className="h-80 rounded-xl" />
                <SkeletonLoader className="h-80 rounded-xl" />
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;