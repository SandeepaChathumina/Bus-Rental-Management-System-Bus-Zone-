import express from 'express';
import {
  createSchedule,
  getSchedules,
  getDriverSchedule,
  updateSchedule,
  cancelSchedule
} from '../controllers/scheduleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', admin, createSchedule);
router.get('/', admin, getSchedules);
router.get('/driver', getDriverSchedule); // For drivers to view their own schedule
router.put('/:id', admin, updateSchedule);
router.patch('/:id/cancel', admin, cancelSchedule);

export default router;