// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`
      );

      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Login attempt with:', credentials);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        credentials
      );
      
      console.log('✅ Login response received:', response.data);
      
      const { token, user: userData } = response.data;

      if (!userData || !userData.role) {
        console.error('❌ No user data or role in response');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      console.log('👤 User data:', userData);
      console.log('🎯 User role:', userData.role);

      // Save token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data
      setUser(userData);

      return { 
        success: true, 
        user: userData,
        token: token
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registration attempt with:', userData);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        userData
      );
      
      console.log('✅ Registration response:', response.data);
      
      const { token, user: newUser } = response.data;

      // Save token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data
      setUser(newUser);

      return { 
        success: true, 
        user: newUser 
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';

      if (errorMessage.includes('email') && errorMessage.includes('already')) {
        return {
          success: false,
          message: 'Email is already registered. Please use a different email.',
        };
      }

      if (errorMessage.includes('username') && errorMessage.includes('already')) {
        return {
          success: false,
          message: 'Username is already taken. Please choose a different username.',
        };
      }

      if (errorMessage.includes('phone') && errorMessage.includes('duplicate')) {
        return {
          success: false,
          message: 'Phone number is already registered. Please use a different phone number.',
        };
      }

      if (errorMessage.includes('nic') && errorMessage.includes('duplicate')) {
        return {
          success: false,
          message: 'NIC is already registered. Please use a different NIC number.',
        };
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};