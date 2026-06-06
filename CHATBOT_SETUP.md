# Bus Zone Chatbot Setup Guide

## Overview
This guide will help you set up the Ollama-powered chatbot for your Bus Rental Management System.

## Prerequisites
- Node.js and npm installed
- Your Bus Zone application running

## Step 1: Install Ollama

### Windows
1. Download Ollama from: https://ollama.ai/download
2. Install the application
3. Open Command Prompt or PowerShell
4. Run: `ollama --version` to verify installation

### macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Step 2: Download a Model

Choose one of these models (recommended for your use case):

### Option 1: Llama 3.2 (Recommended - Good balance of performance and speed)
```bash
ollama pull llama3.2
```

### Option 2: Llama 3.1 (More powerful but larger)
```bash
ollama pull llama3.1
```

### Option 3: Mistral (Fast and efficient)
```bash
ollama pull mistral
```

### Option 4: CodeLlama (If you want coding assistance)
```bash
ollama pull codellama
```

## Step 3: Start Ollama Service

```bash
ollama serve
```

This will start the Ollama service on `http://localhost:11434`

## Step 4: Configure Your Backend

Add these environment variables to your `backend/.env` file:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Step 5: Test the Setup

### Test Ollama Directly
```bash
ollama run llama3.2
```
Type a message and see if it responds.

### Test Your Backend API
```bash
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me with bus booking?"}'
```

### Test Frontend Integration
1. Start your frontend: `npm run dev`
2. Look for the blue chatbot button in the bottom-right corner
3. Click it and try sending a message

## Step 6: Customize the Chatbot

### Update System Prompt
Edit `backend/controllers/chatbotController.js` and modify the `SYSTEM_PROMPT` variable to customize how your chatbot behaves.

### Add Bus-Specific Knowledge
You can enhance the system prompt with specific information about:
- Your bus routes
- Pricing information
- Schedule details
- Company policies

## Troubleshooting

### Common Issues

1. **"Ollama service is not available"**
   - Make sure Ollama is running: `ollama serve`
   - Check if the service is accessible: `curl http://localhost:11434/api/tags`

2. **"Model not found"**
   - Pull the model: `ollama pull llama3.2`
   - Check available models: `ollama list`

3. **Slow responses**
   - Try a smaller model like `mistral`
   - Reduce the `max_tokens` in the controller

4. **Memory issues**
   - Use a smaller model
   - Close other applications
   - Consider using a model with fewer parameters

### Performance Tips

1. **For better performance:**
   - Use `mistral` for faster responses
   - Use `llama3.2` for better quality
   - Use `llama3.1` for best quality (requires more RAM)

2. **For development:**
   - Start with `mistral` for quick testing
   - Switch to `llama3.2` for production

## API Endpoints

Your chatbot now has these endpoints:

- `POST /api/chatbot/chat` - Send a message
- `GET /api/chatbot/models` - Get available models
- `GET /api/chatbot/status` - Check Ollama service status

## Frontend Features

The chatbot component includes:
- ✅ Floating chat button
- ✅ Minimizable chat window
- ✅ Message history
- ✅ Typing indicators
- ✅ Error handling
- ✅ Responsive design
- ✅ Clear chat functionality

## Next Steps

1. **Customize the chatbot's knowledge** by updating the system prompt
2. **Add more specific bus-related information** to make it more helpful
3. **Consider adding authentication** to track user conversations
4. **Add conversation persistence** to save chat history
5. **Implement user feedback** to improve responses

## Support

If you encounter issues:
1. Check the Ollama logs: `ollama logs`
2. Verify your model is downloaded: `ollama list`
3. Test the API endpoints directly
4. Check your browser's developer console for errors

Happy chatting! 🚌💬
