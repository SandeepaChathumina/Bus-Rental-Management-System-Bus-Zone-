// Simple Places Router
import express from 'express';
import { getTravelSuggestions } from '../controllers/simplePlacesController.js';

const router = express.Router();

// GET /api/simple-places/suggestions?destination=Colombo
router.get('/suggestions', getTravelSuggestions);

export default router;
