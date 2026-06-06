import Notification from '../models/Notification.js';

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetAudience, expiresAt, isActive, status } = req.body;
    
    console.log('\n🔧 === CREATING NOTIFICATION ===');
    console.log('Request body:', { title, message, type, targetAudience, expiresAt, isActive, status });
    
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
      status: status || 'draft', // Explicitly set status
      createdBy: req.user._id
    });

    console.log('Notification object before save:', {
      title: notification.title,
      targetAudience: notification.targetAudience,
      status: notification.status,
      isActive: notification.isActive
    });

    // Save to database
    const savedNotification = await notification.save();
    
    console.log('Notification saved successfully:', {
      id: savedNotification._id,
      title: savedNotification.title,
      status: savedNotification.status,
      isActive: savedNotification.isActive,
      targetAudience: savedNotification.targetAudience
    });
    
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
    const { _id: userId, role, userType } = req.user;
    
    // Find all active notifications that target this user
    const notifications = await Notification.find({
      isActive: true,
      status: { $ne: 'draft' }, // Exclude draft notifications
      $and: [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: role },
            { targetAudience: userType },
            // Handle plural forms
            { targetAudience: role + 's' }, // passenger -> passengers
            { targetAudience: userType + 's' } // passenger -> passengers
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    // Debug: Get all notifications first to see what exists
    const allNotifications = await Notification.find({});
    console.log(`\n🔍 === NOTIFICATION DEBUG FOR USER ${userId} ===`);
    console.log(`User role: ${role}, userType: ${userType}`);
    console.log(`\n📊 ALL NOTIFICATIONS IN DATABASE (${allNotifications.length} total):`);
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   - Status: ${notif.status}`);
      console.log(`   - isActive: ${notif.isActive}`);
      console.log(`   - Target: ${notif.targetAudience}`);
      console.log(`   - Expires: ${notif.expiresAt || 'Never'}`);
    });

    console.log(`\n✅ FILTERED NOTIFICATIONS FOR USER (${notifications.length} found):`);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} (${notif.targetAudience})`);
    });

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
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the notification first
    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Handle status changes
    if (updateData.status && updateData.status !== existingNotification.status) {
      console.log(`\n🔄 === UPDATING NOTIFICATION STATUS ===`);
      console.log(`Notification: ${existingNotification.title}`);
      console.log(`Changing from: ${existingNotification.status} to ${updateData.status}`);
      console.log(`Current isActive: ${existingNotification.isActive}`);
      
      // If changing to sent, ensure it's active
      if (updateData.status === 'sent') {
        updateData.isActive = true;
        console.log(`✅ Setting isActive to true for sent notification`);
      }
      
      // If changing to draft, deactivate
      if (updateData.status === 'draft') {
        updateData.isActive = false;
        console.log(`❌ Setting isActive to false for draft notification`);
      }
      
      console.log(`Final updateData:`, {
        status: updateData.status,
        isActive: updateData.isActive,
        targetAudience: updateData.targetAudience || existingNotification.targetAudience
      });
    }

    // Update the notification
    const notification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    console.log(`\n=== NOTIFICATION UPDATED ===`);
    console.log(`Updated notification: ${notification.title}`);
    console.log(`New status: ${notification.status}`);
    console.log(`New isActive: ${notification.isActive}`);
    console.log(`Target audience: ${notification.targetAudience}`);

    res.json({
      success: true,
      message: 'Notification updated successfully',
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

// Send notification (change status from draft to sent)
const sendNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Update status to sent
    notification.status = 'sent';
    notification.isActive = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Test endpoint to check notification visibility
const testNotificationVisibility = async (req, res) => {
  try {
    const { role, userType } = req.query;
    
    console.log('\n🔍 === NOTIFICATION VISIBILITY TEST ===');
    console.log(`Testing for role: ${role}, userType: ${userType}`);
    
    // Get all notifications first
    const allNotifications = await Notification.find({});
    console.log(`\n📊 ALL NOTIFICATIONS IN DATABASE (${allNotifications.length} total):`);
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   - Status: ${notif.status}`);
      console.log(`   - isActive: ${notif.isActive}`);
      console.log(`   - Target: ${notif.targetAudience}`);
      console.log(`   - Expires: ${notif.expiresAt || 'Never'}`);
    });
    
    // Get filtered notifications
    const filteredNotifications = await Notification.find({
      isActive: true,
      status: { $ne: 'draft' },
      $and: [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: role },
            { targetAudience: userType },
            // Handle plural forms
            { targetAudience: role + 's' }, // passenger -> passengers
            { targetAudience: userType + 's' } // passenger -> passengers
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    });

    console.log(`\n✅ FILTERED NOTIFICATIONS (${filteredNotifications.length} found):`);
    filteredNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} (${notif.targetAudience})`);
    });

    res.json({
      success: true,
      data: {
        allNotifications: allNotifications.map(n => ({
          id: n._id,
          title: n.title,
          status: n.status,
          isActive: n.isActive,
          targetAudience: n.targetAudience
        })),
        filteredNotifications: filteredNotifications.map(n => ({
          id: n._id,
          title: n.title,
          status: n.status,
          isActive: n.isActive,
          targetAudience: n.targetAudience
        })),
        query: { role, userType }
      }
    });
  } catch (error) {
    console.error('Error testing notification visibility:', error);
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
  getNotificationStats,
  sendNotification,
  testNotificationVisibility
};