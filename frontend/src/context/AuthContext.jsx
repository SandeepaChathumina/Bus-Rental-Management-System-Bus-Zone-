// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // In AuthContext.jsx, update the login function
const login = async (credentials) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user); // This should store the complete user object
    
    return { success: true, user }; // Return user data
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
};

  const register = async (userData) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, userData);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    
    return { success: true };
  } catch (error) {
    // Check if it's an email duplication error
    const errorMessage = error.response?.data?.message || 'Registration failed';
    
    if (errorMessage.includes('email') && errorMessage.includes('already')) {
      return { 
        success: false, 
        message: 'Email is already registered. Please use a different email.' 
      };
    }
    
    // Check if it's a phone duplication error
    if (errorMessage.includes('phone') && errorMessage.includes('duplicate')) {
      return { 
        success: false, 
        message: 'Phone number is already registered. Please use a different phone number.' 
      };
    }
    
    // Check if it's a NIC duplication error
    if (errorMessage.includes('nic') && errorMessage.includes('duplicate')) {
      return { 
        success: false, 
        message: 'NIC is already registered. Please use a different NIC number.' 
      };
    }
    
    return { 
      success: false, 
      message: errorMessage 
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};