import express from 'express';
import {
    reportLostItem,
    getLostItems,
    updateLostItem,
    deleteLostItem
} from '../controllers/lostItemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (user must be logged in)
router.route('/')
    .post(protect, reportLostItem) // Both users and admins can report
    .get(protect, getLostItems);   // Users see their items, Admins see all

// Routes for updating/deleting - typically only for admins
router.route('/:id')
    .put(protect, admin, updateLostItem)
    .delete(protect, admin, deleteLostItem);

export default router;