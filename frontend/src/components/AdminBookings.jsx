// components/AdminBookings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Search,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, paymentStatusFilter]);

  // Auto-refresh every 10 seconds to show updated payment status
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing admin bookings...');
      fetchBookings();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Admin bookings API response:', data);
        if (data.success) {
          console.log('📊 Admin bookings data:', data.bookings);
          console.log('📊 First booking details:', data.bookings[0]);
          if (data.bookings[0]) {
            console.log('📊 First booking status:', data.bookings[0].bookingStatus);
            console.log('📊 First booking payment status:', data.bookings[0].paymentStatus);
          }
          setBookings(data.bookings || []);
        } else {
          console.error('Failed to fetch bookings:', data.message);
          setBookings([]);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let results = bookings;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(booking =>
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bus?.numberPlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply booking status filter
    if (statusFilter !== 'all') {
      results = results.filter(booking => booking.bookingStatus === statusFilter);
    }
    
    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      results = results.filter(booking => booking.paymentStatus === paymentStatusFilter);
    }
    
    setFilteredBookings(results);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-white">Bookings Management</h2>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button 
            onClick={fetchBookings}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Search className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">All Booking Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
          
          <button
            onClick={fetchBookings}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-700 text-left">
                <th className="px-4 py-3 text-slate-300">Booking ID</th>
                <th className="px-4 py-3 text-slate-300">Passenger</th>
                <th className="px-4 py-3 text-slate-300">Bus</th>
                <th className="px-4 py-3 text-slate-300">Route</th>
                <th className="px-4 py-3 text-slate-300">Date</th>
                <th className="px-4 py-3 text-slate-300">Seats</th>
                <th className="px-4 py-3 text-slate-300">Amount</th>
                <th className="px-4 py-3 text-slate-300">Booking Status</th>
                <th className="px-4 py-3 text-slate-300">Payment Status</th>
                <th className="px-4 py-3 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="border-b border-slate-700">
                  <td className="px-4 py-3 text-white">{booking.bookingId}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </div>
                    <div className="text-slate-400 text-sm">{booking.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {booking.bus?.numberPlate}
                    <div className="text-slate-400 text-sm">{booking.bus?.busType}</div>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {booking.route?.from} → {booking.route?.to}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {new Date(booking.travelDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {booking.seats?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-white">
                    Rs. {booking.totalAmount}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-400 hover:text-green-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No bookings found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;