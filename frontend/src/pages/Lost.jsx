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
  Save,
  Reply,
  ArrowLeftCircle,
  ArrowLeft
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    dateLost: '',
    busNumber: ''
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    busNumber: ''
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Local storage key for persisting data
  const LOST_ITEMS_STORAGE_KEY = 'buszone_lost_items';

  // Bus number validation function
  const validateBusNumber = (busNumber) => {
    const busNumberPattern = /^[A-Z]{2}-\d{4}$/;
    return busNumberPattern.test(busNumber.trim());
  };

  // Get bus number validation error message
  const getBusNumberError = (busNumber) => {
    if (!busNumber.trim()) {
      return 'Bus number is required';
    }
    if (!validateBusNumber(busNumber)) {
      return 'Bus number must be in format AD-9876 (2 capital letters, dash, 4 digits)';
    }
    return null;
  };

  // Handle real-time validation
  const handleBusNumberChange = (value) => {
    setFormData(prev => ({ ...prev, busNumber: value }));
    
    // Real-time validation
    const error = getBusNumberError(value);
    setValidationErrors(prev => ({ ...prev, busNumber: error || '' }));
  };

  // Load data from localStorage on component mount
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(LOST_ITEMS_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    return null;
  };

  // Save data to localStorage
  const saveToLocalStorage = (items) => {
    try {
      localStorage.setItem(LOST_ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  };

  // Real-time event listeners for admin updates
  useEffect(() => {
    const handleLostItemUpdated = (event) => {
      try {
        const { itemId, updates, source, adminReply } = event.detail;
        console.log('Lost.jsx: Received update for item:', itemId, updates, 'from source:', source, 'adminReply:', adminReply);
        console.log('Lost.jsx: Auto-generated message status:', updates.status);
        
        setLostItems(prev => {
          const updatedItems = prev.map(item => {
            if (item._id === itemId) {
              const updatedItem = { 
                ...item, 
                ...updates,
                updatedAt: new Date().toISOString()
              };
              
              console.log('Updated item:', updatedItem);
              
              // Show enhanced notification if admin replied to user's item
              if (adminReply && updates.adminReply && updates.adminReply.trim() !== '') {
                if (item.user?._id === user?._id) {
                  console.log('Showing enhanced admin reply notification for item:', item.itemName);
                  
                  // Enhanced notification with more details
                  toast.success(`🎉 Admin replied to "${item.itemName}"! Check the green reply box below.`, {
                    duration: 8000,
                    icon: '💬',
                    style: {
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                    }
                  });
                  
                  // Additional visual feedback - scroll to the item if it's visible
                  setTimeout(() => {
                    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
                    if (itemElement) {
                      itemElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                      });
                      // Add a temporary highlight effect
                      itemElement.classList.add('animate-pulse');
                      setTimeout(() => {
                        itemElement.classList.remove('animate-pulse');
                      }, 3000);
                    }
                  }, 1000);
                }
              } else if ((updates.adminNotes && updates.adminNotes.trim() !== '') || (updates.adminReply && updates.adminReply.trim() !== '')) {
                if (item.user?._id === user?._id && 
                    ((!item.adminNotes || item.adminNotes.trim() === '') && (!item.adminReply || item.adminReply.trim() === ''))) {
                  
                  // Different notifications for different types of admin responses
                  if (updates.adminReply && updates.adminReply.trim() !== '') {
                    console.log('Showing admin reply notification for item:', item.itemName);
                    toast.success('🎉 Admin has replied to your lost item report! Check the green reply box below.', {
                      duration: 6000,
                      icon: '💬',
                      style: {
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        fontWeight: 'bold'
                      }
                    });
                  } else {
                    console.log('Showing admin notes notification for item:', item.itemName);
                    toast.success('Admin has responded to your lost item report! Item is now locked.', {
                      duration: 5000,
                      icon: '🔒'
                    });
                  }
                }
              }
              
              return updatedItem;
            }
            return item;
          });
          
          // Save to localStorage
          saveToLocalStorage(updatedItems);
          console.log('Lost items updated after admin reply:', updatedItems.filter(item => item.adminReply));
          return updatedItems;
        });
      } catch (error) {
        console.error('Error handling lost item update:', error);
      }
    };

    const handleLostItemDeleted = (event) => {
      try {
        const { itemId } = event.detail;
        console.log('Lost.jsx: Received delete for item:', itemId);
        setLostItems(prev => {
          const updatedItems = prev.filter(item => item._id !== itemId);
          saveToLocalStorage(updatedItems);
          return updatedItems;
        });
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
            const updatedItems = [item, ...prev];
            saveToLocalStorage(updatedItems);
            return updatedItems;
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
    // Load lost items on component mount
    fetchLostItems();
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
      
      // First, try to load from localStorage
      const savedItems = loadFromLocalStorage();
      if (savedItems && savedItems.length > 0) {
        console.log('Loading lost items from localStorage');
        const filteredData = user?.role === 'passenger' 
          ? savedItems.filter(item => 
              (item.user && item.user._id === user._id)
            )
          : savedItems;
        setLostItems(filteredData);
        setLoading(false);
        return;
      }

      if (!token) {
        console.warn('No auth token found');
        setLostItems([]);
        setLoading(false);
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
            reportedBy: 'User',
            user: { 
              _id: user?._id || 'user1', 
              firstName: user?.firstName || 'John', 
              lastName: user?.lastName || 'Doe', 
              email: user?.email || 'john@example.com',
              phone: '+94 771234567'
            },
            adminNotes: 'Located in Main Depot, Bin 5. Slightly wet but functional. Small tear on left side of canopy. Owner verified matching description of wooden duck-head handle. Awaiting pickup.',
            adminReply: 'Hello! We found your umbrella at the main depot. It\'s in good condition with just a small tear. You can pick it up anytime between 9 AM to 5 PM. Please bring a valid ID.',
            repliedBy: 'Sandeepa Admin',
            repliedAt: new Date('2025-10-15T10:30:00').toISOString(),
            createdAt: new Date('2025-09-23').toISOString(),
            updatedAt: new Date('2025-10-15T10:30:00').toISOString()
          },
          {
            _id: '3',
            itemName: 'Blue Water Bottle',
            description: 'Stainless steel water bottle with university logo',
            dateLost: new Date('2025-09-01').toISOString(),
            busNumber: 'AD-9876',
            status: 'Reported',
            reportedBy: 'User',
            user: { 
              _id: user?._id || 'user1', 
              firstName: user?.firstName || 'Jane', 
              lastName: user?.lastName || 'Smith', 
              email: user?.email || 'jane@example.com',
              phone: '+94 771234568'
            },
            adminNotes: '',
            adminReply: 'Hi Jane! Your water bottle was found on bus AD-9876. It\'s currently at our lost & found office. Please contact us at +94 704 222 777 to arrange pickup. Thank you!',
            repliedBy: 'Admin Team',
            repliedAt: new Date('2025-10-14T14:20:00').toISOString(),
            createdAt: new Date('2025-09-21').toISOString(),
            updatedAt: new Date('2025-10-14T14:20:00').toISOString()
          }
        ];

        const filteredMockData = user?.role === 'passenger' 
          ? mockData.filter(item => 
              (item.user && item.user._id === user._id)
            )
          : mockData;

        setLostItems(filteredMockData);
        saveToLocalStorage(filteredMockData);
        
        // Log admin replies for debugging
        const itemsWithReplies = filteredMockData.filter(item => item.adminReply && item.adminReply.trim() !== '');
        console.log('Total items loaded:', filteredMockData.length);
        console.log('Items with admin replies:', itemsWithReplies.length);
        if (itemsWithReplies.length > 0) {
          console.log('Admin replies loaded:', itemsWithReplies.map(item => ({
            itemName: item.itemName,
            adminReply: item.adminReply,
            repliedBy: item.repliedBy
          })));
        } else {
          console.log('No admin replies found in mock data');
        }
        
        return;
      }

      const data = await response.json();
      
      if (data && data.lostItems) {
        const filteredData = user?.role === 'passenger' 
          ? data.lostItems.filter(item => 
              (item.user && item.user._id === user._id)
            )
          : data.lostItems;

        setLostItems(filteredData);
        saveToLocalStorage(filteredData);
      } else {
        console.warn('No lost items data received');
        setLostItems([]);
        saveToLocalStorage([]);
      }
    } catch (error) {
      console.error('Error fetching lost items:', error);
      setLostItems([]);
      saveToLocalStorage([]);
      toast.error('Failed to load lost items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Validation
    if (!formData.itemName.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    const busNumberError = getBusNumberError(formData.busNumber);
    if (busNumberError) {
      toast.error(busNumberError);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        dateLost: formData.dateLost,
        busNumber: formData.busNumber.trim()
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
          _id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
          ...submitData,
          status: 'Reported',
          reportedBy: user?.role === 'admin' ? 'Admin' : 'User',
          user: user?.role === 'passenger' ? user : null,
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

      // Update state and save to localStorage
      setLostItems(prev => {
        const updatedItems = [newItem, ...prev];
        saveToLocalStorage(updatedItems);
        return updatedItems;
      });
      
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
      if ((item.adminNotes && item.adminNotes.trim() !== '') || (item.adminReply && item.adminReply.trim() !== '')) {
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
      busNumber: item.busNumber || ''
    });
    setShowEditForm(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    if (!editingItem) {
      toast.error('No item selected for editing');
      return;
    }
    
    // Validation
    if (!formData.itemName.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    const busNumberError = getBusNumberError(formData.busNumber);
    if (busNumberError) {
      toast.error(busNumberError);
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
        busNumber: formData.busNumber.trim()
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
        updatedAt: new Date().toISOString()
      };

      // Update local state immediately for better UX and save to localStorage
      setLostItems(prev => {
        const updatedItems = prev.map(item =>
          item._id === editingItem._id ? { ...item, ...updates } : item
        );
        saveToLocalStorage(updatedItems);
        return updatedItems;
      });

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
      busNumber: ''
    });
    setValidationErrors({
      busNumber: ''
    });
  };

  const deleteItem = async (itemId) => {
    const item = lostItems.find(item => item._id === itemId);
    
    if (!item) {
      toast.error('Item not found');
      return;
    }
    
    if (!canDeleteItem(item)) {
      if ((item.adminNotes && item.adminNotes.trim() !== '') || (item.adminReply && item.adminReply.trim() !== '')) {
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
      
      // Optimistically remove from UI and save to localStorage
      setLostItems(prev => {
        const updatedItems = prev.filter(item => item._id !== itemId);
        saveToLocalStorage(updatedItems);
        return updatedItems;
      });
      
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

  // Clear localStorage data (for debugging)
  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.removeItem(LOST_ITEMS_STORAGE_KEY);
      localStorage.removeItem('buszone_lost_items');
      localStorage.removeItem('buszone_feedbacks');
      toast.success('All cache data cleared successfully');
      
      // Force refresh the page to reload fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Simulate admin reply for testing
  const simulateAdminReply = (itemId) => {
    const adminReplies = [
      "Thank you for reporting this item. We have found it and it is available for pickup at our main office. Please contact us at +94 704 222 777 to arrange collection.",
      "Hello! We found your item at the main depot. It's in good condition and ready for pickup. Please bring a valid ID when you come to collect it.",
      "Your lost item has been located and is currently at our lost & found office. Please contact us during business hours (9 AM - 5 PM) to arrange pickup.",
      "Good news! We have found your item. It's currently being held at our main office. Please call us at +94 704 222 777 to schedule a pickup time.",
      "We have successfully located your lost item. It's in excellent condition and ready for collection. Please visit our office with a valid ID to claim it."
    ];
    
    const randomReply = adminReplies[Math.floor(Math.random() * adminReplies.length)];
    
    // Simulate the real-time event system
    window.dispatchEvent(new CustomEvent('lostItemUpdated', {
      detail: {
        itemId: itemId,
        updates: {
          adminReply: randomReply,
          repliedBy: 'Sandeepa Admin',
          repliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        source: 'admin',
        adminReply: true
      }
    }));
  };

  // Permission checks - UPDATED TO DISABLE BUTTONS AFTER ADMIN REPLY
  const canEditItem = (item) => {
    if (!item) return false;
    
    // Admin can edit everything
    if (user?.role === 'admin') return true;
    
    // Users can only edit their own items that don't have admin responses
    const isOwnItem = item.user && item.user._id === user?._id;
    const hasAdminResponse = (item.adminNotes && item.adminNotes.trim() !== '') || (item.adminReply && item.adminReply.trim() !== '');
    
    return isOwnItem && !hasAdminResponse;
  };

  const canDeleteItem = (item) => {
    if (!item) return false;
    
    // Admin can delete everything
    if (user?.role === 'admin') return true;
    
    // Users can only delete their own items that don't have admin responses
    const isOwnItem = item.user && item.user._id === user?._id;
    const hasAdminResponse = (item.adminNotes && item.adminNotes.trim() !== '') || (item.adminReply && item.adminReply.trim() !== '');
    
    return isOwnItem && !hasAdminResponse;
  };

  const getLockIcon = (item) => {
    const userCanEdit = canEditItem(item);
    return userCanEdit ? <Unlock className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-red-400" />;
  };

  const getLockText = (item) => {
    const userCanEdit = canEditItem(item);
    const hasAdminResponse = (item.adminNotes && item.adminNotes.trim() !== '') || (item.adminReply && item.adminReply.trim() !== '');
    
    if (hasAdminResponse && !userCanEdit) {
      return 'Locked - Admin Replied';
    }
    
    return userCanEdit ? 'Editable' : 'Locked';
  };

  const getLockColor = (item) => {
    const userCanEdit = canEditItem(item);
    return userCanEdit ? 'text-green-400' : 'text-red-400';
  };

  const getReportedByIcon = (reportedBy) => {
    return <User className="w-4 h-4 text-blue-400" />;
  };

  const getReportedByText = (item) => {
    return `By: ${item.user?.firstName || 'User'}`;
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
      case 'reported': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'found': return 'bg-green-100 text-green-800 border border-green-300';
      case 'claimed': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'returned': return 'bg-purple-100 text-purple-800 border border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'reported': return <AlertCircle className="w-3 h-3" />;
      case 'found': return <CheckCircle className="w-3 h-3" />;
      case 'claimed': return <User className="w-3 h-3" />;
      case 'returned': return <CheckCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  // Navigation component
  const Navbar = () => (
    <div className="w-full h-[80px] bg-white/95 backdrop-blur-xl border-b border-blue-200/50 flex items-center px-6 lg:px-8 fixed top-0 z-50 shadow-lg">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-blue-50 text-slate-700 mr-4 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link to="/" className="mr-16 flex items-center space-x-3">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-xl shadow-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 bg-cyan-400 w-3 h-3 rounded-full"></div>
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              BusZone+
            </div>
            <div className="text-xs text-blue-600/70">
              Lost & Found
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-6 ml-auto">
        <div className="hidden md:flex items-center space-x-2 text-slate-700">
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
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden border-r border-blue-200`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-200">
          <h1 className="text-xl font-bold text-slate-800">Menu</h1>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-blue-50 text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          {/* Back to Booking Button */}
          <button
            onClick={() => {
              navigate('/booking');
              setSidebarOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            <span>Back</span>
          </button>
          
          <Link
            to="/booking"
            className="flex items-center px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg mb-2"
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </Link>
          
          {/* Debug option for admins */}
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                clearLocalStorage();
                setSidebarOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-lg mb-2"
            >
              <RefreshCw className="w-5 h-5 mr-3" />
              <span>Clear Local Data</span>
            </button>
          )}
          
          <button
            onClick={() => {
              navigate('/login');
              setSidebarOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <Navbar />
      <Sidebar />
      
      <div className="pt-20 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/booking')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Back</span>
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Lost & Found</h1>
                <p className="text-slate-600">Report and track lost items from your bus journeys</p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span>Data persistence: Active</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                  {lostItems.some(item => item.adminReply && item.adminReply.trim() !== '') && (
                    <>
                      <span className="ml-4 flex items-center">
                        <Reply className="w-3 h-3 mr-1 text-green-500" />
                        Admin replies: 
                        <span className="ml-1 font-semibold text-green-600">
                          {lostItems.filter(item => item.adminReply && item.adminReply.trim() !== '').length}
                        </span>
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                    </>
                  )}
                </div>
              </div>
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
                className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="text-slate-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white border border-blue-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
                className="p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-slate-700 hover:text-blue-600 transition-colors disabled:opacity-50 shadow-sm"
                title="Refresh data"
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
              <div className="col-span-full bg-gradient-to-br from-white to-blue-50 rounded-2xl p-12 text-center border border-blue-200 shadow-lg">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Items Found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No items match your search criteria" 
                    : "No lost items have been reported yet"}
                </p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 shadow-lg"
                >
                  Report First Item
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} data-item-id={item._id} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 relative shadow-lg hover:shadow-xl">
                  {/* Lock/Admin Indicator - FIXED POSITIONING */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1 z-10">
                    {getLockIcon(item)}
                    <span className={`text-xs font-medium ${getLockColor(item)}`}>
                      {getLockText(item)}
                    </span>
                  </div>

                  {/* Status Badge - IMPROVED STYLING */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 ${getStatusColor(item.status)} z-10 shadow-sm`}>
                    {getStatusIcon(item.status)}
                    <span className="font-semibold">{item.status}</span>
                  </div>

                  {/* Content with proper spacing */}
                  <div className="mt-12"> {/* Added margin top to avoid overlap */}
                    <div className="mb-4">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-semibold text-slate-800">{item.itemName}</h3>
                        {item.adminReply && item.adminReply.trim() !== '' && (
                          <span className={`ml-2 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse ${
                            item.status === 'Found' ? 'bg-green-500' :
                            item.status === 'Claimed' ? 'bg-blue-500' :
                            item.status === 'Returned' ? 'bg-purple-500' :
                            'bg-green-500'
                          }`}>
                            {item.status === 'Found' ? '🎉 Found & Replied' :
                             item.status === 'Claimed' ? '📦 Ready for Pickup' :
                             item.status === 'Returned' ? '✅ Returned' :
                             'Admin Replied'}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2">{item.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-700">
                        <Bus className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Bus: {item.busNumber}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-slate-700">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Lost on: {formatDate(item.dateLost)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-slate-700">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Reported: {formatDate(item.createdAt)}</span>
                      </div>

                      <div className="flex items-center text-sm text-slate-700">
                        {getReportedByIcon(item.reportedBy)}
                        <span className="ml-2">By: User</span>
                      </div>

                      {item.user && (
                        <div className="flex items-center text-sm text-slate-700">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          <span>User: {item.user.firstName} {item.user.lastName}</span>
                        </div>
                      )}
                    </div>

                    {item.adminNotes && item.adminNotes.trim() !== '' && (
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Admin Notes:</p>
                            <p className="text-slate-700 text-sm">{item.adminNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.adminReply && item.adminReply.trim() !== '' && (
                      <div className={`rounded-xl p-4 mb-4 shadow-lg relative overflow-hidden ${
                        item.status === 'Found' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' :
                        item.status === 'Claimed' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300' :
                        item.status === 'Returned' ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-300' :
                        'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
                      } animate-pulse`}>
                        {/* Animated background effect */}
                        <div className={`absolute inset-0 animate-pulse ${
                          item.status === 'Found' ? 'bg-gradient-to-r from-green-100/50 to-emerald-100/50' :
                          item.status === 'Claimed' ? 'bg-gradient-to-r from-blue-100/50 to-cyan-100/50' :
                          item.status === 'Returned' ? 'bg-gradient-to-r from-purple-100/50 to-violet-100/50' :
                          'bg-gradient-to-r from-green-100/50 to-emerald-100/50'
                        }`}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start">
                            <div className={`p-2 rounded-full mr-3 flex-shrink-0 animate-bounce shadow-lg ${
                              item.status === 'Found' ? 'bg-green-500' :
                              item.status === 'Claimed' ? 'bg-blue-500' :
                              item.status === 'Returned' ? 'bg-purple-500' :
                              'bg-green-500'
                            }`}>
                              <Reply className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className={`text-sm font-bold flex items-center ${
                                  item.status === 'Found' ? 'text-green-800' :
                                  item.status === 'Claimed' ? 'text-blue-800' :
                                  item.status === 'Returned' ? 'text-purple-800' :
                                  'text-green-800'
                                }`}>
                                  <span className={`px-2 py-1 rounded-full text-xs mr-2 animate-pulse shadow-md ${
                                    item.status === 'Found' ? 'bg-green-500 text-white' :
                                    item.status === 'Claimed' ? 'bg-blue-500 text-white' :
                                    item.status === 'Returned' ? 'bg-purple-500 text-white' :
                                    'bg-green-500 text-white'
                                  }`}>
                                    {item.status === 'Found' ? '🎉 FOUND' :
                                     item.status === 'Claimed' ? '📦 CLAIMED' :
                                     item.status === 'Returned' ? '✅ RETURNED' :
                                     'NEW'}
                                  </span>
                                  Admin Reply
                                </p>
                                {item.repliedBy && (
                                  <span className={`text-xs px-2 py-1 rounded-full shadow-sm ${
                                    item.status === 'Found' ? 'text-green-600 bg-green-100' :
                                    item.status === 'Claimed' ? 'text-blue-600 bg-blue-100' :
                                    item.status === 'Returned' ? 'text-purple-600 bg-purple-100' :
                                    'text-green-600 bg-green-100'
                                  }`}>
                                    by {item.repliedBy}
                                  </span>
                                )}
                              </div>
                              <div className={`rounded-lg p-3 border shadow-sm ${
                                item.status === 'Found' ? 'bg-white border-green-200' :
                                item.status === 'Claimed' ? 'bg-white border-blue-200' :
                                item.status === 'Returned' ? 'bg-white border-purple-200' :
                                'bg-white border-green-200'
                              }`}>
                                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">{item.adminReply}</p>
                              </div>
                              {item.repliedAt && (
                                <p className="text-xs text-slate-500 mt-2 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Replied on: {new Date(item.repliedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons - UPDATED TO DISABLE AFTER ADMIN REPLY */}
                    <div className="pt-3 border-t border-blue-200">
                      {user?.role === 'admin' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center shadow-sm"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Update
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm shadow-sm"
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
                                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm shadow-sm"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                            )}
                            
                            {canDeleteItem(item) && (
                              <button
                                onClick={() => deleteItem(item._id)}
                                className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm shadow-sm"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            )}
                          </div>
                          
                            {!canEditItem(item) && (
                             <div className="text-xs flex items-center text-red-600">
                               {((item.adminNotes && item.adminNotes.trim() !== '') || (item.adminReply && item.adminReply.trim() !== '')) ? (
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
                </div>
              ))
            )}
          </div>
        )}

        {/* Report Lost Item Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-blue-200 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Report Lost Item</h2>
                <button
                  onClick={() => {
                    setShowReportForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="e.g., Black backpack, Red umbrella"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                    placeholder="Describe the item in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Lost
                  </label>
                  <input
                    type="date"
                    value={formData.dateLost}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateLost: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bus Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => handleBusNumberChange(e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm ${
                      validationErrors.busNumber 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-blue-200 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., AD-9876"
                  />
                  {validationErrors.busNumber && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.busNumber}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportForm(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed shadow-lg"
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
            <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-blue-200 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Edit Lost Item</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

               {/* Warning message for users if item is locked */}
               {user?.role !== 'admin' && !canEditItem(editingItem) && (
                 <div className="border rounded-lg p-4 mb-4 bg-red-100 border-red-300">
                   <div className="flex items-start">
                     <Lock className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                     <div>
                       <h4 className="font-medium text-sm text-red-700">
                         Item Locked
                       </h4>
                       <p className="text-sm mt-1 text-red-600">
                         {((editingItem.adminNotes && editingItem.adminNotes.trim() !== '') || (editingItem.adminReply && editingItem.adminReply.trim() !== ''))
                           ? 'This item cannot be edited because an admin has responded to it.'
                           : 'You do not have permission to edit this item.'
                         }
                       </p>
                      {editingItem.adminNotes && editingItem.adminNotes.trim() !== '' && (
                        <div className="mt-2 p-2 bg-slate-100 rounded">
                          <p className="text-xs text-slate-600 mb-1">Admin Notes:</p>
                          <p className="text-xs text-slate-700">{editingItem.adminNotes}</p>
                        </div>
                      )}
                      {editingItem.adminReply && editingItem.adminReply.trim() !== '' && (
                        <div className="mt-2 p-2 bg-slate-100 rounded">
                          <p className="text-xs text-slate-600 mb-1">Admin Reply:</p>
                          <p className="text-xs text-slate-700">{editingItem.adminReply}</p>
                          {editingItem.repliedBy && (
                            <p className="text-xs text-slate-500 mt-1">by {editingItem.repliedBy}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    placeholder="e.g., Black backpack, Red umbrella"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    placeholder="Describe the item in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Lost
                  </label>
                  <input
                    type="date"
                    value={formData.dateLost}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateLost: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bus Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => handleBusNumberChange(e.target.value)}
                    disabled={user?.role !== 'admin' && !canEditItem(editingItem)}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                      validationErrors.busNumber 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-blue-200 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., AD-9876"
                  />
                  {validationErrors.busNumber && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.busNumber}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || (user?.role !== 'admin' && !canEditItem(editingItem))}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 shadow-lg"
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