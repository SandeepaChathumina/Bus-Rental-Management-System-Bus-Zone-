import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Fetch attendance records
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // Filter records based on search term and date
  useEffect(() => {
    let filtered = attendanceRecords;
    
    if (selectedDate) {
      filtered = filtered.filter(record => 
        new Date(record.checkInTime).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userId.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRecords(filtered);
  }, [attendanceRecords, selectedDate, searchTerm]);

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance);
      } else {
        toast.error('Failed to fetch attendance records');
      }
    } catch (error) {
      toast.error('Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user._id })
      });
      
      if (response.ok) {
        toast.success('Check-in successful');
        fetchAttendanceRecords();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Check-in failed');
      }
    } catch (error) {
      toast.error('Error during check-in');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/${attendanceId}/check-out`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Check-out successful');
        fetchAttendanceRecords();
      } else {
        toast.error('Check-out failed');
      }
    } catch (error) {
      toast.error('Error during check-out');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Attendance Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by name or role..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          
          {(user?.role === 'driver' || user?.role === 'staff') && (
            <button
              onClick={handleCheckIn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 w-full md:w-auto"
            >
              Check In
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Check-In Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Check-Out Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.userId.firstName} {record.userId.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{record.userId.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? formatDate(record.checkOutTime) : 'Not checked out'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'Checked-In' ? 'bg-green-100 text-green-800' : 
                          record.status === 'Checked-Out' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {record.status === 'Checked-In' && (
                        <button
                          onClick={() => handleCheckOut(record._id)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;