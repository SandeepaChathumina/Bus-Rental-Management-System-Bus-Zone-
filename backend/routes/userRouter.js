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
import User from '../models/user.js';
import DriverProfile from '../models/driverProfile.js';
import StaffProfile from '../models/staffProfile.js';

const router = express.Router();

// ✅ Updated /me route
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach role-specific profile data if available
    if (user.role === 'driver') {
      const driverProfile = await DriverProfile.findOne({ user: user._id }).lean();
      user.driverProfile = driverProfile || null;
    } else if (user.role === 'staff') {
      const staffProfile = await StaffProfile.findOne({ user: user._id }).lean();
      user.staffProfile = staffProfile || null;
    }

    res.json(user);
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
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
router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
