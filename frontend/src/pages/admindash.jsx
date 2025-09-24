// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import BusManagement from './BusManagement';
import PaymentManagement from './PaymentManagement'; // Add this import
import AttendanceManagement from '../components/AttendanceManagement'; 
import AdminNotificationPanel from './AdminNotificationPanel';
import {
  Users,
  Bus,
  Bell,
  MessageSquare,
  Search,
  Calendar,
  Wrench,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  MoreVertical,
  UserCheck,
  Clock,
  Menu,
  X,
  Home,
  LogOut,
  ChevronDown,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Send,
  XCircle,
  Edit,
  Trash2,
  User,
  Package,
  Filter,
  RefreshCw,
  FileText,
  MapPin,
  Phone,
  Mail,
  Eye,
  Save,
  AlertCircle,
  Shield,
  Download,
  Printer,
  CreditCard,
  DollarSign
} from 'lucide-react';

import toast from 'react-hot-toast';
import axios from 'axios';
import MaintenanceManagement from './MaintenanceManagement';
import AllBookings from './allbookings';

// Lost & Found Component with Report Generation
const AdminLostFoundContent = () => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportData, setReportData] = useState(null);

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
    
    // Setup real-time polling for updates
    const interval = setInterval(fetchLostItems, 5000);
    return () => clearInterval(interval);
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
        // Enhanced mock data with proper permission handling
        const mockData = [
          {
            _id: '1',
            itemName: 'Black Backpack',
            description: 'Black backpack with laptop inside. Has a blue keychain attached.',
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
            adminReply: false,
            canEdit: true,
            canDelete: true,
            createdAt: new Date('2024-09-20').toISOString(),
            updatedAt: new Date('2024-09-20').toISOString()
          },
          {
            _id: '2',
            itemName: 'Red Umbrella',
            description: 'Red compact umbrella, brand new condition with black handle',
            dateLost: new Date('2024-09-19').toISOString(),
            busNumber: 'BZ-002',
            status: 'Found',
            reportedBy: 'Admin',
            adminNotes: 'Found under seat 15A, kept in office storage room',
            adminReply: true,
            canEdit: true,
            canDelete: true,
            createdAt: new Date('2024-09-19').toISOString(),
            updatedAt: new Date('2024-09-19').toISOString()
          },
          {
            _id: '3',
            itemName: 'Samsung Galaxy Phone',
            description: 'Samsung Galaxy S21, black color with cracked screen protector',
            dateLost: new Date('2024-09-18').toISOString(),
            busNumber: 'BZ-003',
            status: 'Found',
            reportedBy: 'User',
            user: { 
              _id: 'user2', 
              firstName: 'Jane', 
              lastName: 'Smith', 
              email: 'jane@example.com',
              phone: '+94 777654321'
            },
            booking: { 
              _id: 'booking2', 
              bookingReference: 'BZ-2024-002',
              route: 'Galle - Colombo'
            },
            adminNotes: 'Phone found by cleaning staff, battery dead',
            adminReply: true,
            canEdit: false,
            canDelete: false,
            createdAt: new Date('2024-09-18').toISOString(),
            updatedAt: new Date('2024-09-18').toISOString()
          },
          {
            _id: '4',
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
            adminReply: true,
            canEdit: false,
            canDelete: false,
            createdAt: new Date('2024-09-17').toISOString(),
            updatedAt: new Date('2024-09-17').toISOString()
          }
        ];
        setLostItems(mockData);
        toast.error('Using demo data - Backend connection failed');
        return;
      }

      const data = await response.json();
      setLostItems(data.lostItems || []);
    } catch (error) {
      console.error('Error fetching lost items:', error);
      toast.error('Failed to load lost items');
      setLostItems([]);
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
        // Demo success
        const newItem = {
          _id: Date.now().toString(),
          ...formData,
          dateLost: formData.dateLost || new Date().toISOString(),
          reportedBy: 'Admin',
          adminReply: !!formData.adminNotes,
          canEdit: true,
          canDelete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setLostItems(prev => [newItem, ...prev]);
        toast.success('Lost item reported successfully (demo mode)');
      } else {
        const data = await response.json();
        setLostItems(prev => [data.lostItem, ...prev]);
        toast.success('Lost item reported successfully');
      }

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
      // Demo success for offline mode
      const newItem = {
        _id: Date.now().toString(),
        ...formData,
        dateLost: formData.dateLost || new Date().toISOString(),
        reportedBy: 'Admin',
        adminReply: !!formData.adminNotes,
        canEdit: true,
        canDelete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLostItems(prev => [newItem, ...prev]);
      toast.success('Lost item reported successfully (offline mode)');
      
      setFormData({
        itemName: '',
        description: '',
        dateLost: '',
        busNumber: '',
        status: 'Reported',
        adminNotes: ''
      });
      setShowReportForm(false);
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

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to update item');
      }

      // Update local state with permission changes
      setLostItems(prev =>
        prev.map(item =>
          item._id === itemId ? { 
            ...item, 
            ...updates,
            adminReply: !!(updates.adminNotes || item.adminNotes),
            updatedAt: new Date().toISOString(),
            // Lock user permissions when admin replies
            canEdit: item.reportedBy === 'User' && updates.adminNotes ? false : item.canEdit,
            canDelete: item.reportedBy === 'User' && updates.adminNotes ? false : item.canDelete
          } : item
        )
      );
      
      toast.success('Item updated successfully');

      // Broadcast update to other components (simulate real-time)
      window.dispatchEvent(new CustomEvent('lostItemUpdated', { 
        detail: { itemId, updates, timestamp: new Date().toISOString() } 
      }));

    } catch (error) {
      console.error('Error updating item:', error);
      // Update local state anyway for demo
      setLostItems(prev =>
        prev.map(item =>
          item._id === itemId ? { 
            ...item, 
            ...updates,
            adminReply: !!(updates.adminNotes || item.adminNotes),
            updatedAt: new Date().toISOString(),
            canEdit: item.reportedBy === 'User' && updates.adminNotes ? false : item.canEdit,
            canDelete: item.reportedBy === 'User' && updates.adminNotes ? false : item.canDelete
          } : item
        )
      );
      toast.success('Item updated successfully (demo mode)');

      // Broadcast update even in demo mode
      window.dispatchEvent(new CustomEvent('lostItemUpdated', { 
        detail: { itemId, updates, timestamp: new Date().toISOString() } 
      }));
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this lost item report? This action cannot be undone.')) {
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

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete item');
      }

      setLostItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Lost item report deleted successfully');

      // Broadcast deletion to other components
      window.dispatchEvent(new CustomEvent('lostItemDeleted', { 
        detail: { itemId, timestamp: new Date().toISOString() } 
      }));

    } catch (error) {
      console.error('Error deleting item:', error);
      setLostItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Lost item report deleted successfully (demo mode)');

      // Broadcast deletion even in demo mode
      window.dispatchEvent(new CustomEvent('lostItemDeleted', { 
        detail: { itemId, timestamp: new Date().toISOString() } 
      }));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      const updates = {
        status: editingItem.status,
        adminNotes: editingItem.adminNotes
      };
      
      updateItemStatus(editingItem._id, updates);
      setEditingItem(null);
    }
  };

  // Generate Lost & Found Report Function
  const generateLostFoundReport = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter items from the last week
    const recentItems = lostItems.filter(item => 
      new Date(item.createdAt) >= oneWeekAgo
    );

    // Calculate statistics
    const totalItems = recentItems.length;
    const reportedCount = recentItems.filter(item => item.status === 'Reported').length;
    const foundCount = recentItems.filter(item => item.status === 'Found').length;
    const claimedCount = recentItems.filter(item => item.status === 'Claimed').length;
    const returnedCount = recentItems.filter(item => item.status === 'Returned').length;
    
    // Most common items
    const itemCounts = recentItems.reduce((acc, item) => {
      acc[item.itemName] = (acc[item.itemName] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonItems = Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Bus statistics
    const busCounts = recentItems.reduce((acc, item) => {
      acc[item.busNumber] = (acc[item.busNumber] || 0) + 1;
      return acc;
    }, {});

    const busWithMostItems = Object.entries(busCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    // Resolution time analysis
    const resolvedItems = recentItems.filter(item => 
      ['Found', 'Claimed', 'Returned'].includes(item.status)
    );
    
    const avgResolutionTime = resolvedItems.length > 0 
      ? resolvedItems.reduce((total, item) => {
          const reportedDate = new Date(item.createdAt);
          const resolvedDate = new Date(item.updatedAt);
          const diffTime = Math.abs(resolvedDate - reportedDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return total + diffDays;
        }, 0) / resolvedItems.length
      : 0;

    // Categorize items
    const categorizeItems = (items) => {
      const categories = {
        'Electronics': ['phone', 'laptop', 'tablet', 'charger', 'headphones', 'camera'],
        'Personal Items': ['wallet', 'bag', 'backpack', 'purse', 'keys', 'umbrella'],
        'Documents': ['passport', 'id', 'license', 'documents', 'books', 'notebook'],
        'Clothing': ['jacket', 'coat', 'hat', 'scarf', 'gloves', 'clothing'],
        'Others': []
      };

      const categoryCounts = {};

      items.forEach(item => {
        const itemName = item.itemName.toLowerCase();
        let categorized = false;

        for (const [category, keywords] of Object.entries(categories)) {
          if (keywords.some(keyword => itemName.includes(keyword))) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            categorized = true;
            break;
          }
        }

        if (!categorized) {
          categoryCounts['Others'] = (categoryCounts['Others'] || 0) + 1;
        }
      });

      return Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => ({ category, count }));
    };

    // Generate recommendations
    const generateRecommendations = (items, summary) => {
      const recommendations = [];

      if (summary.resolutionRate < 50) {
        recommendations.push({
          type: 'warning',
          message: 'Low resolution rate. Consider improving lost item tracking and communication with passengers.'
        });
      }

      if (summary.avgResolutionTime > 3) {
        recommendations.push({
          type: 'info',
          message: 'Average resolution time is high. Streamline the item return process.'
        });
      }

      const unresolvedCount = items.filter(item => 
        ['Reported', 'Found'].includes(item.status)
      ).length;

      if (unresolvedCount > 5) {
        recommendations.push({
          type: 'urgent',
          message: `High number of unresolved items (${unresolvedCount}). Prioritize follow-ups.`
        });
      }

      if (recommendations.length === 0) {
        recommendations.push({
          type: 'success',
          message: 'Good performance! Maintain current processes.'
        });
      }

      return recommendations;
    };

    const summary = {
      totalItems,
      reportedCount,
      foundCount,
      claimedCount,
      returnedCount,
      resolutionRate: totalItems > 0 ? ((returnedCount + claimedCount) / totalItems * 100).toFixed(1) : 0,
      avgResolutionTime: avgResolutionTime.toFixed(1)
    };

    // Create report data
    const report = {
      period: {
        start: oneWeekAgo.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        end: now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        days: 7
      },
      summary: summary,
      analysis: {
        mostCommonItems,
        busWithMostItems,
        topCategories: categorizeItems(recentItems)
      },
      recentActivity: recentItems
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),
      recommendations: generateRecommendations(recentItems, summary)
    };

    setReportData(report);
    setShowReportModal(true);
    toast.success('Weekly Lost & Found report generated successfully!');
  };

  // Print/Export Report
  const exportReport = () => {
    const printContent = document.getElementById('lost-found-report').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // Download as PDF
  const downloadPDF = () => {
    toast.success('PDF export functionality would be implemented with jsPDF library');
    // In a real implementation, you would use a library like jsPDF
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'reported': return 'text-yellow-400 bg-yellow-900/30';
      case 'found': return 'text-green-400 bg-green-900/30';
      case 'claimed': return 'text-blue-400 bg-blue-900/30';
      case 'returned': return 'text-purple-400 bg-purple-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'reported': return <AlertCircle className="w-4 h-4" />;
      case 'found': return <Eye className="w-4 h-4" />;
      case 'claimed': return <User className="w-4 h-4" />;
      case 'returned': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatistics = () => {
    const total = lostItems.length;
    const reported = lostItems.filter(item => item.status === 'Reported').length;
    const found = lostItems.filter(item => item.status === 'Found').length;
    const returned = lostItems.filter(item => item.status === 'Returned').length;
    const claimed = lostItems.filter(item => item.status === 'Claimed').length;

    return { total, reported, found, returned, claimed };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Lost & Found Management</h2>
          <p className="text-slate-400">Manage and track lost items from bus journeys</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* New Generate Report Button */}
          <button
            onClick={generateLostFoundReport}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Items</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Reported</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.reported}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Found</p>
              <p className="text-2xl font-bold text-green-400">{stats.found}</p>
            </div>
            <Eye className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Claimed</p>
              <p className="text-2xl font-bold text-blue-400">{stats.claimed}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Returned</p>
              <p className="text-2xl font-bold text-purple-400">{stats.returned}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items, descriptions, or bus numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Filter className="text-slate-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
          </select>
          
          <button
            onClick={fetchLostItems}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lost Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? "No items match your search criteria" 
                : "No lost items have been reported yet"}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{item.itemName}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 mb-3">{item.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-slate-300">
                      <Bus className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Bus: {item.busNumber}</span>
                    </div>
                    
                    <div className="flex items-center text-slate-300">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Lost: {formatDate(item.dateLost)}</span>
                    </div>
                    
                    <div className="flex items-center text-slate-300">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Reported: {formatDate(item.createdAt)}</span>
                    </div>

                    <div className="flex items-center text-sm text-slate-300">
                      {item.reportedBy === 'Admin' ? (
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                      ) : (
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                      )}
                      <span>
                        {item.reportedBy === 'User' ? 'By: User' : 'Reported by User'}
                      </span>
                    </div>
                  </div>

                  {item.user && (
                    <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
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
                      {item.booking && (
                        <div className="mt-2 flex items-center text-sm text-slate-300">
                          <FileText className="w-3 h-3 mr-2 text-blue-400" />
                          <span>Booking: {item.booking.bookingReference}</span>
                          {item.booking.route && <span className="ml-2">({item.booking.route})</span>}
                        </div>
                      )}
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                <button
                  onClick={() => setEditingItem(item)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={() => deleteItem(item._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Lost Item Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add any admin notes..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300"
                >
                  Report Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Lost Item</h2>
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setEditingItem(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add notes about the item status, location, condition, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Item Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-semibold text-white">{selectedItem.itemName}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(selectedItem.status)}`}>
                  {getStatusIcon(selectedItem.status)}
                  <span className="ml-1">{selectedItem.status}</span>
                </div>
              </div>

              {selectedItem.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Description</h4>
                  <p className="text-white bg-slate-700/50 p-3 rounded-lg">{selectedItem.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Bus Information</h4>
                  <div className="bg-slate-700/50 p-3 rounded-lg space-y-2">
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
                  <div className="bg-slate-700/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center">
                      {selectedItem.reportedBy === 'Admin' ? (
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                      ) : (
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                      )}
                      <span className="text-white">Reported By: {selectedItem.reportedBy}</span>
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
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-white">{selectedItem.user.firstName} {selectedItem.user.lastName}</span>
                      </div>
                      {selectedItem.user.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-400" />
                          <a href={`mailto:${selectedItem.user.email}`} className="text-blue-400 hover:text-blue-300">
                            {selectedItem.user.email}
                          </a>
                        </div>
                      )}
                      {selectedItem.user.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-400" />
                          <a href={`tel:${selectedItem.user.phone}`} className="text-blue-400 hover:text-blue-300">
                            {selectedItem.user.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    {selectedItem.booking && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-white">Booking Reference: {selectedItem.booking.bookingReference}</span>
                        </div>
                        {selectedItem.booking.route && (
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="text-white">Route: {selectedItem.booking.route}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedItem.adminNotes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Admin Notes</h4>
                  <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-lg">
                    <p className="text-white">{selectedItem.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setEditingItem(selectedItem);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost & Found Report Modal */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Lost & Found Weekly Report</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={exportReport}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div id="lost-found-report" className="space-y-6">
              {/* Report Header */}
              <div className="bg-slate-900 rounded-xl p-6 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Lost & Found Weekly Report</h1>
                <p className="text-slate-300">
                  Period: {reportData.period.start} to {reportData.period.end}
                </p>
                <p className="text-slate-400 text-sm">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Executive Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-700/30">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Total Items</h3>
                  <p className="text-3xl font-bold text-white">{reportData.summary.totalItems}</p>
                  <p className="text-blue-400 text-sm">Items reported this week</p>
                </div>
                
                <div className="bg-green-900/20 rounded-xl p-4 border border-green-700/30">
                  <h3 className="text-lg font-semibold text-green-300 mb-2">Resolution Rate</h3>
                  <p className="text-3xl font-bold text-white">{reportData.summary.resolutionRate}%</p>
                  <p className="text-green-400 text-sm">Successfully resolved</p>
                </div>
                
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-700/30">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Avg. Resolution</h3>
                  <p className="text-3xl font-bold text-white">{reportData.summary.avgResolutionTime} days</p>
                  <p className="text-purple-400 text-sm">Time to resolve items</p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-yellow-400 text-2xl font-bold">{reportData.summary.reportedCount}</div>
                    <div className="text-slate-400 text-sm">Reported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 text-2xl font-bold">{reportData.summary.foundCount}</div>
                    <div className="text-slate-400 text-sm">Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 text-2xl font-bold">{reportData.summary.claimedCount}</div>
                    <div className="text-slate-400 text-sm">Claimed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 text-2xl font-bold">{reportData.summary.returnedCount}</div>
                    <div className="text-slate-400 text-sm">Returned</div>
                  </div>
                </div>
              </div>

              {/* Top Items and Buses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Common Items */}
                <div className="bg-slate-900 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Most Common Items</h3>
                  <div className="space-y-3">
                    {reportData.analysis.mostCommonItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buses with Most Items */}
                <div className="bg-slate-900 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Buses with Most Lost Items</h3>
                  <div className="space-y-3">
                    {reportData.analysis.busWithMostItems.map(([bus, count], index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-300">Bus {bus}</span>
                        <span className="text-white font-semibold">{count} items</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Analysis */}
              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Item Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportData.analysis.topCategories.map((category, index) => (
                    <div key={index} className="text-center">
                      <div className="text-white text-xl font-bold">{category.count}</div>
                      <div className="text-slate-400 text-sm">{category.category}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {reportData.recommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      rec.type === 'urgent' ? 'bg-red-900/20 border border-red-700/30' :
                      rec.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-700/30' :
                      rec.type === 'info' ? 'bg-blue-900/20 border border-blue-700/30' :
                      'bg-green-900/20 border border-green-700/30'
                    }`}>
                      <p className="text-white">{rec.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {reportData.recentActivity.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700">
                      <div>
                        <span className="text-white">{item.itemName}</span>
                        <span className="text-slate-400 text-sm ml-2">- Bus {item.busNumber}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        item.status === 'Returned' ? 'bg-green-900/30 text-green-400' :
                        item.status === 'Found' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main AdminDashboard Component (Remains the same as your original code)
const AdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(null);
  const navigate = useNavigate();

  // Feedback section state
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState('');

  // Maintenance state
  const [maintenances, setMaintenances] = useState([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    busId: '',
    issue: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    estimatedCost: '',
    startDate: '',
    estimatedCompletionDate: ''
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalBuses: 48,
    activeBookings: 156,
    maintenanceRequests: 12,
    revenue: 1256000,
    occupancyRate: 78,
    totalIncome: 0, // Add this
    totalExpense: 0, // Add this
    netRevenue: 0 // Add this
  });

  // Refs for textareas to manage cursor position
  const textareaRefs = useRef({});

  // Backend URL with fallback
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch users
        const usersResponse = await fetch(`${BACKEND_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        
        // Fetch bus stats
        const busStatsResponse = await fetch(`${BACKEND_URL}/api/buses/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let busStats = { totalBuses: 0, availableBuses: 0, inServiceBuses: 0, maintenanceBuses: 0 };
        
        if (busStatsResponse.ok) {
          busStats = await busStatsResponse.json();
        }

        // Fetch payment statistics
        let paymentStats = { totalIncome: 0, totalExpense: 0, netRevenue: 0 };
        try {
          const paymentStatsResponse = await fetch(`${BACKEND_URL}/api/payments/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (paymentStatsResponse.ok) {
            const paymentData = await paymentStatsResponse.json();
            if (paymentData.success) {
              paymentStats = {
                totalIncome: paymentData.income || 0,
                totalExpense: paymentData.expense || 0,
                netRevenue: paymentData.revenue || 0
              };
            }
          }
        } catch (paymentError) {
          console.error('Failed to fetch payment stats:', paymentError);
          // Use fallback calculation
          paymentStats = calculatePaymentStatsFromMockData();
        }
        
        if (!mounted) return;
        
        const arr = usersData || [];
        setTotalUsers(Array.isArray(arr) ? arr.length : (arr.count || 0));
        
        // Update dashboard stats with real data
        setDashboardStats(prev => ({
          ...prev,
          totalBuses: busStats.totalBuses,
          maintenanceRequests: busStats.maintenanceBuses,
          totalIncome: paymentStats.totalIncome,
          totalExpense: paymentStats.totalExpense,
          netRevenue: paymentStats.netRevenue
        }));
        
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (mounted) {
          setTotalUsers(0);
          // Set fallback payment stats
          const fallbackStats = calculatePaymentStatsFromMockData();
          setDashboardStats(prev => ({
            ...prev,
            totalIncome: fallbackStats.totalIncome,
            totalExpense: fallbackStats.totalExpense,
            netRevenue: fallbackStats.netRevenue
          }));
        }
      }
    };

    // Fallback function to calculate payment stats
    const calculatePaymentStatsFromMockData = () => {
      // Mock payment data for demonstration
      const mockPayments = [
        { paymentType: 'booking', amount: 50000, status: 'success' },
        { paymentType: 'booking', amount: 75000, status: 'success' },
        { paymentType: 'salary', amount: 25000, status: 'success' },
        { paymentType: 'maintenance', amount: 15000, status: 'success' },
        { paymentType: 'booking', amount: 60000, status: 'success' }
      ];

      const income = mockPayments
        .filter(p => p.paymentType === 'booking' && p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const expense = mockPayments
        .filter(p => (p.paymentType === 'salary' || p.paymentType === 'maintenance') && p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const netRevenue = income - expense;

      return { totalIncome: income, totalExpense: expense, netRevenue };
    };
    
    fetchDashboardData();
    return () => { mounted = false; };
  }, []);

  // Maintenance functions
  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenances();
    }
  }, [activeTab]);

  const fetchMaintenances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMaintenances(response.data.maintenances || []);
      setFilteredMaintenances(response.data.maintenances || []);
    } catch (error) {
      console.error('Failed to fetch maintenance records', error);
      // Mock data for demonstration
      const mockMaintenances = [
        {
          _id: '1',
          busId: 'BUS001',
          busDetails: { numberPlate: 'ABC123', busType: 'Standard' },
          issue: 'Engine Overheating',
          description: 'Engine temperature rising above normal levels during operation',
          priority: 'High',
          status: 'In Progress',
          estimatedCost: 1200,
          startDate: '2024-01-15',
          estimatedCompletionDate: '2024-01-20',
          actualCompletionDate: null,
          createdAt: new Date('2024-01-15').toISOString()
        },
        {
          _id: '2',
          busId: 'BUS002',
          busDetails: { numberPlate: 'DEF456', busType: 'Luxury' },
          issue: 'Brake System Check',
          description: 'Routine brake system maintenance and inspection',
          priority: 'Medium',
          status: 'Pending',
          estimatedCost: 800,
          startDate: '2024-01-18',
          estimatedCompletionDate: '2024-01-22',
          actualCompletionDate: null,
          createdAt: new Date('2024-01-18').toISOString()
        },
        {
          _id: '3',
          busId: 'BUS003',
          busDetails: { numberPlate: 'GHI789', busType: 'Mini' },
          issue: 'AC Repair',
          description: 'Air conditioning system not cooling properly',
          priority: 'Low',
          status: 'Completed',
          estimatedCost: 600,
          startDate: '2024-01-10',
          estimatedCompletionDate: '2024-01-12',
          actualCompletionDate: '2024-01-11',
          createdAt: new Date('2024-01-10').toISOString()
        }
      ];
      setMaintenances(mockMaintenances);
      setFilteredMaintenances(mockMaintenances);
      toast.error('Using mock data - Backend connection failed');
    }
  };

  useEffect(() => {
    filterMaintenances();
  }, [maintenances, searchTerm, filterStatus]);

  const filterMaintenances = () => {
    let filtered = maintenances;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(maintenance =>
        maintenance.busId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (maintenance.busDetails?.numberPlate?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        maintenance.issue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.status === filterStatus);
    }

    setFilteredMaintenances(filtered);
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...maintenanceFormData,
        estimatedCost: parseFloat(maintenanceFormData.estimatedCost) || 0
      };

      if (editingMaintenance) {
        await axios.put(`${BACKEND_URL}/api/maintenance/${editingMaintenance._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Maintenance record updated successfully');
      } else {
        await axios.post(`${BACKEND_URL}/api/maintenance`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Maintenance record created successfully');
      }

      setShowMaintenanceModal(false);
      setEditingMaintenance(null);
      setMaintenanceFormData({
        busId: '',
        issue: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        estimatedCost: '',
        startDate: '',
        estimatedCompletionDate: ''
      });
      fetchMaintenances();
    } catch (error) {
      console.error('Failed to save maintenance record', error);
      toast.error(error.response?.data?.message || 'Failed to save maintenance record');
    }
  };

  const handleEditMaintenance = (maintenance) => {
    setEditingMaintenance(maintenance);
    setMaintenanceFormData({
      busId: maintenance.busId,
      issue: maintenance.issue,
      description: maintenance.description,
      priority: maintenance.priority,
      status: maintenance.status,
      estimatedCost: maintenance.estimatedCost.toString(),
      startDate: maintenance.startDate,
      estimatedCompletionDate: maintenance.estimatedCompletionDate
    });
    setShowMaintenanceModal(true);
  };

  const handleDeleteMaintenance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Maintenance record deleted successfully');
      fetchMaintenances();
    } catch (error) {
      console.error('Failed to delete maintenance record', error);
      toast.error('Failed to delete maintenance record');
    }
  };

  const handleMaintenanceInputChange = (e) => {
    setMaintenanceFormData({
      ...maintenanceFormData,
      [e.target.name]: e.target.value
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-900/30 text-red-400';
      case 'Medium':
        return 'bg-orange-900/30 text-orange-400';
      case 'Low':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-900/30 text-green-400';
      case 'In Progress':
        return 'bg-blue-900/30 text-blue-400';
      case 'Pending':
        return 'bg-orange-900/30 text-orange-400';
      case 'Cancelled':
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
      month: 'short',
      day: 'numeric'
    });
  };

  // Maintenance Content Component
  const MaintenanceContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance Management</h2>
          <p className="text-slate-400">Manage bus maintenance records and schedules</p>
        </div>
        <button
          onClick={() => setShowMaintenanceModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Maintenance
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by bus ID, plate, or issue..."
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
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Maintenance List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bus ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Estimated Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Est. Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredMaintenances.map((maintenance) => (
                <tr key={maintenance._id} className="hover:bg-slate-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{maintenance.busId}</div>
                    <div className="text-xs text-slate-400">{maintenance.busDetails?.numberPlate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{maintenance.issue}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{maintenance.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(maintenance.priority)}`}>
                      {maintenance.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                    {formatCurrency(maintenance.estimatedCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {formatDate(maintenance.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {formatDate(maintenance.estimatedCompletionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditMaintenance(maintenance)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Maintenance"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaintenance(maintenance._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Maintenance"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMaintenances.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No maintenance records found</h3>
            <p className="text-slate-500 mt-1">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first maintenance record'
              }
            </p>
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900 opacity-75 z-40" onClick={() => setShowMaintenanceModal(false)}></div>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingMaintenance ? 'Edit Maintenance' : 'Add New Maintenance'}
                </h3>
                <button
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    setEditingMaintenance(null);
                    setMaintenanceFormData({
                      busId: '',
                      issue: '',
                      description: '',
                      priority: 'Medium',
                      status: 'Pending',
                      estimatedCost: '',
                      startDate: '',
                      estimatedCompletionDate: ''
                    });
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bus ID</label>
                  <input
                    type="text"
                    name="busId"
                    value={maintenanceFormData.busId}
                    onChange={handleMaintenanceInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bus ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Issue</label>
                  <input
                    type="text"
                    name="issue"
                    value={maintenanceFormData.issue}
                    onChange={handleMaintenanceInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter issue description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Detailed Description</label>
                  <textarea
                    name="description"
                    value={maintenanceFormData.description}
                    onChange={handleMaintenanceInputChange}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed description of the issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={maintenanceFormData.priority}
                      onChange={handleMaintenanceInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select
                      name="status"
                      value={maintenanceFormData.status}
                      onChange={handleMaintenanceInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={maintenanceFormData.estimatedCost}
                    onChange={handleMaintenanceInputChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter estimated cost"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={maintenanceFormData.startDate}
                      onChange={handleMaintenanceInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Est. Completion Date</label>
                    <input
                      type="date"
                      name="estimatedCompletionDate"
                      value={maintenanceFormData.estimatedCompletionDate}
                      onChange={handleMaintenanceInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaintenanceModal(false);
                      setEditingMaintenance(null);
                      setMaintenanceFormData({
                        busId: '',
                        issue: '',
                        description: '',
                        priority: 'Medium',
                        status: 'Pending',
                        estimatedCost: '',
                        startDate: '',
                        estimatedCompletionDate: ''
                      });
                    }}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingMaintenance ? 'Update Maintenance' : 'Add Maintenance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Update menuItems to include Payment Management
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'buses', label: 'Bus Management', icon: Bus },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'payments', label: 'Payment', icon: CreditCard }, // Add this line
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'drivers', label: 'Driver Assign', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'lost-found', label: 'Lost & Found', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Update StatCard to include payment statistics
  const StatCard = ({ title, value, icon: Icon, trend, onClick, isCurrency = false, isRevenue = false }) => {
    let displayValue = value;
    
    if (isCurrency) {
      displayValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value || 0);
    }
    
    let valueColor = 'text-white';
    if (isRevenue) {
      valueColor = value >= 0 ? 'text-green-400' : 'text-red-400';
    }

    return (
      <div
        onClick={onClick}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">{title}</p>
            <h3 className={`text-2xl font-bold mt-1 ${valueColor}`}>
              {displayValue}
            </h3>
            {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-900/30">
            <Icon className="w-6 h-6 text-slate-300" />
          </div>
        </div>
      </div>
    );
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers === null ? 'Loading...' : totalUsers.toLocaleString()}
          icon={Users}
          onClick={() => setActiveTab('users')}
        />
        <StatCard 
          title="Total Buses" 
          value={dashboardStats.totalBuses} 
          icon={Bus} 
          onClick={() => setActiveTab('buses')}
        />
        <StatCard 
          title="Active Bookings" 
          value={dashboardStats.activeBookings} 
          icon={BookOpen} 
          onClick={() => setActiveTab('bookings')}
        />
        <StatCard 
          title="Maintenance Requests" 
          value={dashboardStats.maintenanceRequests} 
          icon={Wrench} 
          onClick={() => setActiveTab('maintenance')}
        />
      </div>

      {/* Payment Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={dashboardStats.totalIncome}
          icon={DollarSign}
          isCurrency={true}
          onClick={() => setActiveTab('payments')}
        />
        <StatCard
          title="Total Expense"
          value={dashboardStats.totalExpense}
          icon={CreditCard}
          isCurrency={true}
          onClick={() => setActiveTab('payments')}
        />
        <StatCard
          title="Net Revenue"
          value={dashboardStats.netRevenue}
          icon={BarChart3}
          isCurrency={true}
          isRevenue={true}
          onClick={() => setActiveTab('payments')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="flex flex-col items-center justify-center p-4 bg-blue-900/20 rounded-lg"
              onClick={() => setActiveTab('users')}
            >
              <Plus className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-300">Add User</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-green-900/20 rounded-lg"
              onClick={() => setActiveTab('buses')}
            >
              <Plus className="w-6 h-6 text-green-400 mb-2" />
              <span className="text-sm font-medium text-green-300">Add Bus</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-purple-900/20 rounded-lg"
              onClick={() => setActiveTab('payments')}
            >
              <CreditCard className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm font-medium text-purple-300">Payments</span>
            </button>
            <button
              className="flex flex-col items-center justify-center p-4 bg-orange-900/20 rounded-lg"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="w-6 h-6 text-orange-400 mb-2" />
              <span className="text-sm font-medium text-orange-300">Reports</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 text-green-400 mr-3" />
                <span className="text-sm text-slate-300">New booking payment received</span>
              </div>
              <span className="text-xs text-slate-400">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <Wrench className="w-4 h-4 text-orange-400 mr-3" />
                <span className="text-sm text-slate-300">Maintenance payment processed</span>
              </div>
              <span className="text-xs text-slate-400">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <User className="w-4 h-4 text-blue-400 mr-3" />
                <span className="text-sm text-slate-300">Salary payment completed</span>
              </div>
              <span className="text-xs text-slate-400">3 hours ago</span>
            </div>
          </div>
          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Update renderContent to include PaymentManagement
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'notifications':
        return <AdminNotificationPanel />;
      case 'buses':
        return <BusManagement />;
      case 'payments': // Add this case
        return <PaymentManagement />;
      case 'bookings':
        return <AllBookings/>;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'drivers':
        return <div className="text-white p-6">Driver Assign (placeholder)</div>;
      case 'attendance':
        return <AttendanceManagement />;
      case 'feedback':
        return <FeedbackContent />;
      case 'lost-found':
        return <div className="text-white p-6">Lost & Found (placeholder)</div>;
      case 'analytics':
        return <div className="text-white p-6">Analytics (placeholder)</div>;
      case 'settings':
        return <div className="text-white p-6">Settings (placeholder)</div>;
      default:
        return <div className="text-white p-6">Module under development</div>;
    }
  };

  // Keep all the existing feedback functions unchanged...
  // (The rest of your existing feedback functions remain the same)

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          const mockFeedbacks = [
            {
              _id: '1',
              title: 'AD3412 Bus is not safe',
              description: 'Bus has serious safety concerns and needs immediate attention',
              type: 'complaint',
              userId: { 
                _id: '68b5240faf8b3f2810a46257',
                firstName: 'John', 
                lastName: 'Doe' 
              },
              user_id: '68b5240faf8b3f2810a46257',
              send_date: new Date('2025-09-21T20:50:57').toISOString(),
              status: 'replied',
              admin_reply: 'Thank you for bringing this to our attention. We have scheduled the bus for immediate safety inspection and maintenance.',
              reply_date: new Date('2025-09-21T21:21:00').toISOString(),
              booking_reference: 'AD3412'
            },
            {
              _id: '2',
              title: 'Good Sheets',
              description: '247BC Bus have good sheets and it\'s very comfortable',
              type: 'feedback',
              userId: { 
                _id: 'user_hgpwcldsy',
                firstName: 'Jane', 
                lastName: 'Smith' 
              },
              user_id: 'user_hgpwcldsy',
              send_date: new Date('2025-09-20T02:42:00').toISOString(),
              status: 'pending',
              admin_reply: null,
              reply_date: null,
              booking_reference: 'BZ-2025-002'
            }
          ];
          setFeedbacks(mockFeedbacks);
          setFilteredFeedbacks(mockFeedbacks);
          setError('Using mock data - Backend API not available');
          return;
        }
        throw new Error('Failed to fetch feedbacks');
      }
      
      const data = await response.json();
      const processedData = data.map(feedback => ({
        ...feedback,
        userId: feedback.userId || { 
          _id: feedback.user_id || `user_${Math.random().toString(36).substr(2, 9)}`,
          firstName: 'Unknown',
          lastName: 'User'
        },
        user_id: feedback.user_id || (feedback.userId ? feedback.userId._id : null)
      }));
      
      setFeedbacks(processedData);
      setFilteredFeedbacks(processedData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
      const mockFeedbacks = [
        {
          _id: '1',
          title: 'AD3412 Bus is not safe',
          description: 'Bus has serious safety concerns and needs immediate attention',
          type: 'complaint',
          userId: { 
            _id: '68b5240faf8b3f2810a46257',
            firstName: 'John', 
            lastName: 'Doe' 
          },
          user_id: '68b5240faf8b3f2810a46257',
          send_date: new Date('2025-09-21T20:50:57').toISOString(),
          status: 'replied',
          admin_reply: 'Thank you for bringing this to our attention. We have scheduled the bus for immediate safety inspection and maintenance.',
              reply_date: new Date('2025-09-21T21:21:00').toISOString(),
          booking_reference: 'AD3412'
        },
        {
          _id: '2',
          title: 'Good Sheets',
          description: '247BC Bus have good sheets and it\'s very comfortable',
          type: 'feedback',
          userId: { 
            _id: 'user_hgpwcldsy',
            firstName: 'Jane', 
            lastName: 'Smith' 
          },
          user_id: 'user_hgpwcldsy',
          send_date: new Date('2025-09-20T02:42:00').toISOString(),
          status: 'pending',
          admin_reply: null,
          reply_date: null,
          booking_reference: 'BZ-2025-002'
        }
      ];
      setFeedbacks(mockFeedbacks);
      setFilteredFeedbacks(mockFeedbacks);
      setError('Using mock data - Backend connection failed');
    }
  };

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredFeedbacks(feedbacks);
    } else if (filterType === 'feedback') {
      setFilteredFeedbacks(feedbacks.filter(f => f.type === 'feedback'));
    } else if (filterType === 'complaint') {
      setFilteredFeedbacks(feedbacks.filter(f => f.type === 'complaint'));
    } else if (filterType === 'pending') {
      setFilteredFeedbacks(feedbacks.filter(f => !f.admin_reply));
    }
  }, [filterType, feedbacks]);

  const handleReply = async (feedbackId) => {
    const replyText = replyTexts[feedbackId] || '';
    
    if (!replyText.trim()) {
      setError('Please enter a response before sending.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/feedbacks/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admin_reply: replyText
        })
      });

      if (!response.ok) {
        setFeedbacks(prev => prev.map(f => 
          f._id === feedbackId 
            ? { ...f, admin_reply: replyText, reply_date: new Date().toISOString(), status: 'replied' } 
            : f
        ));
        setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
        setReplyingTo(null);
        setError('Reply sent successfully (demo mode)');
        toast.success('Reply sent successfully!');
        return;
      }

      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId 
          ? { ...f, admin_reply: replyText, reply_date: new Date().toISOString(), status: 'replied' } 
          : f
      ));
      
      setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
      setReplyingTo(null);
      setError('');
      
      toast.success('Reply sent successfully!');
    } catch (err) {
      console.error('Failed to send reply', err);
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId 
          ? { ...f, admin_reply: replyText, reply_date: new Date().toISOString(), status: 'replied' } 
          : f
      ));
      setReplyTexts(prev => ({ ...prev, [feedbackId]: '' }));
      setReplyingTo(null);
      setError('Reply sent successfully (demo mode - backend offline)');
      toast.success('Reply sent successfully!');
    }
  };

  const toggleResolve = async (feedbackId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'closed' ? 'replied' : 'closed';
      
      const response = await fetch(`${BACKEND_URL}/api/feedbacks/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        setFeedbacks(prev => prev.map(f => 
          f._id === feedbackId ? { ...f, status: newStatus } : f
        ));
        setError('Status updated successfully (demo mode)');
        return;
      }

      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId ? { ...f, status: newStatus } : f
      ));
      
      setError('');
    } catch (err) {
      console.error('Failed to update feedback status', err);
      const newStatus = currentStatus === 'closed' ? 'replied' : 'closed';
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId ? { ...f, status: newStatus } : f
      ));
      setError('Status updated successfully (demo mode - backend offline)');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback/complaint? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/feedbacks/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
        setFilteredFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
        setError('Feedback deleted successfully (demo mode)');
        toast.success('Feedback deleted successfully');
        return;
      }

      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setFilteredFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setError('');
      
      toast.success('Feedback deleted successfully');
    } catch (err) {
      console.error('Failed to delete feedback', err);
      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setFilteredFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setError('Feedback deleted successfully (demo mode - backend offline)');
      toast.success('Feedback deleted successfully');
    }
  };

  const FeedbackContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Feedback & Complaints</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'feedback' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('feedback')}
          >
            Feedback
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'complaint' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('complaint')}
          >
            Complaints
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filterType === 'pending' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setFilterType('pending')}
          >
            Pending
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No feedback found</h3>
            <p className="text-slate-500 mt-1">There are no feedback entries matching your criteria.</p>
          </div>
        ) : (
          filteredFeedbacks.map(feedback => (
            <FeedbackCard key={feedback._id} feedback={feedback} />
          ))
        )}
      </div>
    </div>
  );

  const FeedbackCard = ({ feedback }) => {
    const handleTextChange = (e) => {
      const feedbackId = feedback._id;
      const newValue = e.target.value;
      const cursorPosition = e.target.selectionStart;
      
      setReplyTexts(prev => ({ ...prev, [feedbackId]: newValue }));
      
      setTimeout(() => {
        const textarea = textareaRefs.current[feedbackId];
        if (textarea) {
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    };

    const handleKeyDown = (e) => {
      e.stopPropagation();
    };

    const handleSendReply = () => {
      handleReply(feedback._id);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown Date';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    };

    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-3 rounded-full ${feedback.type === 'feedback' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {feedback.type === 'feedback' ? <ThumbsUp size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{feedback.title}</h3>
              <p className="text-slate-300 mt-1">{feedback.description}</p>
              
              <div className="flex items-center mt-2 text-sm text-slate-400">
                <span>{formatDate(feedback.send_date)}</span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <User className="h-3.5 w-3.5 mr-1.5" />
                <span>User ID: {feedback.user_id || feedback.userId?._id || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {feedback.status === 'closed' && (
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full flex items-center">
                <CheckCircle size={12} className="mr-1" /> Closed
              </span>
            )}
            {feedback.status === 'replied' && (
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full flex items-center">
                <MessageCircle size={12} className="mr-1" /> Replied
              </span>
            )}
            {!feedback.admin_reply && feedback.status !== 'closed' && (
              <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded-full flex items-center">
                <AlertTriangle size={12} className="mr-1" /> Pending
              </span>
            )}
          </div>
        </div>

        {feedback.admin_reply && (
          <div className="mt-4 pl-12">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center text-sm text-slate-300 mb-2">
                <span className="font-medium">Admin Response</span>
                <span className="mx-2">•</span>
                <span>{formatDate(feedback.reply_date)}</span>
              </div>
              <p className="text-slate-100">{feedback.admin_reply}</p>
            </div>
          </div>
        )}

        <div className="mt-4 pl-12">
          {replyingTo === feedback._id ? (
            <div className="space-y-3 w-full">
              <div className="bg-slate-700 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <textarea
                  ref={(el) => {
                    if (el) textareaRefs.current[feedback._id] = el;
                  }}
                  value={replyTexts[feedback._id] || ''}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response here..."
                  rows={6}
                  maxLength={1000}
                  className="w-full min-h-[150px] p-4 bg-transparent text-white placeholder-slate-400 border-none outline-none resize-none text-sm"
                  style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal',
                    writingMode: 'horizontal-tb'
                  }}
                  autoFocus
                  spellCheck="false"
                />
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800/50 border-t border-slate-600">
                  <span className="text-xs text-slate-400">
                    {(replyTexts[feedback._id] || '').length}/1000 characters
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyTexts(prev => ({ ...prev, [feedback._id]: '' }));
                        setError('');
                      }}
                      className="px-4 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!replyTexts[feedback._id]?.trim()}
                    >
                      <Send size={16} className="mr-2" />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {!feedback.admin_reply && (
                <button
                  onClick={() => {
                    setReplyingTo(feedback._id);
                    setError('');
                    setReplyTexts(prev => ({ 
                      ...prev, 
                      [feedback._id]: prev[feedback._id] || '' 
                    }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Reply
                </button>
              )}
              <button
                onClick={() => toggleResolve(feedback._id, feedback.status)}
                className={`px-4 py-2 rounded-lg flex items-center hover:opacity-90 transition-opacity ${
                  feedback.status === 'closed' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-green-600 text-white'
                }`}
              >
                {feedback.status === 'closed' ? (
                  <>
                    <XCircle size={16} className="mr-2" />
                    Reopen
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Mark Resolved
                  </>
                )}
              </button>
              <button
                onClick={() => handleDeleteFeedback(feedback._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center hover:bg-red-700 transition-colors"
                title="Delete Feedback"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800 overflow-y-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/40x40?text=BZ+" alt="BusZone+" className="h-8 w-8 mr-2 rounded" />
            <h1 className="text-xl font-bold text-white">BusZone+</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-800 text-white mr-4">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white capitalize">{menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-slate-800">
                  <Bell className="w-6 h-6 text-slate-300" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">3</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{authUser?.firstName || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{authUser?.role || 'Super Admin'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? <div className="text-slate-400">Loading dashboard...</div> : renderContent()}
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminDashboard;