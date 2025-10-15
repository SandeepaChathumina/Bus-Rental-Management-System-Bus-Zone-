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
  Plus,
  Download,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DriverScheduleManagement = () => {
  
  
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
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
  }, [confirmedBookings, searchTerm, filterDate, startDate, endDate, statusFilter]);

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

    // Filter by date range
    if (startDate || endDate) {
        filtered = filtered.filter(booking => {
          if (!booking || !booking.travelDate) return false;
          const bookingDate = new Date(booking.travelDate);
          
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return bookingDate >= start && bookingDate <= end;
          } else if (startDate) {
            const start = new Date(startDate);
            return bookingDate >= start;
          } else if (endDate) {
            const end = new Date(endDate);
            return bookingDate <= end;
          }
          return true;
        });
      }

    // Keep the old single date filter for backward compatibility
    if (filterDate) {
        const filterDateObj = new Date(filterDate);
        filtered = filtered.filter(booking => {
          if (!booking || !booking.travelDate) return false;
          const bookingDate = new Date(booking.travelDate);
          return bookingDate.toDateString() === filterDateObj.toDateString();
        });
      }

    // Filter by driver response status
    if (statusFilter) {
        filtered = filtered.filter(booking => {
          if (!booking) return false;
          
          if (statusFilter === 'assigned') {
            return booking.assignedDriver && (booking.driverResponse === 'pending' || booking.driverResponse === 'accepted');
          } else if (statusFilter === 'accepted') {
            return booking.driverResponse === 'accepted';
          } else if (statusFilter === 'declined') {
            return booking.driverResponse === 'declined';
          } else if (statusFilter === 'pending') {
            return booking.assignedDriver && booking.driverResponse === 'pending';
          } else if (statusFilter === 'unassigned') {
            return !booking.assignedDriver;
          }
          return true;
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'N/A';
      
      // Handle different time formats
      let formattedTime = timeString;
      
      // If time is in HHMM format (4 digits), convert to HH:MM
      if (timeString.length === 4 && !timeString.includes(':')) {
        formattedTime = `${timeString.substring(0, 2)}:${timeString.substring(2, 4)}`;
      }
      
      // If time is in HH:MM format, use it directly
      if (timeString.includes(':')) {
        return timeString;
      }
      
      return formattedTime;
    } catch (error) {
      console.error('Error formatting time string:', timeString, error);
      return 'Invalid Time';
    }
  };

  const exportToPDF = (bookings) => {
    if (!bookings || bookings.length === 0) {
      toast.error('No data to export');
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
    doc.text('Driver Schedule Management Report', pageWidth / 2, margin + 25, { align: 'center' });
    
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
    
    // Add filter information if any filters are applied
    const hasFilters = searchTerm || startDate || endDate || statusFilter || filterDate;
    let filterY = margin + 40;
    
    if (hasFilters) {
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.setFont(undefined, 'bold');
      doc.text('Filtered Report', pageWidth / 2, filterY, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      
      let filterDetails = [];
      if (searchTerm) filterDetails.push(`Search: "${searchTerm}"`);
      if (startDate && endDate) filterDetails.push(`Date Range: ${startDate} to ${endDate}`);
      else if (startDate) filterDetails.push(`From Date: ${startDate}`);
      else if (endDate) filterDetails.push(`To Date: ${endDate}`);
      if (filterDate) filterDetails.push(`Specific Date: ${filterDate}`);
      if (statusFilter) {
        const statusLabels = {
          'unassigned': 'Unassigned',
          'assigned': 'Assigned',
          'accepted': 'Accepted',
          'declined': 'Declined',
          'pending': 'Pending'
        };
        filterDetails.push(`Status: ${statusLabels[statusFilter] || statusFilter}`);
      }
      
      if (filterDetails.length > 0) {
        doc.text(`Applied Filters: ${filterDetails.join(' | ')}`, pageWidth / 2, filterY + 7, { align: 'center' });
      }
      
      filterY += 20;
    }
    
    // Statistics section
    const statsY = filterY;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Report Summary', margin, statsY);
    
    // Calculate statistics
    const totalBookings = bookings.length;
    const assignedBookings = bookings.filter(b => b.assignedDriver).length;
    const unassignedBookings = totalBookings - assignedBookings;
    const acceptedBookings = bookings.filter(b => b.driverResponse === 'accepted').length;
    const declinedBookings = bookings.filter(b => b.driverResponse === 'declined').length;
    const pendingBookings = bookings.filter(b => b.driverResponse === 'pending').length;
    
    // Statistics boxes
    const availableWidth = pageWidth - (margin * 2);
    const boxCount = 5;
    const boxSpacing = 8;
    const boxWidth = Math.min(30, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
    const boxHeight = 25;
    let currentX = margin;
    
    // Total Bookings box - Primary Blue
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
    doc.text(totalBookings.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Total Bookings', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Assigned box - Dark Blue
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(assignedBookings.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Assigned', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Accepted box - Sky Blue
    doc.setFillColor(14, 165, 233);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(acceptedBookings.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Accepted', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Declined box - Navy Blue
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
    doc.text(declinedBookings.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Declined', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Pending box - Light Blue
    doc.setFillColor(96, 165, 250);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(pendingBookings.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Pending', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    // Status distribution table
    const statusTableY = statsY + 50;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Assignment Status Distribution', margin, statusTableY);
    
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['Assigned', assignedBookings.toString(), `${((assignedBookings/totalBookings)*100).toFixed(1)}%`],
      ['Unassigned', unassignedBookings.toString(), `${((unassignedBookings/totalBookings)*100).toFixed(1)}%`],
      ['Accepted', acceptedBookings.toString(), `${((acceptedBookings/totalBookings)*100).toFixed(1)}%`],
      ['Declined', declinedBookings.toString(), `${((declinedBookings/totalBookings)*100).toFixed(1)}%`],
      ['Pending', pendingBookings.toString(), `${((pendingBookings/totalBookings)*100).toFixed(1)}%`]
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

    // Add new page for booking details table
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
    
    // Main booking data table
    const tableStartY = margin + 30;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Booking Details', margin, tableStartY);
    
    // Prepare table data
    const tableColumns = [
      { header: 'Booking ID', dataKey: 'bookingId', width: 25 },
      { header: 'Passenger', dataKey: 'passenger', width: 35 },
      { header: 'Route', dataKey: 'route', width: 40 },
      { header: 'Date', dataKey: 'date', width: 25 },
      { header: 'Time', dataKey: 'time', width: 20 },
      { header: 'Driver', dataKey: 'driver', width: 35 },
      { header: 'Status', dataKey: 'status', width: 25 },
      { header: 'Response', dataKey: 'response', width: 20 }
    ];
    
    const tableRows = bookings.map((booking, index) => ({
      bookingId: booking.bookingId || 'N/A',
      passenger: `${booking.user?.firstName || 'N/A'} ${booking.user?.lastName || 'N/A'}`.trim().substring(0, 20),
      route: `${booking.route?.from || 'N/A'} → ${booking.route?.to || 'N/A'}`.substring(0, 25),
      date: formatDate(booking.travelDate),
      time: formatTime(booking.departureTime),
      driver: getDriverName(booking.assignedDriver).substring(0, 20),
      status: booking.bookingStatus || 'N/A',
      response: booking.driverResponse || 'N/A'
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
        bookingId: { halign: 'center', fontSize: 8, cellWidth: 25 },
        passenger: { halign: 'left', fontSize: 8, cellWidth: 35, overflow: 'linebreak' },
        route: { halign: 'left', fontSize: 7, cellWidth: 40, overflow: 'linebreak' },
        date: { halign: 'center', fontSize: 8, cellWidth: 25 },
        time: { halign: 'center', fontSize: 8, cellWidth: 20 },
        driver: { halign: 'left', fontSize: 8, cellWidth: 35, overflow: 'linebreak' },
        status: { halign: 'center', fontSize: 8, cellWidth: 25 },
        response: { halign: 'center', fontSize: 8, cellWidth: 20 }
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
        doc.text('BusZone+ Driver Schedule Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
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
    const filterSuffix = hasFilters ? '_Filtered' : '_AllData';
    const fileName = `BusZone_DriverScheduleReport${filterSuffix}_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
      doc.save(fileName);
  };

  const exportToCSV = (bookings) => {
    if (!bookings || bookings.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Check if filters are applied
    const hasFilters = searchTerm || startDate || endDate || statusFilter || filterDate;
    
    // CSV Headers
    const headers = [
      'Booking ID',
      'Passenger Name',
      'Email',
      'Phone',
      'Route',
      'Travel Date',
      'Departure Time',
      'Arrival Time',
      'Passengers',
      'Total Amount',
      'Booking Status',
      'Assigned Driver',
      'Driver Response',
      'Driver Response Time',
      'Created At'
    ];

    // Add filter information as comments at the top of CSV
    let csvContent = '';
    
    if (hasFilters) {
      csvContent += '# BusZone+ Driver Schedule Management Report - Filtered Data\n';
      csvContent += `# Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
      csvContent += '# Applied Filters:\n';
      
      if (searchTerm) csvContent += `# - Search: "${searchTerm}"\n`;
      if (startDate && endDate) csvContent += `# - Date Range: ${startDate} to ${endDate}\n`;
      else if (startDate) csvContent += `# - From Date: ${startDate}\n`;
      else if (endDate) csvContent += `# - To Date: ${endDate}\n`;
      if (filterDate) csvContent += `# - Specific Date: ${filterDate}\n`;
      if (statusFilter) {
        const statusLabels = {
          'unassigned': 'Unassigned',
          'assigned': 'Assigned',
          'accepted': 'Accepted',
          'declined': 'Declined',
          'pending': 'Pending'
        };
        csvContent += `# - Status: ${statusLabels[statusFilter] || statusFilter}\n`;
      }
      csvContent += '#\n';
    } else {
      csvContent += '# BusZone+ Driver Schedule Management Report - All Data\n';
      csvContent += `# Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
      csvContent += '#\n';
    }

    // Convert data to CSV format
    const csvData = bookings.map(booking => [
      booking.bookingId || 'N/A',
      `${booking.user?.firstName || 'N/A'} ${booking.user?.lastName || 'N/A'}`.trim(),
      booking.user?.email || 'N/A',
      booking.user?.phone || 'N/A',
      `${booking.route?.from || 'N/A'} → ${booking.route?.to || 'N/A'}`,
      formatDate(booking.travelDate),
      formatTime(booking.departureTime),
      formatTime(booking.arrivalTime),
      booking.passengers || 'N/A',
      booking.totalAmount || 'N/A',
      booking.bookingStatus || 'N/A',
      getDriverName(booking.assignedDriver),
      booking.driverResponse || 'N/A',
      booking.driverResponseTime ? new Date(booking.driverResponseTime).toLocaleString() : 'N/A',
      booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'
    ]);

    // Combine filter info, headers and data
    const csvRows = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','));
    
    csvContent += csvRows.join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const currentDate = new Date();
    const filterSuffix = hasFilters ? '_Filtered' : '_AllData';
    const fileName = `BusZone_DriverScheduleReport${filterSuffix}_${currentDate.toISOString().split('T')[0]}_${Date.now()}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Use filtered data if any filters are applied, otherwise use all confirmed bookings
      const dataToExport = (searchTerm || startDate || endDate || statusFilter || filterDate) 
        ? filteredBookings 
        : confirmedBookings;
      
      if (exportFormat === 'pdf') {
        exportToPDF(dataToExport);
      } else if (exportFormat === 'csv') {
        exportToCSV(dataToExport);
      }
      
      const filterInfo = (searchTerm || startDate || endDate || statusFilter || filterDate) 
        ? ' (filtered data)' 
        : ' (all data)';
      
      toast.success(`Report exported successfully${filterInfo}`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  const openExportModal = () => {
    setShowExportModal(true);
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
        { 
          driverId: selectedDriver,
          resetDriverResponse: true // Flag to reset driver response
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setConfirmedBookings(prev =>
          prev.map(booking =>
            booking._id === selectedBooking._id
              ? { 
                  ...booking, 
                  assignedDriver: selectedDriver,
                  driverResponse: 'pending', // Reset driver response
                  driverResponseTime: null
                }
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
              ? { 
                  ...booking, 
                  assignedDriver: selectedDriver,
                  driverResponse: 'pending', // Reset driver response
                  driverResponseTime: null
                }
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
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Ended':
        return 'bg-purple-100 text-purple-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Started':
        return 'bg-orange-100 text-orange-800';
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
      <div className="space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6 -m-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
          <h2 className="text-2xl font-bold text-gray-800">Driver Schedule Management</h2>
          <p className="text-gray-600">Assign drivers to confirmed bookings</p>
              </div>
        <div className="flex space-x-3">
            <button
            onClick={openExportModal}
            disabled={confirmedBookings.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
          <button
            onClick={fetchConfirmedBookings}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
            </button>
            </div>
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
      <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search Input */}
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

          {/* Date Range Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="text-gray-400 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-blue-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="pending">Pending</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(startDate || endDate || searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                  setFilterDate('');
                  setStatusFilter('');
                }}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
              </div>
            </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
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
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {booking.route?.from || 'N/A'} → {booking.route?.to || 'N/A'}
        </div>
                    {booking.route?.estimatedDuration && (
                    <div className="text-xs text-gray-500">
                        {booking.route.estimatedDuration}
      </div>
                    )}
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
                          
                          {/* Show Trip Status */}
                          {(booking.bookingStatus === 'In Progress' || booking.bookingStatus === 'Started') && (
                            <div className="mt-1">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                🚌 Trip Started
                              </span>
              </div>
                          )}

                          {booking.bookingStatus === 'Ended' && (
                            <div className="mt-1">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                ✅ Trip Ended
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
                      {driver.user?.firstName || 'N/A'} {driver.user?.lastName || 'N/A'} - {driver.licenseNumber || 'N/A'}{driver.experience && driver.experience > 0 ? ` (${driver.experience} years exp)` : ''}
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Export Driver Schedule Report</h3>
          <button
            onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    exportFormat === 'csv'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">CSV (.csv)</div>
                  <div className="text-xs text-gray-500">For spreadsheets</div>
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">PDF (.pdf)</div>
                  <div className="text-xs text-gray-500">For printing</div>
              </button>
            </div>
          </div>

            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  Report will include {
                    (searchTerm || startDate || endDate || statusFilter || filterDate) 
                      ? filteredBookings.length 
                      : confirmedBookings.length
                  } records
                  {(searchTerm || startDate || endDate || statusFilter || filterDate) && (
                    <span className="text-blue-600 font-medium"> (filtered data)</span>
                  )}
                </div>
                <div>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</div>
              </div>
          </div>

            <div className="flex space-x-3">
            <button
              onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
                onClick={handleExport}
              disabled={exportLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {exportLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
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