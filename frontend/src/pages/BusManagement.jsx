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
  Bus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Clock,
  FileText,
  Calendar,
  Upload,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel'); // 'excel', 'pdf'
  const [showExportModal, setShowExportModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    busType: 'Standard',
    engineNumber: '',
    capacity: '',
    numberPlate: '',
    pricePerDay: '',
    vehiclePhoto: '',
    status: 'Available'
  });

  const [formErrors, setFormErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    filterBuses();
  }, [buses, searchTerm, filterStatus]);

  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/buses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuses(response.data.buses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch buses', error);
      toast.error('Failed to fetch buses');
      setLoading(false);
    }
  };

  const filterBuses = () => {
    let filtered = buses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bus =>
        bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.engineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.busType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bus => bus.status === filterStatus);
    }

    setFilteredBuses(filtered);
  };

  const validateForm = () => {
    const errors = {};

    // Engine Number validation (only for new buses)
    if (!editingBus) {
      if (!formData.engineNumber.trim()) {
        errors.engineNumber = 'Engine number is required';
      } else if (!/^[A-Z0-9]{5,20}$/i.test(formData.engineNumber)) {
        errors.engineNumber = 'Engine number must be 5-20 alphanumeric characters';
      }
    }

    // Number Plate validation (only for new buses)
    if (!editingBus) {
      if (!formData.numberPlate.trim()) {
        errors.numberPlate = 'Number plate is required';
      } else if (!/^[A-Z0-9\s-]{3,15}$/i.test(formData.numberPlate)) {
        errors.numberPlate = 'Number plate must be 3-15 alphanumeric characters with spaces or hyphens';
      }
    }

    // Capacity validation
    if (!formData.capacity) {
      errors.capacity = 'Capacity is required';
    } else if (formData.capacity < 10 || formData.capacity > 100) {
      errors.capacity = 'Capacity must be between 10 and 100 seats';
    }

    // Price validation
    if (!formData.pricePerDay) {
      errors.pricePerDay = 'Price per day is required';
    } else if (formData.pricePerDay < 0) {
      errors.pricePerDay = 'Price cannot be negative';
    } else if (formData.pricePerDay > 10000) {
      errors.pricePerDay = 'Price cannot exceed $10,000 per day';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data according to backend expectations
      const submitData = {
        busType: formData.busType,
        engineNumber: formData.engineNumber,
        capacity: parseInt(formData.capacity),
        numberPlate: formData.numberPlate,
        pricePerDay: parseFloat(formData.pricePerDay) || 0,
        vehiclePhoto: formData.vehiclePhoto || '',
        status: formData.status
      };
      
      if (editingBus) {
        // For editing, don't allow changing engine number and number plate
        submitData.engineNumber = editingBus.engineNumber;
        submitData.numberPlate = editingBus.numberPlate;
        
        await axios.put(`${BACKEND_URL}/api/buses/${editingBus._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Bus updated successfully');
      } else {
        // Create new bus
        await axios.post(`${BACKEND_URL}/api/buses`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Bus created successfully');
      }
      
      setShowModal(false);
      setEditingBus(null);
      setFormData({
        busType: 'Standard',
        engineNumber: '',
        capacity: '',
        numberPlate: '',
        pricePerDay: '',
        vehiclePhoto: '',
        status: 'Available'
      });
      setPreviewImage('');
      setFormErrors({});
      fetchBuses();
    } catch (error) {
      console.error('Failed to save bus', error);
      toast.error(error.response?.data?.message || 'Failed to save bus');
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busType: bus.busType,
      engineNumber: bus.engineNumber,
      capacity: bus.capacity.toString(),
      numberPlate: bus.numberPlate,
      pricePerDay: bus.pricePerDay.toString(),
      vehiclePhoto: bus.vehiclePhoto || '',
      status: bus.status
    });
    setPreviewImage(bus.vehiclePhoto || '');
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  // Simulate image upload and get URL
  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      // In a real application, you would upload the file to a server
      // and get back a URL. For now, we'll create a local URL for preview
      // and simulate an upload process.
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setPreviewImage(imageUrl);
        
        // In a real app, you would upload to your server and get a permanent URL
        // For demo purposes, we'll use the data URL (not recommended for production)
        setFormData(prev => ({
          ...prev,
          vehiclePhoto: imageUrl
        }));
        
        toast.success('Image uploaded successfully!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      setUploading(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setPreviewImage('');
    setFormData(prev => ({
      ...prev,
      vehiclePhoto: ''
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'In Service':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-orange-400" />;
      case 'Retired':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-900/30 text-green-400';
      case 'In Service':
        return 'bg-blue-900/30 text-blue-400';
      case 'Maintenance':
        return 'bg-orange-900/30 text-orange-400';
      case 'Retired':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Export to Excel function
  const exportToExcel = () => {
    setExportLoading(true);
    
    try {
      // Prepare data for export
      const exportData = filteredBuses.map(bus => ({
        'Bus ID': bus.busId || 'N/A',
        'Number Plate': bus.numberPlate,
        'Bus Type': bus.busType,
        'Engine Number': bus.engineNumber,
        'Capacity': `${bus.capacity} seats`,
        'Price Per Day': formatCurrency(bus.pricePerDay),
        'Status': bus.status,
        'Created Date': formatDate(bus.createdAt),
        'Last Updated': formatDate(bus.updatedAt)
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 8 },  // Bus ID
        { wch: 15 }, // Number Plate
        { wch: 12 }, // Bus Type
        { wch: 20 }, // Engine Number
        { wch: 10 }, // Capacity
        { wch: 15 }, // Price Per Day
        { wch: 12 }, // Status
        { wch: 15 }, // Created Date
        { wch: 15 }  // Last Updated
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Buses Report');

      // Generate file name with timestamp
      const fileName = `Bus_Fleet_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

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

  // Export to PDF function - Fixed version
  const exportToPDF = async () => {
    setExportLoading(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: 'Bus Fleet Management Report',
        subject: 'Bus Fleet Export',
        author: 'BusZone+ System',
        keywords: 'bus, fleet, management, report',
        creator: 'BusZone+'
      });

      // Add header
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, 210, 30, 'F');
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('BUS FLEET MANAGEMENT REPORT', 105, 15, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

      // Prepare table data
      const headers = ['Bus ID', 'Number Plate', 'Type', 'Engine No.', 'Capacity', 'Price/Day', 'Status'];
      
      const tableData = filteredBuses.map(bus => [
        bus.busId || 'N/A',
        bus.numberPlate,
        bus.busType,
        bus.engineNumber,
        `${bus.capacity} seats`,
        formatCurrency(bus.pricePerDay),
        bus.status
      ]);

      // Set starting position for table
      let yPosition = 40;

      // Create table manually for better control
      const columnWidths = [15, 25, 20, 30, 20, 25, 20];
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
        `Total Buses: ${filteredBuses.length}`,
        `Available: ${filteredBuses.filter(b => b.status === 'Available').length}`,
        `In Service: ${filteredBuses.filter(b => b.status === 'In Service').length}`,
        `Maintenance: ${filteredBuses.filter(b => b.status === 'Maintenance').length}`,
        `Retired: ${filteredBuses.filter(b => b.status === 'Retired').length}`,
        `Total Daily Revenue Potential: ${formatCurrency(filteredBuses.reduce((sum, bus) => sum + (bus.pricePerDay || 0), 0))}`
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
        doc.text('BusZone+ Fleet Management System', 105, 295, { align: 'center' });
      }

      // Generate file name
      const fileName = `Bus_Fleet_Report_${new Date().toISOString().split('T')[0]}.pdf`;

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
    if (filteredBuses.length === 0) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading buses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Bus Management</h2>
          <p className="text-slate-400">Manage your fleet of buses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={exportLoading}
          >
            {exportLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Export Report
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Bus
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search buses by plate, engine number, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="In Service">In Service</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-slate-300">Total: {filteredBuses.length}</span>
          <span className="text-green-400">Available: {filteredBuses.filter(b => b.status === 'Available').length}</span>
          <span className="text-blue-400">In Service: {filteredBuses.filter(b => b.status === 'In Service').length}</span>
        </div>
      </div>

      {/* Bus List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bus ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Number Plate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Engine Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Price/Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredBuses.map((bus) => (
                <tr key={bus._id} className="hover:bg-slate-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{bus.busId || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">{bus.numberPlate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{bus.busType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">{bus.engineNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{bus.capacity} seats</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                    {formatCurrency(bus.pricePerDay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                      {getStatusIcon(bus.status)}
                      <span className="ml-1.5">{bus.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(bus)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Bus"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Delete button removed as requested */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBuses.length === 0 && (
          <div className="text-center py-12">
            <Bus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No buses found</h3>
            <p className="text-slate-500 mt-1">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first bus'
              }
            </p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowExportModal(false)}></div>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Export Report</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                  disabled={exportLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportFormat('excel')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        exportFormat === 'excel' 
                          ? 'border-green-500 bg-green-900/20 text-green-400' 
                          : 'border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-medium">Excel (.xlsx)</span>
                      <p className="text-xs mt-1">Best for data analysis</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        exportFormat === 'pdf' 
                          ? 'border-red-500 bg-red-900/20 text-red-400' 
                          : 'border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-medium">PDF (.pdf)</span>
                      <p className="text-xs mt-1">Best for printing</p>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center text-sm text-slate-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Report will include {filteredBuses.length} buses</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                    disabled={exportLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeExport}
                    disabled={exportLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {exportLoading ? (
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
      )}

      {/* Add/Edit Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900 opacity-75 z-40" onClick={() => setShowModal(false)}></div>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingBus(null);
                    setFormData({
                      busType: 'Standard',
                      engineNumber: '',
                      capacity: '',
                      numberPlate: '',
                      pricePerDay: '',
                      vehiclePhoto: '',
                      status: 'Available'
                    });
                    setPreviewImage('');
                    setFormErrors({});
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bus Type</label>
                  <select
                    name="busType"
                    value={formData.busType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Mini">Mini</option>
                    <option value="Double Decker">Double Decker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Engine Number
                    {editingBus && <span className="text-slate-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingBus 
                        ? 'border-slate-500 text-slate-400 cursor-not-allowed' 
                        : formErrors.engineNumber ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Enter engine number"
                    required
                    disabled={editingBus}
                  />
                  {formErrors.engineNumber && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.engineNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.capacity ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Enter seating capacity"
                    required
                  />
                  {formErrors.capacity && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.capacity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Number Plate
                    {editingBus && <span className="text-slate-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingBus 
                        ? 'border-slate-500 text-slate-400 cursor-not-allowed' 
                        : formErrors.numberPlate ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Enter number plate"
                    required
                    disabled={editingBus}
                  />
                  {formErrors.numberPlate && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.numberPlate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price Per Day ($)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="10000"
                    className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.pricePerDay ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Enter price per day"
                    required
                  />
                  {formErrors.pricePerDay && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.pricePerDay}</p>
                  )}
                </div>

                {/* Image Upload Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle Photo</label>
                  
                  {/* Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : previewImage 
                          ? 'border-slate-600' 
                          : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {previewImage ? (
                      <div className="space-y-3">
                        <img 
                          src={previewImage} 
                          alt="Vehicle preview" 
                          className="mx-auto max-h-32 rounded-lg object-contain"
                        />
                        <div className="flex justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById('file-input').click()}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Change Image
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Image className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="text-slate-300">
                          <span className="text-blue-400 font-medium">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-slate-400 text-xs">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                    
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {uploading && (
                    <div className="mt-2 text-center">
                      <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-blue-400 text-sm">Uploading image...</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="In Service">In Service</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBus(null);
                      setFormData({
                        busType: 'Standard',
                        engineNumber: '',
                        capacity: '',
                        numberPlate: '',
                        pricePerDay: '',
                        vehiclePhoto: '',
                        status: 'Available'
                      });
                      setPreviewImage('');
                      setFormErrors({});
                    }}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingBus ? 'Update Bus' : 'Add Bus'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;