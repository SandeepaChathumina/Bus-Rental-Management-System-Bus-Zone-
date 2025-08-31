import express from 'express';
import {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats,
  getStaffUsers,
  getActiveBuses,
  getMaintenanceByUser,
  getMaintenanceByBus,
  getMaintenanceCostStats
} from '../controllers/maintenanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected
router.post('/', protect, createMaintenance);
router.get('/', protect, getMaintenances);
router.get('/stats', protect, getMaintenanceStats);
router.get('/cost-stats', protect, getMaintenanceCostStats);
router.get('/staff-users', protect, getStaffUsers);
router.get('/active-buses', protect, getActiveBuses);
router.get('/user/:userId', protect, getMaintenanceByUser);
router.get('/bus/:busId', protect, getMaintenanceByBus);
router.get('/:id', protect, getMaintenanceById);
router.put('/:id', protect, updateMaintenance);
router.delete('/:id', protect, admin, deleteMaintenance);

export default router;