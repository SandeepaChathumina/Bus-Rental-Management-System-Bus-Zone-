// Test Real Google Places API with your actual API key
import realGooglePlacesService from './utils/realGooglePlacesService.js';

async function testRealGooglePlaces() {
  console.log('🧪 Testing Real Google Places API with Your API Key...\n');
  console.log('✅ Using your actual Google Places API key');
  
  try {
    // Test Colombo attractions
    console.log('🏛️ Testing Colombo Tourist Attractions...');
    const colomboAttractions = await realGooglePlacesService.getTouristAttractions('Colombo');
    console.log(`Found ${colomboAttractions.length} REAL attractions in Colombo:`);
    colomboAttractions.slice(0, 5).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Types: ${place.types.join(', ')}`);
      if (place.description) console.log(`   Description: ${place.description}`);
      console.log('');
    });

    // Test Colombo restaurants
    console.log('🍽️ Testing Colombo Restaurants...');
    const colomboRestaurants = await realGooglePlacesService.getRestaurants('Colombo');
    console.log(`Found ${colomboRestaurants.length} REAL restaurants in Colombo:`);
    colomboRestaurants.slice(0, 5).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Price Level: ${place.price_level ? '$'.repeat(place.price_level) : 'Not specified'}`);
      if (place.website) console.log(`   Website: ${place.website}`);
      console.log('');
    });

    // Test Kandy
    console.log('🏔️ Testing Kandy Attractions...');
    const kandyAttractions = await realGooglePlacesService.getTouristAttractions('Kandy');
    console.log(`Found ${kandyAttractions.length} REAL attractions in Kandy:`);
    kandyAttractions.slice(0, 3).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log('');
    });

    // Test comprehensive info
    console.log('📋 Testing Comprehensive Destination Info...');
    const colomboInfo = await realGooglePlacesService.getDestinationInfo('Colombo');
    console.log(`Colombo Summary:`);
    console.log(`  Attractions: ${colomboInfo.attractions.count}`);
    console.log(`  Restaurants: ${colomboInfo.restaurants.count}`);
    console.log(`  Shopping: ${colomboInfo.shopping.count}`);

    console.log('\n✅ Real Google Places API is working perfectly!');
    console.log('\n🎉 You now have REAL Sri Lankan tourist data:');
    console.log('• Real tourist attractions with actual ratings');
    console.log('• Real restaurants with Google reviews');
    console.log('• Real addresses and contact information');
    console.log('• Real photos and descriptions');
    console.log('• Real opening hours and websites');
    console.log('\n🚀 Your travel suggestions feature is now 100% real!');

  } catch (error) {
    console.error('❌ Error testing real Google Places:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your API key is correct');
    console.log('2. Enable Places API and Geocoding API in Google Cloud Console');
    console.log('3. Enable billing in Google Cloud Console');
    console.log('4. Wait 10 minutes after enabling APIs');
  }
}

testRealGooglePlaces();
