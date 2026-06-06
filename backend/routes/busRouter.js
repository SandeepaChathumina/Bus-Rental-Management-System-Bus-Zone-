import express from 'express';
import {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
  getBusStats,
  getBusesByStatus,
  reactivateBus,
  getBusesByPriceRange,
  getPricingStats
} from '../controllers/busController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected, some require admin
router.post('/', protect, admin, createBus);
router.get('/', protect, getBuses);
router.get('/stats', protect, getBusStats);
router.get('/pricing-stats', protect, getPricingStats);
router.get('/price-range', protect, getBusesByPriceRange);
router.get('/status/:status', protect, getBusesByStatus);
router.get('/:id', protect, getBusById);
router.put('/:id', protect, admin, updateBus);
router.patch('/:id/reactivate', protect, admin, reactivateBus);
router.delete('/:id', protect, admin, deleteBus);

export default router;