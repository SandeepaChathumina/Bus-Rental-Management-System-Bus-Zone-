// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaBus, FaHome } from 'react-icons/fa';
import b5Image from '../assets/b5.jpeg';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(credentials);
      console.log('Login result:', result);

      if (result.success) {
        toast.success('Login successful!');
        
        // Get user role from the result
        const userRole = result.user?.role;
        console.log('User role:', userRole);
        
        // Navigate based on role
        switch (userRole) {
          case 'admin':
            navigate('/admin-dashboard', { replace: true });
            break;
          case 'driver':
            navigate('/driver-dashboard', { replace: true });
            break;
          case 'staff':
            navigate('/staffdash', { replace: true });
            break;
          case 'passenger':
            navigate('/booking', { replace: true });
            break;
          default:
            navigate('/booking', { replace: true });
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Home Button */}
      <button
        onClick={handleHomeClick}
        className="absolute top-8 left-8 z-20 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20"
      >
        <FaHome className="text-lg" />
        <span className="font-semibold">Home</span>
      </button>

      <div className="flex min-h-screen">
        {/* Left Side - Modern Branding */}
        <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-12">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${b5Image})` }}
          ></div>
          
          {/* Modern Glass Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl max-w-lg">
            <div className="text-center">
              {/* Logo */}
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <FaBus className="text-4xl text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">BusZone+</h1>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full"></div>
              </div>

              {/* Content */}
              <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                Smart Bus Management
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Intelligent transportation solutions for modern cities
              </p>

              {/* Features */}
              <div className="space-y-4 text-left">
                {[
                  "Role-based Access Control",
                  "Real-time Bus Tracking", 
                  "Automated Scheduling",
                  "Multi-platform Support"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                    <span className="text-blue-100">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <FaBus className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">BusZone+</h1>
              <p className="text-blue-200 mt-2">Smart Bus Management System</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome Back</h2>
                <p className="text-gray-600 text-lg">Sign in to your account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

              {/* Demo Credentials Hint */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Demo:</strong> Use your registered username and password
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;