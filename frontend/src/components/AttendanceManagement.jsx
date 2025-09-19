import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Users,
  QrCode,
  Scan,
  Download,
  Plus,
  Edit,
  Trash2,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX
} from 'lucide-react';

const AttendanceManagement = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('records');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [selectedUserForQR, setSelectedUserForQR] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'records') {
      fetchAttendanceRecords();
    }
  }, [currentPage, selectedUser, startDate, endDate, statusFilter, activeTab]);

  useEffect(() => {
    // Clean up scanner when component unmounts or tab changes
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.log("Scanner cleanup:", error);
        });
      }
    };
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter to only include drivers and staff
      const driversAndStaff = response.data.filter(user => 
        user.role === 'driver' || user.role === 'staff'
      );
      setUsers(driversAndStaff);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(selectedUser && { userId: selectedUser }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Attendance API response:', response.data);
      
      // Handle mongoose-paginate-v2 response format
      if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
        setAttendanceRecords(response.data.docs);
        setTotalPages(response.data.totalPages || 1);
        setTotalRecords(response.data.totalDocs || response.data.docs.length);
      } 
      // Fallback for other response formats
      else if (response.data && Array.isArray(response.data)) {
        setAttendanceRecords(response.data);
        setTotalPages(1);
        setTotalRecords(response.data.length);
      }
      else {
        console.error('Unexpected API response format:', response.data);
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
      }
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!selectedUserForQR) {
      alert('Please select a user to generate QR code');
      return;
    }

    setQrGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/generate-qr`,
        { userId: selectedUserForQR },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code: ' + (error.response?.data?.message || error.message));
    } finally {
      setQrGenerating(false);
    }
  };

  const handleScan = async (qrData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/scan-qr`,
        { qrData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setScanResult(response.data);
      
      // Refresh records after scanning
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error scanning QR code:', error);
      alert('Error scanning QR code: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleManualScan = () => {
    const qrData = prompt('Please paste the QR code data:');
    if (qrData) {
      handleScan(qrData);
    }
  };

  const startScanner = () => {
    setCameraError(null);
    setIsScanning(true);
    setScanResult(null);
    
    // Clear any previous scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.log("Scanner clear error:", error);
      });
    }
    
    // Initialize the scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [] 
      },
      false
    );
    
    scannerRef.current.render(
      (decodedText) => {
        // Successfully scanned
        setIsScanning(false);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        handleScan(decodedText);
      },
      (error) => {
        // Most errors can be ignored as they're usually parsing errors
        console.log("QR Scan error (usually not critical):", error);
      }
    ).catch(err => {
      console.error("Failed to initialize scanner:", err);
      setCameraError("Failed to access camera. Please check permissions.");
      setIsScanning(false);
    });
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.log("Scanner stop error:", error);
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };

  const exportReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(selectedUser && { userId: selectedUser }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        format: 'csv'
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/report?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Handle report response format
      let records = [];
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        records = response.data.records;
      } else if (Array.isArray(response.data)) {
        records = response.data;
      }
      
      // Convert to CSV
      const headers = 'Name,Role,Date,Check-In Time,Check-Out Time,Status\n';
      const csvData = records.map(record => 
        `${record.userId?.firstName || ''} ${record.userId?.lastName || ''},${record.userId?.role || ''},${formatDate(record.date)},${record.checkInTime ? formatTime(record.checkInTime) : 'N/A'},${record.checkOutTime ? formatTime(record.checkOutTime) : 'N/A'},${record.status || ''}`
      ).join('\n');
      
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteAttendanceRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh the records
      fetchAttendanceRecords();
      alert('Attendance record deleted successfully');
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('Error deleting record: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    const userName = `${record.userId?.firstName || ''} ${record.userId?.lastName || ''}`.toLowerCase();
    const userRole = (record.userId?.role || '').toLowerCase();
    const recordDate = formatDate(record.date).toLowerCase();
    const recordStatus = (record.status || '').toLowerCase();
    
    return userName.includes(searchTerm) || 
           userRole.includes(searchTerm) || 
           recordDate.includes(searchTerm) ||
           recordStatus.includes(searchTerm);
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'records' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
          onClick={() => setActiveTab('records')}
        >
          Attendance Records
        </button>
        {authUser?.role === 'admin' && (
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'qr' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('qr')}
          >
            QR Management
          </button>
        )}
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'scan' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
          onClick={() => setActiveTab('scan')}
        >
          Scan QR
        </button>
      </div>

      {/* Attendance Records Tab */}
      {activeTab === 'records' && (
        <div>
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role, date, or status..."
                    className="w-full pl-10 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">User</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                <input
                    type="date"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Checked-In">Checked-In</option>
                  <option value="Checked-Out">Checked-Out</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              
              <div className="md:col-span-4 flex justify-end items-end space-x-3">
                <button
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600"
                  onClick={() => {
                    setSelectedUser('');
                    setStartDate('');
                    setEndDate('');
                    setStatusFilter('');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </button>
                
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 flex items-center"
                  onClick={exportReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center"
                  onClick={fetchAttendanceRecords}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Attendance Records</h3>
              <div className="text-slate-300 text-sm">
                Showing {filteredRecords.length} of {totalRecords} records
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-slate-400 mt-2">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                {attendanceRecords.length === 0 ? (
                  <div>
                    <p>No attendance records found.</p>
                    <p className="text-sm mt-2">Please check if:</p>
                    <ul className="text-sm text-slate-500 mt-1">
                      <li>- The API endpoint is correct</li>
                      <li>- You have proper authentication</li>
                      <li>- There are attendance records in the database</li>
                    </ul>
                    <button 
                      onClick={fetchAttendanceRecords}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center mx-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  'No records match your search criteria'
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-slate-700 text-left">
                        <th className="px-4 py-2 text-slate-300">User</th>
                        <th className="px-4 py-2 text-slate-300">Date</th>
                        <th className="px-4 py-2 text-slate-300">Check-In</th>
                        <th className="px-4 py-2 text-slate-300">Check-Out</th>
                        <th className="px-4 py-2 text-slate-300">Status</th>
                        {authUser?.role === 'admin' && (
                          <th className="px-4 py-2 text-slate-300">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(record => (
                        <tr key={record._id} className="border-b border-slate-700 hover:bg-slate-750">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {record.userId?.firstName || 'Unknown'} {record.userId?.lastName || 'User'}
                                </p>
                                <p className="text-slate-400 text-sm">{record.userId?.role || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {record.checkInTime ? formatTime(record.checkInTime) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {record.checkOutTime ? formatTime(record.checkOutTime) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Checked-In' ? 'bg-yellow-500/20 text-yellow-300' :
                              record.status === 'Checked-Out' ? 'bg-green-500/20 text-green-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {record.status || 'Unknown'}
                            </span>
                          </td>
                          {authUser?.role === 'admin' && (
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button 
                                  className="p-1 text-red-400 hover:text-red-300"
                                  onClick={() => deleteAttendanceRecord(record._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-2 items-center">
                      <button
                        className="p-2 rounded-md bg-slate-700 text-white disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="text-slate-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        className="p-2 rounded-md bg-slate-700 text-white disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* QR Management Tab (Admin only) */}
      {activeTab === 'qr' && authUser?.role === 'admin' && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Generate QR Codes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select User</label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                value={selectedUserForQR}
                onChange={(e) => setSelectedUserForQR(e.target.value)}
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                    </option>
                ))}
              </select>
              
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateQRCode}
                disabled={!selectedUserForQR || qrGenerating}
              >
                {qrGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
            
            <div className="flex justify-center">
              {qrCode ? (
                <div className="text-center">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-white rounded-lg shadow-lg" />
                  <p className="text-slate-300 mt-4 text-sm">Scan this QR code to check in/out</p>
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center text-sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrCode;
                        link.download = 'attendance-qr.png';
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button
                      className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 flex items-center text-sm"
                      onClick={() => setQrCode(null)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-48 h-48 bg-slate-700 rounded-lg border-2 border-dashed border-slate-600">
                  <QrCode className="w-12 h-12 text-slate-500 mb-2" />
                  <p className="text-slate-400 text-center text-sm p-4">Select a user and generate QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scan QR Tab */}
      {activeTab === 'scan' && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">QR Code Scanner</h3>
          
          <div className="max-w-2xl mx-auto">
            {cameraError && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg mb-6 flex items-center">
                <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
            
            <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-700 shadow-lg">
              <div className="relative">
                <div id="qr-reader" className="mx-auto mb-4 rounded-lg overflow-hidden"></div>
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-blue-400 border-dashed rounded-lg w-64 h-64 animate-pulse"></div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                {!isScanning ? (
                  <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center transition-all shadow-md hover:shadow-lg"
                    onClick={startScanner}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </button>
                ) : (
                  <button
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 flex items-center transition-all shadow-md hover:shadow-lg"
                    onClick={stopScanner}
                  >
                    <CameraOff className="w-5 h-5 mr-2" />
                    Stop Camera
                  </button>
                )}
                
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center transition-all shadow-md hover:shadow-lg"
                  onClick={handleManualScan}
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Manual Input
                </button>
              </div>
            </div>
            
            {scanResult && (
              <div className={`p-6 rounded-xl border mb-6 ${
                scanResult.action === 'check-in' 
                  ? 'bg-green-900/20 border-green-700' 
                  : 'bg-blue-900/20 border-blue-700'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`rounded-full p-2 mr-3 ${
                    scanResult.action === 'check-in' 
                      ? 'bg-green-600' 
                      : 'bg-blue-600'
                  }`}>
                    {scanResult.action === 'check-in' ? (
                      <UserCheck className="w-5 h-5 text-white" />
                    ) : (
                      <UserX className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {scanResult.action === 'check-in' ? 'Check-In Successful' : 'Check-Out Successful'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                  <div>
                    <p className="text-sm text-slate-400">User</p>
                    <p className="font-medium">
                      {scanResult.attendance?.userId?.firstName} {scanResult.attendance?.userId?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Role</p>
                    <p className="font-medium capitalize">{scanResult.attendance?.userId?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Time</p>
                    <p className="font-medium">
                      {scanResult.attendance?.checkInTime ? 
                        new Date(scanResult.attendance.checkInTime).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="font-medium">
                      {scanResult.attendance?.checkInTime ? 
                        new Date(scanResult.attendance.checkInTime).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-green-300 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {scanResult.message}
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h4 className="text-md font-semibold text-white mb-3 flex items-center">
                <Scan className="w-5 h-5 mr-2 text-blue-400" />
                Scanning Instructions
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Position the QR code within the camera viewfinder</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Ensure good lighting for better scanning accuracy</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Hold the device steady until the code is recognized</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Use manual input if camera is not available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;