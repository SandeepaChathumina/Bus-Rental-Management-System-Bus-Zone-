// src/pages/Lost.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Calendar,
  Bus,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  FileText,
  Home,
  Bell,
  LogOut,
  Menu,
  X,
  Lock,
  Unlock,
  Shield,
  MessageSquare,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const Lost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    dateLost: '',
    busNumber: '',
    bookingId: ''
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Real-time event listeners for admin updates
  useEffect(() => {
    const handleLostItemUpdated = (event) => {
      try {
        const { itemId, updates } = event.detail;
        console.log('Lost.jsx: Received update for item:', itemId, updates);
        
        setLostItems(prev => 
          prev.map(item => {
            if (item._id === itemId) {
              const updatedItem = { 
                ...item, 
                ...updates,
                updatedAt: new Date().toISOString()
              };
              
              // Show notification if admin replied to user's item
              if (updates.adminNotes && updates.adminNotes.trim() !== '' && 
                  item.user?._id === user?._id && 
                  (!item.adminNotes || item.adminNotes.trim() === '')) {
                toast.success('Admin has responded to your lost item report! Item is now locked.', {
                  duration: 5000,
                  icon: '🔒'
                });
              }
              
              return updatedItem;
            }
            return item;
          })
        );
      } catch (error) {
        console.error('Error handling lost item update:', error);
      }
    };

    const handleLostItemDeleted = (event) => {
      try {
        const { itemId } = event.detail;
        console.log('Lost.jsx: Received delete for item:', itemId);
        setLostItems(prev => prev.filter(item => item._id !== itemId));
        toast.info('A lost item report has been removed by admin');
      } catch (error) {
        console.error('Error handling lost item deletion:', error);
      }
    };

    // Listen for new items created by admin
    const handleLostItemCreated = (event) => {
      try {
        const { item } = event.detail;
        console.log('Lost.jsx: Received new item from admin:', item);
        
        // Only add if it doesn't already exist
        setLostItems(prev => {
          const exists = prev.find(i => i._id === item._id);
          if (!exists) {
            return [item, ...prev];
          }
          return prev;
        });
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
  }, [user]);

  useEffect(() => {
    fetchLostItems();
    if (user?.role === 'passenger') {
      fetchUserBookings();
    }
  }, [user]);

  // Auto-refresh every 30 seconds for better sync
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLostItems();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No auth token found');
        setLostItems([]);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/lost-items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('API not available, using mock data');
        // Enhanced mock data with proper sync simulation
        const mockData = [
          {
            _id: '1',
            itemName: 'Yellow Umbrella',
            description: 'Yellow umbrella with wooden duck-head handle',
            dateLost: new Date('2025-09-03').toISOString(),
            busNumber: 'AD-8765',
            status: 'Reported',
            reportedBy: 'User', // Changed from 'Admin' to 'User'
            user: { 
              _id: user?._id || 'user1', 
              firstName: user?.firstName || 'John', 
              lastName: user?.lastName || 'Doe', 
              email: user?.email || 'john@example.com',
              phone: '+94 771234567'
            },
            booking: { 
              _id: 'booking1', 
              bookingReference: 'BZ-2025-001',
              route: 'Colombo - Kandy'
            },
            adminNotes: 'Located in Main Depot, Bin 5. Slightly wet but functional. Small tear on left side of canopy. Owner verified matching description of wooden duck-head handle. Awaiting pickup.',
            createdAt: new Date('2025-09-23').toISOString(),
            updatedAt: new Date('2025-09-23T01:12:00').toISOString()
          },
          {
            _id: '2',
            itemName: 'Black Backpack',
            description: 'Black backpack with laptop compartment',
            dateLost: new Date('2025-09-02').toISOString(),
            busNumber: 'BC-1234',
            status: 'Found',
            reportedBy: 'Admin',
            adminNotes: 'Found under seat 12B, contains books and water bottle',
            createdAt: new Date('2025-09-22').toISOString(),
            updatedAt: new Date('2025-09-22T15:30:00').toISOString()
          },
          {
            _id: '3',
            itemName: 'Blue Water Bottle',
            description: 'Stainless steel water bottle with university logo',
            dateLost: new Date('2025-09-01').toISOString(),
            busNumber: 'AD-9876',
            status: 'Reported',
            reportedBy: 'User', // User reported item
            user: { 
              _id: user?._id || 'user1', 
              firstName: user?.firstName || 'Jane', 
              lastName: user?.lastName || 'Smith', 
              email: user?.email || 'jane@example.com',
              phone: '+94 771234568'
            },
            booking: { 
              _id: 'booking2', 
              bookingReference: 'BZ-2025-002',
              route: 'Kandy - Galle'
            },
            adminNotes: '',
            createdAt: new Date('2025-09-21').toISOString(),
            updatedAt: new Date('2025-09-21T10:30:00').toISOString()
          }
        ];

        const filteredMockData = user?.role === 'passenger' 
          ? mockData.filter(item => 
              item.reportedBy === 'Admin' || 
              (item.user && item.user._id === user._id)
            )
          : mockData;

        setLostItems(filteredMockData);
        return;
      }

      const data = await response.json();
      
      if (data && data.lostItems) {
        const filteredData = user?.role === 'passenger' 
          ? data.lostItems.filter(item => 
              item.reportedBy === 'Admin' || 
              (item.user && item.user._id === user._id)
            )
          : data.lostItems;

        setLostItems(filteredData);
      } else {
        console.warn('No lost items data received');
        setLostItems([]);
      }
    } catch (error) {
      console.error('Error fetching lost items:', error);
      setLostItems([]);
      toast.error('Failed to load lost items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/api/bookings/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserBookings(data.bookings || []);
      } else {
        // Mock booking data
        setUserBookings([
          { _id: 'booking1', bookingReference: 'BZ-2025-001', busNumber: 'AD-8765' },
          { _id: 'booking2', bookingReference: 'BZ-2025-002', busNumber: 'BC-1234' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setUserBookings([]);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.itemName.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    if (!formData.busNumber.trim()) {
      toast.error('Bus number is required');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        dateLost: formData.dateLost,
        busNumber: formData.busNumber.trim(),
        bookingId: formData.bookingId || null
      };

      const response = await fetch(`${BACKEND_URL}/api/lost-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      let newItem;
      if (!response.ok) {
        // Create mock item with correct reportedBy value
        newItem = {
          _id: Date.now().toString(),
          ...submitData,
          status: 'Reported',
          reportedBy: user?.role === 'admin' ? 'Admin' : 'User', // Fixed this logic
          user: user?.role === 'passenger' ? user : null,
          booking: submitData.bookingId ? userBookings.find(b => b._id === submitData.bookingId) : null,
          adminNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        toast.success('Lost item reported successfully (demo mode)');
      } else {
        const data = await response.json();
        newItem = data.lostItem || data;
        toast.success('Lost item reported successfully');
      }

      // Update state
      setLostItems(prev => [newItem, ...prev]);
      
      // Notify admin dashboard about new item
      window.dispatchEvent(new CustomEvent('lostItemCreated', {
        detail: { 
          item: newItem,
          source: 'user'
        }
      }));

      // Reset and close form
      resetForm();
      setShowReportForm(false);
      
    } catch (error) {
      console.error('Error reporting lost item:', error);
      toast.error('Failed to report lost item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditItem = (item) => {
    if (!canEditItem(item)) {
      if (item.reportedBy === 'Admin') {
        toast.error('This item was reported by admin and cannot be edited by users.');
      } else if (item.adminNotes && item.adminNotes.trim() !== '') {
        toast.error('Cannot edit item after admin response');
      } else {
        toast.error('You do not have permission to edit this item.');
      }
      return;
    }
    
    setEditingItem(item);
    setFormData({
      itemName: item.itemName || '',
      description: item.description || '',
      dateLost: item.dateLost ? new Date(item.dateLost).toISOString().split('T')[0] : '',
      busNumber: item.busNumber || '',
      bookingId: item.booking?._id || ''
    });
    setShowEditForm(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!editingItem) {
      toast.error('No item selected for editing');
      return;
    }
    
    // Validation
    if (!formData.itemName.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    if (!formData.busNumber.trim()) {
      toast.error('Bus number is required');
      return;
    }

    if (!canEditItem(editingItem)) {
      toast.error('You no longer have permission to edit this item.');
      setShowEditForm(false);
      setEditingItem(null);
      resetForm();
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        dateLost: formData.dateLost,
        busNumber: formData.busNumber.trim(),
        bookingId: formData.bookingId || null
      };

      const response = await fetch(`${BACKEND_URL}/api/lost-items/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const updates = {
        ...updateData,
        booking: updateData.bookingId ? userBookings.find(b => b._id === updateData.bookingId) : editingItem.booking,
        updatedAt: new Date().toISOString()
      };

      // Update local state immediately for better UX
      setLostItems(prev =>
        prev.map(item =>
          item._id === editingItem._id ? { ...item, ...updates } : item
        )
      );

      // Notify admin dashboard about the update
      window.dispatchEvent(new CustomEvent('lostItemUpdated', {
        detail: {
          itemId: editingItem._id,
          updates: updates,
          source: 'user'
        }
      }));

      if (response.ok) {
        toast.success('Lost item updated successfully');
      } else {
        toast.success('Lost item updated successfully (demo mode)');
      }

      // Reset and close form
      resetForm();
      setShowEditForm(false);
      setEditingItem(null);
      
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      dateLost: '',
      busNumber: '',
      bookingId: ''
    });
  };

  const deleteItem = async (itemId) => {
    const item = lostItems.find(item => item._id === itemId);
    
    if (!item) {
      toast.error('Item not found');
      return;
    }
    
    if (!canDeleteItem(item)) {
      if (item.reportedBy === 'Admin') {
        toast.error('This item was reported by admin and cannot be deleted by users.');
      } else if (item.adminNotes && item.adminNotes.trim() !== '') {
        toast.error('Cannot delete item after admin response');
      } else {
        toast.error('You do not have permission to delete this item.');
      }
      return;
    }

    if (!window.confirm('Are you sure you want to delete this lost item report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Optimistically remove from UI
      setLostItems(prev => prev.filter(item => item._id !== itemId));
      
      const response = await fetch(`${BACKEND_URL}/api/lost-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Notify admin dashboard about the deletion
      window.dispatchEvent(new CustomEvent('lostItemDeleted', {
        detail: { 
          itemId: itemId,
          source: 'user'
        }
      }));

      if (response.ok) {
        toast.success('Lost item report deleted successfully');
      } else {
        toast.success('Lost item report deleted successfully (demo mode)');
      }

    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      
      // Revert the optimistic update on error
      fetchLostItems();
    }
  };

  // Permission checks - FIXED LOGIC
  const canEditItem = (item) => {
    if (!item) return false;
    
    // Admin can edit everything
    if (user?.role === 'admin') return true;
    
    // Users can only edit their own items that don't have admin responses
    const isOwnItem = item.user && item.user._id === user?._id;
    const hasAdminReply = item.adminNotes && item.adminNotes.trim() !== '';
    const isUserReported = item.reportedBy === 'User';
    
    return isUserReported && isOwnItem && !hasAdminReply;
  };

  const canDeleteItem = (item) => {
    if (!item) return false;
    
    // Admin can delete everything
    if (user?.role === 'admin') return true;
    
    // Users can only delete their own items that don't have admin responses
    const isOwnItem = item.user && item.user._id === user?._id;
    const hasAdminReply = item.adminNotes && item.adminNotes.trim() !== '';
    const isUserReported = item.reportedBy === 'User';
    
    return isUserReported && isOwnItem && !hasAdminReply;
  };

  const getLockIcon = (item) => {
    if (item.reportedBy === 'Admin') {
      return <Shield className="w-4 h-4 text-purple-400" />;
    }
    
    const userCanEdit = canEditItem(item);
    return userCanEdit ? <Unlock className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-red-400" />;
  };

  const getLockText = (item) => {
    if (item.reportedBy === 'Admin') {
      return 'Admin Item';
    }
    
    const userCanEdit = canEditItem(item);
    const hasAdminReply = item.adminNotes && item.adminNotes.trim() !== '';
    
    if (hasAdminReply && !userCanEdit) {
      return 'Locked - Admin Replied';
    }
    
    return userCanEdit ? 'Editable' : 'Locked';
  };

  const getLockColor = (item) => {
    if (item.reportedBy === 'Admin') {
      return 'text-purple-400';
    }
    
    const userCanEdit = canEditItem(item);
    return userCanEdit ? 'text-green-400' : 'text-red-400';
  };

  const getReportedByIcon = (reportedBy) => {
    return reportedBy === 'Admin' ? 
      <Shield className="w-4 h-4 text-purple-400" /> : 
      <User className="w-4 h-4 text-blue-400" />;
  };

  // Fixed function to get proper display text for "By" field
  const getReportedByText = (reportedBy) => {
    return reportedBy === 'Admin' ? 'Admin' : 'User';
  };

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.busNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
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
      case 'found': return <CheckCircle className="w-4 h-4" />;
      case 'claimed': return <User className="w-4 h-4" />;
      case 'returned': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Navigation component
  const Navbar = () => (
    <div className="w-full h-[80px] bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center px-6 lg:px-8 fixed top-0 z-50">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-slate-800 text-white mr-4 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link to="/" className="mr-16 flex items-center space-x-3">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-xl shadow-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full"></div>
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              BusZone+
            </div>
            <div className="text-xs text-slate-400">
              Lost & Found
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-6 ml-auto">
        <div className="hidden md:flex items-center space-x-2 text-slate-300">
          <span className="text-sm">+94 704 222 777</span>
        </div>
        
        {user && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile sidebar
  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden border-r border-slate-800`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">Menu</h1>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-800 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <Link
            to="/booking"
            className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg mb-2"
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={() => {
              navigate('/login');
              setSidebarOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Sidebar />
      
      <div className="pt-20 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Lost & Found</h1>
              <p className="text-slate-400">Report and track lost items from your bus journeys</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Lost Item
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                disabled={loading}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Lost Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No items match your search criteria" 
                    : "No lost items have been reported yet"}
                </p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300"
                >
                  Report First Item
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 relative">
                  {/* Lock/Admin Indicator */}
                  {user?.role !== 'admin' && (
                    <div className="absolute top-4 right-4 flex items-center space-x-1">
                      {getLockIcon(item)}
                      <span className={`text-xs font-medium ${getLockColor(item)}`}>
                        {getLockText(item)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.itemName}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-300">
                      <Bus className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Bus: {item.busNumber}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-300">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Lost on: {formatDate(item.dateLost)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-300">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Reported: {formatDate(item.createdAt)}</span>
                    </div>

                    <div className="flex items-center text-sm text-slate-300">
                      {getReportedByIcon(item.reportedBy)}
                      <span className="ml-2">
                      {item.reportedBy === 'User' ? 'By: Admin' : `Reported by ${item.user?.firstName || 'User'}`}
                    </span>
                    </div>

                    {item.user && (
                      <div className="flex items-center text-sm text-slate-300">
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        <span>User: {item.user.firstName} {item.user.lastName}</span>
                      </div>
                    )}

                    {item.booking?.bookingReference && (
                      <div className="flex items-center text-sm text-slate-300">
                        <FileText className="w-4 h-4 mr-2 text-blue-400" />
                        <span>Ref: {item.booking.bookingReference}</span>
                      </div>
                    )}
                  </div>

                  {item.adminNotes && item.adminNotes.trim() !== '' && (
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-4">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 mr-2 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-300 mb-1">Admin Response:</p>
                          <p className="text-slate-300 text-sm">{item.adminNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-700">
                    {user?.role === 'admin' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Update
                        </button>
                        <button
                          onClick={() => deleteItem(item._id)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {canEditItem(item) && (
                            <button
                              onClick={() => handleEditItem(item)}
                              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                          )}
                          
                          {canDeleteItem(item) && (
                            <button
                              onClick={() => deleteItem(item._id)}
                              className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          )}
                        </div>
                        
                        {!canEditItem(item) && (
                          <div className={`text-xs flex items-center ${item.reportedBy === 'Admin' ? 'text-purple-400' : 'text-red-400'}`}>
                            {item.reportedBy === 'Admin' ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin Item
                              </>
                            ) : item.adminNotes && item.adminNotes.trim() !== '' ? (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Locked - Admin Replied
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                No Permission
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Report Lost Item Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Report Lost Item</h2>
                <button
                  onClick={() => {
                    setShowReportForm(false);
                    resetForm();
                  }}
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
                    placeholder="e.g., AD-8765"
                  />
                </div>

                {user?.role === 'passenger' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Booking Reference
                    </label>
                    <select
                      value={formData.bookingId}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select your booking</option>
                      {userBookings.map((booking) => (
                        <option key={booking._id} value={booking._id}>
                          {booking.bookingReference} - {booking.busNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Reporting...' : 'Report Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Lost Item Modal */}
        {showEditForm && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Lost Item</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Warning message for users if item is locked */}
              {user?.role !== 'admin' && !canEditItem(editingItem) && (
                <div className={`border rounded-lg p-4 mb-4 ${
                  editingItem.reportedBy === 'Admin' 
                    ? 'bg-purple-900/30 border-purple-700' 
                    : 'bg-red-900/30 border-red-700'
                }`}>
                  <div className="flex items-start">
                    {editingItem.reportedBy === 'Admin' ? (
                      <Shield className="w-5 h-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`font-medium text-sm ${
                        editingItem.reportedBy === 'Admin' ? 'text-purple-400' : 'text-red-400'
                      }`}>
                        {editingItem.reportedBy === 'Admin' ? 'Admin Item' : 'Item Locked'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        editingItem.reportedBy === 'Admin' ? 'text-purple-300' : 'text-red-300'
                      }`}>
                        {editingItem.reportedBy === 'Admin' 
                          ? 'This item was reported by admin and cannot be edited by users.'
                          : editingItem.adminNotes && editingItem.adminNotes.trim() !== ''
                            ? 'This item cannot be edited because an admin has responded to it.'
                            : 'You do not have permission to edit this item.'
                        }
                      </p>
                      {editingItem.adminNotes && editingItem.adminNotes.trim() !== '' && (
                        <div className="mt-2 p-2 bg-slate-800/50 rounded">
                          <p className="text-xs text-slate-400 mb-1">Admin Response:</p>
                          <p className="text-xs text-slate-300">{editingItem.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., AD-8765"
                  />
                </div>

                {user?.role === 'passenger' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Booking Reference
                    </label>
                    <select
                      value={formData.bookingId}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                      disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select your booking</option>
                      {userBookings.map((booking) => (
                        <option key={booking._id} value={booking._id}>
                          {booking.bookingReference} - {booking.busNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || (user?.role !== 'admin' && !canEditItem(editingItem))}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
                  >
                    {submitting ? 'Updating...' : 'Update Item'}
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

export default Lost;