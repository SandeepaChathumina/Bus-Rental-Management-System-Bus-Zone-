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
  // Phone validation regex - exactly 10 digits
  const phoneRegex = /^0\d{9}$/;
  // NIC validation regex - 9 or 12 digits only
  const nicRegex = /^\d{9}$|^\d{12}$/;
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
    // For NIC field, only allow numbers and limit to 12 digits
    else if (name === 'nic') {
      // Remove any non-digit characters
      const numericValue = value.replace(/\D/g, '');
      // Limit to 12 digits
      const limitedValue = numericValue.slice(0, 12);
      
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
        toast.error('Phone number must be exactly 10 digits (0-9 only).');
        return;
      }
      
      if (phoneAvailable === false) {
        toast.error('Phone number is already registered. Please use a different phone number.');
        return;
      }
    }
    
    // Check if NIC is valid and available
    if (!nicRegex.test(formData.nic)) {
      toast.error('NIC must be either 9 digits (old format) or 12 digits (new format).');
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
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-2/5 relative items-center justify-center p-12">
          {/* Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${b5Image})` }}
          ></div>
          
          {/* Branding Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl max-w-lg">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <FaBus className="text-4xl text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Join BusZone+</h1>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full"></div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6 leading-tight">
                Start Your Journey With Us
              </h2>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Create your account and experience premium bus services with advanced booking and management features
              </p>

              {/* Benefits */}
              <div className="space-y-4 text-left">
                {[
                  "Easy Online Booking",
                  "Real-time Bus Tracking", 
                  "Secure Payment System",
                  "24/7 Customer Support"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                    <span className="text-blue-100">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <FaBus className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">BusZone+</h1>
            </div>

            {/* Registration Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                  <FaUserPlus className="text-2xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Create Account</h2>
                <p className="text-gray-600 text-lg">Join thousands of satisfied customers</p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaUser className="inline mr-2 text-blue-500" />
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaUser className="inline mr-2 text-blue-500" />
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                {/* Username and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaUser className="inline mr-2 text-blue-500" />
                      Username
                    </label>
                    <div className="relative">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 ${
                          getBorderColor('username', null, usernameAvailable, checkingUsername)
                        }`}
                        placeholder="Choose username"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <div className="absolute right-3 top-4">
                        {checkingUsername && (
                          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingUsername && usernameAvailable === true && hasInteracted.username && (
                          <FaCheck className="h-5 w-5 text-green-500" />
                        )}
                        {!checkingUsername && usernameAvailable === false && hasInteracted.username && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {!checkingUsername && usernameAvailable === false && hasInteracted.username && (
                      <p className="mt-2 text-sm text-red-600">Username is already taken. Please choose another one.</p>
                    )}
                    {!checkingUsername && usernameAvailable === true && hasInteracted.username && (
                      <p className="mt-2 text-sm text-green-600">Username is available!</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaEnvelope className="inline mr-2 text-blue-500" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 ${
                          getBorderColor('email', emailValid, emailAvailable, checkingEmail)
                        }`}
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <div className="absolute right-3 top-4">
                        {checkingEmail && (
                          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingEmail && emailAvailable === true && hasInteracted.email && (
                          <FaCheck className="h-5 w-5 text-green-500" />
                        )}
                        {!checkingEmail && emailAvailable === false && hasInteracted.email && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {!checkingEmail && emailValid === false && formData.email && hasInteracted.email && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {!checkingEmail && emailValid === false && formData.email && hasInteracted.email && (
                      <p className="mt-2 text-sm text-red-600">Please enter a valid email address.</p>
                    )}
                    {!checkingEmail && emailAvailable === false && hasInteracted.email && (
                      <p className="mt-2 text-sm text-red-600">Email is already registered. Please use a different email.</p>
                    )}
                    {!checkingEmail && emailAvailable === true && hasInteracted.email && (
                      <p className="mt-2 text-sm text-green-600">Email is available!</p>
                    )}
                  </div>
                </div>

                {/* Phone and NIC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaPhone className="inline mr-2 text-blue-500" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 ${
                          getBorderColor('phone', phoneValid, phoneAvailable, checkingPhone)
                        }`}
                        placeholder="Enter 10-digit phone number (optional)"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={10}
                      />
                      <div className="absolute right-3 top-4">
                        {checkingPhone && (
                          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingPhone && phoneAvailable === false && hasInteracted.phone && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {!checkingPhone && phoneValid === false && formData.phone && hasInteracted.phone && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {!checkingPhone && phoneValid === true && phoneAvailable === true && formData.phone && hasInteracted.phone && (
                          <FaCheck className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    {!checkingPhone && phoneValid === false && formData.phone && hasInteracted.phone && (
                      <p className="mt-2 text-sm text-red-600">Phone number must be exactly 10 digits (0-9 only).</p>
                    )}
                    {!checkingPhone && phoneAvailable === false && hasInteracted.phone && (
                      <p className="mt-2 text-sm text-red-600">Phone number is already registered. Please use a different phone number.</p>
                    )}
                    {!checkingPhone && phoneValid === true && phoneAvailable === true && formData.phone && hasInteracted.phone && (
                      <p className="mt-2 text-sm text-green-600">Phone number is available!</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="nic" className="block text-sm font-semibold text-gray-700 mb-3">
                      <FaIdCard className="inline mr-2 text-blue-500" />
                      NIC Number
                    </label>
                    <div className="relative">
                      <input
                        id="nic"
                        name="nic"
                        type="text"
                        required
                        className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 ${
                          getBorderColor('nic', nicValid, nicAvailable, checkingNIC)
                        }`}
                        placeholder="Enter 9 or 12 digit NIC number"
                        value={formData.nic}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={12}
                      />
                      <div className="absolute right-3 top-4">
                        {checkingNIC && (
                          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        )}
                        {!checkingNIC && nicAvailable === false && hasInteracted.nic && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {!checkingNIC && nicValid === false && formData.nic && hasInteracted.nic && (
                          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {!checkingNIC && nicValid === true && nicAvailable === true && formData.nic && hasInteracted.nic && (
                          <FaCheck className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    {!checkingNIC && nicValid === false && formData.nic && hasInteracted.nic && (
                      <p className="mt-2 text-sm text-red-600">NIC must be either 9 digits (old format) or 12 digits (new format).</p>
                    )}
                    {!checkingNIC && nicAvailable === false && hasInteracted.nic && (
                      <p className="mt-2 text-sm text-red-600">NIC is already registered. Please use a different NIC number.</p>
                    )}
                    {!checkingNIC && nicValid === true && nicAvailable === true && formData.nic && hasInteracted.nic && (
                      <p className="mt-2 text-sm text-green-600">NIC is available!</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                    <FaLock className="inline mr-2 text-blue-500" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 ${
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
                    <div className="absolute right-3 top-4 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                      </button>
                      {hasInteracted.password && passwordValid === true && (
                        <FaCheck className="h-5 w-5 text-green-500" />
                      )}
                      {hasInteracted.password && passwordValid === false && (
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Password strength indicator */}
                  {hasInteracted.password && formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Password strength:</span>
                        <span className={`text-sm font-semibold ${
                          passwordStrength <= 1 ? 'text-red-600' :
                          passwordStrength <= 2 ? 'text-orange-600' :
                          passwordStrength <= 3 ? 'text-yellow-600' :
                          passwordStrength <= 4 ? 'text-green-600' :
                          'text-emerald-700'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Password requirements */}
                      <div className="mt-2 text-xs text-gray-600">
                        <p className={formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                          • At least 8 characters long {formData.password.length >= 8 ? '✓' : '✗'}
                        </p>
                        <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • At least one uppercase letter {/[A-Z]/.test(formData.password) ? '✓' : '✗'}
                        </p>
                        <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • At least one lowercase letter {/[a-z]/.test(formData.password) ? '✓' : '✗'}
                        </p>
                        <p className={/\d/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • At least one number {/\d/.test(formData.password) ? '✓' : '✗'}
                        </p>
                        <p className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          • At least one special character (@$!%*?&) {/[@$!%*?&]/.test(formData.password) ? '✓' : '✗'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || usernameAvailable === false || emailAvailable === false || emailValid === false || nicAvailable === false || nicValid === false || passwordValid === false || (formData.phone && (phoneValid === false || phoneAvailable === false))}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <FaUserPlus className="text-lg" />
                      Create Account
                    </div>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
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