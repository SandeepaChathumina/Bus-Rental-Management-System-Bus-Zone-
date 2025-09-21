import express from 'express';
import {
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
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (if any)

// Protected routes
router.use(protect);

router.get('/my-notifications', getMyNotifications);
router.get('/stats', getNotificationStats);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/click', trackClick);
router.get('/:id', getNotificationById);

// Admin only routes
router.use(admin); // All routes below this require admin role

router.route('/')
  .post(createNotification)
  .get(getNotifications);

router.route('/:id')
  .put(updateNotification)
  .delete(deleteNotification);

router.patch('/:id/status', toggleNotificationStatus);

export default router;
