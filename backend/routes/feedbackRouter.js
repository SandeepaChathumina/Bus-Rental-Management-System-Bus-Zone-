import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getUserFeedbacks,
  getFeedbackById,
  updateFeedback,
  adminReply,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createFeedback);
router.get('/my-feedbacks', getUserFeedbacks);
router.put('/:id', updateFeedback);
router.get('/:id', getFeedbackById);

router.get('/', admin, getAllFeedbacks);
router.post('/:id/reply', admin, adminReply);
router.delete('/:id', deleteFeedback);

export default router;