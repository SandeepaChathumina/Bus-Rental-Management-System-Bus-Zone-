// routes/userRoutes.js
import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes below require authentication
router.use(protect);

// Admin-only
router.get('/', authorizeRoles('admin'), getAllUsers);
router.get('/:id', authorizeRoles('admin'), getUserById);
router.put('/:id', authorizeRoles('admin'), updateUserById);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

export default router;
