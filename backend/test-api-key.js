// Test your Google API key directly
import axios from 'axios';

async function testApiKey() {
  const apiKey = 'AIzaSyDrkIU5OF2yac7hDq8O8KVqgyvZRPDgACs';
  
  console.log('🔍 Testing Your Google API Key...\n');
  console.log('API Key:', apiKey.substring(0, 15) + '...');
  
  try {
    // Test 1: Geocoding API
    console.log('📍 Testing Geocoding API...');
    const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: 'Colombo, Sri Lanka',
        key: apiKey
      }
    });
    
    console.log('Geocoding Status:', geocodeResponse.data.status);
    if (geocodeResponse.data.status === 'OK') {
      console.log('✅ Geocoding API: Working');
      const location = geocodeResponse.data.results[0].geometry.location;
      console.log('Coordinates:', location);
    } else {
      console.log('❌ Geocoding API:', geocodeResponse.data.status);
      console.log('Error:', geocodeResponse.data.error_message);
    }
    
    // Test 2: Places API
    console.log('\n🏛️ Testing Places API...');
    const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: '6.9271,79.8612', // Colombo coordinates
        radius: 5000,
        type: 'tourist_attraction',
        key: apiKey
      }
    });
    
    console.log('Places Status:', placesResponse.data.status);
    if (placesResponse.data.status === 'OK') {
      console.log('✅ Places API: Working');
      console.log('Found places:', placesResponse.data.results.length);
      placesResponse.data.results.slice(0, 3).forEach((place, index) => {
        console.log(`${index + 1}. ${place.name} (${place.rating}⭐)`);
      });
    } else {
      console.log('❌ Places API:', placesResponse.data.status);
      console.log('Error:', placesResponse.data.error_message);
    }
    
    console.log('\n📋 Next Steps:');
    if (geocodeResponse.data.status !== 'OK' || placesResponse.data.status !== 'OK') {
      console.log('1. Go to: https://console.cloud.google.com/');
      console.log('2. Select your project');
      console.log('3. Go to "APIs & Services" → "Library"');
      console.log('4. Enable: Geocoding API, Places API');
      console.log('5. Go to "Billing" and enable billing');
      console.log('6. Wait 10 minutes and test again');
    } else {
      console.log('✅ Your API key is working! Real data is ready.');
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testApiKey();
