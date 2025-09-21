import Notification from '../models/Notification.js';

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetAudience, expiresAt, isActive } = req.body;
    
    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create notification
    const notification = new Notification({
      title,
      message,
      type: type || 'general',
      targetAudience: targetAudience || 'all',
      expiresAt: expiresAt || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    // Save to database
    const savedNotification = await notification.save();
    
    // Populate createdBy field
    await savedNotification.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      data: savedNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all notifications (admin only)
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notifications for the current user
const getMyNotifications = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    // Find all active notifications that target this user
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: req.user.role },
        { targetAudience: req.user.userType }
      ],
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    // Add read status for each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const isRead = notification.readBy && notification.readBy.includes(userId);
      return {
        ...notification.toObject(),
        isRead: isRead || false
      };
    });

    res.json({
      success: true,
      count: notificationsWithReadStatus.length,
      data: notificationsWithReadStatus
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user already read this notification
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all unread notifications for this user
    const unreadNotifications = await Notification.find({
      readBy: { $ne: userId },
      isActive: true
    });

    // Mark all as read
    for (const notification of unreadNotifications) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Track notification click
const trackClick = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.clicks = (notification.clicks || 0) + 1;
    await notification.save();

    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Error tracking notification click:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle notification status (active/inactive)
const toggleNotificationStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error toggling notification status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const notifications = await Notification.find({});
    const total = notifications.length;
    
    const readCount = notifications.reduce((count, notification) => {
      return count + (notification.readBy && notification.readBy.length > 0 ? 1 : 0);
    }, 0);
    
    const totalClicks = notifications.reduce((sum, notification) => {
      return sum + (notification.clicks || 0);
    }, 0);
    
    res.json({
      success: true,
      data: {
        totalNotifications: total,
        readRate: total > 0 ? (readCount / total) * 100 : 0,
        clickRate: total > 0 ? (totalClicks / total) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  createNotification,
  getNotifications,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  trackClick,
  updateNotification,
  deleteNotification,
  toggleNotificationStatus,
  getNotificationStats
};