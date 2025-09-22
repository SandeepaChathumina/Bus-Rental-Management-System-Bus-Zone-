import express from 'express';
import { calculateRoute } from '../controllers/routeController.js';

const router = express.Router();

router.post('/calculate', calculateRoute);

export default router;