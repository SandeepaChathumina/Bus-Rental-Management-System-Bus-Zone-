import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Download,
  Save,
  X,
  Wrench,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Bus,
  Calendar,
  DollarSign,
  BarChart3,
  ChevronDown,
  MoreVertical,
  FileText,
  TrendingUp,
  PieChart
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MaintenanceManagement = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [staffUsers, setStaffUsers] = useState([]);
  const [activeBuses, setActiveBuses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: [],
    byPriority: [],
    summary: { pending: 0, inProgress: 0, completed: 0 }
  });
  const [costStats, setCostStats] = useState({
    overall: { totalSpent: 0, averageCost: 0, totalRequests: 0, minCost: 0, maxCost: 0 },
    monthly: [],
    byPriority: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    user: '',
    bus: '',
    description: '',
    priority: 'Medium',
    estimatedCost: '',
    estimatedCompletionDate: '',
    status: 'Pending',
    actualCost: '',
    actualCompletionDate: ''
  });

  useEffect(() => {
    fetchMaintenances();
    fetchStaffUsers();
    fetchActiveBuses();
    fetchStats();
    fetchCostStats();
  }, []);

  useEffect(() => {
    filterMaintenances();
  }, [maintenances, searchTerm, filterStatus, filterPriority]);

  // Get today's date in YYYY-MM-DD format for date validation
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get tomorrow's date for minimum completion date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.user) newErrors.user = 'Staff member is required';
    if (!formData.bus) newErrors.bus = 'Bus selection is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'Valid estimated cost is required';
    }

    // Date validation
    if (formData.estimatedCompletionDate) {
      const estDate = new Date(formData.estimatedCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (estDate < today) {
        newErrors.estimatedCompletionDate = 'Estimated completion date cannot be in the past';
      }
    }

    // Actual completion date validation (only for completed status)
    if (formData.status === 'Completed') {
      if (!formData.actualCompletionDate) {
        newErrors.actualCompletionDate = 'Actual completion date is required for completed requests';
      } else {
        const actualDate = new Date(formData.actualCompletionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (actualDate > today) {
          newErrors.actualCompletionDate = 'Actual completion date cannot be in the future';
        }
      }

      if (!formData.actualCost || parseFloat(formData.actualCost) <= 0) {
        newErrors.actualCost = 'Valid actual cost is required for completed requests';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchMaintenances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenances(response.data.maintenances || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch maintenance requests', error);
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/staff-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch staff users', error);
    }
  };

  const fetchActiveBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/active-buses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveBuses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch active buses', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance stats', error);
    }
  };

  const fetchCostStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/cost-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCostStats(response.data);
    } catch (error) {
      console.error('Failed to fetch cost stats', error);
    }
  };

  const filterMaintenances = () => {
    let filtered = maintenances;

    if (searchTerm) {
      filtered = filtered.filter(maintenance =>
        maintenance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (maintenance.user && (
          maintenance.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (maintenance.bus && (
          maintenance.bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.bus.busType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          maintenance.bus._id.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.priority === filterPriority);
    }

    setFilteredMaintenances(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        userId: formData.user,
        busId: formData.bus,
        estimatedCost: parseFloat(formData.estimatedCost),
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined
      };

      if (editingMaintenance) {
        await axios.put(`${BACKEND_URL}/api/maintenance/${editingMaintenance._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/maintenance`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      setEditingMaintenance(null);
      setFormData({
        user: '',
        bus: '',
        description: '',
        priority: 'Medium',
        estimatedCost: '',
        estimatedCompletionDate: '',
        status: 'Pending',
        actualCost: '',
        actualCompletionDate: ''
      });
      setErrors({});
      fetchMaintenances();
      fetchStats();
      fetchCostStats();
    } catch (error) {
      console.error('Failed to save maintenance request', error);
    }
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      user: maintenance.user._id,
      bus: maintenance.bus._id,
      description: maintenance.description,
      priority: maintenance.priority,
      estimatedCost: maintenance.estimatedCost,
      estimatedCompletionDate: maintenance.estimatedCompletionDate ? new Date(maintenance.estimatedCompletionDate).toISOString().split('T')[0] : '',
      status: maintenance.status,
      actualCost: maintenance.actualCost || '',
      actualCompletionDate: maintenance.actualCompletionDate ? new Date(maintenance.actualCompletionDate).toISOString().split('T')[0] : ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMaintenances();
      fetchStats();
      fetchCostStats();
    } catch (error) {
      console.error('Failed to delete maintenance request', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Additional validation for status changes
    if (name === 'status' && value !== 'Completed') {
      setErrors(prev => ({
        ...prev,
        actualCost: '',
        actualCompletionDate: ''
      }));
    }
  };

  // Improved number input handler with better cursor behavior
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    const finalValue = decimalCount > 1 ? 
      sanitizedValue.substring(0, sanitizedValue.lastIndexOf('.')) : 
      sanitizedValue;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-900/30 text-green-400';
      case 'In Progress':
        return 'bg-blue-900/30 text-blue-400';
      case 'Pending':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'Cancelled':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-900/30 text-red-400';
      case 'High':
        return 'bg-orange-900/30 text-orange-400';
      case 'Medium':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'Low':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Export to PDF function - matching user management theme
  const exportToPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table layout
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Add BusZone+ Header (matching user management theme)
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
      doc.text('Maintenance Management Report', pageWidth / 2, margin + 25, { align: 'center' });
      
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
      const totalMaintenances = maintenances.length;
      const pendingMaintenances = maintenances.filter(m => m.status === 'Pending').length;
      const inProgressMaintenances = maintenances.filter(m => m.status === 'In Progress').length;
      const completedMaintenances = maintenances.filter(m => m.status === 'Completed').length;
      const cancelledMaintenances = maintenances.filter(m => m.status === 'Cancelled').length;
      const totalCost = maintenances.reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0);
      
      // Statistics boxes - matching user management theme
      const availableWidth = pageWidth - (margin * 2);
      const boxCount = 5;
      const boxSpacing = 6;
      const boxWidth = Math.min(30, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
      const boxHeight = 25;
      let currentX = margin;
      
      // Total Maintenances box - Blue theme with white text
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(totalMaintenances.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Total Requests', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // Pending box - Blue theme with white text
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(pendingMaintenances.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Pending', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // In Progress box - Blue theme with white text
      doc.setFillColor(29, 78, 216);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(inProgressMaintenances.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('In Progress', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // Completed box - Blue theme with white text
      doc.setFillColor(30, 64, 175);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(completedMaintenances.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Completed', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // Total Cost box - Blue theme with white text
      doc.setFillColor(14, 165, 233);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`LKR ${totalCost.toLocaleString()}`, currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Total Cost', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      // Status distribution table
      const statusTableY = statsY + 50;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Status Distribution', margin, statusTableY);
      
      const statusData = [
        ['Status', 'Count', 'Percentage'],
        ['Pending', pendingMaintenances.toString(), `${((pendingMaintenances/totalMaintenances)*100).toFixed(1)}%`],
        ['In Progress', inProgressMaintenances.toString(), `${((inProgressMaintenances/totalMaintenances)*100).toFixed(1)}%`],
        ['Completed', completedMaintenances.toString(), `${((completedMaintenances/totalMaintenances)*100).toFixed(1)}%`],
        ['Cancelled', cancelledMaintenances.toString(), `${((cancelledMaintenances/totalMaintenances)*100).toFixed(1)}%`]
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

      // Add new page for maintenance details table
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
      
      // Main maintenance data table
      const tableStartY = margin + 30;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Maintenance Details', margin, tableStartY);
      
      // Prepare table data
      const tableColumns = [
        { header: 'Bus Details', dataKey: 'busDetails', width: 40 },
        { header: 'Description', dataKey: 'description', width: 50 },
        { header: 'Staff', dataKey: 'staff', width: 35 },
        { header: 'Priority', dataKey: 'priority', width: 20 },
        { header: 'Status', dataKey: 'status', width: 25 },
        { header: 'Cost', dataKey: 'cost', width: 25 },
        { header: 'Dates', dataKey: 'dates', width: 30 }
      ];
      
      const tableRows = filteredMaintenances.map((maintenance) => ({
        busDetails: `${maintenance.bus?.numberPlate || 'N/A'}\n${maintenance.bus?.busType || 'N/A'}`,
        description: maintenance.description?.substring(0, 40) + (maintenance.description?.length > 40 ? '...' : ''),
        staff: `${maintenance.user?.firstName || ''} ${maintenance.user?.lastName || ''}`.trim() || 'N/A',
        priority: maintenance.priority || 'N/A',
        status: maintenance.status || 'N/A',
        cost: `LKR ${(maintenance.actualCost || maintenance.estimatedCost || 0).toLocaleString()}`,
        dates: `Est: ${formatDate(maintenance.estimatedCompletionDate)}\nAct: ${formatDate(maintenance.actualCompletionDate)}`
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
          busDetails: { halign: 'left', fontSize: 7, cellWidth: 40, overflow: 'linebreak' },
          description: { halign: 'left', fontSize: 7, cellWidth: 50, overflow: 'linebreak' },
          staff: { halign: 'left', fontSize: 8, cellWidth: 35, overflow: 'linebreak' },
          priority: { halign: 'center', fontSize: 8, cellWidth: 20 },
          status: { halign: 'center', fontSize: 8, cellWidth: 25 },
          cost: { halign: 'right', fontSize: 8, cellWidth: 25 },
          dates: { halign: 'left', fontSize: 7, cellWidth: 30, overflow: 'linebreak' }
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
          doc.text('BusZone+ Maintenance Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
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
      const fileName = `BusZone_MaintenanceReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ['Bus Number', 'Bus Type', 'Description', 'Staff', 'Priority', 'Status', 'Estimated Cost', 'Actual Cost', 'Estimated Date', 'Actual Date'];
      const csvContent = [
        headers.join(','),
        ...filteredMaintenances.map(maintenance => [
          maintenance.bus?.numberPlate || 'N/A',
          maintenance.bus?.busType || 'N/A',
          `"${maintenance.description.replace(/"/g, '""')}"`,
          `"${maintenance.user?.firstName} ${maintenance.user?.lastName}"`,
          maintenance.priority,
          maintenance.status,
          maintenance.estimatedCost,
          maintenance.actualCost || 'N/A',
          maintenance.estimatedCompletionDate ? formatDate(maintenance.estimatedCompletionDate) : 'N/A',
          maintenance.actualCompletionDate ? formatDate(maintenance.actualCompletionDate) : 'N/A'
        ].join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `maintenance-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading maintenance requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
    <div className="space-y-6">
        {/* Header - matching user management theme */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Maintenance Management</h1>
            <p className="text-gray-600">Manage and track bus maintenance requests</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

        {/* Tabs - matching user management theme */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-lg">
          <div className="border-b border-blue-200">
            <nav className="flex space-x-8 px-6">
          {['overview', 'list', 'statistics', 'cost-analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
          </div>
      </div>

        {/* Overview Tab - matching user management theme */}
      {activeTab === 'overview' && (
          <div className="space-y-6">
          {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <h3 className="text-2xl text-gray-800 font-bold">{stats.total}</h3>
            </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Wrench className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">All maintenance requests</p>
          </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <h3 className="text-2xl text-yellow-600 font-bold">{stats.summary.pending}</h3>
            </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">Awaiting action</p>
          </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <h3 className="text-2xl text-blue-600 font-bold">{stats.summary.inProgress}</h3>
            </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">Currently being worked on</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <h3 className="text-2xl text-green-600 font-bold">
              {formatCurrency(costStats.overall.totalSpent)}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">Overall maintenance costs</p>
              </div>
          </div>

            {/* Recent Activities and Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Maintenance Requests</h3>
            <div className="space-y-3">
              {maintenances.slice(0, 5).map((maintenance) => (
                    <div key={maintenance._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(maintenance.status)}
                    <div>
                          <p className="text-gray-800 font-medium">{maintenance.description}</p>
                          <p className="text-gray-600 text-sm">
                        Bus: {maintenance.bus?.numberPlate} (ID: {maintenance.bus?._id.substring(0, 8)}...)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                        <p className="text-gray-800 font-medium">{formatCurrency(maintenance.estimatedCost)}</p>
                        <p className="text-gray-500 text-sm">{formatDate(maintenance.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {stats.byStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status._id === 'Completed' ? 'bg-green-400' :
                          status._id === 'In Progress' ? 'bg-blue-400' :
                          status._id === 'Pending' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-gray-700">{status._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-medium">{status.count}</span>
                        <span className="text-gray-500 text-sm">
                          ({((status.count / stats.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                </div>
              ))}
                </div>
            </div>
          </div>
        </div>
      )}

        {/* List View Tab - matching user management theme */}
      {activeTab === 'list' && (
          <div className="space-y-6">
          {/* Filters */}
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by description, staff, bus, or bus ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
                </div>
            </div>
          </div>

          {/* Table */}
            <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-blue-100">
                  {filteredMaintenances.map((maintenance) => (
                      <tr key={maintenance._id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <Bus className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                              <div className="text-gray-800 font-medium">{maintenance.bus?.numberPlate}</div>
                              <div className="text-gray-500 text-sm">ID: {maintenance.bus?._id.substring(0, 8)}...</div>
                              <div className="text-gray-500 text-sm">{maintenance.bus?.busType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-gray-700 max-w-xs truncate">{maintenance.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                              <div className="text-gray-800">
                              {maintenance.user?.firstName} {maintenance.user?.lastName}
                            </div>
                              <div className="text-gray-500 text-sm">
                              {maintenance.user?.staffProfile?.employeeId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            maintenance.priority === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                            maintenance.priority === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            maintenance.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                          {maintenance.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(maintenance.status)}
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              maintenance.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                              maintenance.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              maintenance.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {maintenance.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-800 font-medium">{formatCurrency(maintenance.estimatedCost)}</div>
                        {maintenance.actualCost && (
                            <div className="text-gray-500 text-sm">Actual: {formatCurrency(maintenance.actualCost)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600 text-sm">
                          <div>Est: {formatDate(maintenance.estimatedCompletionDate)}</div>
                          {maintenance.actualCompletionDate && (
                            <div>Actual: {formatDate(maintenance.actualCompletionDate)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(maintenance)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                              title="Edit Maintenance"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* Statistics Tab - matching user management theme */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <h3 className="text-2xl text-gray-800 font-bold">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Wrench className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <h3 className="text-2xl text-yellow-600 font-bold">{stats.summary.pending}</h3>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <h3 className="text-2xl text-blue-600 font-bold">{stats.summary.inProgress}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <h3 className="text-2xl text-green-600 font-bold">{stats.summary.completed}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Chart */}
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Status Distribution</h3>
                <div className="space-y-3">
                  {stats.byStatus.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status._id === 'Completed' ? 'bg-green-400' :
                          status._id === 'In Progress' ? 'bg-blue-400' :
                          status._id === 'Pending' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-gray-700">{status._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-medium">{status.count}</span>
                        <span className="text-gray-500 text-sm">
                          ({((status.count / stats.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Distribution Chart */}
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Priority Distribution</h3>
                <div className="space-y-3">
                  {stats.byPriority.map((priority) => (
                    <div key={priority._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          priority._id === 'Critical' ? 'bg-red-400' :
                          priority._id === 'High' ? 'bg-orange-400' :
                          priority._id === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <span className="text-gray-700">{priority._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-medium">{priority.count}</span>
                        <span className="text-gray-500 text-sm">
                          ({((priority.count / stats.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Maintenance Activity</h3>
              <div className="space-y-3">
                {maintenances.slice(0, 10).map((maintenance) => (
                  <div key={maintenance._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(maintenance.status)}
                      <div>
                        <p className="text-gray-800 font-medium">{maintenance.description}</p>
                        <p className="text-gray-600 text-sm">
                          Bus: {maintenance.bus?.numberPlate} • {maintenance.priority} Priority
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 font-medium">{formatCurrency(maintenance.estimatedCost)}</p>
                      <p className="text-gray-500 text-sm">{formatDate(maintenance.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cost Analysis Tab - matching user management theme */}
        {activeTab === 'cost-analysis' && (
          <div className="space-y-6">
            {/* Cost Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <h3 className="text-2xl text-green-600 font-bold">
                      {formatCurrency(costStats.overall.totalSpent)}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Cost</p>
                    <h3 className="text-2xl text-blue-600 font-bold">
                      {formatCurrency(costStats.overall.averageCost)}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <h3 className="text-2xl text-gray-800 font-bold">{costStats.overall.totalRequests}</h3>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cost Range</p>
                    <h3 className="text-lg text-orange-600 font-bold">
                      {formatCurrency(costStats.overall.minCost)} - {formatCurrency(costStats.overall.maxCost)}
                    </h3>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <PieChart className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Cost Analysis</h3>
                <div className="space-y-3">
                  {costStats.monthly.slice(0, 6).map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-medium">{formatCurrency(month.totalCost)}</span>
                        <span className="text-gray-500 text-sm">({month.count} requests)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Cost by Priority</h3>
                <div className="space-y-3">
                  {costStats.byPriority.map((priority) => (
                    <div key={priority._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          priority._id === 'Critical' ? 'bg-red-400' :
                          priority._id === 'High' ? 'bg-orange-400' :
                          priority._id === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <span className="text-gray-700">{priority._id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-medium">{formatCurrency(priority.totalCost)}</span>
                        <span className="text-gray-500 text-sm">({priority.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost Trends */}
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Cost Trends & Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="text-gray-800 font-medium mb-2">Most Expensive Month</h4>
                  <p className="text-gray-600 text-sm">
                    {costStats.monthly.length > 0 ? 
                      `${costStats.monthly.reduce((max, month) => month.totalCost > max.totalCost ? month : max).month}: ${formatCurrency(costStats.monthly.reduce((max, month) => month.totalCost > max.totalCost ? month : max).totalCost)}` 
                      : 'No data available'
                    }
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="text-gray-800 font-medium mb-2">Average per Request</h4>
                  <p className="text-gray-600 text-sm">
                    {formatCurrency(costStats.overall.averageCost)} per maintenance request
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="text-gray-800 font-medium mb-2">Cost Efficiency</h4>
                  <p className="text-gray-600 text-sm">
                    {costStats.overall.totalRequests > 0 ? 
                      `${((costStats.overall.completedRequests || 0) / costStats.overall.totalRequests * 100).toFixed(1)}% completion rate` 
                      : 'No data available'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Maintenance Modal - matching user management theme */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pt-12">
            <div className="absolute inset-0 bg-black/50" onClick={() => {
              setShowModal(false);
              setEditingMaintenance(null);
              setErrors({});
            }}></div>
            <div className="relative bg-white border border-blue-200 rounded-xl p-6 z-60 w-full max-w-4xl shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingMaintenance ? 'Edit Maintenance Request' : 'Create Maintenance Request'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingMaintenance(null);
                    setFormData({
                      user: '',
                      bus: '',
                      description: '',
                      priority: 'Medium',
                      estimatedCost: '',
                      estimatedCompletionDate: '',
                      status: 'Pending',
                      actualCost: '',
                      actualCompletionDate: ''
                    });
                    setErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Staff Member *</label>
                    <select
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.user ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={editingMaintenance}
                    >
                      <option value="">Select Staff Member</option>
                      {staffUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.staffProfile?.employeeId || 'N/A'})
                        </option>
                      ))}
                    </select>
                    {errors.user && <p className="text-red-500 text-xs mt-1">{errors.user}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bus *</label>
                    <select
                      name="bus"
                      value={formData.bus}
                      onChange={handleInputChange}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.bus ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={editingMaintenance}
                    >
                      <option value="">Select Bus</option>
                      {activeBuses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.numberPlate} (ID: {bus._id.substring(0, 8)}...) - {bus.busType}
                        </option>
                      ))}
                    </select>
                    {errors.bus && <p className="text-red-500 text-xs mt-1">{errors.bus}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe the maintenance issue..."
                    rows={3}
                    required
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (LKR) *</label>
                    <input
                      type="text"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleNumberInput}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.estimatedCost ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      required
                    />
                    {errors.estimatedCost && <p className="text-red-500 text-xs mt-1">{errors.estimatedCost}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion Date</label>
                    <input
                      type="date"
                      name="estimatedCompletionDate"
                      value={formData.estimatedCompletionDate}
                      onChange={handleInputChange}
                      min={getTomorrowDate()}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.estimatedCompletionDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.estimatedCompletionDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.estimatedCompletionDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {formData.status === 'Completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost (LKR) *</label>
                      <input
                        type="text"
                        name="actualCost"
                        value={formData.actualCost}
                        onChange={handleNumberInput}
                        className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.actualCost ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.actualCost && <p className="text-red-500 text-xs mt-1">{errors.actualCost}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actual Completion Date *</label>
                      <input
                        type="date"
                        name="actualCompletionDate"
                        value={formData.actualCompletionDate}
                        onChange={handleInputChange}
                        max={getTodayDate()}
                        className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.actualCompletionDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.actualCompletionDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.actualCompletionDate}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMaintenance(null);
                      setFormData({
                        user: '',
                        bus: '',
                        description: '',
                        priority: 'Medium',
                        estimatedCost: '',
                        estimatedCompletionDate: '',
                        status: 'Pending',
                        actualCost: '',
                        actualCompletionDate: ''
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center shadow-md transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingMaintenance ? 'Update' : 'Create'} Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceManagement;