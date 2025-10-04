// Free Places Service - Using OpenStreetMap/Nominatim for real Sri Lankan data
import axios from 'axios';

class FreePlacesService {
  constructor() {
    this.nominatimUrl = 'https://nominatim.openstreetmap.org';
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
  }

  /**
   * Get real places for Sri Lankan destinations using free APIs
   */
  async getRealPlaces(destination, type = 'tourism') {
    try {
      // Get coordinates for the destination
      const coordinates = await this.getCoordinates(destination);
      if (!coordinates) {
        throw new Error(`Could not find coordinates for ${destination}`);
      }

      const { lat, lng } = coordinates;

      // Search for places using Overpass API
      const places = await this.searchPlaces(lat, lng, type);

      return places;

    } catch (error) {
      console.error('Error fetching real places:', error);
      throw error;
    }
  }

  /**
   * Get coordinates using Nominatim (free)
   */
  async getCoordinates(destination) {
    try {
      const response = await axios.get(`${this.nominatimUrl}/search`, {
        params: {
          q: `${destination}, Sri Lanka`,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'BusRentalSystem/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  /**
   * Search for places using Overpass API
   */
  async searchPlaces(lat, lng, type) {
    try {
      let query = '';
      
      if (type === 'tourism') {
        query = `
          [out:json][timeout:25];
          (
            node["tourism"~"^(attraction|museum|gallery|zoo|theme_park)$"](around:5000,${lat},${lng});
            way["tourism"~"^(attraction|museum|gallery|zoo|theme_park)$"](around:5000,${lat},${lng});
            relation["tourism"~"^(attraction|museum|gallery|zoo|theme_park)$"](around:5000,${lat},${lng});
          );
          out center;
        `;
      } else if (type === 'restaurant') {
        query = `
          [out:json][timeout:25];
          (
            node["amenity"~"^(restaurant|cafe|fast_food|food_court)$"](around:3000,${lat},${lng});
            way["amenity"~"^(restaurant|cafe|fast_food|food_court)$"](around:3000,${lat},${lng});
            relation["amenity"~"^(restaurant|cafe|fast_food|food_court)$"](around:3000,${lat},${lng});
          );
          out center;
        `;
      } else if (type === 'shopping') {
        query = `
          [out:json][timeout:25];
          (
            node["shop"~"^(mall|supermarket|department_store|clothes|shoes|electronics)$"](around:3000,${lat},${lng});
            way["shop"~"^(mall|supermarket|department_store|clothes|shoes|electronics)$"](around:3000,${lat},${lng});
            relation["shop"~"^(mall|supermarket|department_store|clothes|shoes|electronics)$"](around:3000,${lat},${lng});
          );
          out center;
        `;
      }

      const response = await axios.post(this.overpassUrl, query, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      const elements = response.data.elements || [];
      
      // Format the results
      const places = elements.slice(0, 10).map((element, index) => {
        const tags = element.tags || {};
        const center = element.center || element;
        
        return {
          id: `osm_${element.id}`,
          name: tags.name || tags.brand || `Place ${index + 1}`,
          rating: 0, // OSM doesn't have ratings
          user_ratings_total: 0,
          price_level: null,
          vicinity: tags.addr_city || destination,
          types: [type],
          address: this.formatAddress(tags),
          description: tags.description || tags.website || '',
          website: tags.website || null,
          opening_hours: tags.opening_hours || null,
          geometry: {
            location: {
              lat: center.lat,
              lng: center.lon
            }
          }
        };
      });

      return places;

    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Format address from OSM tags
   */
  formatAddress(tags) {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:country']) parts.push(tags['addr:country']);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  /**
   * Get tourist attractions
   */
  async getTouristAttractions(destination) {
    return this.getRealPlaces(destination, 'tourism');
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
    return this.getRealPlaces(destination, 'shopping');
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

export default new FreePlacesService();
