import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, Bell, Send, BarChart3, RefreshCw, Eye, Filter, Download, FileText, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    deliveryChannel: 'in_app',
    isActive: true,
    isPublic: false,
    expiresAt: '',
    sendAt: '',
    status: 'draft'
  });

  const [formErrors, setFormErrors] = useState({});
  const [dateErrors, setDateErrors] = useState({});

  // Export Modal Component
  const ExportModal = ({ show, onClose, format, setFormat, itemCount, onExport, loading }) => {
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
            <Calendar className="inline w-4 h-4 mr-1" /> Report will include {itemCount} notifications
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

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchTerm, notifications, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const notificationsData = response.data.data || response.data.notifications || response.data || [];
      
      // Sort by creation date, newest first
      const sortedData = notificationsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(sortedData);
      setFilteredNotifications(sortedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      
      // Fallback to mock data if API fails
      const mockNotifications = [
        {
          _id: '1',
          title: 'hh',
          message: 'Test notification',
          type: 'general',
          targetAudience: 'all',
          deliveryChannel: 'in_app',
          isActive: true,
          status: 'active',
          expiresAt: '2025-09-11',
          createdAt: '2025-09-10'
        },
        {
          _id: '2',
          title: 'jiu',
          message: 'Another notification',
          type: '',
          targetAudience: '',
          deliveryChannel: '',
          isActive: false,
          status: 'draft',
          expiresAt: '',
          createdAt: '2025-09-15'
        },
        {
          _id: '3',
          title: 'mkjfvor',
          message: 'Package notification',
          type: 'package',
          targetAudience: 'all',
          deliveryChannel: 'in_app',
          isActive: true,
          status: 'scheduled',
          expiresAt: '2025-09-20',
          createdAt: '2025-09-18'
        }
      ];
      
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchNotifications();
    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/admin/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Create basic stats if API fails
      setStats({
        totalNotifications: notifications.length,
        readRate: 65,
        activeNotifications: notifications.filter(n => n.isActive).length,
        scheduled: notifications.filter(n => n.status === 'scheduled').length
      });
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.message && notification.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNotifications(filtered);
  };

  const validateDates = () => {
    const errors = {};
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    
    // Validate expiry date
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate <= now) {
        errors.expiresAt = 'Expiry date must be in the future';
      }
    }
    
    // Validate schedule send date
    if (formData.sendAt) {
      const sendDate = new Date(formData.sendAt);
      if (sendDate <= now) {
        errors.sendAt = 'Schedule send date must be in the future';
      }
    }
    
    // Validate that schedule send is before expiry (if both are set)
    if (formData.sendAt && formData.expiresAt) {
      const sendDate = new Date(formData.sendAt);
      const expiryDate = new Date(formData.expiresAt);
      if (sendDate >= expiryDate) {
        errors.sendAt = 'Schedule send date must be before expiry date';
      }
    }
    
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    if (!formData.type) {
      errors.type = 'Type is required';
    }
    
    if (!formData.targetAudience) {
      errors.targetAudience = 'Target audience is required';
    }
    
    if (!formData.deliveryChannel) {
      errors.deliveryChannel = 'Delivery channel is required';
    }
    
    setFormErrors(errors);
    const dateValidation = validateDates();
    return Object.keys(errors).length === 0 && dateValidation;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      // Prepare data for API - match your database schema exactly
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetAudience: formData.targetAudience,
        deliveryChannel: formData.deliveryChannel,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        status: formData.status,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        sendAt: formData.sendAt ? new Date(formData.sendAt).toISOString() : null,
        // Add any additional fields your backend expects
        isSeasonal: false, // Default value
        readStatus: false, // Default value
        clickCount: 0, // Default value
      };

      const token = localStorage.getItem('token');
      
      if (editingNotification) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${editingNotification._id}`,
          notificationData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        toast.success('Notification updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          notificationData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        toast.success('Notification created successfully');
      }
      resetForm();
      refreshData();
    } catch (error) {
      console.error('Error saving notification:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data || 
                          'Failed to save notification';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'general',
      targetAudience: notification.targetAudience || 'all',
      deliveryChannel: notification.deliveryChannel || 'in_app',
      isActive: notification.isActive !== undefined ? notification.isActive : true,
      isPublic: notification.isPublic || false,
      status: notification.status || 'draft',
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
      sendAt: notification.sendAt ? new Date(notification.sendAt).toISOString().slice(0, 16) : '',
    });
    setFormErrors({});
    setDateErrors({});
    setShowForm(true);
    
    // Show warning if notification is already sent
    if (notification.status === 'sent') {
      toast('⚠️ This notification has already been sent. Changes will affect future visibility.', {
        duration: 4000,
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification deleted successfully');
      refreshData();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const sendNotification = async (id) => {
    if (!window.confirm('Are you sure you want to send this notification? It will be visible to the target audience.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification sent successfully');
      refreshData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const bulkUpdateStatus = async (notificationIds, newStatus) => {
    if (!window.confirm(`Are you sure you want to update ${notificationIds.length} notifications to ${newStatus} status?`)) return;
    
    try {
      console.log(`Updating ${notificationIds.length} notifications to status: ${newStatus}`);
      const token = localStorage.getItem('token');
      const promises = notificationIds.map(id => {
        console.log(`Updating notification ${id} to status ${newStatus}`);
        return axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`, 
          { status: newStatus }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });
      
      await Promise.all(promises);
      toast.success(`${notificationIds.length} notifications updated successfully`);
      refreshData();
    } catch (error) {
      console.error('Error bulk updating notifications:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleDateChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear previous date errors for this field
    setDateErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    // Validate dates in real-time
    setTimeout(() => {
      validateDates();
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'general',
      targetAudience: 'all',
      deliveryChannel: 'in_app',
      isActive: true,
      isPublic: false,
      expiresAt: '',
      sendAt: '',
      status: 'draft'
    });
    setFormErrors({});
    setDateErrors({});
    setEditingNotification(null);
    setShowForm(false);
  };


  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const notification = notifications.find(n => n._id === id);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        { isActive: !notification.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status updated successfully');
      refreshData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportNotifications = () => {
    const data = filteredNotifications.map(notification => ({
      Title: notification.title,
      Message: notification.message,
      Type: notification.type,
      Target: notification.targetAudience,
      Channel: notification.deliveryChannel,
      Status: notification.isActive ? 'Active' : 'Inactive',
      'Expiry Date': notification.expiresAt ? new Date(notification.expiresAt).toLocaleDateString() : 'Never',
      'Created At': new Date(notification.createdAt).toLocaleString()
    }));

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notifications.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(','));
    return [headers, ...rows].join('\n');
  };

  const exportPDF = (list) => {
    if (!list || list.length === 0) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table layout
    
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
    doc.text('Notification Management Report', pageWidth / 2, margin + 25, { align: 'center' });
    
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
    const totalNotifications = list.length;
    const activeNotifications = list.filter(n => n.isActive).length;
    const draftNotifications = list.filter(n => n.status === 'draft').length;
    const sentNotifications = list.filter(n => n.status === 'sent').length;
    const scheduledNotifications = list.filter(n => n.status === 'scheduled').length;
    
    // Statistics boxes
    const availableWidth = pageWidth - (margin * 2);
    const boxCount = 5;
    const boxSpacing = 6;
    const boxWidth = Math.min(30, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
    const boxHeight = 25;
    let currentX = margin;
    
    // Total Notifications box
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(totalNotifications.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Total', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Active Notifications box
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(activeNotifications.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Active', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Draft Notifications box
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(draftNotifications.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Draft', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Sent Notifications box
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(sentNotifications.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Sent', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Scheduled Notifications box
    doc.setFillColor(14, 165, 233);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(scheduledNotifications.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Scheduled', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    // Status distribution table
    const statusTableY = statsY + 50;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Status Distribution', margin, statusTableY);
    
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ['Active', activeNotifications.toString(), `${((activeNotifications/totalNotifications)*100).toFixed(1)}%`],
      ['Draft', draftNotifications.toString(), `${((draftNotifications/totalNotifications)*100).toFixed(1)}%`],
      ['Sent', sentNotifications.toString(), `${((sentNotifications/totalNotifications)*100).toFixed(1)}%`],
      ['Scheduled', scheduledNotifications.toString(), `${((scheduledNotifications/totalNotifications)*100).toFixed(1)}%`]
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

    // Add new page for notification details table
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
    
    // Main notification data table
    const tableStartY = margin + 30;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Notification Details', margin, tableStartY);
    
    // Prepare table data
    const tableColumns = [
      { header: 'Title', dataKey: 'title', width: 50 },
      { header: 'Type', dataKey: 'type', width: 20 },
      { header: 'Target', dataKey: 'target', width: 20 },
      { header: 'Channel', dataKey: 'channel', width: 20 },
      { header: 'Status', dataKey: 'status', width: 20 },
      { header: 'Created', dataKey: 'created', width: 25 }
    ];
    
    const tableRows = list.map((n, index) => ({
      title: n.title?.substring(0, 30) + (n.title?.length > 30 ? '...' : ''),
      type: n.type?.charAt(0).toUpperCase() + n.type?.slice(1) || 'General',
      target: n.targetAudience?.charAt(0).toUpperCase() + n.targetAudience?.slice(1) || 'All',
      channel: n.deliveryChannel?.charAt(0).toUpperCase() + n.deliveryChannel?.slice(1) || 'In-App',
      status: n.isActive ? 'Active' : 'Inactive',
      created: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'N/A'
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
        title: { halign: 'left', fontSize: 8, cellWidth: 50, overflow: 'linebreak' },
        type: { halign: 'center', fontSize: 8, cellWidth: 20 },
        target: { halign: 'center', fontSize: 8, cellWidth: 20 },
        channel: { halign: 'center', fontSize: 8, cellWidth: 20 },
        status: { halign: 'center', fontSize: 8, cellWidth: 20 },
        created: { halign: 'center', fontSize: 7, cellWidth: 25 }
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
        doc.text('BusZone+ Notification Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
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
    const fileName = `BusZone_NotificationReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
    doc.save(fileName);
    toast.success("PDF report generated successfully!");
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      if (exportFormat === 'csv') {
        exportNotifications();
      } else if (exportFormat === 'pdf') {
        exportPDF(filteredNotifications);
      }
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'general', label: 'General', color: 'bg-gray-500' },
    { value: 'promotional', label: 'Promotional', color: 'bg-purple-500' },
    { value: 'alert', label: 'Alert', color: 'bg-red-500' },
    { value: 'update', label: 'Update', color: 'bg-blue-500' },
    { value: 'package', label: 'Package', color: 'bg-amber-500' },
  ];

  const userTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'passengers', label: 'Passengers' },
    { value: 'drivers', label: 'Drivers' },
    { value: 'staff', label: 'Staff' }
  ];

  const statusTypes = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
    { value: 'sent', label: 'Sent', color: 'bg-purple-500' },
  ];

  const deliveryChannels = [
    { value: 'in_app', label: 'In-App' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notification' },
    { value: 'all', label: 'All Channels' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      case 'draft':
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
      case 'scheduled':
        return <div className="w-3 h-3 rounded-full bg-blue-500"></div>;
      case 'sent':
        return <div className="w-3 h-3 rounded-full bg-purple-500"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Bell className="h-6 w-6 mr-2 text-blue-600" />
          Notification Management
          <span className="ml-3 bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white hover:bg-blue-50 text-gray-700 border border-blue-300 px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-white hover:bg-blue-50 text-gray-700 border border-blue-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Notification</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl text-gray-800 font-bold">{stats?.totalNotifications || notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Notifications</p>
              <p className="text-2xl text-gray-800 font-bold">{stats?.activeNotifications || notifications.filter(n => n.isActive).length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent Notifications</p>
              <p className="text-2xl text-gray-800 font-bold">{notifications.filter(n => n.status === 'sent').length}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <Send className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft Notifications</p>
              <p className="text-2xl text-gray-800 font-bold">{notifications.filter(n => n.status === 'draft').length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Bell className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box - Right Side */}
          <div className="flex justify-end">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusTypes.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Bulk Actions - Below Search */}
        <div className="mt-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Bulk Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const draftNotifications = filteredNotifications.filter(n => n.status === 'draft');
                  if (draftNotifications.length > 0) {
                    bulkUpdateStatus(draftNotifications.map(n => n._id), 'sent');
                  } else {
                    toast('No draft notifications found');
                  }
                }}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                Send All Drafts
              </button>
              <button
                onClick={() => {
                  const sentNotifications = filteredNotifications.filter(n => n.status === 'sent');
                  if (sentNotifications.length > 0) {
                    bulkUpdateStatus(sentNotifications.map(n => n._id), 'draft');
                  } else {
                    toast('No sent notifications found');
                  }
                }}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
              >
                Revert to Draft
              </button>
              <button
                onClick={() => {
                  const activeNotifications = filteredNotifications.filter(n => n.isActive);
                  if (activeNotifications.length > 0) {
                    bulkUpdateStatus(activeNotifications.map(n => n._id), 'draft');
                  } else {
                    toast('No active notifications found');
                  }
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                Deactivate All
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/test-visibility?role=passenger&userType=passenger`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('Test visibility result:', response.data);
                    toast.success('Check console for visibility test results');
                  } catch (error) {
                    console.error('Test visibility error:', error);
                    toast.error('Failed to test visibility');
                  }
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Test Visibility
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingNotification ? 'Edit Notification' : 'Create New Notification'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border ${formErrors.title ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter notification title"
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border ${formErrors.type ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 bg-white border ${formErrors.message ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter notification message"
              />
              {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border ${formErrors.targetAudience ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {userTypes.map(userType => (
                    <option key={userType.value} value={userType.value}>{userType.label}</option>
                  ))}
                </select>
                {formErrors.targetAudience && <p className="text-red-500 text-xs mt-1">{formErrors.targetAudience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channel *</label>
                <select
                  value={formData.deliveryChannel}
                  onChange={(e) => setFormData({ ...formData, deliveryChannel: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border ${formErrors.deliveryChannel ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {deliveryChannels.map(channel => (
                    <option key={channel.value} value={channel.value}>{channel.label}</option>
                  ))}
                </select>
                {formErrors.deliveryChannel && <p className="text-red-500 text-xs mt-1">{formErrors.deliveryChannel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleDateChange('expiresAt', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full px-3 py-2 bg-white border ${dateErrors.expiresAt ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {dateErrors.expiresAt ? (
                  <p className="text-red-500 text-xs mt-1">{dateErrors.expiresAt}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">Must be a future date and time</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Send (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.sendAt}
                  onChange={(e) => handleDateChange('sendAt', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full px-3 py-2 bg-white border ${dateErrors.sendAt ? 'border-red-500' : 'border-blue-300'} rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {dateErrors.sendAt ? (
                  <p className="text-red-500 text-xs mt-1">{dateErrors.sendAt}</p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">Must be a future date and time</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Notification
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Public Notification
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingNotification ? 'Update' : 'Create'} Notification</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Notifications List
          </h3>
          <div className="text-sm text-gray-600">
            Showing {filteredNotifications.length} of {notifications.length} total
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">TITLE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">TYPE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">TARGET</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">CHANNEL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">EXPRESS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                      <p className="text-sm mt-2">Try adjusting your search or filter terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredNotifications.map(notification => {
                  const typeConfig = notificationTypes.find(t => t.value === notification.type);
                  const statusConfig = statusTypes.find(s => s.value === notification.status);
                  const channelConfig = deliveryChannels.find(c => c.value === notification.deliveryChannel);
                  
                  return (
                    <tr key={notification._id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">
                          <strong>{notification.title}</strong>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {typeConfig ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color} text-white`}>
                            {typeConfig.label}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {userTypes.find(t => t.value === notification.targetAudience)?.label || notification.targetAudience || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {channelConfig?.label || notification.deliveryChannel || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(notification.status)}
                          <select
                            value={notification.status || 'draft'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus !== notification.status) {
                                if (window.confirm(`Change status from ${notification.status} to ${newStatus}?`)) {
                                  bulkUpdateStatus([notification._id], newStatus);
                                }
                              }
                            }}
                            className="text-xs bg-white border border-blue-300 rounded px-2 py-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(notification.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(notification)}
                            className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {notification.status !== 'sent' && (
                            <button
                              onClick={() => sendNotification(notification._id)}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100"
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => toggleStatus(notification._id)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                            title={notification.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        format={exportFormat}
        setFormat={setExportFormat}
        itemCount={filteredNotifications.length}
        onExport={handleExport}
        loading={exportLoading}
      />
    </div>
  );
};

export default AdminNotificationPanel;