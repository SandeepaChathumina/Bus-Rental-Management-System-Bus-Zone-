// src/components/DriverScheduleManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bus, 
  User, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  Download,
  FileText,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const DriverScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDriver, setFilterDriver] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [showExportModal, setShowExportModal] = useState(false);

  // Complete sample data
  const sampleData = {
    drivers: [
      { _id: 'driver1', firstName: 'Kavindu', lastName: 'Ishara', licenseNumber: 'DL12345', contact: '+94 771234567' },
      { _id: 'driver2', firstName: 'Dilshan', lastName: 'Range', licenseNumber: 'DL67890', contact: '+94 772345678' },
      { _id: 'driver3', firstName: 'Saman', lastName: 'Perera', licenseNumber: 'DL54321', contact: '+94 773456789' },
      { _id: 'driver4', firstName: 'Nimal', lastName: 'Silva', licenseNumber: 'DL98765', contact: '+94 774567890' }
    ],
    buses: [
      { _id: 'bus1', busId: 'BZ-001', numberPlate: 'NA-1234', busType: 'Luxury Coach', capacity: 10 },
      { _id: 'bus2', busId: 'BZ-002', numberPlate: 'CAB-5678', busType: 'Standard Coach', capacity: 23 },
      { _id: 'bus3', busId: 'BZ-003', numberPlate: 'CAB-9012', busType: 'Mini Coach', capacity: 20 },
      { _id: 'bus4', busId: 'BZ-004', numberPlate: 'CAB-3456', busType: 'Luxury Coach', capacity: 15 }
    ],
    bookings: [
      { _id: 'booking1', bookingId: 'BZ-2024-1001', travelDate: '2024-09-28', passengers: 32, route: 'Colombo - Kandy' },
      { _id: 'booking2', bookingId: 'BZ-2024-1002', travelDate: '2024-09-27', passengers: 28, route: 'Galle - Colombo' },
      { _id: 'booking3', bookingId: 'BZ-2024-1003', travelDate: '2024-09-27', passengers: 40, route: 'Negombo - Colombo' },
      { _id: 'booking4', bookingId: 'BZ-2024-1004', travelDate: '2024-09-27', passengers: 22, route: 'Colombo - Galle' }
    ]
  };

  const initialScheduleData = {
    bookingId: '',
    busId: '',
    driverId: '',
    startLocation: '',
    destination: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    status: 'Scheduled'
  };

  // Sample schedules data with correct references
  const sampleSchedules = [
    {
      _id: 'schedule1',
      bookingId: sampleData.bookings[0],
      busId: sampleData.buses[0],
      driverId: sampleData.drivers[0],
      startLocation: 'Colombo Fort',
      destination: 'Kandy City Center',
      scheduledStartTime: '2024-01-15',
      scheduledEndTime: '2024-01-15',
      status: 'Scheduled',
      createdAt: '2024-01-10T10:00:00',
      updatedAt: '2024-01-10T10:00:00'
    },
    {
      _id: 'schedule2',
      bookingId: sampleData.bookings[1],
      busId: sampleData.buses[1],
      driverId: sampleData.drivers[1],
      startLocation: 'Galle Bus Stand',
      destination: 'Colombo Fort',
      scheduledStartTime: '2024-01-15',
      scheduledEndTime: '2024-01-15',
      status: 'In Progress',
      actualStartTime: '2024-01-15T08:15:00',
      createdAt: '2024-01-09T14:30:00',
      updatedAt: '2024-01-15T08:15:00'
    },
    {
      _id: 'schedule3',
      bookingId: sampleData.bookings[2],
      busId: sampleData.buses[2],
      driverId: sampleData.drivers[2],
      startLocation: 'Negombo Bus Station',
      destination: 'Colombo Pettah',
      scheduledStartTime: '2024-01-16',
      scheduledEndTime: '2024-01-16',
      status: 'Completed',
      actualStartTime: '2024-01-16T07:25:00',
      actualEndTime: '2024-01-16T09:10:00',
      createdAt: '2024-01-08T16:45:00',
      updatedAt: '2024-01-16T09:10:00'
    },
    {
      _id: 'schedule4',
      bookingId: sampleData.bookings[3],
      busId: sampleData.buses[3],
      driverId: sampleData.drivers[3],
      startLocation: 'Colombo Fort',
      destination: 'Galle Bus Stand',
      scheduledStartTime: '2024-01-16',
      scheduledEndTime: '2024-01-16',
      status: 'Cancelled',
      createdAt: '2024-01-11T11:20:00',
      updatedAt: '2024-01-12T09:45:00'
    }
  ];

  // Calendar validation functions - Only past date validation
const validateDateTime = (formData, isEdit = false, existingScheduleId = null) => {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for date comparison
  
  const startDate = new Date(formData.scheduledStartTime);
  const endDate = new Date(formData.scheduledEndTime);

  // Past date validation only
  if (startDate < today) {
    errors.scheduledStartTime = 'Start date cannot be in the past';
  }

  if (endDate < today) {
    errors.scheduledEndTime = 'End date cannot be in the past';
  }

  return errors;
};

  // Export to Excel function
  const exportToExcel = () => {
    setExportLoading(true);
    
    try {
      // Prepare data for export
      const exportData = filteredSchedules.map(schedule => ({
        'Schedule ID': schedule._id,
        'Booking ID': schedule.bookingId.bookingId,
        'Driver': `${schedule.driverId.firstName} ${schedule.driverId.lastName}`,
        'Driver License': schedule.driverId.licenseNumber,
        'Bus ID': schedule.busId.busId,
        'Number Plate': schedule.busId.numberPlate,
        'Bus Type': schedule.busId.busType,
        'Start Location': schedule.startLocation,
        'Destination': schedule.destination,
        'Route': schedule.bookingId.route,
        'Passengers': schedule.bookingId.passengers,
        'Scheduled Start': new Date(schedule.scheduledStartTime).toLocaleDateString(),
        'Scheduled End': new Date(schedule.scheduledEndTime).toLocaleDateString(),
        'Status': schedule.status,
        'Created Date': formatDateTime(schedule.createdAt),
        'Last Updated': formatDateTime(schedule.updatedAt)
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 },  // Schedule ID
        { wch: 12 },  // Booking ID
        { wch: 20 },  // Driver
        { wch: 15 },  // Driver License
        { wch: 10 },  // Bus ID
        { wch: 15 },  // Number Plate
        { wch: 15 },  // Bus Type
        { wch: 20 },  // Start Location
        { wch: 20 },  // Destination
        { wch: 20 },  // Route
        { wch: 10 },  // Passengers
        { wch: 20 },  // Scheduled Start
        { wch: 20 },  // Scheduled End
        { wch: 12 },  // Status
        { wch: 20 },  // Created Date
        { wch: 20 }   // Last Updated
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Driver Schedules Report');

      // Generate file name with timestamp
      const fileName = `Driver_Schedules_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, fileName);
      
      toast.success('Excel report generated successfully!');
    } catch (error) {
      console.error('Export to Excel error:', error);
      toast.error('Failed to generate Excel report');
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  // Export to PDF function
  const exportToPDF = async () => {
    setExportLoading(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: 'Driver Schedules Management Report',
        subject: 'Driver Schedules Export',
        author: 'BusZone+ System',
        keywords: 'driver, schedule, management, report',
        creator: 'BusZone+'
      });

      // Add header
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, 210, 30, 'F');
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('DRIVER SCHEDULES MANAGEMENT REPORT', 105, 15, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

      // Prepare table data
      const headers = ['Schedule ID', 'Driver', 'Bus', 'Route', 'Start Time', 'End Time', 'Status'];
      
      const tableData = filteredSchedules.map(schedule => [
        schedule._id.substring(0, 8) + '...',
        `${schedule.driverId.firstName} ${schedule.driverId.lastName}`,
        schedule.busId.numberPlate,
        schedule.bookingId.route,
        formatTime(schedule.scheduledStartTime),
        formatTime(schedule.scheduledEndTime),
        schedule.status
      ]);

      // Set starting position for table
      let yPosition = 40;

      // Create table manually for better control
      const columnWidths = [25, 30, 20, 30, 25, 25, 20];
      const rowHeight = 10;
      const margin = 10;

      // Draw table headers
      doc.setFillColor(15, 23, 42); // slate-900
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      
      let xPosition = margin;
      headers.forEach((header, index) => {
        doc.rect(xPosition, yPosition, columnWidths[index], rowHeight, 'F');
        doc.text(header, xPosition + 2, yPosition + 7);
        xPosition += columnWidths[index];
      });

      yPosition += rowHeight;

      // Draw table rows
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      tableData.forEach((row, rowIndex) => {
        xPosition = margin;
        let maxHeight = rowHeight;
        
        // Check if we need a new page
        if (yPosition + rowHeight > 280) {
          doc.addPage();
          yPosition = 20;
          
          // Redraw headers on new page
          doc.setFillColor(15, 23, 42);
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');
          
          let headerX = margin;
          headers.forEach((header, index) => {
            doc.rect(headerX, yPosition, columnWidths[index], rowHeight, 'F');
            doc.text(header, headerX + 2, yPosition + 7);
            headerX += columnWidths[index];
          });
          yPosition += rowHeight;
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
        }

        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(241, 245, 249); // slate-50
        } else {
          doc.setFillColor(255, 255, 255);
        }

        // Draw row background
        let bgX = margin;
        columnWidths.forEach(width => {
          doc.rect(bgX, yPosition, width, rowHeight, 'F');
          bgX += width;
        });

        // Draw row content
        row.forEach((cell, cellIndex) => {
          doc.text(cell.toString(), xPosition + 2, yPosition + 7);
          xPosition += columnWidths[cellIndex];
        });

        yPosition += rowHeight;
      });

      // Add summary section
      yPosition += 10;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('SUMMARY STATISTICS', margin, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const stats = [
        `Total Schedules: ${filteredSchedules.length}`,
        `Scheduled: ${filteredSchedules.filter(s => s.status === 'Scheduled').length}`,
        `In Progress: ${filteredSchedules.filter(s => s.status === 'In Progress').length}`,
        `Completed: ${filteredSchedules.filter(s => s.status === 'Completed').length}`,
        `Cancelled: ${filteredSchedules.filter(s => s.status === 'Cancelled').length}`,
        `Total Drivers: ${new Set(filteredSchedules.map(s => s.driverId._id)).size}`,
        `Total Buses: ${new Set(filteredSchedules.map(s => s.busId._id)).size}`
      ];

      stats.forEach(stat => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(stat, margin, yPosition);
        yPosition += 6;
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('BusZone+ Driver Schedule Management System', 105, 295, { align: 'center' });
      }

      // Generate file name
      const fileName = `Driver_Schedules_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      // Save the PDF
      doc.save(fileName);
      
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Export to PDF error:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  const handleExport = () => {
    if (filteredSchedules.length === 0) {
      toast.error('No data to export');
      return;
    }
    setShowExportModal(true);
  };

  const executeExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSchedules(sampleSchedules);
        setFilteredSchedules(sampleSchedules);
      } catch (error) {
        console.error('Error loading schedules:', error);
        toast.error('Failed to load schedules');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [searchTerm, filterDriver, filterStatus, filterDate, schedules]);

  const filterSchedules = () => {
    let filtered = schedules;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(schedule => {
        const searchLower = searchTerm.toLowerCase();
        return (
          schedule.bookingId.bookingId.toLowerCase().includes(searchLower) ||
          schedule.driverId.firstName.toLowerCase().includes(searchLower) ||
          schedule.driverId.lastName.toLowerCase().includes(searchLower) ||
          schedule.busId.numberPlate.toLowerCase().includes(searchLower) ||
          schedule.startLocation.toLowerCase().includes(searchLower) ||
          schedule.destination.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by driver
    if (filterDriver !== 'all') {
      filtered = filtered.filter(schedule => schedule.driverId._id === filterDriver);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(schedule => schedule.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledStartTime).toISOString().split('T')[0];
        return scheduleDate === filterDate;
      });
    }

    setFilteredSchedules(filtered);
  };

  const handleCreateSchedule = async (formData) => {
    try {
      // Validate form
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix the validation errors');
        return false;
      }

      // Clear validation errors
      setValidationErrors({});

      // Find related data
      const booking = sampleData.bookings.find(b => b._id === formData.bookingId);
      const bus = sampleData.buses.find(b => b._id === formData.busId);
      const driver = sampleData.drivers.find(d => d._id === formData.driverId);

      if (!booking || !bus || !driver) {
        toast.error('Invalid data selected');
        return false;
      }

      // Create new schedule
      const newSchedule = {
        _id: `schedule${Date.now()}`,
        bookingId: booking,
        busId: bus,
        driverId: driver,
        startLocation: formData.startLocation,
        destination: formData.destination,
        scheduledStartTime: formData.scheduledStartTime,
        scheduledEndTime: formData.scheduledEndTime,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSchedules(prev => [newSchedule, ...prev]);
      toast.success('Schedule created successfully!');
      return true;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
      return false;
    }
  };

  const handleUpdateSchedule = async (formData) => {
    try {
      if (!selectedSchedule) return false;

      // Validate form
      const errors = validateForm(formData, true, selectedSchedule._id);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix the validation errors');
        return false;
      }

      // Clear validation errors
      setValidationErrors({});

      // Find related data
      const booking = sampleData.bookings.find(b => b._id === formData.bookingId);
      const bus = sampleData.buses.find(b => b._id === formData.busId);
      const driver = sampleData.drivers.find(d => d._id === formData.driverId);

      if (!booking || !bus || !driver) {
        toast.error('Invalid data selected');
        return false;
      }

      // Update schedule
      const updatedSchedules = schedules.map(schedule =>
        schedule._id === selectedSchedule._id
          ? {
              ...schedule,
              bookingId: booking,
              busId: bus,
              driverId: driver,
              startLocation: formData.startLocation,
              destination: formData.destination,
              scheduledStartTime: formData.scheduledStartTime,
              scheduledEndTime: formData.scheduledEndTime,
              status: formData.status,
              updatedAt: new Date().toISOString()
            }
          : schedule
      );

      setSchedules(updatedSchedules);
      toast.success('Schedule updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
      return false;
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      setSchedules(prev => prev.filter(schedule => schedule._id !== scheduleId));
      toast.success('Schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to cancel this schedule?')) {
      return;
    }

    try {
      const updatedSchedules = schedules.map(schedule =>
        schedule._id === scheduleId
          ? { ...schedule, status: 'Cancelled', updatedAt: new Date().toISOString() }
          : schedule
      );

      setSchedules(updatedSchedules);
      toast.success('Schedule cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      toast.error('Failed to cancel schedule');
    }
  };

  const handleEditClick = (schedule) => {
    setSelectedSchedule(schedule);
    setValidationErrors({});
    setShowEditModal(true);
  };

  const toggleExpand = (scheduleId) => {
    setExpandedSchedules(prev => ({
      ...prev,
      [scheduleId]: !prev[scheduleId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-900/30 text-blue-400';
      case 'in progress': return 'bg-orange-900/30 text-orange-400';
      case 'completed': return 'bg-green-900/30 text-green-400';
      case 'cancelled': return 'bg-red-900/30 text-red-400';
      default: return 'bg-gray-900/30 text-gray-400';
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Modal Components
  const CreateScheduleModal = () => {
    const [formData, setFormData] = useState(initialScheduleData);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }

      // Auto-validate time fields when both are filled
      if ((field === 'scheduledStartTime' && formData.scheduledEndTime) || 
          (field === 'scheduledEndTime' && formData.scheduledStartTime)) {
        const errors = validateDateTime(formData);
        setValidationErrors(prev => ({ ...prev, ...errors }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const success = await handleCreateSchedule(formData);
      if (success) {
        setShowCreateModal(false);
        setFormData(initialScheduleData);
        setValidationErrors({});
      }
    };

    const handleClose = () => {
      setShowCreateModal(false);
      setFormData(initialScheduleData);
      setValidationErrors({});
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create New Schedule</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Info Banner */}
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium">Schedule Validation Rules:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Cannot schedule in the past</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Booking *</label>
                <select
                  required
                  value={formData.bookingId}
                  onChange={(e) => handleInputChange('bookingId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.bookingId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">Select Booking</option>
                  {sampleData.bookings.map(booking => (
                    <option key={booking._id} value={booking._id}>
                      {booking.bookingId} - {booking.route} ({new Date(booking.travelDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {validationErrors.bookingId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.bookingId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Driver *</label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => handleInputChange('driverId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.driverId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">Select Driver</option>
                  {sampleData.drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName} ({driver.licenseNumber})
                    </option>
                  ))}
                </select>
                {validationErrors.driverId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.driverId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bus *</label>
                <select
                  required
                  value={formData.busId}
                  onChange={(e) => handleInputChange('busId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.busId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">Select Bus</option>
                  {sampleData.buses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busId} - {bus.numberPlate} ({bus.busType})
                    </option>
                  ))}
                </select>
                {validationErrors.busId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.busId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Location *</label>
                <input
                  type="text"
                  required
                  value={formData.startLocation}
                  onChange={(e) => handleInputChange('startLocation', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.startLocation ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="e.g., Colombo Fort"
                />
                {validationErrors.startLocation && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.startLocation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Destination *</label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.destination ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="e.g., Kandy City Center"
                />
                {validationErrors.destination && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.destination}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Time *</label>
                <input
                  type="date"
                  required
                  value={formData.scheduledStartTime}
                  onChange={(e) => handleInputChange('scheduledStartTime', e.target.value)}
                  min={getMinDate()}  // We'll update this function too
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.scheduledStartTime ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {validationErrors.scheduledStartTime && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.scheduledStartTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledEndTime}
                  onChange={(e) => handleInputChange('scheduledEndTime', e.target.value)}
                  min={getMinDateTime()}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.scheduledEndTime ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {validationErrors.scheduledEndTime && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.scheduledEndTime}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditScheduleModal = () => {
    const [formData, setFormData] = useState(
      selectedSchedule ? {
        bookingId: selectedSchedule.bookingId._id,
        busId: selectedSchedule.busId._id,
        driverId: selectedSchedule.driverId._id,
        startLocation: selectedSchedule.startLocation,
        destination: selectedSchedule.destination,
        scheduledStartTime: selectedSchedule.scheduledStartTime.split('T')[0],
        scheduledEndTime: selectedSchedule.scheduledEndTime.split('T')[0],
        status: selectedSchedule.status
      } : initialScheduleData
    );

    useEffect(() => {
      if (selectedSchedule) {
        setFormData({
          bookingId: selectedSchedule.bookingId._id,
          busId: selectedSchedule.busId._id,
          driverId: selectedSchedule.driverId._id,
          startLocation: selectedSchedule.startLocation,
          destination: selectedSchedule.destination,
          scheduledStartTime: selectedSchedule.scheduledStartTime.slice(0, 16),
          scheduledEndTime: selectedSchedule.scheduledEndTime.slice(0, 16),
          status: selectedSchedule.status
        });
      }
    }, [selectedSchedule]);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }

      // Auto-validate time fields when both are filled
      if ((field === 'scheduledStartTime' && formData.scheduledEndTime) || 
          (field === 'scheduledEndTime' && formData.scheduledStartTime)) {
        const errors = validateDateTime(formData, true, selectedSchedule?._id);
        setValidationErrors(prev => ({ ...prev, ...errors }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const success = await handleUpdateSchedule(formData);
      if (success) {
        setShowEditModal(false);
        setSelectedSchedule(null);
        setValidationErrors({});
      }
    };

    const handleClose = () => {
      setShowEditModal(false);
      setSelectedSchedule(null);
      setValidationErrors({});
    };

    if (!selectedSchedule) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Edit Schedule</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Info Banner */}
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium">Schedule Validation Rules:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Cannot schedule in the past</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Booking *</label>
                <select
                  required
                  value={formData.bookingId}
                  onChange={(e) => handleInputChange('bookingId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.bookingId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">Select Booking</option>
                  {sampleData.bookings.map(booking => (
                    <option key={booking._id} value={booking._id}>
                      {booking.bookingId} - {booking.route} ({new Date(booking.travelDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {validationErrors.bookingId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.bookingId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Driver *</label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => handleInputChange('driverId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.driverId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">Select Driver</option>
                  {sampleData.drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName} ({driver.licenseNumber})
                    </option>
                  ))}
                </select>
                {validationErrors.driverId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.driverId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bus *</label>
                <select
                  required
                  value={formData.busId}
                  onChange={(e) => handleInputChange('busId', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.busId ? 'border-red-500' : 'border-slate-600'
                  }`}
                >
                  <option value="">Select Bus</option>
                  {sampleData.buses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busId} - {bus.numberPlate} ({bus.busType})
                    </option>
                  ))}
                </select>
                {validationErrors.busId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.busId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Location *</label>
                <input
                  type="text"
                  required
                  value={formData.startLocation}
                  onChange={(e) => handleInputChange('startLocation', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.startLocation ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="e.g., Colombo Fort"
                />
                {validationErrors.startLocation && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.startLocation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Destination *</label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.destination ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="e.g., Kandy City Center"
                />
                {validationErrors.destination && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.destination}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledStartTime}
                  onChange={(e) => handleInputChange('scheduledStartTime', e.target.value)}
                  min={getMinDateTime()}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.scheduledStartTime ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {validationErrors.scheduledStartTime && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.scheduledStartTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledEndTime}
                  onChange={(e) => handleInputChange('scheduledEndTime', e.target.value)}
                  min={getMinDateTime()}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.scheduledEndTime ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {validationErrors.scheduledEndTime && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.scheduledEndTime}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Export Report</h2>
          <button
            onClick={() => setShowExportModal(false)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-4 border rounded-lg text-center transition-all ${
                  exportFormat === 'excel'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span>Excel (CSV)</span>
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-4 border rounded-lg text-center transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-700/30 p-3 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong>Records to export:</strong> {filteredSchedules.length} schedules
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {exportFormat === 'excel' 
                ? 'Excel format includes all schedule details in a spreadsheet'
                : 'PDF format includes a formatted report with summary statistics'
              }
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeExport}
              disabled={exportLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Driver Schedule Management</h1>
          <p className="text-slate-400">Manage and monitor driver schedules and assignments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Schedules</p>
                <p className="text-2xl font-bold text-white mt-1">{schedules.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Drivers</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {new Set(schedules.map(s => s.driverId._id)).size}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <User className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Buses</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {new Set(schedules.map(s => s.busId._id)).size}
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Bus className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Today's Schedules</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {schedules.filter(s => {
                    const today = new Date().toISOString().split('T')[0];
                    const scheduleDate = new Date(s.scheduledStartTime).toISOString().split('T')[0];
                    return scheduleDate === today;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterDriver}
                  onChange={(e) => setFilterDriver(e.target.value)}
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Drivers</option>
                  {sampleData.drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No schedules found</h3>
              <p className="text-slate-500 mb-4">No schedules match your current filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDriver('all');
                  setFilterStatus('all');
                  setFilterDate('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredSchedules.map((schedule) => (
                <div key={schedule._id} className="p-6 hover:bg-slate-750/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <Bus className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {schedule.bookingId.route}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{schedule.driverId.firstName} {schedule.driverId.lastName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bus className="w-4 h-4 text-slate-400" />
                            <span>{schedule.busId.numberPlate} ({schedule.busId.busType})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{schedule.startLocation} → {schedule.destination}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                              <span>{new Date(schedule.scheduledStartTime).toLocaleDateString()} - {new Date(schedule.scheduledEndTime).toLocaleDateString()}</span>                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleExpand(schedule._id)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        {expandedSchedules[schedule._id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      <div className="relative">
                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 opacity-0 invisible transition-all duration-200 transform scale-95">
                          <div className="py-1">
                            <button
                              onClick={() => handleEditClick(schedule)}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit Schedule</span>
                            </button>
                            
                            {schedule.status !== 'Cancelled' && schedule.status !== 'Completed' && (
                              <button
                                onClick={() => handleCancelSchedule(schedule._id)}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel Schedule</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteSchedule(schedule._id)}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Schedule</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSchedules[schedule._id] && (
                    <div className="mt-4 pl-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Booking Details</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-white">ID: {schedule.bookingId.bookingId}</p>
                            <p className="text-slate-300">Passengers: {schedule.bookingId.passengers}</p>
                            <p className="text-slate-300">Travel Date: {new Date(schedule.bookingId.travelDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Driver Details</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-white">{schedule.driverId.firstName} {schedule.driverId.lastName}</p>
                            <p className="text-slate-300">License: {schedule.driverId.licenseNumber}</p>
                            <p className="text-slate-300">Contact: {schedule.driverId.contact}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Schedule Timeline</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-white">Created: {formatDateTime(schedule.createdAt)}</p>
                            <p className="text-slate-300">Last Updated: {formatDateTime(schedule.updatedAt)}</p>
                            {schedule.actualStartTime && (
                              <p className="text-slate-300">Actual Start: {formatDateTime(schedule.actualStartTime)}</p>
                            )}
                            {schedule.actualEndTime && (
                              <p className="text-slate-300">Actual End: {formatDateTime(schedule.actualEndTime)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateScheduleModal />}
      {showEditModal && <EditScheduleModal />}
      {showExportModal && <ExportModal />}
    </div>
  );
};

export default DriverScheduleManagement;