// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user._id}`);
        setUserData(response.data);
      } catch (error) {
        toast.error('Failed to fetch user data');
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Username</p>
            <p className="font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-gray-600">Role</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-gray-600">NIC</p>
            <p className="font-medium">{user.nic}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{user.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {user.role === 'driver' && userData?.driverProfile && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Driver Profile</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">License Number</p>
              <p className="font-medium">{userData.driverProfile.licenseNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">License Expiry</p>
              <p className="font-medium">{new Date(userData.driverProfile.licenseExpiry).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Emergency Contact</p>
              <p className="font-medium">{userData.driverProfile.emergencyContact || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}

      {user.role === 'staff' && userData?.staffProfile && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Staff Profile</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Staff Role</p>
              <p className="font-medium">{userData.staffProfile.staffRole}</p>
            </div>
            <div>
              <p className="text-gray-600">Employee ID</p>
              <p className="font-medium">{userData.staffProfile.employeeId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;