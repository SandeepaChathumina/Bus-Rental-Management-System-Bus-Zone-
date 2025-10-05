// Real Places Router - For real Sri Lankan data
import express from 'express';
import {
  getRealTravelPlaces,
  getRealTouristAttractions,
  getRealRestaurants,
  getHotels,
  getRealDestinationInfo
} from '../controllers/realPlacesController.js';

const router = express.Router();

// Get real travel places for a destination
// GET /api/real-places/travel?destination=Colombo&type=attractions
router.get('/travel', getRealTravelPlaces);

// Get real tourist attractions for a destination
// GET /api/real-places/attractions?destination=Colombo
router.get('/attractions', getRealTouristAttractions);

// Get real restaurants for a destination
// GET /api/real-places/restaurants?destination=Colombo
router.get('/restaurants', getRealRestaurants);

// Get real hotels and accommodations for a destination
// GET /api/real-places/hotels?destination=Colombo
router.get('/hotels', getHotels);

// Get comprehensive real destination information
// GET /api/real-places/destination?destination=Colombo
router.get('/destination', getRealDestinationInfo);

export default router;
