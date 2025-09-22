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

const DriverProfile = () => {
  const { user, checkAuthStatus } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
        console.log('No driver profile in context, fetching from API...');
        // Fetch user data with driver profile
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('API response:', response.data);
        
        if (response.data.driverProfile) {
          setDriverProfile(response.data.driverProfile);
          initializeFormData(response.data, response.data.driverProfile);
        } else {
          console.log('No driver profile found in API response');
          setDriverProfile(null);
          initializeFormData(user, {});
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
      toast.error('Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (userData, profileData) => {
    console.log('Initializing form data:', { userData, profileData });
    
    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      email: userData.email || '',
      address: userData.address || '',
      licenseNumber: profileData?.licenseNumber || '',
      licenseExpiry: profileData?.licenseExpiry ? 
        new Date(profileData.licenseExpiry).toISOString().split('T')[0] : '',
      emergencyContact: profileData?.emergencyContact || '',
      experience: profileData?.experience || '',
      hourlyRate: profileData?.hourlyRate || '',
      bankAccount: {
        bankName: profileData?.bankAccount?.bankName || '',
        accountNumber: profileData?.bankAccount?.accountNumber || '',
        routingNumber: profileData?.bankAccount?.routingNumber || ''
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankAccount.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankAccount: {
          ...prev.bankAccount,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        driverProfile: {
          licenseNumber: formData.licenseNumber,
          licenseExpiry: formData.licenseExpiry,
          emergencyContact: formData.emergencyContact,
          experience: parseInt(formData.experience) || 0,
          hourlyRate: parseFloat(formData.hourlyRate) || 0,
          bankAccount: formData.bankAccount
        }
      };

      console.log('Saving data:', updateData);

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${user._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Save response:', response.data);

      // Refresh auth status to get updated data
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
    initializeFormData(user, driverProfile);
    setIsEditing(false);
  };

  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', text: 'Not provided', color: 'text-gray-400' };
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Expired', color: 'text-red-400' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', text: 'Expiring soon', color: 'text-yellow-400' };
    } else {
      return { status: 'valid', text: 'Valid', color: 'text-green-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-white">Loading profile...</span>
      </div>
    );
  }

  const licenseStatus = getLicenseStatus(driverProfile?.licenseExpiry);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-blue-100">Professional Driver</p>
              <p className="text-sm text-blue-200">ID: {user._id?.slice(-8)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-white/20 ${licenseStatus.color}`}>
              <Shield className="w-4 h-4 mr-1" />
              {licenseStatus.text}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Driver Profile</h2>
        <div className="space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{user.firstName || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{user.lastName || 'Not provided'}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </label>
              <p className="text-white">{user.email}</p>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-white">{user.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-white">{user.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Driver License Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <IdCard className="w-5 h-5 mr-2 text-green-400" />
            License Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">License Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter license number"
                />
              ) : (
                <p className="text-white">{driverProfile?.licenseNumber || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                License Expiry Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              ) : (
                <div>
                  <p className="text-white">
                    {driverProfile?.licenseExpiry ? 
                      new Date(driverProfile.licenseExpiry).toLocaleDateString() : 
                      'Not provided'
                    }
                  </p>
                  {driverProfile?.licenseExpiry && (
                    <p className={`text-sm mt-1 ${licenseStatus.color}`}>
                      {licenseStatus.text}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter emergency contact"
                />
              ) : (
                <p className="text-white">{driverProfile?.emergencyContact || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-400" />
            Professional Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Years of Experience</label>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter years of experience"
                />
              ) : (
                <p className="text-white">{driverProfile?.experience || 0} years</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Hourly Rate
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter hourly rate"
                />
              ) : (
                <p className="text-white">${driverProfile?.hourlyRate || 0}/hour</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1 flex items-center">
                <Bus className="w-4 h-4 mr-1" />
                Assigned Bus
              </label>
              <p className="text-white">
                {driverProfile?.assignedBus ? 
                  `Bus #${driverProfile.assignedBus}` : 
                  'Not assigned'
                }
              </p>
              <p className="text-xs text-slate-400 mt-1">Assigned by administrator</p>
            </div>
          </div>
        </div>

        {/* Bank Account Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-400" />
            Bank Account
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccount.bankName"
                  value={formData.bankAccount.bankName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter bank name"
                />
              ) : (
                <p className="text-white">{driverProfile?.bankAccount?.bankName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccount.accountNumber"
                  value={formData.bankAccount.accountNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter account number"
                />
              ) : (
                <p className="text-white">
                  {driverProfile?.bankAccount?.accountNumber ? 
                    '••••' + driverProfile.bankAccount.accountNumber.slice(-4) : 
                    'Not provided'
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Routing Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccount.routingNumber"
                  value={formData.bankAccount.routingNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter routing number"
                />
              ) : (
                <p className="text-white">
                  {driverProfile?.bankAccount?.routingNumber ? 
                    '••••' + driverProfile.bankAccount.routingNumber.slice(-4) : 
                    'Not provided'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* License Status Alert */}
      {licenseStatus.status === 'expired' && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400 font-semibold">License Expired</span>
          </div>
          <p className="text-red-300 text-sm mt-1">
            Your driver's license has expired. Please renew your license and update the information.
          </p>
        </div>
      )}

      {licenseStatus.status === 'expiring' && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-semibold">License Expiring Soon</span>
          </div>
          <p className="text-yellow-300 text-sm mt-1">
            Your driver's license will expire on {new Date(driverProfile.licenseExpiry).toLocaleDateString()}. 
            Please renew your license soon.
          </p>
        </div>
      )}

      {licenseStatus.status === 'valid' && driverProfile?.licenseExpiry && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400 font-semibold">License Valid</span>
          </div>
          <p className="text-green-300 text-sm mt-1">
            Your driver's license is valid until {new Date(driverProfile.licenseExpiry).toLocaleDateString()}.
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;