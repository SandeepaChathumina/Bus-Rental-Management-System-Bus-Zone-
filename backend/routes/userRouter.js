import express from 'express';
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserReport,
  checkUsernameAvailability,
  checkEmailAvailability,
  checkPhoneAvailability,
  checkNICAvailability
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.post('/register', registerUser);
router.get('/check-username', checkUsernameAvailability);
router.get('/check-email', checkEmailAvailability);
router.get('/check-phone', checkPhoneAvailability);
router.get('/check-nic', checkNICAvailability);
router.post('/admin/register', protect, admin, registerUser);
router.post('/login', loginUser);
router.get('/report', protect, admin, getUserReport);
router.route('/').get(protect, admin, getUsers);
router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);

export default router;