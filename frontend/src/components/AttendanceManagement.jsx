import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import jsQR from 'jsqr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  UserX,
  FileText,
  Calendar,
  X
} from 'lucide-react';

// QR Scanner Component with jsQR
const QRScanner = ({ onScan, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const animationFrameRef = useRef(null);

  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsScanning(true);
        
        // Start QR scanning
        scanQRCode();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onError(`Camera access denied: ${error.message}`);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Only scan if video is ready
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR code scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      // If QR code is detected
      if (code) {
        console.log('QR Code detected:', code.data);
        onScan(code.data);
        stopCamera(); // Stop camera after successful scan
        return;
      }
    }

    // Continue scanning
    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  useEffect(() => {
    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="text-center">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 mx-auto max-w-md border border-gray-300 shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          playsInline
          muted
        />
        {isScanning && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-blue-500 border-dashed rounded-lg w-48 h-48 animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-gray-800 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm inline-block shadow-sm">
                Point camera at QR code
              </p>
            </div>
          </>
        )}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Camera not active</p>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex justify-center space-x-4">
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center transition-all"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 flex items-center transition-all"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

// Export Modal Component
const ExportModal = ({ 
  show, 
  onClose, 
  format, 
  setFormat, 
  itemCount, 
  onExport, 
  loading, 
  title = "Export Report" 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-blue-100 bg-opacity-80 z-40" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen px-4 z-50 relative">
        <div className="bg-white border border-blue-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("csv")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === "csv"
                      ? "border-green-500 bg-green-100 text-green-800"
                      : "border-blue-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">CSV (.csv)</span>
                  <p className="text-xs mt-1">For spreadsheets</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === "pdf"
                      ? "border-red-500 bg-red-100 text-red-800"
                      : "border-blue-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">PDF (.pdf)</span>
                  <p className="text-xs mt-1">For printing</p>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Report will include {itemCount} records</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Generated on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={onExport}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceManagement = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('records');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [selectedUserForQR, setSelectedUserForQR] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');
  const [scanningStatus, setScanningStatus] = useState('');
  
  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'records') {
      fetchAttendanceRecords();
    }
  }, [currentPage, selectedUser, statusFilter, startDate, endDate, activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
        // Don't apply status filter to backend if it's 'Checked-In' (we'll filter on frontend)
        ...(statusFilter && statusFilter !== 'Checked-In' && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
        setAttendanceRecords(response.data.docs);
        setTotalPages(response.data.totalPages || 1);
        setTotalRecords(response.data.totalDocs || response.data.docs.length);
      } else if (response.data && Array.isArray(response.data)) {
        setAttendanceRecords(response.data);
        setTotalPages(1);
        setTotalRecords(response.data.length);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
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
      setScanningStatus('Processing QR code...');
      
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
      setScanningStatus('QR code processed successfully!');
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setScanningStatus('');
      }, 3000);
      
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error scanning QR code:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setScanningStatus(`Error: ${errorMessage}`);
      alert('Error scanning QR code: ' + errorMessage);
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setScanningStatus('');
      }, 5000);
    }
  };

  const handleManualScan = () => {
    if (manualQrInput.trim()) {
      handleScan(manualQrInput.trim());
      setManualQrInput('');
    } else {
      alert('Please enter QR code data');
    }
  };

  const handleCameraError = (error) => {
    setCameraError(error);
    setScanningStatus(`Camera Error: ${error}`);
  };

  const handleQrDetected = (qrData) => {
    console.log('QR Code detected in parent:', qrData);
    setScanningStatus('QR code detected! Processing...');
    handleScan(qrData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };

  // Updated export functions
  const exportCSV = (records) => {
    if (!records || records.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = 'Name,Role,Date,Check-In Time,Check-Out Time,Status\n';
    const csvData = records.map(record => 
      `"${record.userId?.firstName || ''} ${record.userId?.lastName || ''}","${record.userId?.role || ''}","${formatDate(record.date)}","${record.checkInTime ? formatTime(record.checkInTime) : 'N/A'}","${record.checkOutTime ? formatTime(record.checkOutTime) : 'N/A'}","${record.status || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = (records, statusFilter = '') => {
    if (!records || records.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Add BusZone+ Header
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text('BusZone+', margin, margin + 10);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('Premium Bus Rental Management System', margin, margin + 16);
    
    // Report title
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Attendance Management Report', pageWidth / 2, margin + 25, { align: 'center' });
    
    // Report metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    const currentDate = new Date();
    doc.text(`Generated on: ${currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${currentDate.toLocaleTimeString()}`, pageWidth / 2, margin + 32, { align: 'center' });
    
    // Statistics section
    const statsY = margin + 40;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Report Summary', margin, statsY);
    
    // Calculate statistics
    const totalRecords = records.length;
    const checkedIn = records.filter(r => r.status === 'Checked-In').length;
    const checkedOut = records.filter(r => r.status === 'Checked-Out').length;
    const checkedInAndOut = checkedIn + checkedOut; // Combined count for Checked-In filter
    const absent = records.filter(r => r.status === 'Absent').length;
    
    // Statistics boxes
    const availableWidth = pageWidth - (margin * 2);
    const boxCount = 4;
    const boxSpacing = 8;
    const boxWidth = Math.min(35, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
    const boxHeight = 25;
    let currentX = margin;
    
    // Total Records box
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(totalRecords.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Total Records', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Checked-In box (always show combined count)
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(checkedInAndOut.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Checked-In', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Checked-Out box (show original checked out count)
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(checkedOut.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Checked-Out', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Absent box
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(absent.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Absent', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    // Status distribution table
    const statusTableY = statsY + 50;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Status Distribution', margin, statusTableY);
    
    // Status data with correct counts
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['Checked-In', checkedInAndOut.toString(), `${((checkedInAndOut/totalRecords)*100).toFixed(1)}%`],
      ['Checked-Out', checkedOut.toString(), `${((checkedOut/totalRecords)*100).toFixed(1)}%`],
      ['Absent', absent.toString(), `${((absent/totalRecords)*100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
      startY: statusTableY + 8,
      head: [statusData[0]],
      body: statusData.slice(1),
      styles: { 
        fontSize: 10, 
        cellPadding: 4,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' }
      },
      margin: { left: margin, right: margin }
    });

    // Add new page for attendance details table
    doc.addPage();
    
    // Add header to second page
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text('BusZone+', margin, margin + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('Premium Bus Rental Management System', margin, margin + 16);
    
    // Main attendance data table
    const tableStartY = margin + 30;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Attendance Details', margin, tableStartY);
    
    // Prepare table data
    const tableColumns = [
      { header: 'Name', dataKey: 'name', width: 45 },
      { header: 'Role', dataKey: 'role', width: 25 },
      { header: 'Date', dataKey: 'date', width: 25 },
      { header: 'Check-In', dataKey: 'checkIn', width: 30 },
      { header: 'Check-Out', dataKey: 'checkOut', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];
    
    const tableRows = records.map((record, index) => ({
      name: `${record.userId?.firstName || ''} ${record.userId?.lastName || ''}`.trim().substring(0, 20) || 'Unknown User',
      role: record.userId?.role?.charAt(0).toUpperCase() + record.userId?.role?.slice(1) || 'N/A',
      date: formatDate(record.date),
      checkIn: record.checkInTime ? formatTime(record.checkInTime) : 'N/A',
      checkOut: record.checkOutTime ? formatTime(record.checkOutTime) : 'N/A',
      status: record.status || 'Unknown'
    }));

    autoTable(doc, {
      startY: tableStartY + 8,
      columns: tableColumns,
      body: tableRows,
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        textColor: [30, 30, 30],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        name: { halign: 'left', fontSize: 8, cellWidth: 45, overflow: 'linebreak' },
        role: { halign: 'center', fontSize: 8, cellWidth: 25 },
        date: { halign: 'center', fontSize: 8, cellWidth: 25 },
        checkIn: { halign: 'center', fontSize: 7, cellWidth: 30 },
        checkOut: { halign: 'center', fontSize: 7, cellWidth: 30 },
        status: { halign: 'center', fontSize: 8, cellWidth: 25 }
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      showHead: 'everyPage',
      didDrawPage: function (data) {
        // Add footer on each page
        const pageNumber = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${currentPage} of ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('BusZone+ Attendance Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
    });

    // Add footer with company info
    const finalY = doc.lastAutoTable.finalY || pageHeight - 30;
    if (finalY < pageHeight - 40) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text('This report was generated by BusZone+ Management System', pageWidth / 2, finalY + 20, { align: 'center' });
      doc.text('For support, contact: info@buszoneplus.com | +94 704 222 777', pageWidth / 2, finalY + 25, { align: 'center' });
    }

    // Save the PDF
    const fileName = `BusZone_AttendanceReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
    doc.save(fileName);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Get all records for export (not just filtered ones)
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(selectedUser && { userId: selectedUser }),
        // Don't apply status filter to backend if it's 'Checked-In' (we'll filter on frontend)
        ...(statusFilter && statusFilter !== 'Checked-In' && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      let exportRecords = [];
      if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
        exportRecords = response.data.docs;
      } else if (response.data && Array.isArray(response.data)) {
        exportRecords = response.data;
      }

      // Apply frontend filtering for Checked-In status
      if (statusFilter === 'Checked-In') {
        exportRecords = exportRecords.filter(record => 
          record.status === 'Checked-In' || record.status === 'Checked-Out'
        );
      }

      if (exportFormat === 'csv') {
        exportCSV(exportRecords);
      } else {
        exportPDF(exportRecords, statusFilter);
      }

      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report: ' + (error.response?.data?.message || error.message));
    } finally {
      setExportLoading(false);
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
      
      fetchAttendanceRecords();
      alert('Attendance record deleted successfully');
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('Error deleting record: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    // Apply search filter first
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      const userName = `${record.userId?.firstName || ''} ${record.userId?.lastName || ''}`.toLowerCase();
      const userRole = (record.userId?.role || '').toLowerCase();
      const recordDate = formatDate(record.date).toLowerCase();
      const recordStatus = (record.status || '').toLowerCase();
      
      const matchesSearch = userName.includes(searchTerm) || 
             userRole.includes(searchTerm) || 
             recordDate.includes(searchTerm) ||
             recordStatus.includes(searchTerm);
      
      if (!matchesSearch) return false;
    }
    
    // Apply status filter
    if (!statusFilter) return true;
    
    if (statusFilter === 'Checked-In') {
      // Show both Checked-In and Checked-Out records
      return record.status === 'Checked-In' || record.status === 'Checked-Out';
    } else if (statusFilter === 'Checked-Out') {
      return record.status === 'Checked-Out';
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-blue-200 bg-white rounded-t-xl p-2">
          <button
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'records' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
            onClick={() => setActiveTab('records')}
          >
            Attendance Records
          </button>
          {authUser?.role === 'admin' && (
            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'qr' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
              onClick={() => setActiveTab('qr')}
            >
              QR Management
            </button>
          )}
          <button
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'scan' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
            onClick={() => setActiveTab('scan')}
          >
            Scan QR
          </button>
        </div>

      {/* Attendance Records Tab */}
      {activeTab === 'records' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role, date, or status..."
                    className="w-full pl-10 bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Checked-In">Checked-In</option>
                  <option value="Checked-Out">Checked-Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end items-end space-x-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setSelectedUser('');
                  setStatusFilter('');
                  setSearchQuery('');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </button>
              
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                onClick={() => setShowExportModal(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                onClick={fetchAttendanceRecords}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Attendance Records</h3>
              <div className="text-gray-600 text-sm">
                Showing {filteredRecords.length} of {totalRecords} records
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                {attendanceRecords.length === 0 ? (
                  <div>
                    <p>No attendance records found.</p>
                    <p className="text-sm mt-2">Please check if:</p>
                    <ul className="text-sm text-gray-500 mt-1">
                      <li>- The API endpoint is correct</li>
                      <li>- You have proper authentication</li>
                      <li>- There are attendance records in the database</li>
                    </ul>
                    <button 
                      onClick={fetchAttendanceRecords}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
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
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-left">
                        <th className="px-4 py-3 text-blue-800 font-semibold">User</th>
                        <th className="px-4 py-3 text-blue-800 font-semibold">Date</th>
                        <th className="px-4 py-3 text-blue-800 font-semibold">Check-In</th>
                        <th className="px-4 py-3 text-blue-800 font-semibold">Check-Out</th>
                        <th className="px-4 py-3 text-blue-800 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(record => (
                        <tr key={record._id} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-gray-800 font-medium">
                                  {record.userId?.firstName || 'Unknown'} {record.userId?.lastName || 'User'}
                                </p>
                                <p className="text-gray-500 text-sm">{record.userId?.role || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {record.checkInTime ? formatTime(record.checkInTime) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {record.checkOutTime ? formatTime(record.checkOutTime) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Checked-In' ? 'bg-yellow-100 text-yellow-800' :
                              record.status === 'Checked-Out' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status || 'Unknown'}
                            </span>
                          </td>
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
                        className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
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
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate QR Codes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-blue-200 rounded-lg shadow-lg" />
                  <p className="text-gray-600 mt-4 text-sm">Scan this QR code to check in/out</p>
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm transition-colors"
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
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center text-sm transition-colors"
                      onClick={() => setQrCode(null)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-48 h-48 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                  <QrCode className="w-12 h-12 text-blue-400 mb-2" />
                  <p className="text-gray-600 text-center text-sm p-4">Select a user and generate QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scan QR Tab - UPDATED WITH WORKING QR SCANNER */}
      {activeTab === 'scan' && (
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">QR Code Scanner</h3>
          
          <div className="max-w-2xl mx-auto">
            {cameraError && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-6 flex items-center">
                <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {scanningStatus && (
              <div className={`p-4 rounded-lg mb-6 flex items-center ${
                scanningStatus.includes('Error') 
                  ? 'bg-red-100 border border-red-300 text-red-800' 
                  : 'bg-blue-100 border border-blue-300 text-blue-800'
              }`}>
                {scanningStatus.includes('Error') ? (
                  <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                <span>{scanningStatus}</span>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-200 shadow-lg">
              {/* Working QR Scanner */}
              <QRScanner 
                onScan={handleQrDetected}
                onError={handleCameraError}
              />
              
              {/* Manual Input Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3 text-center">Manual QR Input</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Paste QR code data here..."
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={manualQrInput}
                    onChange={(e) => setManualQrInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualScan();
                      }
                    }}
                  />
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                    onClick={handleManualScan}
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Submit
                  </button>
                </div>
              </div>
            </div>
            
            {scanResult && (
              <div className={`p-6 rounded-xl border mb-6 ${
                scanResult.action === 'check-in' 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-blue-50 border-blue-300'
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
                  <h4 className="text-lg font-semibold text-gray-800">
                    {scanResult.action === 'check-in' ? 'Check-In Successful' : 'Check-Out Successful'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="font-medium">
                      {scanResult.attendance?.userId?.firstName} {scanResult.attendance?.userId?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{scanResult.attendance?.userId?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {scanResult.attendance?.checkInTime ? 
                        new Date(scanResult.attendance.checkInTime).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {scanResult.attendance?.checkInTime ? 
                        new Date(scanResult.attendance.checkInTime).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-green-700 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {scanResult.message}
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <Scan className="w-5 h-5 mr-2 text-blue-600" />
                Scanning Instructions
              </h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Click "Start Camera" to begin scanning</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Position the QR code within the camera view</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Ensure good lighting for better scanning</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Hold the QR code steady until it's detected</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <span>Use manual input if camera scanning doesn't work</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        format={exportFormat}
        setFormat={setExportFormat}
        itemCount={totalRecords}
        onExport={handleExport}
        loading={exportLoading}
        title="Export Attendance Report"
      />
      </div>
    </div>
  );
};

export default AttendanceManagement;