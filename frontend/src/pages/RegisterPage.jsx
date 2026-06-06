// src/pages/RegisterPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaHome, FaBus, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaLock, FaUserPlus, FaExclamationTriangle, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import b5Image from '../assets/b5.jpeg';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    nic: '',
    address: '',
    role: 'passenger'
  });
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [phoneAvailable, setPhoneAvailable] = useState(null);
  const [nicAvailable, setNICAvailable] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [phoneValid, setPhoneValid] = useState(null);
  const [nicValid, setNICValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingNIC, setCheckingNIC] = useState(false);
  const [hasInteracted, setHasInteracted] = useState({
    username: false,
    email: false,
    phone: false,
    nic: false,
    password: false
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone validation regex - must start with 0 and be exactly 10 digits
  const phoneRegex = /^0\d{9}$/;
  // NIC validation regex - 9 digits + V or 12 digits
  const nicRegex = /^\d{9}[Vv]$|^\d{12}$/;
  // Password validation - at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;
    
    return Math.min(strength, 5); // Max strength is 5
  };

  // Password validation effect
  useEffect(() => {
    if (formData.password === '') {
      setPasswordValid(null);
      setPasswordStrength(0);
      return;
    }
    
    const isValid = passwordRegex.test(formData.password);
    const strength = calculatePasswordStrength(formData.password);
    
    setPasswordValid(isValid);
    setPasswordStrength(strength);
  }, [formData.password]);

  // Debounce function to limit API calls for username
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (formData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      
      setCheckingUsername(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/check-username?username=${formData.username}`
        );
        setUsernameAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    };
    
    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // Debounce function to limit API calls for email
  useEffect(() => {
    const checkEmailAvailability = async () => {
      // First validate email format
      const isValid = emailRegex.test(formData.email);
      setEmailValid(isValid);
      
      if (!isValid || formData.email.length < 5) {
        setEmailAvailable(null);
        return;
      }
      
      setCheckingEmail(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/check-email?email=${formData.email}`
        );
        setEmailAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking email:', error);
      } finally {
        setCheckingEmail(false);
      }
    };
    
    const timeoutId = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Debounce function to limit API calls for phone
  useEffect(() => {
    const checkPhoneAvailability = async () => {
      // First validate phone format
      const isValid = phoneRegex.test(formData.phone);
      setPhoneValid(isValid);
      
      if (!isValid || formData.phone === '') {
        setPhoneAvailable(null);
        return;
      }
      
      setCheckingPhone(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/check-phone?phone=${formData.phone}`
        );
        setPhoneAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking phone:', error);
      } finally {
        setCheckingPhone(false);
      }
    };
    
    const timeoutId = setTimeout(checkPhoneAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.phone]);

  // Debounce function to limit API calls for NIC
  useEffect(() => {
    const checkNICAvailability = async () => {
      // First validate NIC format
      const isValid = nicRegex.test(formData.nic);
      setNICValid(isValid);
      
      if (!isValid || formData.nic === '') {
        setNICAvailable(null);
        return;
      }
      
      setCheckingNIC(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/check-nic?nic=${formData.nic}`
        );
        setNICAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking NIC:', error);
      } finally {
        setCheckingNIC(false);
      }
    };
    
    const timeoutId = setTimeout(checkNICAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.nic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Track interaction
    if (!hasInteracted[name]) {
      setHasInteracted(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // For phone field, only allow numbers and limit to 10 digits
    if (name === 'phone') {
      // Remove any non-digit characters
      const numericValue = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedValue = numericValue.slice(0, 10);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } 
    // For NIC field, allow numbers and V character
    else if (name === 'nic') {
      // Allow digits and V/v character, convert to uppercase
      const cleanValue = value.replace(/[^\dVv]/g, '').toUpperCase();
      // Limit to 10 characters (9 digits + V) or 12 digits
      const limitedValue = cleanValue.length <= 10 ? cleanValue : cleanValue.slice(0, 12);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } 
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    // Mark field as interacted when user leaves it
    if (!hasInteracted[name]) {
      setHasInteracted(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as interacted on submit
    setHasInteracted({
      username: true,
      email: true,
      phone: true,
      nic: true,
      password: true
    });
    
    // Check if username is available before submitting
    if (usernameAvailable === false) {
      toast.error('Username is already taken. Please choose another one.');
      return;
    }
    
    // Check if email is valid and available
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    if (emailAvailable === false) {
      toast.error('Email is already registered. Please use a different email.');
      return;
    }
    
    // Check if phone number is valid and available (if provided)
    if (formData.phone) {
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Phone number must start with 0 and be exactly 10 digits.');
        return;
      }
      
      if (phoneAvailable === false) {
        toast.error('Phone number is already registered. Please use a different phone number.');
        return;
      }
    }
    
    // Check if NIC is valid and available
    if (!nicRegex.test(formData.nic)) {
      toast.error('NIC must be either 9 digits + V (old format) or 12 digits (new format).');
      return;
    }
    
    if (nicAvailable === false) {
      toast.error('NIC is already registered. Please use a different NIC number.');
      return;
    }
    
    // Check if password is strong enough
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }
    
    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      toast.success('Registration successful! Please login to continue.');
      navigate('/login'); // Navigate to login instead of dashboard
    } else {
      // Check specific error types
      if (result.message.includes('phone') && result.message.includes('duplicate')) {
        toast.error('Phone number is already registered. Please use a different phone number.');
      } else if (result.message.includes('nic') && result.message.includes('duplicate')) {
        toast.error('NIC is already registered. Please use a different NIC number.');
      } else {
        toast.error(result.message);
      }
    }
    
    setLoading(false);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  // Helper function to determine border color
  const getBorderColor = (fieldName, isValid, isAvailable, isChecking) => {
    if (!hasInteracted[fieldName]) {
      return 'border-gray-200'; // Default border if not interacted with
    }
    
    if (isChecking) {
      return 'border-blue-500'; // Blue border while checking
    }
    
    if (isValid === false || isAvailable === false) {
      return 'border-red-500'; // Red border for invalid or unavailable
    }
    
    if (isValid === true && isAvailable === true) {
      return 'border-green-500'; // Green border for valid and available
    }
    
    return 'border-gray-200'; // Default border
  };

  // Password strength indicator colors
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-green-500';
    if (passwordStrength === 5) return 'bg-emerald-600';
    return 'bg-gray-300';
  };

  // Password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    if (passwordStrength === 4) return 'Strong';
    if (passwordStrength === 5) return 'Very Strong';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image with Light Overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${b5Image})` }}
        ></div>
        <div className="absolute inset-0 bg-white/30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-sky-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Home Button */}
      <button
        onClick={handleHomeClick}
        className="absolute top-8 left-8 z-20 flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-lg hover:bg-white text-slate-700 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200/50"
      >
        <FaHome className="text-lg" />
        <span className="font-semibold">Home</span>
      </button>

      {/* Centered Registration Container */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-center">
        {/* Registration Form */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaBus className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">BusZone+</h1>
              <p className="text-slate-600 mt-2">Create your account to get started</p>
            </div>

            {/* Registration Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-blue-200/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaUserPlus className="text-2xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Create Account</h2>
                <p className="text-slate-600 text-lg">Join thousands of satisfied customers</p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-3">
                      <FaUser className="inline mr-2 text-blue-500 text-xs" />
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="w-full px-5 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/50 focus:bg-white text-slate-800 placeholder-slate-500 shadow-sm"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-3">
                      <FaUser className="inline mr-2 text-blue-500 text-xs" />
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-5 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/50 focus:bg-white text-slate-800 placeholder-slate-500 shadow-sm"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                {/* Username and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-3">
                      <FaUser className="inline mr-2 text-blue-500 text-xs" />
                      Username
                    </label>
                    <div className="relative">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 text-sm ${
                          getBorderColor('username', null, usernameAvailable, checkingUsername)
                        }`}
                        placeholder="Choose username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <div className="absolute right-3 top-3">
                        {checkingUsername && (
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingUsername && usernameAvailable === true && hasInteracted.username && (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        )}
                        {!checkingUsername && usernameAvailable === false && hasInteracted.username && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    {!checkingUsername && usernameAvailable === false && hasInteracted.username && (
                      <p className="mt-1 text-xs text-red-600">Username is already taken.</p>
                    )}
                    {!checkingUsername && usernameAvailable === true && hasInteracted.username && (
                      <p className="mt-1 text-xs text-green-600">Username is available!</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                      <FaEnvelope className="inline mr-2 text-blue-500 text-xs" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 text-sm ${
                          getBorderColor('email', emailValid, emailAvailable, checkingEmail)
                        }`}
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <div className="absolute right-3 top-3">
                        {checkingEmail && (
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingEmail && emailAvailable === true && hasInteracted.email && (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        )}
                        {!checkingEmail && emailAvailable === false && hasInteracted.email && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {!checkingEmail && emailValid === false && formData.email && hasInteracted.email && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    {!checkingEmail && emailValid === false && formData.email && hasInteracted.email && (
                      <p className="mt-1 text-xs text-red-600">Please enter a valid email address.</p>
                    )}
                    {!checkingEmail && emailAvailable === false && hasInteracted.email && (
                      <p className="mt-1 text-xs text-red-600">Email is already registered.</p>
                    )}
                    {!checkingEmail && emailAvailable === true && hasInteracted.email && (
                      <p className="mt-1 text-xs text-green-600">Email is available!</p>
                    )}
                  </div>
                </div>

                {/* Phone and NIC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-3">
                      <FaPhone className="inline mr-2 text-blue-500 text-xs" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 text-sm ${
                          getBorderColor('phone', phoneValid, phoneAvailable, checkingPhone)
                        }`}
                        placeholder="Enter 10-digit phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={10}
                      />
                      <div className="absolute right-3 top-3">
                        {checkingPhone && (
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingPhone && phoneAvailable === false && hasInteracted.phone && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {!checkingPhone && phoneValid === false && formData.phone && hasInteracted.phone && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {!checkingPhone && phoneValid === true && phoneAvailable === true && formData.phone && hasInteracted.phone && (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    {!checkingPhone && phoneValid === false && formData.phone && hasInteracted.phone && (
                      <p className="mt-1 text-xs text-red-600">Must start with 0 and be 10 digits.</p>
                    )}
                    {!checkingPhone && phoneAvailable === false && hasInteracted.phone && (
                      <p className="mt-1 text-xs text-red-600">Phone number is already registered.</p>
                    )}
                    {!checkingPhone && phoneValid === true && phoneAvailable === true && formData.phone && hasInteracted.phone && (
                      <p className="mt-1 text-xs text-green-600">Phone number is available!</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="nic" className="block text-sm font-semibold text-slate-700 mb-3">
                      <FaIdCard className="inline mr-2 text-blue-500 text-xs" />
                      NIC Number
                    </label>
                    <div className="relative">
                      <input
                        id="nic"
                        name="nic"
                        type="text"
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 text-sm ${
                          getBorderColor('nic', nicValid, nicAvailable, checkingNIC)
                        }`}
                        placeholder="Enter NIC number"
                        value={formData.nic}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={12}
                      />
                      <div className="absolute right-3 top-3">
                        {checkingNIC && (
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingNIC && nicAvailable === false && hasInteracted.nic && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {!checkingNIC && nicValid === false && formData.nic && hasInteracted.nic && (
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {!checkingNIC && nicValid === true && nicAvailable === true && formData.nic && hasInteracted.nic && (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    {!checkingNIC && nicValid === false && formData.nic && hasInteracted.nic && (
                      <p className="mt-1 text-xs text-red-600">9 digits + V or 12 digits required.</p>
                    )}
                    {!checkingNIC && nicAvailable === false && hasInteracted.nic && (
                      <p className="mt-1 text-xs text-red-600">NIC is already registered.</p>
                    )}
                    {!checkingNIC && nicValid === true && nicAvailable === true && formData.nic && hasInteracted.nic && (
                      <p className="mt-1 text-xs text-green-600">NIC is available!</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-3">
                    <FaMapMarkerAlt className="inline mr-2 text-blue-500 text-xs" />
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 text-sm"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                    <FaLock className="inline mr-2 text-blue-500 text-xs" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 text-sm ${
                        !hasInteracted.password ? 'border-gray-200' : 
                        passwordValid === false ? 'border-red-500' : 
                        passwordValid === true ? 'border-green-500' : 
                        'border-gray-200'
                      }`}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="absolute right-3 top-3 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </button>
                      {hasInteracted.password && passwordValid === true && (
                        <FaCheck className="h-4 w-4 text-green-500" />
                      )}
                      {hasInteracted.password && passwordValid === false && (
                        <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Password strength indicator */}
                  {hasInteracted.password && formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Password strength:</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength <= 1 ? 'text-red-600' :
                          passwordStrength <= 2 ? 'text-orange-600' :
                          passwordStrength <= 3 ? 'text-yellow-600' :
                          passwordStrength <= 4 ? 'text-green-600' :
                          'text-emerald-700'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Password requirements */}
                      <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 gap-1">
                        <p className={formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                          • 8+ characters {formData.password.length >= 8 ? '✓' : '✗'}
                        </p>
                        <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • Uppercase {/[A-Z]/.test(formData.password) ? '✓' : '✗'}
                        </p>
                        <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • Lowercase {/[a-z]/.test(formData.password) ? '✓' : '✗'}
                        </p>
                        <p className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • Special char {/[@$!%*?&]/.test(formData.password) ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || usernameAvailable === false || emailAvailable === false || emailValid === false || nicAvailable === false || nicValid === false || passwordValid === false || (formData.phone && (phoneValid === false || phoneAvailable === false))}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaUserPlus className="text-sm" />
                      Create Account
                    </div>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-blue-200">
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;