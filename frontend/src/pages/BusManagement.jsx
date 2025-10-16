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
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import DragDropImageUpload from '../components/DragDropImageUpload';

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
  
  const [formData, setFormData] = useState({
    busType: 'Standard',
    brand: '',
    modelName: '',
    engineNumber: '',
    capacity: '',
    numberPlate: '',
    pricePerDay: '',
    vehiclePhoto: '',
    status: 'Available'
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formErrors, setFormErrors] = useState({});

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
        bus.busType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.brand && bus.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bus.modelName && bus.modelName.toLowerCase().includes(searchTerm.toLowerCase()))
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

    // Engine Number validation (only for new buses) - must start with ENG
    if (!editingBus) {
      if (!formData.engineNumber.trim()) {
        errors.engineNumber = 'Engine number is required';
      } else if (!/^ENG[A-Z0-9]{2,17}$/i.test(formData.engineNumber)) {
        errors.engineNumber = 'Engine number must start with ENG followed by letters and numbers (e.g., ENG123ABC)';
      }
    }

    // Number Plate validation (only for new buses) - must start with N, second letter a-f, then 4 numbers
    if (!editingBus) {
      if (!formData.numberPlate.trim()) {
        errors.numberPlate = 'Number plate is required';
      } else {
        // Custom number plate validation: N + (a-f) + 4 digits
        const customPlateRegex = /^N[a-fA-F]\d{4}$/i;
        const formattedPlate = formData.numberPlate.toUpperCase().replace(/\s/g, '');
        
        if (!customPlateRegex.test(formData.numberPlate)) {
          errors.numberPlate = 'Number plate must start with N, second letter a-f, followed by 4 numbers (e.g., NA1234, NB5678)';
        }
      }
    }

    // Model Name validation
    if (formData.modelName && formData.modelName.trim().length > 0) {
      if (formData.modelName.trim().length < 2) {
        errors.modelName = 'Model name must be at least 2 characters long';
      } else if (formData.modelName.trim().length > 50) {
        errors.modelName = 'Model name cannot exceed 50 characters';
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
    } else if (formData.pricePerDay > 100000) {
      errors.pricePerDay = 'Price cannot exceed LKR 100,000 per day';
    }

    // Vehicle Photo validation - now supports both URL and uploaded images
    if (formData.vehiclePhoto) {
      const isUrl = /^https?:\/\/.+\..+/.test(formData.vehiclePhoto);
      const isDataUrl = formData.vehiclePhoto.startsWith('data:image');
      const isSupabaseUrl = formData.vehiclePhoto.includes('supabase');
      
      if (!isUrl && !isDataUrl && !isSupabaseUrl) {
        errors.vehiclePhoto = 'Please provide a valid image URL or upload an image';
      }
    }

    // Bus Type validation
    if (!formData.busType) {
      errors.busType = 'Bus type is required';
    }

    // Brand validation
    if (!formData.brand) {
      errors.brand = 'Bus brand is required';
    } else if (formData.brand.trim().length < 2) {
      errors.brand = 'Brand name must be at least 2 characters';
    } else if (formData.brand.trim().length > 50) {
      errors.brand = 'Brand name must be less than 50 characters';
    }

    // Status validation
    if (!formData.status) {
      errors.status = 'Status is required';
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
        brand: formData.brand,
        modelName: formData.modelName || '',
        engineNumber: formData.engineNumber,
        capacity: parseInt(formData.capacity),
        numberPlate: formData.numberPlate.toUpperCase(), // Convert to uppercase for consistency
        pricePerDay: parseFloat(formData.pricePerDay) || 0,
        vehiclePhoto: formData.vehiclePhoto || '',
        status: formData.status
      };
      
      console.log('Submitting bus data:', submitData);
      
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
        brand: '',
        modelName: '',
        engineNumber: '',
        capacity: '',
        numberPlate: '',
        pricePerDay: '',
        vehiclePhoto: '',
        status: 'Available'
      });
      setImagePreview(null);
      setFormErrors({});
      fetchBuses();
    } catch (error) {
      console.error('Failed to save bus', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.details) {
        // Handle validation errors
        const validationErrors = error.response.data.details;
        const errorMessages = Object.values(validationErrors).map(err => err.message).join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save bus');
      }
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busType: bus.busType,
      brand: bus.brand || '',
      modelName: bus.modelName || '',
      engineNumber: bus.engineNumber,
      capacity: bus.capacity.toString(),
      numberPlate: bus.numberPlate,
      pricePerDay: bus.pricePerDay.toString(),
      vehiclePhoto: bus.vehiclePhoto || '',
      status: bus.status
    });
    setImagePreview(bus.vehiclePhoto || null);
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

    // Auto-format number plate to uppercase as user types
    let processedValue = value;
    if (name === 'numberPlate' && !editingBus) {
      processedValue = value.toUpperCase();
    }

    // Auto-fill capacity based on bus type
    let newFormData = {
      ...formData,
      [name]: processedValue
    };

    // Auto-fill capacity when bus type changes
    if (name === 'busType' && !editingBus) {
      const capacityMap = {
        'Standard': 51,
        'Luxury': 40,
        'Deluxe': 55,
        'Mini': 35,
        'Double Decker': 78
      };
      newFormData.capacity = capacityMap[value] || '';
    }

    setFormData(newFormData);
  };


  const handleImageUpload = (imageUrl) => {
    setFormData({
      ...formData,
      vehiclePhoto: imageUrl
    });
    setImagePreview(imageUrl);
    setIsUploadingImage(false);
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      vehiclePhoto: ''
    });
    setImagePreview(null);
  };

  const handleImageUploadStart = () => {
    setIsUploadingImage(true);
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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Service':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Retired':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  // Calculate bus statistics
  const busStats = {
    total: buses.length,
    available: buses.filter(b => b.status === 'Available').length,
    inService: buses.filter(b => b.status === 'In Service').length,
    maintenance: buses.filter(b => b.status === 'Maintenance').length,
    retired: buses.filter(b => b.status === 'Retired').length
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
        'Brand': bus.brand || 'N/A',
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
        { wch: 15 }, // Brand
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

  // Export to PDF function - Matching UserManagement format
  const exportToPDF = async () => {
    setExportLoading(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table layout
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Add BusZone+ Header (without logo)
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
      doc.text('Bus Fleet Management Report', pageWidth / 2, margin + 25, { align: 'center' });
      
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
      const totalBuses = filteredBuses.length;
      const availableBuses = filteredBuses.filter(b => b.status === 'Available').length;
      const inServiceBuses = filteredBuses.filter(b => b.status === 'In Service').length;
      const maintenanceBuses = filteredBuses.filter(b => b.status === 'Maintenance').length;
      const retiredBuses = filteredBuses.filter(b => b.status === 'Retired').length;
      
      // Statistics boxes - responsive layout
      const availableWidth = pageWidth - (margin * 2);
      const boxCount = 5;
      const boxSpacing = 6;
      const boxWidth = Math.min(30, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
      const boxHeight = 25;
      let currentX = margin;
      
      // Total Buses box - Blue theme with white text
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(totalBuses.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Total Buses', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // Available Buses box - Blue theme with white text
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(availableBuses.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Available', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // In Service box - Blue theme with white text
      doc.setFillColor(29, 78, 216);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(inServiceBuses.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('In Service', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // Maintenance box - Blue theme with white text
      doc.setFillColor(30, 64, 175);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
      doc.text(maintenanceBuses.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Maintenance', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      currentX += boxWidth + boxSpacing;
      
      // Retired box - Blue theme with white text
      doc.setFillColor(14, 165, 233);
      doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(retiredBuses.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
      doc.setFontSize(7);
      doc.text('Retired', currentX + boxWidth/2, statsY + 25, { align: 'center' });
      
      // Status distribution table - moved to separate page to prevent overlap
      const statusTableY = statsY + 50;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Status Distribution', margin, statusTableY);
      
      const statusData = [
        ['Status', 'Count', 'Percentage'],
        ['Available', availableBuses.toString(), `${((availableBuses/totalBuses)*100).toFixed(1)}%`],
        ['In Service', inServiceBuses.toString(), `${((inServiceBuses/totalBuses)*100).toFixed(1)}%`],
        ['Maintenance', maintenanceBuses.toString(), `${((maintenanceBuses/totalBuses)*100).toFixed(1)}%`],
        ['Retired', retiredBuses.toString(), `${((retiredBuses/totalBuses)*100).toFixed(1)}%`]
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

      // Add new page for bus details table to prevent overlap
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
      
      // Main bus data table - now on separate page
      const tableStartY = margin + 30;
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text('Bus Details', margin, tableStartY);
      
      // Prepare table data with responsive formatting
      const tableColumns = [
        { header: 'ID', dataKey: 'id', width: 20 },
        { header: 'Number Plate', dataKey: 'numberPlate', width: 30 },
        { header: 'Type', dataKey: 'type', width: 25 },
        { header: 'Brand', dataKey: 'brand', width: 25 },
        { header: 'Model', dataKey: 'model', width: 25 },
        { header: 'Engine No.', dataKey: 'engineNumber', width: 35 },
        { header: 'Capacity', dataKey: 'capacity', width: 20 },
        { header: 'Price/Day', dataKey: 'pricePerDay', width: 25 },
        { header: 'Status', dataKey: 'status', width: 20 }
      ];
      
      const tableRows = filteredBuses.map((bus, index) => ({
        id: (bus.busId || bus._id).toString().substring(0, 6) + '...',
        numberPlate: bus.numberPlate?.substring(0, 12) || 'N/A',
        type: bus.busType?.substring(0, 15) || 'N/A',
        brand: bus.brand?.substring(0, 15) || 'N/A',
        model: bus.modelName?.substring(0, 15) || 'N/A',
        engineNumber: bus.engineNumber?.substring(0, 20) + (bus.engineNumber?.length > 20 ? '...' : '') || 'N/A',
        capacity: `${bus.capacity} seats`,
        pricePerDay: formatCurrency(bus.pricePerDay),
        status: bus.status || 'N/A'
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
          id: { halign: 'center', fontSize: 7, cellWidth: 20 },
          numberPlate: { halign: 'center', fontSize: 8, cellWidth: 30 },
          type: { halign: 'left', fontSize: 8, cellWidth: 25 },
          engineNumber: { halign: 'left', fontSize: 7, cellWidth: 35, overflow: 'linebreak' },
          capacity: { halign: 'center', fontSize: 8, cellWidth: 20 },
          pricePerDay: { halign: 'center', fontSize: 7, cellWidth: 25 },
          status: { halign: 'center', fontSize: 8, cellWidth: 20 }
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
          doc.text('BusZone+ Bus Fleet Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
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
      const fileName = `BusZone_BusReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading buses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Buses</p>
                <h3 className="text-2xl text-gray-800 font-bold">{busStats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Bus className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <h3 className="text-2xl text-gray-800 font-bold">{busStats.available}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Service</p>
                <h3 className="text-2xl text-gray-800 font-bold">{busStats.inService}</h3>
              </div>
              <div className="p-3 bg-cyan-100 rounded-full">
                <Clock className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <h3 className="text-2xl text-gray-800 font-bold">{busStats.maintenance}</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Wrench className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls + Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Buses
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by plate, engine number, or type..."
                    className="pl-10 pr-4 py-2 bg-white border border-blue-300 text-gray-800 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white text-gray-800 px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="In Service">In Service</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Bus List Table */}
            <div className="bg-white rounded-xl overflow-hidden border border-blue-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Bus ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Number Plate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Engine Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Price/Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {filteredBuses.map((bus) => (
                      <tr key={bus._id} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {bus.vehiclePhoto ? (
                              <img
                                src={bus.vehiclePhoto}
                                alt={`${bus.busType} - ${bus.numberPlate}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full flex items-center justify-center ${bus.vehiclePhoto ? 'hidden' : 'flex'}`}
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{bus.busId || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{bus.numberPlate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.busType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{bus.brand || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.modelName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{bus.engineNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{bus.capacity} seats</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
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
                              className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-100 transition-colors"
                              title="Edit Bus"
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
        
              {filteredBuses.length === 0 && (
                <div className="text-center py-12">
                  <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">No buses found</h3>
                  <p className="text-gray-500 mt-1">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Get started by adding your first bus'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
            <h3 className="text-lg text-gray-800 mb-3 font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                  <span className="text-sm text-blue-700 font-medium">Add New Bus</span>
                </div>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
                disabled={exportLoading}
              >
                <div className="flex items-center space-x-3">
                  {exportLoading ? (
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  )}
                  <span className="text-sm text-green-700 font-medium">Export Report</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)}></div>
          <div className="relative bg-white border border-blue-200 rounded-xl p-6 z-60 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Export Report</h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-3 border-2 rounded-lg ${
                  exportFormat === 'excel' 
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-blue-300 text-gray-600 hover:bg-blue-50'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1" /> Excel
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-3 border-2 rounded-lg ${
                  exportFormat === 'pdf' 
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-blue-300 text-gray-600 hover:bg-blue-50'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1" /> PDF
              </button>
            </div>
            <div className="bg-blue-50 rounded p-2 text-sm text-gray-700 mb-4">
              <Calendar className="inline w-4 h-4 mr-1" /> Report will include {filteredBuses.length} buses
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowExportModal(false)} className="px-3 py-1 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={executeExport}
                disabled={exportLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md"
              >
                {exportLoading ? "Generating..." : "Export Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pt-12">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white border border-blue-200 rounded-xl p-6 z-60 w-full max-w-4xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBus(null);
                  setFormData({
                    busType: 'Standard',
                    brand: 'Toyota',
                    engineNumber: '',
                    capacity: '',
                    numberPlate: '',
                    pricePerDay: '',
                    vehiclePhoto: '',
                    status: 'Available'
                  });
                  setImagePreview(null);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Type
                    {editingBus && <span className="text-gray-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <select
                    name="busType"
                    value={formData.busType}
                    onChange={handleInputChange}
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full ${
                      editingBus ? 'cursor-not-allowed opacity-50 border-gray-300' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    required
                    disabled={editingBus}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Mini">Mini</option>
                    <option value="Double Decker">Double Decker</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Brand
                    {editingBus && <span className="text-gray-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full ${
                      editingBus 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : formErrors.brand ? 'border-red-500 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter bus brand (e.g., Toyota, Mercedes, Volvo)"
                    required
                    disabled={editingBus}
                  />
                  {formErrors.brand && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name <span className="text-gray-500 text-xs">(Optional)</span>
                    {editingBus && <span className="text-gray-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleInputChange}
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full ${
                      editingBus 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : formErrors.modelName ? 'border-red-500 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., Hiace, Sprinter, Coaster (optional)"
                    disabled={editingBus}
                  />
                  {formErrors.modelName && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.modelName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Number
                    {editingBus && <span className="text-gray-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleInputChange}
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full ${
                      editingBus 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : formErrors.engineNumber ? 'border-red-500 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter engine number (e.g., ENG123ABC)"
                    required
                    disabled={editingBus}
                  />
                  {formErrors.engineNumber && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.engineNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                    {editingBus && <span className="text-gray-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full ${
                      editingBus 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : formErrors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter seating capacity"
                    required
                    disabled={editingBus}
                  />
                  {formErrors.capacity && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.capacity}</p>
                  )}
                  {!editingBus && !formErrors.capacity && (
                    <p className="text-gray-500 text-xs mt-1">Capacity auto-fills based on bus type selection</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Plate
                    {editingBus && <span className="text-gray-500 text-xs ml-1">(Cannot be changed)</span>}
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate || ''}
                    onChange={handleInputChange}
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full uppercase ${
                      editingBus 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : formErrors.numberPlate ? 'border-red-500 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter number plate (e.g., NA1234)"
                    required
                    disabled={editingBus}
                    autoComplete="off"
                  />
                  {formErrors.numberPlate && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.numberPlate}</p>
                  )}
                  {!editingBus && !formErrors.numberPlate && (
                    <p className="text-gray-500 text-xs mt-1">Format: N + (a-f) + 4 digits (e.g., NA1234, NB5678)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Day (LKR)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    min="0"
                    max="100000"
                    step="0.01"
                    className={`p-3 bg-white border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors w-full ${
                      formErrors.pricePerDay ? 'border-red-500 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter price per day in LKR"
                    required
                  />
                  {formErrors.pricePerDay && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.pricePerDay}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="p-3 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="In Service">In Service</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Photo
                    <span className="text-gray-500 text-xs ml-1">(Optional - Drag & drop or click to upload)</span>
                  </label>
                  <DragDropImageUpload
                    onImageUpload={handleImageUpload}
                    currentImage={imagePreview}
                    onRemoveImage={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="w-full"
                    maxSize={5 * 1024 * 1024} // 5MB
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                  />
                  {formErrors.vehiclePhoto && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.vehiclePhoto}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    <p>• Supported formats: JPEG, PNG, WebP</p>
                    <p>• Maximum file size: 5MB</p>
                    <p>• Images will be automatically optimized and stored securely</p>
                  </div>
                </div>
                </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBus(null);
                    setFormData({
                      busType: 'Standard',
                      brand: 'Toyota',
                      engineNumber: '',
                      capacity: '',
                      numberPlate: '',
                      pricePerDay: '',
                      vehiclePhoto: '',
                      status: 'Available'
                    });
                    setImagePreview(null);
                    setFormErrors({});
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingBus ? 'Update Bus' : 'Add Bus'}
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

export default BusManagement;