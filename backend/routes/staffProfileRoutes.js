// routes/staffProfileRoutes.js
import express from 'express';
import StaffProfile from '../models/staffProfile.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Update staff profile
router.put('/:id', protect, async (req, res) => {
  try {
    const { staffRole, department, salary } = req.body;
    
    const staffProfile = await StaffProfile.findByIdAndUpdate(
      req.params.id,
      { staffRole, department, salary },
      { new: true, runValidators: true }
    );

    if (!staffProfile) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    res.json(staffProfile);
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;