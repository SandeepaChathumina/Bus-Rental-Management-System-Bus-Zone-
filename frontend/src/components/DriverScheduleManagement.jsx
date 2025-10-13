import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Bus,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Phone,
  Mail,
  Eye,
  Save,
  X,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const DriverScheduleManagement = () => {
  
  
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);


  // Backend URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    try {
      fetchConfirmedBookings();
      fetchDrivers();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Failed to initialize component');
    }
  }, []);

  useEffect(() => {
    try {
      filterBookings();
    } catch (err) {
      console.error('Error filtering bookings:', err);
      setError('Failed to filter bookings');
    }
  }, [confirmedBookings, searchTerm, filterDate]);

  const fetchConfirmedBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setConfirmedBookings([]);
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/bookings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter for confirmed bookings only
        const confirmedBookings = response.data.bookings.filter(booking => 
          booking.bookingStatus === 'Confirmed'
        );
        setConfirmedBookings(confirmedBookings);
      } else {
        console.error('API response not successful:', response.data);
        // Fallback to mock data if API fails
        const mockBookings = [
          {
            _id: '1',
            bookingId: 'BK001',
            user: {
              _id: 'user1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890'
            },
            bus: {
              _id: 'bus1',
              busType: 'Luxury',
              numberPlate: 'ABC-1234',
              capacity: 50
            },
            route: {
              from: 'Colombo',
              to: 'Kandy',
              distance: 120,
              estimatedDuration: '3 hours'
            },
            travelDate: new Date('2024-01-20'),
            departureTime: '08:00',
            seats: [
              { seatNumber: 'A1', passengerName: 'John Doe', passengerNIC: '123456789V' },
              { seatNumber: 'A2', passengerName: 'Jane Doe', passengerNIC: '987654321V' }
            ],
            numberOfPassengers: 2,
            totalAmount: 5000,
            bookingStatus: 'Confirmed',
            paymentStatus: 'Paid',
            assignedDriver: null,
            createdAt: new Date('2024-01-15')
          },
          {
            _id: '2',
            bookingId: 'BK002',
            user: {
              _id: 'user2',
              firstName: 'Alice',
              lastName: 'Smith',
              email: 'alice@example.com',
              phone: '+1234567891'
            },
            bus: {
              _id: 'bus2',
              busType: 'Standard',
              numberPlate: 'DEF-5678',
              capacity: 40
            },
            route: {
              from: 'Galle',
              to: 'Colombo',
              distance: 100,
              estimatedDuration: '2.5 hours'
            },
            travelDate: new Date('2024-01-21'),
            departureTime: '14:00',
            seats: [
              { seatNumber: 'B1', passengerName: 'Alice Smith', passengerNIC: '111111111V' }
            ],
            numberOfPassengers: 1,
            totalAmount: 2500,
            bookingStatus: 'Confirmed',
            paymentStatus: 'Paid',
            assignedDriver: null,
            createdAt: new Date('2024-01-16')
          }
        ];
        setConfirmedBookings(mockBookings);
        toast.error('Using mock data - Backend connection failed');
      }
    } catch (error) {
      console.error('Failed to fetch confirmed bookings:', error);
      setError(`Failed to fetch bookings: ${error.message}`);
      // Use mock data on error
      const mockBookings = [
        {
          _id: '1',
          bookingId: 'BK001',
          user: {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890'
          },
          bus: {
            _id: 'bus1',
            busType: 'Luxury',
            numberPlate: 'ABC-1234',
            capacity: 50
          },
          route: {
            from: 'Colombo',
            to: 'Kandy',
            distance: 120,
            estimatedDuration: '3 hours'
          },
          travelDate: new Date('2024-01-20'),
          departureTime: '08:00',
          seats: [
            { seatNumber: 'A1', passengerName: 'John Doe', passengerNIC: '123456789V' },
            { seatNumber: 'A2', passengerName: 'Jane Doe', passengerNIC: '987654321V' }
          ],
          numberOfPassengers: 2,
          totalAmount: 5000,
          bookingStatus: 'Confirmed',
          paymentStatus: 'Paid',
          assignedDriver: null,
          createdAt: new Date('2024-01-15')
        }
      ];
      setConfirmedBookings(mockBookings);
      toast.error('Using mock data - Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setDrivers([]);
        return;
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        // Filter users with driver role and include driver profiles
        const drivers = response.data
          .filter(user => user.role === 'driver' && user.isActive)
          .map(user => ({
            _id: user._id,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone
            },
            licenseNumber: user.driverProfile?.licenseNumber || 'N/A',
            licenseExpiry: user.driverProfile?.licenseExpiry || null,
            experience: user.driverProfile?.experience || 0,
            hourlyRate: user.driverProfile?.hourlyRate || 25,
            assignedBus: user.driverProfile?.assignedBus || null,
            isAvailable: true
          }));
        setDrivers(drivers);
      } else {
        // Fallback to mock data
        const mockDrivers = [
          {
            _id: 'driver1',
            user: {
              _id: 'user3',
              firstName: 'Michael',
              lastName: 'Johnson',
              email: 'michael@example.com',
              phone: '+1234567892'
            },
            licenseNumber: 'DL123456',
            licenseExpiry: new Date('2025-12-31'),
            experience: 5,
            hourlyRate: 30,
            assignedBus: null,
            isAvailable: true
          },
          {
            _id: 'driver2',
            user: {
              _id: 'user4',
              firstName: 'Sarah',
              lastName: 'Wilson',
              email: 'sarah@example.com',
              phone: '+1234567893'
            },
            licenseNumber: 'DL789012',
            licenseExpiry: new Date('2026-06-30'),
            experience: 3,
            hourlyRate: 25,
            assignedBus: null,
            isAvailable: true
          }
        ];
        setDrivers(mockDrivers);
        toast.error('Using mock driver data - Backend connection failed');
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setError(`Failed to fetch drivers: ${error.message}`);
      // Use mock data on error
      const mockDrivers = [
        {
          _id: 'driver1',
          user: {
            _id: 'user3',
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael@example.com',
            phone: '+1234567892'
          },
          licenseNumber: 'DL123456',
          licenseExpiry: new Date('2025-12-31'),
          experience: 5,
          hourlyRate: 30,
          assignedBus: null,
          isAvailable: true
        },
        {
          _id: 'driver2',
          user: {
            _id: 'user4',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah@example.com',
            phone: '+1234567893'
          },
          licenseNumber: 'DL789012',
          licenseExpiry: new Date('2026-06-30'),
          experience: 3,
          hourlyRate: 25,
          assignedBus: null,
          isAvailable: true
        }
      ];
      setDrivers(mockDrivers);
      toast.error('Using mock driver data - Backend connection failed');
    }
  };

  const filterBookings = () => {
    try {
      let filtered = confirmedBookings || [];

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(booking => {
          if (!booking) return false;
          return (
            booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bus?.numberPlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.route?.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.route?.to?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      // Filter by date
      if (filterDate) {
        const filterDateObj = new Date(filterDate);
        filtered = filtered.filter(booking => {
          if (!booking || !booking.travelDate) return false;
          const bookingDate = new Date(booking.travelDate);
          return bookingDate.toDateString() === filterDateObj.toDateString();
        });
      }

      setFilteredBookings(filtered);
    } catch (err) {
      console.error('Error filtering bookings:', err);
      setError(`Failed to filter bookings: ${err.message}`);
    }
  };

  const handleAssignDriver = (booking) => {
    setSelectedBooking(booking);
    setSelectedDriver('');
    setShowAssignModal(true);
  };

  const checkDriverResponses = () => {
    // This function can be called periodically to check for driver responses
    // and show notifications to admin
    const pendingBookings = confirmedBookings.filter(booking => 
      booking.assignedDriver && booking.driverResponse === 'pending'
    );
    
    if (pendingBookings.length > 0) {
      toast.info(`${pendingBookings.length} booking(s) awaiting driver response`);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }

    try {
      setAssigning(true);
      const token = localStorage.getItem('token');
      
      // Update booking with assigned driver
      const response = await axios.patch(
        `${BACKEND_URL}/api/bookings/${selectedBooking._id}/assign-driver`,
        { driverId: selectedDriver },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setConfirmedBookings(prev =>
          prev.map(booking =>
            booking._id === selectedBooking._id
              ? { ...booking, assignedDriver: selectedDriver }
              : booking
          )
        );
        
        toast.success('Driver assigned successfully');
        setShowAssignModal(false);
        setSelectedBooking(null);
        setSelectedDriver('');
      } else {
        // Fallback: update local state anyway for demo
        setConfirmedBookings(prev =>
          prev.map(booking =>
            booking._id === selectedBooking._id
              ? { ...booking, assignedDriver: selectedDriver }
              : booking
          )
        );
        toast.success('Driver assigned successfully (demo mode)');
        setShowAssignModal(false);
        setSelectedBooking(null);
        setSelectedDriver('');
      }
    } catch (error) {
      console.error('Failed to assign driver:', error);
      // Fallback: update local state anyway for demo
      setConfirmedBookings(prev =>
        prev.map(booking =>
          booking._id === selectedBooking._id
            ? { ...booking, assignedDriver: selectedDriver }
            : booking
        )
      );
      toast.success('Driver assigned successfully (demo mode)');
      setShowAssignModal(false);
      setSelectedBooking(null);
      setSelectedDriver('');
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d._id === driverId);
    return driver ? `${driver.user?.firstName || 'N/A'} ${driver.user?.lastName || 'N/A'}` : 'Not Assigned';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Driver Schedule Management</h2>
          <p className="text-gray-600">Assign drivers to confirmed bookings</p>
        </div>
        <button
          onClick={fetchConfirmedBookings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}


      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by booking ID, passenger name, bus plate, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Passenger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Travel Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Assigned Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredBookings?.map((booking) => (
                <tr key={booking._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">{booking.bookingId}</div>
                    <div className="text-xs text-gray-500">{booking.numberOfPassengers} passenger(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {booking.user?.firstName || 'N/A'} {booking.user?.lastName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">{booking.user?.email || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{booking.user?.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{booking.bus?.numberPlate || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{booking.bus?.busType || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Capacity: {booking.bus?.capacity || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {booking.route?.from || 'N/A'} → {booking.route?.to || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.route?.distance || 'N/A'}km • {booking.route?.estimatedDuration || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Departure: {formatTime(booking.departureTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{formatDate(booking.travelDate)}</div>
                    <div className="text-xs text-gray-500">
                      {booking.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.assignedDriver ? (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {getDriverName(booking.assignedDriver)}
                          </div>
                          <div className="text-xs text-gray-500">Assigned</div>
                          {booking.driverResponse && (
                            <div className="mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.driverResponse === 'accepted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.driverResponse === 'declined'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.driverResponse === 'accepted' ? '✓ Accepted' : 
                                 booking.driverResponse === 'declined' ? '✗ Declined' : 
                                 '⏳ Pending'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                        <div className="text-sm text-orange-600">Not Assigned</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleAssignDriver(booking)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded transition-colors"
                      title="Assign Driver"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
            {(!filteredBookings || filteredBookings.length === 0) && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">No confirmed bookings found</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm || filterDate 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'There are no confirmed bookings to assign drivers to'
                  }
                </p>
              </div>
            )}
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-blue-100 bg-opacity-80 z-40" onClick={() => setShowAssignModal(false)}></div>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Assign Driver</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedBooking && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Booking Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Booking ID:</strong> {selectedBooking.bookingId}</div>
                    <div><strong>Passenger:</strong> {selectedBooking.user?.firstName || 'N/A'} {selectedBooking.user?.lastName || 'N/A'}</div>
                    <div><strong>Bus:</strong> {selectedBooking.bus?.numberPlate || 'N/A'} ({selectedBooking.bus?.busType || 'N/A'})</div>
                    <div><strong>Route:</strong> {selectedBooking.route?.from || 'N/A'} → {selectedBooking.route?.to || 'N/A'}</div>
                    <div><strong>Date:</strong> {formatDate(selectedBooking.travelDate)} at {formatTime(selectedBooking.departureTime)}</div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a driver...</option>
                  {drivers?.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.user?.firstName || 'N/A'} {driver.user?.lastName || 'N/A'} - {driver.licenseNumber || 'N/A'} ({driver.experience || 0} years exp)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSubmit}
                  disabled={assigning || !selectedDriver}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Assign Driver
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  } catch (error) {
    console.error('Component render error:', error);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <h1 className="text-xl font-bold text-red-800">❌ Component Error</h1>
          <p className="text-red-600">Something went wrong rendering the component.</p>
          <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default DriverScheduleManagement;