import express from 'express';
import {
  createNotification,
  getNotifications,
  getMyNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationReport,
  getPromotionalNotifications,
  searchNotifications
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/promotional', getPromotionalNotifications);


router.use(protect);


router.get('/my-notifications', getMyNotifications);
router.get('/:id', getNotificationById);


router.post('/', admin, createNotification);
router.get('/', admin, getNotifications);
router.get('/admin/report', admin, getNotificationReport);
router.get('/admin/search', admin, searchNotifications);
router.put('/:id', admin, updateNotification);
router.delete('/:id', admin, deleteNotification);

export default router;