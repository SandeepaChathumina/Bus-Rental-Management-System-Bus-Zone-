// Real Places Controller - Using Google Places API for real Sri Lankan data
import directGooglePlacesService from '../utils/directGooglePlacesService.js';

// Get real travel places for a destination
export const getRealTravelPlaces = async (req, res) => {
  try {
    const { destination, type = 'attractions' } = req.query;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination parameter is required'
      });
    }

    console.log(`Fetching real places for ${destination}, type: ${type}`);

    let places = [];
    
    if (type === 'attractions') {
      places = await directGooglePlacesService.getTouristAttractions(destination);
    } else if (type === 'restaurants') {
      places = await directGooglePlacesService.getRestaurants(destination);
    } else if (type === 'shopping') {
      places = await directGooglePlacesService.getShoppingPlaces(destination);
    } else if (type === 'hotels') {
      places = await directGooglePlacesService.getHotels(destination);
    }

    res.json({
      success: true,
      destination,
      type,
      count: places.length,
      places: places,
      source: 'google_places_api'
    });

  } catch (error) {
    console.error('Error fetching real travel places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real travel places',
      error: error.message
    });
  }
};

// Get real tourist attractions
export const getRealTouristAttractions = async (req, res) => {
  try {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination parameter is required'
      });
    }

    console.log(`Fetching real tourist attractions for ${destination}`);

    const attractions = await directGooglePlacesService.getTouristAttractions(destination);

    res.json({
      success: true,
      destination,
      count: attractions.length,
      attractions: attractions,
      source: 'google_places_api'
    });

  } catch (error) {
    console.error('Error fetching real tourist attractions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real tourist attractions',
      error: error.message
    });
  }
};

// Get real restaurants
export const getRealRestaurants = async (req, res) => {
  try {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination parameter is required'
      });
    }

    console.log(`Fetching real restaurants for ${destination}`);

    const restaurants = await directGooglePlacesService.getRestaurants(destination);

    res.json({
      success: true,
      destination,
      count: restaurants.length,
      restaurants: restaurants,
      source: 'google_places_api'
    });

  } catch (error) {
    console.error('Error fetching real restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real restaurants',
      error: error.message
    });
  }
};

// Get hotels and accommodations
export const getHotels = async (req, res) => {
  try {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination parameter is required'
      });
    }

    console.log(`Fetching real hotels for ${destination}`);

    const hotels = await directGooglePlacesService.getHotels(destination);

    res.json({
      success: true,
      destination,
      count: hotels.length,
      hotels: hotels,
      source: hotels.length > 0 && hotels[0].source ? hotels[0].source : 'unknown'
    });

  } catch (error) {
    console.error('Error fetching real hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real hotels',
      error: error.message
    });
  }
};

// Get comprehensive real destination info
export const getRealDestinationInfo = async (req, res) => {
  try {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination parameter is required'
      });
    }

    console.log(`Getting real comprehensive info for ${destination}`);

    const data = await directGooglePlacesService.getDestinationInfo(destination);

    res.json({
      success: true,
      destination,
      data: data,
      source: 'google_places_api'
    });

  } catch (error) {
    console.error('Error getting real destination info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real destination information',
      error: error.message
    });
  }
};
