// src/components/DriverProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  User,
  MapPin,
  Phone,
  Mail,
  IdCard,
  Calendar,
  Shield,
  Bus,
  Clock,
  DollarSign,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

// Sri Lanka phone number validation
const validateSriLankaPhone = (phone) => {
  if (!phone) return { isValid: true, message: '' }; // Allow empty
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Sri Lanka phone number patterns
  const patterns = [
    /^0[1-9][0-9]{8}$/, // 0XXXXXXXXX (10 digits starting with 0)
    /^\+94[1-9][0-9]{8}$/, // +94XXXXXXXXX (11 digits starting with +94)
    /^94[1-9][0-9]{8}$/, // 94XXXXXXXXX (10 digits starting with 94)
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid Sri Lanka phone number (0XXXXXXXXX or +94XXXXXXXXX)'
  };
};

const DriverProfile = () => {
  const { user, checkAuthStatus } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: '',
    emergencyContact: '',
    experience: '',
    hourlyRate: '',
    bankAccount: {
      bankName: '',
      accountNumber: '',
      routingNumber: ''
    }
  });
  const [phoneValidation, setPhoneValidation] = useState({ isValid: true, message: '' });

  useEffect(() => {
    if (user) {
      loadDriverProfile();
    }
  }, [user]);

  const loadDriverProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading driver profile for user:', user);
      
      // Check if driver profile exists in user context
      if (user.driverProfile) {
        console.log('Driver profile found in user context:', user.driverProfile);
        setDriverProfile(user.driverProfile);
        initializeFormData(user, user.driverProfile);
      } else {
        console.log('No driver profile found, using user data');
        setDriverProfile(null);
        initializeFormData(user, null);
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
      toast.error('Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (userData, driverProfileData) => {
    const baseData = {
      username: userData.username || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      email: userData.email || '',
      address: userData.address || '',
      licenseNumber: driverProfileData?.licenseNumber || '',
      licenseExpiry: driverProfileData?.licenseExpiry || '',
      emergencyContact: driverProfileData?.emergencyContact || '',
      experience: driverProfileData?.experience || '',
      hourlyRate: driverProfileData?.hourlyRate || '',
      bankAccount: {
        bankName: driverProfileData?.bankAccount?.bankName || '',
        accountNumber: driverProfileData?.bankAccount?.accountNumber || '',
        routingNumber: driverProfileData?.bankAccount?.routingNumber || ''
      }
    };

    console.log('Initializing form data:', baseData);
    setFormData(baseData);
    
    // Validate phone number on initialization
    if (baseData.phone) {
      setPhoneValidation(validateSriLankaPhone(baseData.phone));
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value);
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Validate phone number in real-time
      if (field === 'phone') {
        setPhoneValidation(validateSriLankaPhone(value));
      }
    }
  };

  const handleSave = async () => {
    // Validate phone number before saving
    const phoneValidationResult = validateSriLankaPhone(formData.phone);
    if (!phoneValidationResult.isValid) {
      toast.error(phoneValidationResult.message);
      return;
    }

    try {
      setSaving(true);
      console.log('Saving profile data:', formData);

      // Update user profile
      const userResponse = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        {
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update driver profile
      const driverResponse = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/drivers/profile`,
        {
          licenseNumber: formData.licenseNumber,
          licenseExpiry: formData.licenseExpiry,
          emergencyContact: formData.emergencyContact,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          bankAccount: formData.bankAccount
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Update responses:', { user: userResponse.data, driver: driverResponse.data });

      // Refresh auth status to get updated user data
      await checkAuthStatus();

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    initializeFormData(user, driverProfile);
    setIsEditing(false);
    setPhoneValidation({ isValid: true, message: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const profileImage = user?.profileImage || user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  const fullName = formData.firstName && formData.lastName 
    ? `${formData.firstName} ${formData.lastName}`
    : user?.username || 'Driver';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="relative">
              <img
                src={profileImage}
                alt={fullName}
                className="w-20 h-20 rounded-full border-4 border-blue-500/50"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-600">Professional Bus Driver</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center text-yellow-500">
                  <span className="text-sm">★★★★★</span>
                  <span className="text-gray-600 ml-1 text-sm">4.8</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !phoneValidation.isValid}
                  className="bg-green-600 hover:bg-green-700 text-gray-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {saving ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    phoneValidation.isValid ? 'border-gray-300' : 'border-red-500'
                  }`}
                  placeholder="07XXXXXXXX or +947XXXXXXXX"
                />
                {formData.phone && (
                  <div className="absolute right-3 top-2">
                    {phoneValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {!phoneValidation.isValid && (
                <p className="text-red-600 text-xs mt-1">{phoneValidation.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={true} // Email cannot be changed
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed"
                title="Email address cannot be changed"
              />
              <p className="text-gray-500 text-xs mt-1">Email address cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>
        </div>

        {/* Driver Information */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Bus className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Driver Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                disabled={true} // License Number cannot be changed
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
                title="License number cannot be changed"
              />
              <p className="text-gray-500 text-xs mt-1">License number cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">License Expiry Date</label>
              <input
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                disabled={true} // License Expiry Date cannot be changed
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
                title="License expiry date cannot be changed"
              />
              <p className="text-gray-500 text-xs mt-1">License expiry date cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                disabled={true} // Emergency Contact cannot be changed
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
                placeholder="Name and phone number"
                title="Emergency contact cannot be changed"
              />
              <p className="text-gray-500 text-xs mt-1">Emergency contact cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Experience (years)</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  disabled={true} // Experience cannot be changed
                  min="0"
                  max="50"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
                  title="Years of experience cannot be changed"
                />
                <p className="text-gray-500 text-xs mt-1">Years of experience cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hourly Rate (LKR)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  disabled={true} // Hourly Rate cannot be changed
                  min="0"
                  step="50"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-600 cursor-not-allowed"
                  title="Hourly rate cannot be changed"
                />
                <p className="text-gray-500 text-xs mt-1">Hourly rate cannot be changed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Information */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Bank Account Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankAccount.bankName}
                onChange={(e) => handleInputChange('bankAccount.bankName', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., Bank of Ceylon"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccount.accountNumber}
                onChange={(e) => handleInputChange('bankAccount.accountNumber', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Account number"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Routing Number</label>
              <input
                type="text"
                value={formData.bankAccount.routingNumber}
                onChange={(e) => handleInputChange('bankAccount.routingNumber', e.target.value)}
                disabled={!isEditing}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Bank code or routing number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;