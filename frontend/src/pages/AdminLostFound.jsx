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
  RefreshCw,
  Package,
  AlertCircle,
  UserCheck,
  CheckCircle,
  Calendar,
  Clock,
  Bus,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Shield,
  MessageSquare,
  Save,
  X,
  Reply
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminLostFound = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exporting, setExporting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingItem, setReplyingItem] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

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

  const fetchLostItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Mock data based on your image
        const mockData = [
          {
            _id: '1',
            itemName: 'Men\'s Silver Casio Digital Watch (Model: A168WA-1)',
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
            booking: { 
              _id: 'booking1', 
              bookingReference: 'BZ-2024-001',
              route: 'Colombo - Kandy'
            },
            adminNotes: '',
            adminReply: '',
            createdAt: new Date('2024-09-20').toISOString(),
            updatedAt: new Date('2024-09-20').toISOString()
          },
          {
            _id: '2',
            itemName: 'Black Backpack',
            description: 'Black backpack with laptop inside. Has a blue keychain attached.',
            dateLost: new Date('2024-09-19').toISOString(),
            busNumber: 'BZ-002',
            status: 'Found',
            reportedBy: 'Admin',
            adminNotes: 'Found under seat 15A, kept in office storage room',
            adminReply: 'Item has been verified and stored in the main storage room. Waiting for claimant.',
            createdAt: new Date('2024-09-19').toISOString(),
            updatedAt: new Date('2024-09-19').toISOString()
          },
          {
            _id: '3',
            itemName: 'Blue Wallet',
            description: 'Blue leather wallet with ID cards and some cash',
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
            booking: { 
              _id: 'booking3', 
              bookingReference: 'BZ-2024-003',
              route: 'Negombo - Colombo'
            },
            adminNotes: 'Successfully returned to owner after verification',
            adminReply: 'Owner verified identity and item returned on 09/18/2024.',
            createdAt: new Date('2024-09-17').toISOString(),
            updatedAt: new Date('2024-09-17').toISOString()
          }
        ];
        setLostItems(mockData);
        return;
      }

      const data = await response.json();
      setLostItems(data.lostItems || []);
    } catch (error) {
      console.error('Error fetching lost items:', error);
      toast.error('Failed to load lost items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!formData.itemName.trim() || !formData.busNumber.trim()) {
      toast.error('Item name and bus number are required');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to report item');
      }

      const data = await response.json();
      setLostItems(prev => [data.lostItem, ...prev]);
      toast.success('Lost item reported successfully');
      
      setFormData({
        itemName: '',
        description: '',
        dateLost: '',
        busNumber: '',
        status: 'Reported',
        adminNotes: ''
      });
      setShowReportForm(false);
    } catch (error) {
      console.error('Error reporting lost item:', error);
      toast.error('Failed to report lost item');
    } finally {
      setSubmitting(false);
    }
  };

  const updateItemStatus = async (itemId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      setLostItems(prev =>
        prev.map(item =>
          item._id === itemId ? { 
            ...item, 
            ...updates,
            updatedAt: new Date().toISOString()
          } : item
        )
      );
      
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this lost item report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setLostItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Lost item report deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  // Admin Reply Functionality
  const handleAdminReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/lost-items/${replyingItem._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminReply: replyMessage,
          repliedBy: authUser?.firstName || 'Admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const data = await response.json();
      
      // Update the item in the state
      setLostItems(prev =>
        prev.map(item =>
          item._id === replyingItem._id ? { 
            ...item, 
            adminReply: replyMessage,
            updatedAt: new Date().toISOString()
          } : item
        )
      );

      toast.success('Reply sent successfully');
      setShowReplyForm(false);
      setReplyingItem(null);
      setReplyMessage('');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      const updates = {
        status: editingItem.status,
        adminNotes: editingItem.adminNotes || ''
      };
      
      await updateItemStatus(editingItem._id, updates);
      setEditingItem(null);
    }
  };

  const handleEditChange = (field, value) => {
    setEditingItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.busNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const formatDateForExport = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'reported': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'found': return 'bg-green-900/30 text-green-400 border-green-700';
      case 'claimed': return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'returned': return 'bg-purple-900/30 text-purple-400 border-purple-700';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
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

  // Clean text for PDF generation
  const cleanTextForPDF = (text) => {
    if (!text) return '';
    return text
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^\w\s.,!?\-():;/@#$%&*+=]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Direct PDF Download with jsPDF
  const generatePDFReport = async () => {
    if (!exportDateRange.startDate || !exportDateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const startDate = new Date(exportDateRange.startDate);
    const endDate = new Date(exportDateRange.endDate);
    
    if (startDate > endDate) {
      toast.error('Start date cannot be after end date');
      return;
    }

    // Filter items within date range
    const itemsInRange = lostItems.filter(item => {
      const itemDate = new Date(item.dateLost);
      return itemDate >= startDate && itemDate <= endDate;
    });

    if (itemsInRange.length === 0) {
      toast.error('No items found in the selected date range');
      return;
    }

    setExporting(true);

    try {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `BusZone Lost & Found Report - ${exportDateRange.startDate} to ${exportDateRange.endDate}`,
        subject: 'Lost and Found Items Report',
        author: 'BusZone Admin System',
        keywords: 'lost, found, items, report, buszone'
      });

      // Add header
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, 210, 25, 'F');
      
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('BUSZONE', 105, 12, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Lost & Found Report', 105, 18, { align: 'center' });

      // Report information
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date Range: ${formatDateForExport(exportDateRange.startDate)} to ${formatDateForExport(exportDateRange.endDate)}`, 14, 35);
      
      const generatedOn = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${generatedOn}`, 14, 40);
      doc.text(`Total Items: ${itemsInRange.length}`, 14, 45);

      // Summary section
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text('REPORT SUMMARY', 14, 55);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 57, 196, 57);

      const summaryData = [
        { label: 'Reported', value: itemsInRange.filter(item => item.status === 'Reported').length, color: [243, 156, 18] },
        { label: 'Found', value: itemsInRange.filter(item => item.status === 'Found').length, color: [39, 174, 96] },
        { label: 'Claimed', value: itemsInRange.filter(item => item.status === 'Claimed').length, color: [52, 152, 219] },
        { label: 'Returned', value: itemsInRange.filter(item => item.status === 'Returned').length, color: [155, 89, 182] }
      ];

      let yPos = 65;
      summaryData.forEach((item, index) => {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`${item.label}:`, 20, yPos);
        
        doc.setTextColor(item.color[0], item.color[1], item.color[2]);
        doc.text(item.value.toString(), 45, yPos);
        
        yPos += 5;
      });

      // Items table
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text('LOST ITEMS DETAILS', 14, yPos);
      doc.line(14, yPos + 2, 196, yPos + 2);

      // Prepare table data
      const tableData = itemsInRange.map(item => [
        cleanTextForPDF(item.itemName).substring(0, 40) + (item.itemName.length > 40 ? '...' : ''),
        cleanTextForPDF(item.description || 'No description').substring(0, 60) + ((item.description || '').length > 60 ? '...' : ''),
        cleanTextForPDF(item.busNumber),
        formatDateForExport(item.dateLost),
        item.status,
        item.reportedBy
      ]);

      // Add table
      autoTable(doc, {
        startY: yPos + 10,
        head: [['Item Name', 'Description', 'Bus No.', 'Date Lost', 'Status', 'Reported By']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [40, 40, 40],
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold' },
          1: { cellWidth: 50 },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20, fontStyle: 'bold' },
          5: { cellWidth: 20 }
        },
        margin: { top: 5 },
        didDrawPage: function(data) {
          // Footer on each page
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const pageCount = doc.internal.getNumberOfPages();
          
          doc.text(
            `BusZone Lost & Found Management System | Confidential Report | Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          
          doc.text(
            `Generated on ${generatedOn}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 5
          );
        }
      });

      // Save the PDF directly
      const filename = `BusZone-Lost-Found-Report-${exportDateRange.startDate}-to-${exportDateRange.endDate}.pdf`;
      doc.save(filename);
      
      toast.success('PDF report downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      setExporting(false);
      setShowExportModal(false);
      setExportDateRange({ startDate: '', endDate: '' });
    }
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Lost & Found Management</h1>
        <p className="text-slate-400">Manage and track lost items from bus journeys</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Statistics and Search */}
        <div className="lg:col-span-1 space-y-6">
          {/* Statistics Cards */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Report Log Item</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Items</span>
                <span className="font-semibold text-white">{stats.total}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reported</span>
                <span className="font-semibold text-yellow-400">{stats.reported}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Found</span>
                <span className="font-semibold text-green-400">{stats.found}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Claimed</span>
                <span className="font-semibold text-blue-400">{stats.claimed}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Returned</span>
                <span className="font-semibold text-purple-400">{stats.returned}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReportForm(true)}
              className="w-full mt-6 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Lost Item
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search items, descriptions, or bus numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="found">Found</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <button
                onClick={fetchLostItems}
                className="w-full flex items-center justify-center px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Items List */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Items Found</h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No items match your search criteria" 
                    : "No lost items have been reported yet"}
                </p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Report Your First Lost Item
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredItems.map((item) => (
                  <div key={item._id} className="p-6 hover:bg-slate-750 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{item.itemName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <p className="text-slate-400 mb-3">{item.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
                          <div className="flex items-center">
                            <Bus className="w-4 h-4 mr-2 text-blue-400" />
                            <span>Bus: {item.busNumber}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            <span>Lost: {formatDate(item.dateLost)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            {item.reportedBy === 'Admin' ? (
                              <Shield className="w-4 h-4 mr-2 text-purple-400" />
                            ) : (
                              <User className="w-4 h-4 mr-2 text-blue-400" />
                            )}
                            <span>{item.reportedBy === 'User' ? 'Reported by User' : 'Reported by Admin'}</span>
                          </div>
                        </div>

                        {item.user && (
                          <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-300">
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-2 text-blue-400" />
                                <span>{item.user.firstName} {item.user.lastName}</span>
                              </div>
                              {item.user.email && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2 text-blue-400" />
                                  <span>{item.user.email}</span>
                                </div>
                              )}
                              {item.user.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2 text-blue-400" />
                                  <span>{item.user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {item.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                            <div className="flex items-start">
                              <MessageSquare className="w-4 h-4 mr-2 text-blue-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-300 mb-1">Admin Notes:</p>
                                <p className="text-sm text-slate-300">{item.adminNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {item.adminReply && (
                          <div className="mt-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                            <div className="flex items-start">
                              <Reply className="w-4 h-4 mr-2 text-green-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-300 mb-1">Admin Reply:</p>
                                <p className="text-sm text-slate-300">{item.adminReply}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - View, Admin Reply, Edit, Delete */}
                    <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-700">
                      {/* View Button */}
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1 text-slate-400 hover:text-white transition-colors flex items-center text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      
                      {/* Admin Reply Button */}
                      <button
                        onClick={() => {
                          setReplyingItem(item);
                          setReplyMessage(item.adminReply || '');
                          setShowReplyForm(true);
                        }}
                        className="px-3 py-1 text-green-400 hover:text-green-300 transition-colors flex items-center text-sm"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Admin Reply
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingItem({...item})}
                        className="px-3 py-1 text-blue-400 hover:text-blue-300 transition-colors flex items-center text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="px-3 py-1 text-red-400 hover:text-red-300 transition-colors flex items-center text-sm"
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
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Export Lost & Found Report</h2>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportDateRange({ startDate: '', endDate: '' });
                }}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Date Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exportDateRange.startDate}
                      onChange={(e) => setExportDateRange(prev => ({ 
                        ...prev, 
                        startDate: e.target.value 
                      }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exportDateRange.endDate}
                      onChange={(e) => setExportDateRange(prev => ({ 
                        ...prev, 
                        endDate: e.target.value 
                      }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-300 text-sm">
                  <strong>Note:</strong> Report will include items from selected date range
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportDateRange({ startDate: '', endDate: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePDFReport}
                  disabled={exporting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Downloading PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reply Modal */}
      {showReplyForm && replyingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Admin Reply</h2>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyingItem(null);
                  setReplyMessage('');
                }}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Replying to:</h3>
              <p className="text-slate-300">{replyingItem.itemName}</p>
              <p className="text-slate-400 text-sm">Bus: {replyingItem.busNumber} | Status: {replyingItem.status}</p>
            </div>

            <form onSubmit={handleAdminReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reply Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your reply message here..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyingItem(null);
                    setReplyMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Lost Item Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Report Lost Item</h2>
              <button
                onClick={() => setShowReportForm(false)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Black backpack, Red umbrella"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe the item in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date Lost
                </label>
                <input
                  type="date"
                  value={formData.dateLost}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateLost: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bus Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.busNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, busNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., BZ-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Reported">Reported</option>
                  <option value="Found">Found</option>
                  <option value="Claimed">Claimed</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any admin notes..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? 'Reporting...' : 'Report Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Update Lost Item</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingItem.itemName}
                  disabled
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={editingItem.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Reported">Reported</option>
                  <option value="Found">Found</option>
                  <option value="Claimed">Claimed</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={editingItem.adminNotes || ''}
                  onChange={(e) => handleEditChange('adminNotes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add notes about the item status, location, condition, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Item Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-semibold text-white">{selectedItem.itemName}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>

              {selectedItem.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Description</h4>
                  <p className="text-slate-300 bg-slate-700 p-3 rounded-lg">{selectedItem.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Bus Information</h4>
                  <div className="bg-slate-700 p-3 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-white">Bus: {selectedItem.busNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-white">Date Lost: {formatDate(selectedItem.dateLost)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Report Information</h4>
                  <div className="bg-slate-700 p-3 rounded-lg space-y-2">
                    <div className="flex items-center">
                      {selectedItem.reportedBy === 'Admin' ? (
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                      ) : (
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                      )}
                      <span className="text-white">Reported By: {selectedItem.reportedBy === 'User' ? 'Reported by User' : 'Reported by User'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-white">Reported: {formatDate(selectedItem.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedItem.user && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">User Contact Information</h4>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-300">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        <span>{selectedItem.user.firstName} {selectedItem.user.lastName}</span>
                      </div>
                      {selectedItem.user.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-400" />
                          <span>{selectedItem.user.email}</span>
                        </div>
                      )}
                      {selectedItem.user.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-400" />
                          <span>{selectedItem.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.adminNotes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Admin Notes</h4>
                  <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-lg">
                    <p className="text-blue-300">{selectedItem.adminNotes}</p>
                  </div>
                </div>
              )}

              {selectedItem.adminReply && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Admin Reply</h4>
                  <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
                    <p className="text-green-300">{selectedItem.adminReply}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setReplyingItem(selectedItem);
                  setReplyMessage(selectedItem.adminReply || '');
                  setShowReplyForm(true);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
              >
                <Reply className="w-4 h-4 mr-2" />
                Admin Reply
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setEditingItem({...selectedItem});
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLostFound;