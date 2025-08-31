import express from 'express';
import {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus
} from '../controllers/busController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected, some require admin
router.post('/', protect, admin, createBus);
router.get('/', protect, getBuses);
router.get('/:id', protect, getBusById);
router.put('/:id', protect, admin, updateBus);
router.delete('/:id', protect, admin, deleteBus);

export default router;