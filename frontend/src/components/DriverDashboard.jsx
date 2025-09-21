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

const DriverDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [notificationCount, setNotificationCount] = useState(3);
  const [userData] = useState({
    name: "Robert Johnson",
    id: "DRV-7824",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  });

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

  // Sample data
  const scheduleData = [
    { id: 1, route: "Colombo to Kandy", departure: "08:00 AM", arrival: "11:30 AM", status: "Scheduled" },
    { id: 2, route: "Kandy to Galle", departure: "01:00 PM", arrival: "05:45 PM", status: "Scheduled" },
    { id: 3, route: "Galle to Colombo", departure: "07:00 PM", arrival: "10:15 PM", status: "Completed" }
  ];

  const salaryData = {
    currentMonth: "$2,850",
    lastMonth: "$2,650",
    upcomingPayment: "May 15, 2023",
    hoursLogged: "178 hours"
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
      <div className={`bg-slate-900 text-white transition-all duration-300 z-30 fixed md:relative h-full ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
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
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                    <span className="text-sm whitespace-nowrap">{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button className="w-full flex items-center p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors group">
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                <span className="text-sm whitespace-nowrap">Logout</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center">
            {!isSidebarOpen && !isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors mr-2"
              >
                <Menu className="h-5 w-5 text-white" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {activeTab === 'schedule' && 'Driver Schedule'}
              {activeTab === 'salary' && 'Salary Details'}
              {activeTab === 'profile' && 'Driver Profile'}
              {activeTab === 'performance' && 'Performance Analytics'}
              {activeTab === 'safety' && 'Safety Guidelines'}
              {activeTab === 'help' && 'Help & Support'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Notification Bell - Added to Header */}
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
                src={userData.profileImage} 
                alt={userData.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-blue-500"
              />
              {!isMobile && (
                <div className="text-right">
                  <div className="text-white font-medium text-sm md:text-base">{userData.name}</div>
                  <div className="text-xs text-slate-400">{userData.id}</div>
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
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-700/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-0">Today's Schedule</h2>
                <div className="flex items-center space-x-2 text-blue-400">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">May 12, 2023</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {scheduleData.map((item) => (
                  <div key={item.id} className="bg-slate-800/50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-700/50 hover:border-blue-400/50 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-white">{item.route}</h3>
                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-2">
                          <div className="flex items-center text-slate-300 text-sm md:text-base">
                            <Clock className="h-4 w-4 mr-1 text-blue-400" />
                            <span>{item.departure} - {item.arrival}</span>
                          </div>
                          <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium self-start md:self-auto ${
                            item.status === 'Scheduled' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 md:p-3 rounded-lg md:rounded-xl hover:scale-105 transition-transform ml-4">
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Overview</h3>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className={`p-2 md:p-3 rounded-lg md:rounded-xl text-center transition-all duration-300 ${
                      index === 4 
                        ? 'bg-gradient-to-b from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}>
                      <div className="text-xs md:text-sm">{day}</div>
                      <div className="font-bold mt-1 text-sm md:text-base">{index === 4 ? '3' : index % 2 === 0 ? '2' : '1'}</div>
                      <div className="text-xs opacity-70 hidden md:block">trips</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Salary View */}
          {activeTab === 'salary' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-700/50">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Earnings Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-white">Current Month</h3>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">{salaryData.currentMonth}</div>
                  <div className="text-slate-400 text-sm md:text-base">Estimated earnings</div>
                </div>
                
                <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-white">Last Month</h3>
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">{salaryData.lastMonth}</div>
                  <div className="text-slate-400 text-sm md:text-base">Total earned</div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-700/50 mb-6">
                <h3 className="text-base md:text-lg font-semibold text-white mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm">Next Payment Date</div>
                    <div className="text-white font-medium text-base">{salaryData.upcomingPayment}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Hours Logged</div>
                    <div className="text-white font-medium text-base">{salaryData.hoursLogged}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Payment Method</div>
                    <div className="text-white font-medium text-base">Direct Deposit</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Tax Documents</div>
                    <div className="text-blue-400 font-medium text-base hover:underline cursor-pointer flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                View Detailed Report
              </button>
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-700/50">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Driver Profile</h2>
              
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-700/50 flex-1 w-full">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-x-0 md:space-x-4 space-y-4 md:space-y-0 mb-6">
                    <img 
                      src={userData.profileImage} 
                      alt={userData.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-blue-500"
                    />
                    <div className="text-center md:text-left">
                      <h3 className="text-lg md:text-xl font-bold text-white">{userData.name}</h3>
                      <p className="text-slate-400 text-sm md:text-base">{userData.id}</p>
                      <div className="flex items-center justify-center md:justify-start mt-2 text-sm text-slate-300">
                        <Shield className="h-4 w-4 mr-1 text-green-400" />
                        <span>Verified Driver</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                
                <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-700/50 flex-1 w-full">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4">Driver Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm md:text-base">License Number:</span>
                      <span className="text-white text-sm md:text-base">B5247896301</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm md:text-base">License Expiry:</span>
                      <span className="text-white text-sm md:text-base">March 15, 2025</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm md:text-base">Contact Number:</span>
                      <span className="text-white text-sm md:text-base">+94 77 123 4567</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm md:text-base">Email:</span>
                      <span className="text-white text-sm md:text-base">robert.j@example.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm md:text-base">Years with Company:</span>
                      <span className="text-white text-sm md:text-base">3 years</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-700/50">
                <h3 className="text-base md:text-lg font-semibold text-white mb-4">Vehicle Assignment</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="mb-2 md:mb-0">
                    <div className="text-white font-medium text-base md:text-lg">Volvo 9700 Luxury Coach</div>
                    <div className="text-slate-400 text-sm md:text-base">Vehicle ID: BUS-4582</div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-green-400 font-medium text-base md:text-lg">Available</div>
                    <div className="text-slate-400 text-sm md:text-base">Next maintenance: June 5, 2023</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== 'schedule' && activeTab !== 'salary' && activeTab !== 'profile' && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-700/50 text-center py-12">
              <div className="text-blue-400 mb-4">
                {activeTab === 'performance' && <BarChart3 className="h-12 w-12 md:h-16 md:w-16 mx-auto" />}
                {activeTab === 'safety' && <Shield className="h-12 w-12 md:h-16 md:w-16 mx-auto" />}
                {activeTab === 'help' && <HelpCircle className="h-12 w-12 md:h-16 md:w-16 mx-auto" />}
                {activeTab === 'settings' && <Settings className="h-12 w-12 md:h-16 md:w-16 mx-auto" />}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {activeTab === 'performance' && 'Performance Analytics'}
                {activeTab === 'safety' && 'Safety Guidelines'}
                {activeTab === 'help' && 'Help & Support'}
                {activeTab === 'settings' && 'Settings'}
              </h2>
              <p className="text-slate-400">This section is under development</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;