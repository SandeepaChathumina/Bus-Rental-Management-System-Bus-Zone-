import axios from 'axios';

const calculateRoute = async (req, res) => {
  try {
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Both from and to locations are required' 
      });
    }

    // Heigit OpenRouteService API endpoint
    const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
    
    // Coordinates for major Sri Lankan cities
    const cityCoordinates = {
      'colombo': [79.8612, 6.9271],
      'kandy': [80.6337, 7.2906],
      'galle': [80.2168, 6.0535],
      'jaffna': [80.0074, 9.6615],
      'negombo': [79.8357, 7.2086],
      'trincomalee': [81.2339, 8.5874],
      'anuradhapura': [80.4037, 8.3114],
      'polonnaruwa': [81.0024, 7.9403],
      'matara': [80.5544, 5.9485],
      'hambantota': [81.1245, 6.1244],
      'ratnapura': [80.3842, 6.6828]
    };

    const fromCity = from.toLowerCase();
    const toCity = to.toLowerCase();

    if (!cityCoordinates[fromCity] || !cityCoordinates[toCity]) {
      return res.status(400).json({ 
        error: 'Invalid city names provided' 
      });
    }

    const response = await axios.post(apiUrl, {
      coordinates: [cityCoordinates[fromCity], cityCoordinates[toCity]]
    }, {
      headers: {
        'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijk5YmUzNDM1YmY5NjQ3ZjI5Zjg4MzY5MTYxYzJmYjQ0IiwiaCI6Im11cm11cjY0In0=',
        'Content-Type': 'application/json'
      }
    });

    const routeData = response.data;
    
    if (routeData.features && routeData.features.length > 0) {
      const summary = routeData.features[0].properties.summary;
      
      // Convert meters to kilometers and seconds to minutes
      const distance = (summary.distance / 1000).toFixed(1);
      const duration = Math.round(summary.duration / 60); // Convert to minutes
      
      res.json({
        distance: parseFloat(distance),
        duration: duration,
        success: true
      });
    } else {
      res.status(404).json({ 
        error: 'No route found between the specified locations' 
      });
    }

  } catch (error) {
    console.error('Route calculation error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API authentication failed. Please check the API key.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to calculate route distance',
      details: error.response?.data || error.message
    });
  }
};

export {
  calculateRoute
};