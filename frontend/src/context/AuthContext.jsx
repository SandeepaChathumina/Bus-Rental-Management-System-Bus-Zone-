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
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        credentials
      );
      const { token } = response.data;

      // save token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 🔑 Fetch full user details (with driverProfile/staffProfile)
      await checkAuthStatus();

      window.dispatchEvent(new CustomEvent('authChange'));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        userData
      );
      const { token } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // fetch full user after register
      await checkAuthStatus();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed';

      if (errorMessage.includes('email') && errorMessage.includes('already')) {
        return {
          success: false,
          message:
            'Email is already registered. Please use a different email.',
        };
      }

      if (errorMessage.includes('phone') && errorMessage.includes('duplicate')) {
        return {
          success: false,
          message:
            'Phone number is already registered. Please use a different phone number.',
        };
      }

      if (errorMessage.includes('nic') && errorMessage.includes('duplicate')) {
        return {
          success: false,
          message:
            'NIC is already registered. Please use a different NIC number.',
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
