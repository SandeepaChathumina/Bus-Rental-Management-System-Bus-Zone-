import Notification from '../models/notification.js';


const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const { role } = req.user;
    
    const notifications = await Notification.find({
      $or: [
        { targetAudience: 'all' },
        { targetAudience: role },
        { isPublic: true }
      ],
      status: { $in: ['sent', 'scheduled'] },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


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

   
    notification.readStatus = true;
    notification.clickCount += 1;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getNotificationReport = async (req, res) => {
  try {
    const notifications = await Notification.find({});

    const report = {
      totalNotifications: notifications.length,
      byType: {
        discount: notifications.filter(n => n.type === 'discount').length,
        package: notifications.filter(n => n.type === 'package').length,
        alert: notifications.filter(n => n.type === 'alert').length,
        reminder: notifications.filter(n => n.type === 'reminder').length,
        booking_confirmation: notifications.filter(n => n.type === 'booking_confirmation').length,
        promotional: notifications.filter(n => n.type === 'promotional').length,
        seasonal_offer: notifications.filter(n => n.type === 'seasonal_offer').length
      },
      byStatus: {
        draft: notifications.filter(n => n.status === 'draft').length,
        scheduled: notifications.filter(n => n.status === 'scheduled').length,
        sent: notifications.filter(n => n.status === 'sent').length,
        failed: notifications.filter(n => n.status === 'failed').length,
        expired: notifications.filter(n => n.status === 'expired').length
      },
      byTargetAudience: {
        all: notifications.filter(n => n.targetAudience === 'all').length,
        passengers: notifications.filter(n => n.targetAudience === 'passengers').length,
        drivers: notifications.filter(n => n.targetAudience === 'drivers').length,
        staff: notifications.filter(n => n.targetAudience === 'staff').length,
        admins: notifications.filter(n => n.targetAudience === 'admins').length
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getPromotionalNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      type: { $in: ['seasonal_offer', 'promotional', 'discount'] },
      isPublic: true,
      status: 'sent',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const searchNotifications = async (req, res) => {
  try {
    const { type, status, targetAudience, title } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (targetAudience) query.targetAudience = targetAudience;
    if (title) query.title = { $regex: title, $options: 'i' };

    const notifications = await Notification.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
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
  updateNotification,
  deleteNotification,
  getNotificationReport,
  getPromotionalNotifications,
  searchNotifications
};