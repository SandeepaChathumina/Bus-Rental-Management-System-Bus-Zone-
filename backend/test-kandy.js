// Test Kandy suggestions
import { getTravelSuggestions } from './controllers/simplePlacesController.js';

const mockReq = {
  query: { destination: 'Kandy' }
};

const mockRes = {
  json: (data) => {
    console.log('✅ Kandy API Response:');
    console.log(JSON.stringify(data, null, 2));
  },
  status: (code) => ({
    json: (data) => {
      console.log(`❌ Error ${code}:`);
      console.log(JSON.stringify(data, null, 2));
    }
  })
};

console.log('🧪 Testing Kandy Travel Suggestions...\n');
getTravelSuggestions(mockReq, mockRes);
