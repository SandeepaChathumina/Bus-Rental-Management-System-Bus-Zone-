// Test Real Places API
import realPlacesService from './utils/realPlacesService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRealPlaces() {
  console.log('🧪 Testing Real Places API for Sri Lankan Data...\n');
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'Not found');
  
  if (!apiKey) {
    console.log('❌ Google Places API key not found in .env file');
    console.log('Please add: GOOGLE_PLACES_API_KEY=your_api_key_here');
    return;
  }

  try {
    // Test Colombo attractions
    console.log('🏛️ Testing Colombo Tourist Attractions...');
    const colomboAttractions = await realPlacesService.getTouristAttractions('Colombo');
    console.log(`Found ${colomboAttractions.length} real attractions in Colombo:`);
    colomboAttractions.slice(0, 3).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log('');
    });

    // Test Colombo restaurants
    console.log('🍽️ Testing Colombo Restaurants...');
    const colomboRestaurants = await realPlacesService.getRestaurants('Colombo');
    console.log(`Found ${colomboRestaurants.length} real restaurants in Colombo:`);
    colomboRestaurants.slice(0, 3).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log('');
    });

    console.log('✅ Real Places API is working! You now have real Sri Lankan data.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Update your frontend to use /api/real-places/destination');
    console.log('2. Test with real data from Google Places API');
    console.log('3. Users will see actual places in Sri Lanka!');

  } catch (error) {
    console.error('❌ Error testing real places:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure GOOGLE_PLACES_API_KEY is set in .env');
    console.log('2. Enable Geocoding API and Places API in Google Cloud Console');
    console.log('3. Enable billing in Google Cloud Console');
    console.log('4. Wait 10 minutes after enabling APIs');
  }
}

testRealPlaces();
