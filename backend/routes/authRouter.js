// routes/authRouter.js
import express from 'express';
import { loginUser } from '../controllers/userController.js';
import { register } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);

export default router;