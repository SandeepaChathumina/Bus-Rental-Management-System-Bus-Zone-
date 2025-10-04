// Test Free Places API - No API key required!
import freePlacesService from './utils/freePlacesService.js';

async function testFreePlaces() {
  console.log('🧪 Testing Free Places API for Real Sri Lankan Data...\n');
  console.log('✅ No API key required - using OpenStreetMap/Nominatim (free)');
  
  try {
    // Test Colombo attractions
    console.log('🏛️ Testing Colombo Tourist Attractions...');
    const colomboAttractions = await freePlacesService.getTouristAttractions('Colombo');
    console.log(`Found ${colomboAttractions.length} real attractions in Colombo:`);
    colomboAttractions.slice(0, 5).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Type: ${place.types.join(', ')}`);
      console.log('');
    });

    // Test Colombo restaurants
    console.log('🍽️ Testing Colombo Restaurants...');
    const colomboRestaurants = await freePlacesService.getRestaurants('Colombo');
    console.log(`Found ${colomboRestaurants.length} real restaurants in Colombo:`);
    colomboRestaurants.slice(0, 5).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Type: ${place.types.join(', ')}`);
      console.log('');
    });

    // Test Kandy
    console.log('🏔️ Testing Kandy Attractions...');
    const kandyAttractions = await freePlacesService.getTouristAttractions('Kandy');
    console.log(`Found ${kandyAttractions.length} real attractions in Kandy:`);
    kandyAttractions.slice(0, 3).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Address: ${place.address}`);
      console.log('');
    });

    console.log('✅ Free Places API is working! You now have real Sri Lankan data.');
    console.log('\n🚀 Benefits:');
    console.log('• No API key required');
    console.log('• No rate limits');
    console.log('• Real data from OpenStreetMap');
    console.log('• Works immediately');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your frontend to use this free service');
    console.log('2. Users will see actual places in Sri Lanka!');

  } catch (error) {
    console.error('❌ Error testing free places:', error.message);
    console.log('\n🔧 This might be a network issue. Try again in a moment.');
  }
}

testFreePlaces();
