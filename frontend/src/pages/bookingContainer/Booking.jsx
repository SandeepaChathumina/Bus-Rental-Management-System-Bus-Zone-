// src/pages/bookingContainer/Booking.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  LogOut, 
  Bell,
  Bus,
  Calendar,
  Clock,
  Shield,
  Wifi,
  Coffee,
  Snowflake,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import the actual AuthContext

// Category Component
const Category = () => {
  return (
    <div className='w-full px-6 lg:px-8 py-16 bg-slate-900'>
      <div className="max-w-7xl mx-auto">
        <div className="w-full items-center flex justify-between mb-12">
          <h2 className="text-3xl font-bold text-white">
            Browse by Category
          </h2>
          <Link to={"/bus"} className='text-blue-400 hover:text-cyan-400 transition-colors'>
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Private Bus', color: 'from-blue-500 to-blue-600' },
            { name: 'Tourist Bus', color: 'from-cyan-500 to-blue-500' },
            { name: 'Government Bus', color: 'from-blue-500 to-indigo-500' }
          ].map((category, index) => (
            <div key={index} className="group relative bg-slate-800 rounded-2xl p-6 overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              <div className="h-40 mb-4 flex items-center justify-center">
                <Bus className="h-20 w-20 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white text-center">{category.name}</h3>
              <div className="flex justify-center mt-4">
                <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Seasonal Offers Preview Component
const SeasonalOffersPreview = () => {
  return (
    <div className='w-full px-6 lg:px-8 py-16 bg-gradient-to-b from-slate-900 to-slate-800'>
      <div className="max-w-7xl mx-auto">
        <div className="w-full items-center flex justify-between mb-12">
          <h2 className="text-3xl font-bold text-white">
            Seasonal Offers
          </h2>
          <Link to={"/offers"} className="flex items-center text-blue-400 hover:text-cyan-400 transition-colors">
            View All
            <Sparkles className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summer Offer */}
          <div className="relative bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium rounded-full mb-3">
                  ☀️ Summer Special
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  25% Off Coastal Destinations
                </h3>
                <p className="text-slate-300 mb-4">
                  Beat the heat with our summer special! Perfect for family vacations.
                </p>
                <div className="flex items-center text-sm text-slate-400">
                  <span>Valid until: Aug 31, 2024</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-lg font-bold px-4 py-2 rounded-lg">
                25%
              </div>
            </div>
          </div>
          
          {/* Winter Offer */}
          <div className="relative bg-gradient-to-r from-blue-400/20 to-indigo-600/20 rounded-2xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full mb-3">
                  ❄️ Winter Holiday
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  30% Off Mountain Getaways
                </h3>
                <p className="text-slate-300 mb-4">
                  Cozy up this winter with special holiday packages for Christmas.
                </p>
                <div className="flex items-center text-sm text-slate-400">
                  <span>Valid until: Dec 25, 2024</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-lg font-bold px-4 py-2 rounded-lg">
                30%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
// Navbar Component
const BookingNavbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the actual AuthContext

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <div className='w-full h-[80px] bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center px-6 lg:px-8 fixed top-0 z-50'>
      {/* Logo section */}
      <Link to={"/"} className='mr-16 flex items-center space-x-3'>
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-xl shadow-lg">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full"></div>
        </div>
        <div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            BusZone+
          </div>
          <div className="text-xs text-slate-400">
            Premium Bus Rentals
          </div>
        </div>
      </Link>

      {/* Right side section */}
      <div className="flex items-center space-x-6 ml-auto">
        {/* Notification Bell */}
        <button 
          onClick={handleNotificationsClick}
          className="relative p-2 text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all duration-300"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-cyan-400 w-2 h-2 rounded-full animate-ping"></span>
        </button>
        
        {/* Contact Info */}
        <div className="hidden md:flex items-center space-x-2 text-slate-300 group">
          <div className="relative">
            <Phone className="h-4 w-4 text-blue-400 group-hover:animate-bounce" />
            <div className="absolute -top-1 -right-1 bg-blue-400 w-2 h-2 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm group-hover:text-blue-400 transition-colors">
            +94 704 222 777
          </span>
        </div>
        
        {/* User section */}
        {user ? (
          <div className="flex items-center space-x-3 profile-dropdown">
            {/* Profile Icon with Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold shadow-lg hover:scale-105 transition-transform"
                title="View Profile"
              >
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-700">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-sm font-medium text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Hero Section
const BookingHero = () => {
  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden bg-slate-950 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-500/20 border border-blue-400/30 mb-6">
              <span className="text-blue-400 font-semibold">Book Your Journey</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Luxury Bus <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Travel</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-8 max-w-2xl">
              Experience premium comfort with our luxury fleet. Book your next journey with ease and enjoy world-class amenities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Book Now
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 border border-slate-700">
                View Fleet
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Wifi, label: "Free WiFi", color: "text-blue-400" },
                  { icon: Coffee, label: "Refreshments", color: "text-cyan-400" },
                  { icon: Snowflake, label: "AC & Heating", color: "text-blue-400" },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`${item.color} p-2 rounded-xl bg-slate-800 w-fit mx-auto mb-2`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold">Premium Features</h3>
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Leather Seats", "Entertainment", "USB Charging", "Spacious"].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Component
const BookingSearch = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Ride</h2>
            <p className="text-slate-400">Search and book luxury buses with ease</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Location</option>
                  <option value="colombo">Colombo</option>
                  <option value="kandy">Kandy</option>
                  <option value="galle">Galle</option>
                  <option value="jaffna">Jaffna</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Location</option>
                  <option value="colombo">Colombo</option>
                  <option value="kandy">Kandy</option>
                  <option value="galle">Galle</option>
                  <option value="jaffna">Jaffna</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="time" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Booking Component
const Booking = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <BookingNavbar />
      <BookingHero />
      <BookingSearch />
      <Category />
      <SeasonalOffersPreview />
      
      {/* Features Section */}
      <div className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Our buses are regularly maintained and drivers are highly trained for your safety.",
                color: "text-blue-400"
              },
              {
                icon: Clock,
                title: "On Time Always",
                description: "We pride ourselves on punctuality with a 98% on-time arrival record.",
                color: "text-cyan-400"
              },
              {
                icon: Wifi,
                title: "Stay Connected",
                description: "Free WiFi available on all our premium buses to keep you connected.",
                color: "text-blue-400"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
                <div className={`${feature.color} p-3 rounded-xl w-fit mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;