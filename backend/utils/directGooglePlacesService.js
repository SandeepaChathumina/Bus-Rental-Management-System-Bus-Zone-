// Direct Google Places Service - Using your API key with direct search
import axios from 'axios';

class DirectGooglePlacesService {
  constructor() {
    this.apiKey = 'AIzaSyDrkIU5OF2yac7hDq8O8KVqgyvZRPDgACs';
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * Get real places using direct text search (no coordinates needed)
   */
  async getRealPlaces(destination, type = 'tourist_attraction') {
    try {
      // Use text search instead of nearby search
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: `${type} in ${destination}, Sri Lanka`,
          key: this.apiKey,
          language: 'en'
        }
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }

      const places = response.data.results || [];

      // Get detailed information for top places
      const detailedPlaces = await Promise.all(
        places.slice(0, 8).map(async (place) => {
          try {
            const details = await this.getPlaceDetails(place.place_id);
            return {
              id: place.place_id,
              name: place.name,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              price_level: place.price_level || null,
              vicinity: place.formatted_address || place.vicinity,
              types: place.types,
              photos: details.photos || [],
              opening_hours: details.opening_hours || null,
              website: details.website || null,
              formatted_phone_number: details.formatted_phone_number || null,
              address: details.formatted_address || place.formatted_address || place.vicinity,
              description: details.editorial_summary?.overview || '',
              geometry: place.geometry,
              source: 'google_places_api'
            };
          } catch (error) {
            console.error(`Error getting details for ${place.name}:`, error);
            return {
              id: place.place_id,
              name: place.name,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              price_level: place.price_level || null,
              vicinity: place.formatted_address || place.vicinity,
              types: place.types,
              photos: [],
              opening_hours: null,
              website: null,
              formatted_phone_number: null,
              address: place.formatted_address || place.vicinity,
              description: '',
              geometry: place.geometry,
              source: 'google_places_api'
            };
          }
        })
      );

      return detailedPlaces;

    } catch (error) {
      console.error('Error fetching real places:', error);
      throw error;
    }
  }

  /**
   * Get place details using Google Places API
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'photos,opening_hours,website,formatted_phone_number,formatted_address,reviews,editorial_summary',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }

      return {};
    } catch (error) {
      console.error('Error getting place details:', error);
      return {};
    }
  }

  /**
   * Get photo URL for a place
   */
  getPhotoUrl(photoReference, maxWidth = 400) {
    if (!photoReference) return null;
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Get tourist attractions
   */
  async getTouristAttractions(destination) {
    return this.getRealPlaces(destination, 'tourist_attraction');
  }

  /**
   * Get restaurants
   */
  async getRestaurants(destination) {
    return this.getRealPlaces(destination, 'restaurant');
  }

  /**
   * Get shopping places
   */
  async getShoppingPlaces(destination) {
    return this.getRealPlaces(destination, 'shopping_mall');
  }

  /**
   * Get comprehensive destination info
   */
  async getDestinationInfo(destination) {
    try {
      const [attractions, restaurants, shopping] = await Promise.all([
        this.getTouristAttractions(destination),
        this.getRestaurants(destination),
        this.getShoppingPlaces(destination)
      ]);

      return {
        attractions: {
          count: attractions.length,
          places: attractions
        },
        restaurants: {
          count: restaurants.length,
          places: restaurants
        },
        shopping: {
          count: shopping.length,
          places: shopping
        }
      };
    } catch (error) {
      console.error('Error getting destination info:', error);
      throw error;
    }
  }
}

export default new DirectGooglePlacesService();
