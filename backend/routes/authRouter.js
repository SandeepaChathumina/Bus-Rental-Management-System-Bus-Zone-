// routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('firstName required'),
    body('lastName').notEmpty().withMessage('lastName required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
  ],
  register
);

router.post('/login', login);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
