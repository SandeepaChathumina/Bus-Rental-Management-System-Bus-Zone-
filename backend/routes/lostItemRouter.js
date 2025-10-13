import express from 'express';
import {
    reportLostItem,
    getLostItems,
    updateLostItem,
    deleteLostItem,
    addAdminReply
} from '../controllers/lostItemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (user must be logged in)
router.route('/')
    .post(protect, reportLostItem)
    .get(protect, getLostItems);

router.route('/:id')
    .put(protect, admin, updateLostItem)
    .delete(protect, admin, deleteLostItem);

router.route('/:id/reply')
    .post(protect, admin, addAdminReply);

export default router;