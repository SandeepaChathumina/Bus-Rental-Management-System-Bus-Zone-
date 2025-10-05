import axios from 'axios';

// Smart chatbot that gives direct, user-friendly answers
export const sendSmartMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = message.toLowerCase().trim();

    // Direct responses for common questions
    let response = getDirectResponse(userMessage);
    
    // If no direct response, use AI with a simpler prompt
    if (!response) {
      response = await getAIResponse(message, conversationHistory);
    }

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Smart chatbot error:', error);
    res.status(500).json({ 
      error: 'Sorry, I had trouble processing your message. Please try again.',
      details: error.message 
    });
  }
};

// Direct responses for common questions
function getDirectResponse(message) {
  const responses = {
    // Bus types questions
    'what types of bus': 'We have 5 types of buses:\n🚌 Standard - Great for regular trips ($50-80/day)\n🚌 Deluxe - More comfortable seats ($80-120/day)\n🚌 Luxury - Premium experience ($120-200/day)\n🚌 Mini - Perfect for small groups ($40-70/day)\n🚌 Double Decker - Great for big groups ($100-150/day)\n\nWhich one interests you?',
    
    'bus types': 'We have 5 types of buses:\n🚌 Standard - Great for regular trips\n🚌 Deluxe - More comfortable seats\n🚌 Luxury - Premium experience\n🚌 Mini - Perfect for small groups\n🚌 Double Decker - Great for big groups\n\nWhich one interests you?',
    
    'what buses': 'We offer Standard, Deluxe, Luxury, Mini, and Double Decker buses! Each has different capacity and comfort levels. What kind of trip are you planning? 🚌',
    
    'types of bus': 'We have 5 types of buses:\n🚌 Standard - Great for regular trips\n🚌 Deluxe - More comfortable seats\n🚌 Luxury - Premium experience\n🚌 Mini - Perfect for small groups\n🚌 Double Decker - Great for big groups\n\nWhich one interests you?',
    
    // Company questions
    'what is your company': 'We are Bus Zone! 🚌 A trusted bus rental company in Sri Lanka. We help people travel comfortably and safely around the country with our fleet of professional buses and drivers.',
    
    'your company': 'We are Bus Zone! 🚌 A trusted bus rental company in Sri Lanka. We help people travel comfortably and safely around the country.',
    
    'company': 'We are Bus Zone! 🚌 A trusted bus rental company in Sri Lanka. We help people travel comfortably and safely around the country.',
    
    'who are you': 'I\'m your friendly Bus Zone assistant! 😊 I\'m here to help you with bus rentals, pricing, booking, and any questions you have about our services.',
    
    // Pricing questions
    'luxury bus 2 days': 'For a luxury bus for 2 days, you\'re looking at around $240-400 total! 🚌✨ That includes the bus rental and a professional driver. Want to know about other options?',
    
    'luxury bus price': 'Our luxury buses cost $120-200 per day - they come with premium amenities and a professional driver! 🚌💎',
    
    'bus price': 'Here are our bus prices:\n🚌 Standard: $50-80/day\n🚌 Deluxe: $80-120/day\n🚌 Luxury: $120-200/day\n🚌 Mini: $40-70/day\n🚌 Double Decker: $100-150/day',
    
    'how much': 'Our bus prices start from $40/day for a mini bus up to $200/day for luxury buses! What type of trip are you planning? 🚌',
    
    'cost': 'Bus prices vary by type and duration. A standard bus costs $50-80/day, while luxury buses are $120-200/day. How many days do you need? 📅',
    
    // Booking questions
    'how to book': 'Booking is easy! 📝\n1. Call us at +94 11 234 5678 or visit our website\n2. Tell us your route and dates\n3. Choose your bus type\n4. Give us passenger details\n5. Pay securely and get your confirmation!\n\nNeed help with any step?',
    
    'book a bus': 'Great! To book a bus with us:\n📞 Call: +94 11 234 5678\n🌐 Website: www.buszone.lk\n\nJust tell us where you want to go and when! 🚌',
    
    'booking': 'Ready to book? Just call us at +94 11 234 5678 or visit www.buszone.lk! We\'ll help you find the perfect bus for your trip! 🎯',
    
    // Contact questions
    'phone number': 'You can reach us at +94 11 234 5678! 📞 We\'re here 24/7 to help with your bus rental needs!',
    
    'contact': 'Get in touch with us:\n📞 Phone: +94 11 234 5678\n📧 Email: info@buszone.lk\n🌐 Website: www.buszone.lk\n\nWe\'re always happy to help! 😊',
    
    'call': 'Call us anytime at +94 11 234 5678! Our friendly team is ready to help you plan your perfect trip! 📞✨',
    
    // Bus types
    'bus types': 'We have 5 types of buses:\n🚌 Standard - Great for regular trips\n🚌 Deluxe - More comfortable seats\n🚌 Luxury - Premium experience\n🚌 Mini - Perfect for small groups\n🚌 Double Decker - Great for big groups\n\nWhich one interests you?',
    
    'what buses': 'We offer Standard, Deluxe, Luxury, Mini, and Double Decker buses! Each has different capacity and comfort levels. What kind of trip are you planning? 🚌',
    
    // Routes
    'routes': 'Popular routes we serve:\n📍 Colombo to Kandy (3 hours) - $25-35\n📍 Colombo to Galle (2.5 hours) - $20-30\n📍 Colombo to Anuradhapura (4 hours) - $30-40\n📍 Colombo to Jaffna (6 hours) - $40-50\n\nWhere do you want to go? 🗺️',
    
    'colombo to kandy': 'Colombo to Kandy is a beautiful 3-hour journey! 🏔️ We have buses leaving regularly. Standard buses cost around $25-35 for this route. Want to book?',
    
    'colombo to galle': 'Colombo to Galle is a scenic 2.5-hour coastal drive! 🏖️ Prices start from $20-30. Perfect for a beach getaway!',
    
    // General help
    'help': 'I\'m here to help! 😊 I can help you with:\n💰 Pricing information\n📅 Booking process\n🚌 Bus types and routes\n📞 Contact details\n\nWhat would you like to know?',
    
    'hello': 'Hello! 👋 Welcome to Bus Zone! I\'m here to help you with bus rentals. What can I help you with today?',
    
    'hi': 'Hi there! 👋 Thanks for choosing Bus Zone! How can I help you plan your trip today?',
    
    'thanks': 'You\'re very welcome! 😊 Happy to help! Is there anything else you\'d like to know about our bus rental services?',
    
    'thank you': 'You\'re welcome! 😊 Feel free to ask if you need any more help with your bus rental!'
  };

  // Check for keywords in the message (more flexible matching)
  for (const [keyword, response] of Object.entries(responses)) {
    if (message.includes(keyword)) {
      return response;
    }
  }

  // Additional flexible matching for common variations
  if (message.includes('bus') && (message.includes('type') || message.includes('kind'))) {
    return 'We have 5 types of buses:\n🚌 Standard - Great for regular trips\n🚌 Deluxe - More comfortable seats\n🚌 Luxury - Premium experience\n🚌 Mini - Perfect for small groups\n🚌 Double Decker - Great for big groups\n\nWhich one interests you?';
  }

  if (message.includes('company') || message.includes('business') || message.includes('organization')) {
    return 'We are Bus Zone! 🚌 A trusted bus rental company in Sri Lanka. We help people travel comfortably and safely around the country with our fleet of professional buses and drivers.';
  }

  if (message.includes('who') && message.includes('you')) {
    return 'I\'m your friendly Bus Zone assistant! 😊 I\'m here to help you with bus rentals, pricing, booking, and any questions you have about our services.';
  }

  return null;
}

// AI response for complex questions
async function getAIResponse(message, conversationHistory) {
  try {
    const simplePrompt = `You are a friendly Bus Zone customer service representative. Answer this question about bus rentals in a helpful, conversational way: "${message}"`;
    
    const response = await axios.post(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`, {
      model: process.env.OLLAMA_MODEL || 'tinyllama',
      messages: [
        {
          role: 'system',
          content: simplePrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 200
      }
    });

    return response.data.message.content;
  } catch (error) {
    return 'I\'m sorry, I couldn\'t process that right now. Please call us at +94 11 234 5678 for immediate assistance! 📞';
  }
}
