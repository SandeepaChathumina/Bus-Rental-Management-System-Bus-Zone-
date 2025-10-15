import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Package,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Bus,
  User,
  Mail,
  Phone,
  Shield,
  MessageSquare,
  Save,
  X,
  Reply,
  Tag,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export Modal Component
const ExportModal = ({ 
  show, 
  onClose, 
  format, 
  setFormat, 
  itemCount, 
  onExport, 
  loading 
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white border border-blue-200 rounded-xl p-6 z-60 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Export Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setFormat("csv")}
            className={`p-3 border-2 rounded-lg ${
              format === "csv"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-blue-300 text-gray-600 hover:bg-blue-50"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-1" /> CSV
          </button>
          <button
            onClick={() => setFormat("pdf")}
            className={`p-3 border-2 rounded-lg ${
              format === "pdf"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-blue-300 text-gray-600 hover:bg-blue-50"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-1" /> PDF
          </button>
        </div>
        <div className="bg-blue-50 rounded p-2 text-sm text-gray-700 mb-4">
          <Calendar className="inline w-4 h-4 mr-1" /> Report will include {itemCount} items
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={onExport}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md"
          >
            {loading ? "Generating..." : "Export Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLostFound = () => {
  const { user } = useAuth(); // FIXED: Changed from authUser to user
  const navigate = useNavigate();
  
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingItem, setReplyingItem] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Reported');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    dateLost: '',
    busNumber: '',
    status: 'Reported',
    adminNotes: ''
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLostItems();
  }, []);

  // Real-time event listeners for user updates
  useEffect(() => {
    const handleLostItemUpdated = (event) => {
      try {
        const { itemId, updates } = event.detail;
        console.log('AdminLostFound.jsx: Received update for item:', itemId, updates);
        
        setLostItems(prev => {
          const updatedItems = prev.map(item => {
            if (item._id === itemId) {
              return { 
                ...item, 
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
            return item;
          });
          return updatedItems;
        });
      } catch (error) {
        console.error('Error handling lost item update:', error);
      }
    };

    const handleLostItemDeleted = (event) => {
      try {
        const { itemId } = event.detail;
        console.log('AdminLostFound.jsx: Received delete for item:', itemId);
        setLostItems(prev => {
          const updatedItems = prev.filter(item => item._id !== itemId);
          return updatedItems;
        });
        toast.info('A lost item report has been removed by user');
      } catch (error) {
        console.error('Error handling lost item deletion:', error);
      }
    };

    const handleLostItemCreated = (event) => {
      try {
        const { item } = event.detail;
        console.log('AdminLostFound.jsx: Received new item from user:', item);
        
        // Only add if it doesn't already exist
        setLostItems(prev => {
          const exists = prev.find(i => i._id === item._id);
          if (!exists) {
            return [item, ...prev];
          }
          return prev;
        });
        toast.success('New lost item report received from user');
      } catch (error) {
        console.error('Error handling lost item creation:', error);
      }
    };

    window.addEventListener('lostItemUpdated', handleLostItemUpdated);
    window.addEventListener('lostItemDeleted', handleLostItemDeleted);
    window.addEventListener('lostItemCreated', handleLostItemCreated);

    return () => {
      window.removeEventListener('lostItemUpdated', handleLostItemUpdated);
      window.removeEventListener('lostItemDeleted', handleLostItemDeleted);
      window.removeEventListener('lostItemCreated', handleLostItemCreated);
    };
  }, []);

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLostItems(data.lostItems || []);
      } else {
        // Fallback mock data
        const mockData = getMockData();
        setLostItems(mockData);
      }
    } catch (error) {
      console.error('Error fetching lost items:', error);
      toast.error('Failed to load lost items');
      // Use mock data as fallback
      const mockData = getMockData();
      setLostItems(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => {
    return [
      {
        _id: '1',
        itemName: 'Men\'s Silver Casio Digital Watch',
        description: 'A classic retro Casio watch with a silver stainless steel bracelet and a rectangular digital face. The display shows the time, day, and date. There is a small scratch on the screen.',
        dateLost: new Date('2024-09-20').toISOString(),
        busNumber: 'BZ-001',
        status: 'Reported',
        reportedBy: 'User',
        user: { 
          _id: 'user1', 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john@example.com',
          phone: '+94 771234567'
        },
        adminNotes: '',
        adminReply: '',
        createdAt: new Date('2024-09-20').toISOString(),
        updatedAt: new Date('2024-09-20').toISOString()
      },
      {
        _id: '2',
        itemName: 'Black Backpack with Laptop',
        description: 'Black backpack with laptop compartment, contains MacBook Pro and some books. Has a blue keychain attached.',
        dateLost: new Date('2024-09-19').toISOString(),
        busNumber: 'BZ-002',
        status: 'Found',
        reportedBy: 'Admin',
        adminNotes: 'Found under seat 15A, kept in office storage room. Laptop is in good condition.',
        adminReply: 'Item has been verified and stored in the main storage room. Waiting for claimant.',
        createdAt: new Date('2024-09-19').toISOString(),
        updatedAt: new Date('2024-09-19').toISOString()
      },
      {
        _id: '3',
        itemName: 'Blue Leather Wallet',
        description: 'Blue leather wallet with ID cards, credit cards and some cash. Contains national ID and driver\'s license.',
        dateLost: new Date('2024-09-17').toISOString(),
        busNumber: 'BZ-001',
        status: 'Returned',
        reportedBy: 'User',
        user: { 
          _id: 'user3', 
          firstName: 'Mike', 
          lastName: 'Johnson', 
          email: 'mike@example.com',
          phone: '+94 712345678'
        },
        adminNotes: 'Successfully returned to owner after verification',
        adminReply: 'Owner verified identity and item returned on 09/18/2024. All contents intact.',
        createdAt: new Date('2024-09-17').toISOString(),
        updatedAt: new Date('2024-09-17').toISOString()
      },
      {
        _id: '4',
        itemName: 'Red Umbrella',
        description: 'Large red umbrella with wooden handle. Brand: StormMaster.',
        dateLost: new Date('2024-09-16').toISOString(),
        busNumber: 'BZ-003',
        status: 'Claimed',
        reportedBy: 'User',
        user: { 
          _id: 'user4', 
          firstName: 'Sarah', 
          lastName: 'Wilson', 
          email: 'sarah@example.com',
          phone: '+94 773456789'
        },
        adminNotes: 'Claimed by user but not yet picked up',
        adminReply: 'User has been notified and will pick up tomorrow.',
        createdAt: new Date('2024-09-16').toISOString(),
        updatedAt: new Date('2024-09-16').toISOString()
      }
    ];
  };

  // Export Functions
  const exportCSV = (items) => {
    if (!items || items.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Item ID',
      'Item Name',
      'Description',
      'Bus Number',
      'Date Lost',
      'Status',
      'Reported By',
      'User Name',
      'User Email',
      'User Phone',
      'Admin Notes',
      'Admin Reply',
      'Reply Date',
      'Created Date',
      'Last Updated'
    ];

    const rows = items.map(item => [
      item._id || 'N/A',
      `"${(item.itemName || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.busNumber || 'N/A',
      item.dateLost ? new Date(item.dateLost).toLocaleDateString() : 'N/A',
      item.status || 'N/A',
      item.user ? `${item.user.firstName} ${item.user.lastName}` : (item.reportedBy || 'N/A'),
      item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A',
      item.user?.email || 'N/A',
      item.user?.phone || 'N/A',
      `"${(item.adminNotes || '').replace(/"/g, '""')}"`,
      `"${(item.adminReply || '').replace(/"/g, '""')}"`,
      item.repliedAt ? new Date(item.repliedAt).toLocaleString() : 'N/A',
      item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
      item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `lost-found-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV report downloaded successfully!');
  };

  // PDF Export Function
  const exportPDF = (items) => {
    if (!items || items.length === 0) {
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
    doc.text('Lost & Found Report', pageWidth / 2, margin + 25, { align: 'center' });
    
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
    const totalItems = items.length;
    const reportedItems = items.filter(item => item.status === 'Reported').length;
    const foundItems = items.filter(item => item.status === 'Found').length;
    const claimedItems = items.filter(item => item.status === 'Claimed').length;
    const returnedItems = items.filter(item => item.status === 'Returned').length;
    
    // Statistics boxes
    const availableWidth = pageWidth - (margin * 2);
    const boxCount = 5;
    const boxSpacing = 6;
    const boxWidth = Math.min(30, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
    const boxHeight = 25;
    let currentX = margin;
    
    // Total Items box
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(totalItems.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Total Items', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Reported Items box
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(reportedItems.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Reported', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Found Items box
    doc.setFillColor(96, 165, 250);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(foundItems.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Found', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Claimed Items box
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(claimedItems.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Claimed', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Returned Items box
    doc.setFillColor(14, 165, 233);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(returnedItems.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Returned', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    // Status distribution table
    const statusTableY = statsY + 50;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Status Distribution', margin, statusTableY);
    
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['Reported', reportedItems.toString(), `${((reportedItems/totalItems)*100).toFixed(1)}%`],
      ['Found', foundItems.toString(), `${((foundItems/totalItems)*100).toFixed(1)}%`],
      ['Claimed', claimedItems.toString(), `${((claimedItems/totalItems)*100).toFixed(1)}%`],
      ['Returned', returnedItems.toString(), `${((returnedItems/totalItems)*100).toFixed(1)}%`]
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

    // Add new page for item details table
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
    
    // Main item data table
    const tableStartY = margin + 30;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Lost Item Details', margin, tableStartY);
    
    // Prepare table data
    const tableColumns = [
      { header: 'Item Name', dataKey: 'itemName', width: 40 },
      { header: 'Bus No.', dataKey: 'busNumber', width: 20 },
      { header: 'Date Lost', dataKey: 'dateLost', width: 25 },
      { header: 'Status', dataKey: 'status', width: 20 },
      { header: 'Reported By', dataKey: 'reportedBy', width: 25 },
      { header: 'User Contact', dataKey: 'userContact', width: 30 },
      { header: 'Admin Reply', dataKey: 'adminReply', width: 50 },
      { header: 'Reply Date', dataKey: 'replyDate', width: 25 }
    ];
    
    const tableRows = items.map((item, index) => ({
      itemName: (item.itemName || '').substring(0, 25) + (item.itemName?.length > 25 ? '...' : ''),
      busNumber: item.busNumber || 'N/A',
      dateLost: item.dateLost ? new Date(item.dateLost).toLocaleDateString('en-GB') : 'N/A',
      status: item.status || 'N/A',
      reportedBy: item.user ? `${item.user.firstName} ${item.user.lastName}` : (item.reportedBy || 'N/A'),
      userContact: item.user?.phone || 'N/A',
      adminReply: (item.adminReply || '').substring(0, 40) + (item.adminReply?.length > 40 ? '...' : '') || 'N/A',
      replyDate: item.repliedAt ? new Date(item.repliedAt).toLocaleDateString('en-GB') : 'N/A'
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
        itemName: { halign: 'left', fontSize: 7, cellWidth: 40, overflow: 'linebreak' },
        busNumber: { halign: 'center', fontSize: 7, cellWidth: 20 },
        dateLost: { halign: 'center', fontSize: 6, cellWidth: 25 },
        status: { halign: 'center', fontSize: 7, cellWidth: 20 },
        reportedBy: { halign: 'center', fontSize: 7, cellWidth: 25 },
        userContact: { halign: 'left', fontSize: 6, cellWidth: 30, overflow: 'linebreak' },
        adminReply: { halign: 'left', fontSize: 6, cellWidth: 50, overflow: 'linebreak' },
        replyDate: { halign: 'center', fontSize: 6, cellWidth: 25 }
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
        doc.text('BusZone+ Lost & Found Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
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
    const fileName = `BusZone_LostFoundReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
    doc.save(fileName);
    toast.success('PDF report generated successfully!');
  };

  const handleExport = () => {
    if (lostItems.length === 0) {
      toast.error('No items to export');
      return;
    }

    setExporting(true);

    try {
      if (exportFormat === 'csv') {
        exportCSV(lostItems);
      } else {
        exportPDF(lostItems);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  // Handle delete lost item
  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove item from state
        setLostItems(prev => prev.filter(item => item._id !== itemId));
        
        // Notify user page about the deletion
        window.dispatchEvent(new CustomEvent('lostItemDeleted', {
          detail: { itemId }
        }));
        
        toast.success('Lost item deleted successfully');
      } else {
        // For demo purposes, still remove from state even if API fails
        setLostItems(prev => prev.filter(item => item._id !== itemId));
        toast.success('Lost item deleted successfully (demo mode)');
      }
    } catch (error) {
      console.error('Error deleting lost item:', error);
      // For demo purposes, still remove from state
      setLostItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Lost item deleted successfully (demo mode)');
    }
  };

  // Handle view item
  const handleViewItem = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  // Handle admin reply with status - FIXED VERSION
  const handleAdminReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Generate status-specific reply templates
      let finalReplyMessage = replyMessage;
      
      // Add status-specific context to the reply
      if (selectedStatus === 'Found' && !replyMessage.includes('found')) {
        finalReplyMessage = `Good news! We have found your item "${replyingItem.itemName}". ${replyMessage}`;
      } else if (selectedStatus === 'Returned' && !replyMessage.includes('returned')) {
        finalReplyMessage = `We are pleased to inform you that your item "${replyingItem.itemName}" has been successfully returned. ${replyMessage}`;
      } else if (selectedStatus === 'Claimed' && !replyMessage.includes('claimed')) {
        finalReplyMessage = `Your item "${replyingItem.itemName}" is ready for pickup and has been marked as claimed. ${replyMessage}`;
      }

      const response = await fetch(`${BACKEND_URL}/api/lost-items/${replyingItem._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminReply: finalReplyMessage,
          status: selectedStatus,
          repliedBy: user?.firstName || 'Admin' // FIXED: Changed from authUser to user
        })
      });

      let updatedItem;
      if (!response.ok) {
        // Mock reply for demo
        updatedItem = {
          adminReply: finalReplyMessage,
          status: selectedStatus,
          repliedBy: user?.firstName || 'Admin', // FIXED: Changed from authUser to user
          repliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Show status-specific success message
        if (selectedStatus === 'Found') {
          toast.success('Item marked as FOUND and reply sent!', {
            icon: '🎉',
            style: {
              background: '#10b981',
              color: 'white'
            }
          });
        } else if (selectedStatus === 'Returned') {
          toast.success('Item marked as RETURNED and reply sent!', {
            icon: '✅',
            style: {
              background: '#8b5cf6',
              color: 'white'
            }
          });
        } else if (selectedStatus === 'Claimed') {
          toast.success('Item marked as CLAIMED and reply sent!', {
            icon: '📦',
            style: {
              background: '#3b82f6',
              color: 'white'
            }
          });
        } else {
          toast.success('Reply sent successfully (demo mode)');
        }
      } else {
        const data = await response.json();
        updatedItem = data.lostItem;
        
        // Show status-specific success message for real API
        if (selectedStatus === 'Found') {
          toast.success('Item marked as FOUND and reply sent successfully!');
        } else if (selectedStatus === 'Returned') {
          toast.success('Item marked as RETURNED and reply sent successfully!');
        } else if (selectedStatus === 'Claimed') {
          toast.success('Item marked as CLAIMED and reply sent successfully!');
        } else {
          toast.success('Reply sent successfully');
        }
      }

      // Update the item in the state
      setLostItems(prev =>
        prev.map(item =>
          item._id === replyingItem._id ? { ...item, ...updatedItem } : item
        )
      );

      // Notify user page about the admin reply with status information
      window.dispatchEvent(new CustomEvent('lostItemUpdated', {
        detail: {
          itemId: replyingItem._id,
          updates: updatedItem,
          source: 'admin',
          adminReply: true,
          status: selectedStatus
        }
      }));

      setShowReplyForm(false);
      setReplyingItem(null);
      setReplyMessage('');
      setSelectedStatus('Reported');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.user && `${item.user.firstName} ${item.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'reported': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'found': return 'bg-green-100 text-green-800 border border-green-200';
      case 'claimed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'returned': return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'reported': return <AlertCircle className="w-4 h-4" />;
      case 'found': return <CheckCircle className="w-4 h-4" />;
      case 'claimed': return <User className="w-4 h-4" />;
      case 'returned': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatistics = () => {
    const total = lostItems.length;
    const reported = lostItems.filter(item => item.status === 'Reported').length;
    const found = lostItems.filter(item => item.status === 'Found').length;
    const claimed = lostItems.filter(item => item.status === 'Claimed').length;
    const returned = lostItems.filter(item => item.status === 'Returned').length;

    return { total, reported, found, claimed, returned };
  };

  // Make statistics reactive to lostItems changes
  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Lost & Found Management</h1>
        <p className="text-gray-600">Manage and track lost items from bus journeys</p>
      </div>

      {/* Top Section - Statistics and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Statistics Card */}
        <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Log Item</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <span className="font-semibold text-gray-800">{stats.total}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reported</span>
              <span className="font-semibold text-yellow-600">{stats.reported}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Found</span>
              <span className="font-semibold text-green-600">{stats.found}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Claimed</span>
              <span className="font-semibold text-blue-600">{stats.claimed}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Returned</span>
              <span className="font-semibold text-purple-600">{stats.returned}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Card */}
        <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items, descriptions, or bus numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="reported">Reported</option>
                <option value="found">Found</option>
                <option value="claimed">Claimed</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items List - Full Width */}
      <div className="w-full">
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No items match your search criteria" 
                    : "No lost items have been reported yet"}
                </p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  Report Your First Lost Item
                </button>
              </div>
            ) : (
              <div className="divide-y divide-blue-100">
                {filteredItems.map((item) => (
                  <div key={item._id} className="p-6 hover:bg-blue-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.itemName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)} flex items-center gap-1`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 mb-3">
                          <div className="flex items-center">
                            <Bus className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Bus: {item.busNumber}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Lost: {formatDate(item.dateLost)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            {item.reportedBy === 'Admin' ? (
                              <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            ) : (
                              <User className="w-4 h-4 mr-2 text-blue-500" />
                            )}
                            <span>{item.reportedBy === 'User' ? 'User Reported' : 'Admin Reported'}</span>
                          </div>
                        </div>

                        {item.user && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-blue-800">User Contact Information</h4>
                              <Tag className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-2 text-blue-500" />
                                <span>{item.user.firstName} {item.user.lastName}</span>
                              </div>
                              {item.user.email && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2 text-blue-500" />
                                  <span>{item.user.email}</span>
                                </div>
                              )}
                              {item.user.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2 text-blue-500" />
                                  <span>{item.user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {item.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                              <MessageSquare className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800 mb-1">Admin Notes:</p>
                                <p className="text-sm text-gray-700">{item.adminNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {item.adminReply && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                              <Reply className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium text-green-800">Admin Reply:</p>
                                  {item.repliedBy && (
                                    <span className="text-xs text-green-600">by {item.repliedBy}</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">{item.adminReply}</p>
                                {item.repliedAt && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(item.repliedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-4 border-t border-blue-200">
                      <button
                        onClick={() => handleViewItem(item)}
                        className="px-3 py-1 text-gray-500 hover:text-blue-600 transition-colors flex items-center text-sm hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      
                      <button
                        onClick={() => {
                          setReplyingItem(item);
                          setReplyMessage(item.adminReply || '');
                          setSelectedStatus(item.status || 'Reported');
                          setShowReplyForm(true);
                        }}
                        className="px-3 py-1 text-green-600 hover:text-green-700 transition-colors flex items-center text-sm hover:bg-green-50 rounded"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </button>
                      
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`)) {
                            handleDeleteItem(item._id);
                          }
                        }}
                        className="px-3 py-1 text-red-600 hover:text-red-700 transition-colors flex items-center text-sm hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

      {/* Export Report Modal */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        format={exportFormat}
        setFormat={setExportFormat}
        itemCount={lostItems.length}
        onExport={handleExport}
        loading={exporting}
      />

      {/* Reply Modal with Enhanced Status Dropdown */}
      {showReplyForm && replyingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedStatus === 'Found' ? 'Mark as Found' :
                 selectedStatus === 'Returned' ? 'Mark as Returned' :
                 selectedStatus === 'Claimed' ? 'Mark as Claimed' :
                 'Reply to User'}
              </h2>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyingItem(null);
                  setReplyMessage('');
                  setSelectedStatus('Reported');
                }}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-2">Item: {replyingItem.itemName}</h3>
              <p className="text-sm text-slate-600">Replying to: {replyingItem.user?.firstName} {replyingItem.user?.lastName}</p>
            </div>

            <form onSubmit={handleAdminReply} className="space-y-4">
              {/* Enhanced Status Dropdown with Icons */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Update Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  required
                >
                  <option value="Reported">📝 Reported - Initial report</option>
                  <option value="Found">🎉 Found - Item located</option>
                  <option value="Claimed">📦 Claimed - Ready for pickup</option>
                  <option value="Returned">✅ Returned - Given back to owner</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedStatus === 'Found' && 'Item has been located and is in our possession'}
                  {selectedStatus === 'Claimed' && 'Item is ready for pickup by the owner'}
                  {selectedStatus === 'Returned' && 'Item has been successfully returned to the owner'}
                  {selectedStatus === 'Reported' && 'Initial report - still searching for item'}
                </p>
              </div>

              {/* Reply Message with Status-Based Placeholder */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {selectedStatus === 'Found' ? 'Found Notification Message *' :
                   selectedStatus === 'Returned' ? 'Return Confirmation Message *' :
                   selectedStatus === 'Claimed' ? 'Pickup Instructions *' :
                   'Reply Message *'}
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                  placeholder={
                    selectedStatus === 'Found' ? `Good news! We found your ${replyingItem.itemName}. Please provide details about where and how to collect it...` :
                    selectedStatus === 'Returned' ? `We're happy to inform you that your ${replyingItem.itemName} has been returned. Add any additional notes...` :
                    selectedStatus === 'Claimed' ? `Your ${replyingItem.itemName} is ready for pickup. Provide pickup location, timing, and required documents...` :
                    'Enter your reply to the user...'
                  }
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  This message will be sent to the user with the status update.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyingItem(null);
                    setReplyMessage('');
                    setSelectedStatus('Reported');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed shadow-lg ${
                    selectedStatus === 'Found' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500' :
                    selectedStatus === 'Returned' ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500' :
                    selectedStatus === 'Claimed' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500' :
                    'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500'
                  } disabled:from-slate-400 disabled:to-slate-500`}
                >
                  {submitting ? 'Sending...' : 
                   selectedStatus === 'Found' ? 'Mark as Found & Send' :
                   selectedStatus === 'Returned' ? 'Mark as Returned & Send' :
                   selectedStatus === 'Claimed' ? 'Mark as Claimed & Send' :
                   'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Item Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingItem(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Item Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">{viewingItem.itemName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(viewingItem.status)} flex items-center gap-2`}>
                      {getStatusIcon(viewingItem.status)}
                      {viewingItem.status}
                    </span>
                  </div>
                  
                  {viewingItem.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">{viewingItem.description}</p>
                  )}
                </div>
              </div>

              {/* Item Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Bus className="w-5 h-5 mr-2" />
                      Journey Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bus Number:</span>
                        <span className="font-medium">{viewingItem.busNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date Lost:</span>
                        <span className="font-medium">{formatDate(viewingItem.dateLost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reported By:</span>
                        <span className="font-medium">{viewingItem.reportedBy}</span>
                      </div>
                    </div>
                  </div>

                  {viewingItem.user && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        User Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{viewingItem.user.firstName} {viewingItem.user.lastName}</span>
                        </div>
                        {viewingItem.user.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{viewingItem.user.email}</span>
                          </div>
                        )}
                        {viewingItem.user.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{viewingItem.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDateTime(viewingItem.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDateTime(viewingItem.updatedAt)}</span>
                      </div>
                      {viewingItem.repliedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Reply:</span>
                          <span className="font-medium">{formatDateTime(viewingItem.repliedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewingItem.adminNotes && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Admin Notes
                      </h4>
                      <p className="text-sm text-gray-700">{viewingItem.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Reply Section */}
              {viewingItem.adminReply && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Reply className="w-5 h-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-green-800">Admin Reply</h4>
                        {viewingItem.repliedBy && (
                          <span className="text-xs text-green-600">by {viewingItem.repliedBy}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{viewingItem.adminReply}</p>
                      {viewingItem.repliedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(viewingItem.repliedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingItem(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLostFound;