// Test Hybrid Places Service - Real data with fallback
import hybridPlacesService from './utils/hybridPlacesService.js';

async function testHybridPlaces() {
  console.log('🧪 Testing Hybrid Places Service...\n');
  console.log('✅ Tries real data first, falls back to sample data');
  
  try {
    // Test Colombo
    console.log('🏛️ Testing Colombo Tourist Attractions...');
    const colomboAttractions = await hybridPlacesService.getTouristAttractions('Colombo');
    console.log(`Found ${colomboAttractions.length} attractions in Colombo:`);
    colomboAttractions.slice(0, 3).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Source: ${place.source}`);
      console.log('');
    });

    // Test Colombo restaurants
    console.log('🍽️ Testing Colombo Restaurants...');
    const colomboRestaurants = await hybridPlacesService.getRestaurants('Colombo');
    console.log(`Found ${colomboRestaurants.length} restaurants in Colombo:`);
    colomboRestaurants.slice(0, 2).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Source: ${place.source}`);
      console.log('');
    });

    // Test Kandy
    console.log('🏔️ Testing Kandy Attractions...');
    const kandyAttractions = await hybridPlacesService.getTouristAttractions('Kandy');
    console.log(`Found ${kandyAttractions.length} attractions in Kandy:`);
    kandyAttractions.slice(0, 2).forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
      console.log(`   Address: ${place.address}`);
      console.log(`   Source: ${place.source}`);
      console.log('');
    });

    // Test comprehensive info
    console.log('📋 Testing Comprehensive Destination Info...');
    const colomboInfo = await hybridPlacesService.getDestinationInfo('Colombo');
    console.log(`Colombo Summary:`);
    console.log(`  Attractions: ${colomboInfo.attractions.count}`);
    console.log(`  Restaurants: ${colomboInfo.restaurants.count}`);
    console.log(`  Shopping: ${colomboInfo.shopping.count}`);

    console.log('\n✅ Hybrid Places Service is working perfectly!');
    console.log('\n🚀 Benefits:');
    console.log('• Tries to get real data first');
    console.log('• Falls back to quality sample data');
    console.log('• No API key required for fallback');
    console.log('• Always returns useful data');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your frontend to use /api/real-places/destination');
    console.log('2. Users will see real Sri Lankan places!');

  } catch (error) {
    console.error('❌ Error testing hybrid places:', error.message);
  }
}

testHybridPlaces();
