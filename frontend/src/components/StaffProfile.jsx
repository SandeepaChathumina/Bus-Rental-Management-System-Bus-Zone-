// src/components/StaffProfile.jsx
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
  Briefcase, 
  Calendar, 
  DollarSign, 
  Building,
  Edit,
  Save,
  X
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const StaffProfile = () => {
  const { user: authUser } = useAuth();
  const [staffProfile, setStaffProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    staffRole: '',
    employeeId: '',
    department: '',
    salary: ''
  });

  useEffect(() => {
    if (authUser) {
      fetchStaffProfile();
    }
  }, [authUser]);

  const fetchStaffProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setStaffProfile(userData);
      
      // Initialize form data
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        staffRole: userData.staffProfile?.staffRole || '',
        employeeId: userData.staffProfile?.employeeId || '',
        department: userData.staffProfile?.department || '',
        salary: userData.staffProfile?.salary || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch staff profile', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Update user basic info
      await axios.put(
        `${BACKEND_URL}/api/users/${authUser._id}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update staff profile
      if (staffProfile.staffProfile) {
        await axios.put(
          `${BACKEND_URL}/api/staff-profiles/${staffProfile.staffProfile._id}`,
          {
            staffRole: formData.staffRole,
            department: formData.department,
            salary: formData.salary
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success('Profile updated successfully');
      setEditing(false);
      fetchStaffProfile(); // Refresh data
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: staffProfile.firstName || '',
      lastName: staffProfile.lastName || '',
      email: staffProfile.email || '',
      phone: staffProfile.phone || '',
      address: staffProfile.address || '',
      staffRole: staffProfile.staffProfile?.staffRole || '',
      employeeId: staffProfile.staffProfile?.employeeId || '',
      department: staffProfile.staffProfile?.department || '',
      salary: staffProfile.staffProfile?.salary || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!staffProfile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-400">Profile not found</h3>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400">Manage your personal and professional information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{staffProfile.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{staffProfile.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <p className="text-white">{staffProfile.email}</p>
                <p className="text-slate-400 text-sm">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{staffProfile.phone || 'Not provided'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                {editing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{staffProfile.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <IdCard className="inline w-4 h-4 mr-2" />
                  Employee ID
                </label>
                <p className="text-white font-mono">{staffProfile.staffProfile?.employeeId || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Briefcase className="inline w-4 h-4 mr-2" />
                  Staff Role
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="staffRole"
                    value={formData.staffRole}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{staffProfile.staffProfile?.staffRole || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Building className="inline w-4 h-4 mr-2" />
                  Department
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{staffProfile.staffProfile?.department || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-2" />
                  Salary
                </label>
                {editing ? (
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white">{formatCurrency(staffProfile.staffProfile?.salary)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Hire Date
                </label>
                <p className="text-white">{formatDate(staffProfile.staffProfile?.hireDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Employment Status</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {staffProfile.firstName} {staffProfile.lastName}
            </h3>
            <p className="text-slate-400 capitalize">{staffProfile.role}</p>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-sm text-slate-300">Member since</p>
              <p className="text-white font-medium">
                {formatDate(staffProfile.createdAt)}
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Email Verified</span>
                <span className="text-green-400">Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Profile Complete</span>
                <span className="text-blue-400">90%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Last Login</span>
                <span className="text-slate-300">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;