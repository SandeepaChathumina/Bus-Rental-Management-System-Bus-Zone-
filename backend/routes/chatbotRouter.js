import express from 'express';
import { sendMessage, getAvailableModels, checkOllamaStatus } from '../controllers/chatbotController.js';
import { sendSmartMessage } from '../controllers/smartChatbotController.js';

const router = express.Router();

// Chat endpoint
router.post('/chat', sendMessage);

// Smart chat endpoint with direct responses
router.post('/chat-smart', sendSmartMessage);

// Get available models
router.get('/models', getAvailableModels);

// Check Ollama service status
router.get('/status', checkOllamaStatus);

export default router;
