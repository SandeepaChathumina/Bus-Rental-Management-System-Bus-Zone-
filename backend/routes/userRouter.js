import express from 'express';
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  getUserReport,
  checkUsernameAvailability,
  checkEmailAvailability,
  checkPhoneAvailability,
  checkNICAvailability,
  checkEmployeeIdAvailability
  
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/user.js';
import DriverProfile from '../models/driverProfile.js';
import StaffProfile from '../models/staffProfile.js';
import bcrypt from 'bcryptjs';

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

// Add this route to userRouter.js
router.get('/staff/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('staffProfile')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to your users.js file
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password using the User model's method
    await user.updatePassword(newPassword);
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add profile update route
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update only the allowed fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', registerUser);
router.get('/check-username', checkUsernameAvailability);
router.get('/check-email', checkEmailAvailability);
router.get('/check-phone', checkPhoneAvailability);
router.get('/check-nic', checkNICAvailability);
router.get('/check-employee-id', checkEmployeeIdAvailability);
router.post('/admin/register', protect, admin, registerUser);
router.post('/login', loginUser);
router.get('/report', protect, admin, getUserReport);
router.route('/').get(protect, admin, getUsers);
router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);
router.patch('/:id/activate', protect, admin, activateUser);  

export default router;
