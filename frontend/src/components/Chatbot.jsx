import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, MessageCircle } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Bus Zone assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newMessageId, setNewMessageId] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Clean up message animation flags after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => ({ ...msg, isNew: false }))
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      isNew: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await axios.post('http://localhost:3000/api/chatbot/chat-smart', {
        message: inputMessage,
        conversationHistory
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        isNew: true
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
        isNew: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your Bus Zone assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
      setIsAnimating(false);
    }, 200);
  };

  const handleOpenChat = () => {
    setIsAnimating(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleCloseChat = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleMinimizeToggle = () => {
    setIsAnimating(true);
    setIsMinimized(!isMinimized);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 floating-button glow-effect group"
          aria-label="Open chatbot"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:animate-bounce" />
          </div>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={`fixed bottom-6 right-6 chatbot-window rounded-2xl shadow-2xl z-50 transition-all duration-500 ease-out ${
            isAnimating ? 'chatbot-enter' : ''
          } ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot size={20} className="animate-pulse" />
              </div>
              <div>
                <span className="font-semibold text-sm">Bus Zone Assistant</span>
                <div className="text-xs text-blue-200">Online</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMinimizeToggle}
                className="text-white hover:text-gray-200 transition-all duration-200 hover:bg-white hover:bg-opacity-20 p-1 rounded"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={handleCloseChat}
                className="text-white hover:text-gray-200 transition-all duration-200 hover:bg-white hover:bg-opacity-20 p-1 rounded"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[350px] scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                      message.isNew ? (message.sender === 'user' ? 'message-enter-user' : 'message-enter') : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl message-bubble ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200 shadow-sm'
                          : 'bg-gray-50 text-gray-800 shadow-sm border border-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && !message.isError && (
                          <div className="relative">
                            <Bot size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                            <Sparkles size={8} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          <p className="text-xs opacity-70 mt-2 flex items-center space-x-1">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                          </p>
                        </div>
                        {message.sender === 'user' && (
                          <User size={16} className="mt-0.5 flex-shrink-0 text-blue-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 text-gray-800 p-4 rounded-2xl max-w-[80%] shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Bot size={16} className="text-blue-600" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot"></div>
                        </div>
                        <span className="text-xs text-gray-500">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MessageCircle size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none group"
                  >
                    <Send size={16} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={clearChat}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    🗑️ Clear chat
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      Powered by AI
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
