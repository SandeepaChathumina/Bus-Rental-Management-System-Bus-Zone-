import axios from 'axios';

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2'; // You can change this to any model you prefer

// Chatbot system prompt for bus rental management
const SYSTEM_PROMPT = `You are a helpful assistant for a Bus Rental Management System called "Bus Zone". 
You can help users with:
- Bus booking inquiries
- Route information
- Pricing details
- Schedule information
- General customer support
- Lost and found items
- Payment queries
- Maintenance updates

Always be friendly, professional, and helpful. If you don't know something specific about the system, 
direct users to contact customer support or check the website for more details.`;

export const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare the conversation context
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Ollama API
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000
      }
    });

    const botResponse = response.data.message.content;

    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Chatbot service is currently unavailable. Please try again later.',
        details: 'Ollama service is not running'
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(503).json({ 
        error: 'Chatbot model is not available. Please contact support.',
        details: 'Model not found'
      });
    }

    res.status(500).json({ 
      error: 'Failed to process your message. Please try again.',
      details: error.message 
    });
  }
};

export const getAvailableModels = async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models || [];
    
    res.json({
      success: true,
      models: models.map(model => ({
        name: model.name,
        size: model.size,
        modified_at: model.modified_at
      }))
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available models',
      details: error.message 
    });
  }
};

export const checkOllamaStatus = async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    res.json({
      success: true,
      status: 'connected',
      message: 'Ollama service is running'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'disconnected',
      message: 'Ollama service is not available',
      error: error.message
    });
  }
};
