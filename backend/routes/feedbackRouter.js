import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getPublicTestimonials,
  getUserFeedbacks,
  getFeedbackById,
  updateFeedback,
  adminReply,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/testimonials', getPublicTestimonials);

// Protected routes (authentication required)
router.use(protect);

router.post('/', createFeedback);
router.get('/my-feedbacks', getUserFeedbacks);
router.put('/:id', updateFeedback);
router.get('/:id', getFeedbackById);

// Admin only routes
router.get('/', admin, getAllFeedbacks);
router.post('/:id/reply', admin, adminReply);
router.delete('/:id', deleteFeedback);

export default router;