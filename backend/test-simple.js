// Test the simple controller directly
import { getTravelSuggestions } from './controllers/simplePlacesController.js';

// Mock request and response
const mockReq = {
  query: { destination: 'Colombo' }
};

const mockRes = {
  json: (data) => {
    console.log('✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
  },
  status: (code) => ({
    json: (data) => {
      console.log(`❌ Error ${code}:`);
      console.log(JSON.stringify(data, null, 2));
    }
  })
};

console.log('🧪 Testing Simple Travel Suggestions...\n');

// Test the function
getTravelSuggestions(mockReq, mockRes);
