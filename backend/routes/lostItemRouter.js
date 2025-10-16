import express from 'express';
import {
    reportLostItem,
    getLostItems,
    updateLostItem,
    addAdminReply,
    deleteLostItem
} from '../controllers/lostItemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .post(reportLostItem) // Both users and admins can report lost items
    .get(getLostItems);   // Users see their items, admins see all

// Admin only routes
router.route('/:id')
    .put(admin, updateLostItem)
    .delete(admin, deleteLostItem);

router.route('/:id/reply')
    .post(admin, addAdminReply);

export default router;