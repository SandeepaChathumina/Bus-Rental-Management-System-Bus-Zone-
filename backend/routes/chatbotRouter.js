import express from 'express';
import { sendMessage, getAvailableModels, checkOllamaStatus } from '../controllers/chatbotController.js';

const router = express.Router();

// Chat endpoint
router.post('/chat', sendMessage);

// Get available models
router.get('/models', getAvailableModels);

// Check Ollama service status
router.get('/status', checkOllamaStatus);

export default router;
