// services/distanceService.js
import axios from 'axios';

export class DistanceService {
  static async calculateDistance(origin, destination) {
    try {
      // Using OpenRouteService API (free tier available)
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          params: {
            api_key: process.env.OPENROUTE_API_KEY,
            start: `${origin.lng},${origin.lat}`,
            end: `${destination.lng},${destination.lat}`
          }
        }
      );
      
      const distance = response.data.features[0].properties.segments[0].distance / 1000; // Convert to km
      const duration = response.data.features[0].properties.segments[0].duration / 60; // Convert to minutes
      
      return { distance, duration };
    } catch (error) {
      console.error('Distance calculation error:', error);
      
      // Fallback: Use predefined distances between major cities
      const predefinedDistances = {
        'colombo-kandy': { distance: 116, duration: 180 },
        'colombo-galle': { distance: 116, duration: 120 },
        'kandy-nuwara-eliya': { distance: 77, duration: 120 },
        // Add more routes as needed
      };
      
      const key = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
      return predefinedDistances[key] || { distance: 100, duration: 120 };
    }
  }

  static async getCityCoordinates(cityName) {
    // This would typically call a geocoding API
    const cityCoordinates = {
      'colombo': { lat: 6.9271, lng: 79.8612 },
      'kandy': { lat: 7.2906, lng: 80.6337 },
      'galle': { lat: 6.0535, lng: 80.2210 },
      'jaffna': { lat: 9.6615, lng: 80.0255 },
      'nuwara-eliya': { lat: 6.9497, lng: 80.7891 },
      // Add more cities as needed
    };
    
    return cityCoordinates[cityName.toLowerCase()] || { lat: 6.9271, lng: 79.8612 }; // Default to Colombo
  }
}