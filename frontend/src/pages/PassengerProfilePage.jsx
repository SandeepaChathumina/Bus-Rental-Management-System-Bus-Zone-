// src/pages/PassengerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  IdCard, 
  Save, 
  Edit, 
  X,
  Home,
  Calendar,
  Loader,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PassengerProfilePage = () => {
  const { user: authUser, logout } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const navigate = useNavigate();

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) {
        navigate('/login');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${authUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
        if (error.response?.status === 404) {
          toast.error('User not found');
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, navigate, logout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const { password, ...updateData } = profileData;
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${authUser._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/update-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleHomeClick = () => {
    navigate('/booking');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="text-sky-600 text-4xl animate-spin mb-4" />
          <div className="text-slate-700 text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-slate-700 text-lg">Please login to view your profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-200/30 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Home Button */}
      <button
        onClick={handleHomeClick}
        className="absolute top-8 left-8 z-20 flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-lg hover:bg-white text-slate-700 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 border border-sky-200"
      >
        <Home className="text-lg" />
        <span className="font-semibold">Back to Booking</span>
      </button>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-sky-200/50">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-full flex items-center justify-center">
                <User className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
              <p className="text-slate-600 mt-2">Manage your account information</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <User className="inline mr-2 text-sky-500" size={16} />
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <User className="inline mr-2 text-sky-500" size={16} />
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="inline mr-2 text-sky-500" size={16} />
                  Email
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <IdCard className="inline mr-2 text-sky-500" size={16} />
                  Username
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.username}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <IdCard className="inline mr-2 text-sky-500" size={16} />
                  NIC
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.nic}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="inline mr-2 text-sky-500" size={16} />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800"
                  />
                ) : (
                    <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="inline mr-2 text-sky-500" size={16} />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={profileData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800"
                  />
                ) : (
                  <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">{profileData.address || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="inline mr-2 text-sky-500" size={16} />
                  Member Since
                </label>
                <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">
                  {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Password Update Section */}
              {showPasswordSection ? (
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <Lock className="mr-2 text-sky-500" size={20} />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800 pr-10"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800 pr-10"
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-800 pr-10"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 pt-2">
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={updatingPassword}
                        className="flex items-center px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="mr-2" size={16} />
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordSection(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="flex items-center px-6 py-3 bg-slate-500 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
                      >
                        <X className="mr-2" size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                  >
                    <Lock className="mr-2" size={16} />
                    Change Password
                  </button>
                </div>
              )}

              <div className="flex justify-center space-x-4 pt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="mr-2" size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center px-6 py-3 bg-slate-500 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
                    >
                      <X className="mr-2" size={16} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
                  >
                    <Edit className="mr-2" size={16} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerProfilePage;