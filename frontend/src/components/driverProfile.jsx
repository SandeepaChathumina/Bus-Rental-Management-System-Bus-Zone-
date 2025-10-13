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
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Valid Sri Lankan mobile prefixes
  const validPrefixes = ['077', '071', '070', '072', '074', '075', '076', '078'];
  const validInternationalPrefixes = ['+9477', '+9470', '+9471', '+9472', '+9474', '+9475', '+9476', '+9478'];
  
  // Check if it starts with +94 (international format)
  if (cleanPhone.startsWith('+94')) {
    const number = cleanPhone.substring(3); // Remove +94
    if (number.length === 9 && number.startsWith('7')) {
      const prefix = '+94' + number.substring(0, 2);
      if (validInternationalPrefixes.includes(prefix)) {
        return { isValid: true, message: '' };
      }
      return { 
        isValid: false, 
        message: 'Invalid mobile operator. Use +9470, +9471, +9472, +9474, +9475, +9476, +9477, or +9478' 
      };
    }
    return { 
      isValid: false, 
      message: 'Invalid Sri Lankan mobile number. Use +947XXXXXXXX format' 
    };
  }
  
  // Check if it starts with 0 (local format)
  if (cleanPhone.startsWith('0')) {
    if (cleanPhone.length === 10 && cleanPhone.startsWith('07')) {
      const prefix = cleanPhone.substring(0, 3);
      if (validPrefixes.includes(prefix)) {
        return { isValid: true, message: '' };
      }
      return { 
        isValid: false, 
        message: 'Invalid mobile operator. Use 070, 071, 072, 074, 075, 076, 077, or 078' 
      };
    }
    return { 
      isValid: false, 
      message: 'Invalid Sri Lankan mobile number. Use 07XXXXXXXX format' 
    };
  }
  
  return { 
    isValid: false, 
    message: 'Please enter a valid Sri Lankan mobile number (07XXXXXXXX or +947XXXXXXXX)' 
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
    hourlyRate: ''
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
      hourlyRate: driverProfileData?.hourlyRate || ''
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

      // Update user profile (only editable fields)
      const userResponse = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        {
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

      console.log('Update response:', userResponse.data);

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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="relative">
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-24 h-24 rounded-full border-4 border-blue-500/20 shadow-lg"
                />
                <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-3 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
                <p className="text-lg text-gray-600 mb-3">Professional Bus Driver</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="text-yellow-600 text-sm font-semibold">★★★★★</span>
                    <span className="text-gray-700 ml-2 text-sm font-medium">4.8 Rating</span>
                  </div>
                  <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-700 text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                >
                  <Edit className="h-5 w-5" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                  >
                    <X className="h-5 w-5" />
                    <span className="font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !phoneValidation.isValid}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                  >
                    {saving ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span className="font-medium">{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600 text-sm">Your personal details and contact information</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-lg font-semibold text-gray-900">{formData.firstName || 'Not provided'}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-lg font-semibold text-gray-900">{formData.lastName || 'Not provided'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-lg font-semibold text-gray-900">{formData.username || 'Not provided'}</p>
                  <p className="text-gray-500 text-xs mt-1">Username cannot be changed</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    {!phoneValidation.isValid && (
                      <p className="text-red-600 text-xs mt-1">{phoneValidation.message}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-900">{formData.phone || 'Not provided'}</p>
                      {formData.phone && (
                        <div>
                          {phoneValidation.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {!phoneValidation.isValid && formData.phone && (
                      <p className="text-red-600 text-xs mt-1">{phoneValidation.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-lg font-semibold text-gray-900">{formData.email || 'Not provided'}</p>
                  <p className="text-gray-500 text-xs mt-1">Email address cannot be changed</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-lg font-semibold text-gray-900">{formData.address || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                <Bus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Driver Information</h2>
                <p className="text-gray-600 text-sm">Your professional driving credentials and details</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <IdCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">License Number</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formData.licenseNumber || 'Not provided'}</p>
                <p className="text-gray-500 text-xs mt-1">License number cannot be changed</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">License Expiry Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.licenseExpiry ? new Date(formData.licenseExpiry).toLocaleDateString() : 'Not provided'}
                </p>
                <p className="text-gray-500 text-xs mt-1">License expiry date cannot be changed</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Emergency Contact</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formData.emergencyContact || 'Not provided'}</p>
                <p className="text-gray-500 text-xs mt-1">Emergency contact cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Experience</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.experience ? `${formData.experience} years` : 'Not provided'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Years of experience cannot be changed</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Hourly Rate</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.hourlyRate ? `LKR ${formData.hourlyRate}` : 'Not provided'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Hourly rate cannot be changed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverProfile;