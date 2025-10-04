// Simple Travel Suggestions Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleTravelSuggestions = ({ destination, onClose }) => {
  const [suggestions, setSuggestions] = useState({ attractions: [], restaurants: [], hotels: [] });
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (destination) {
      fetchSuggestions();
    }
  }, [destination]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/real-places/destination?destination=${destination}`);
      if (response.data.success) {
        setSuggestions({
          attractions: response.data.data.attractions.places || [],
          restaurants: response.data.data.restaurants.places || [],
          hotels: response.data.data.hotels.places || []
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback to empty data
      setSuggestions({ attractions: [], restaurants: [], hotels: [] });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPlaces = () => {
    switch (activeFilter) {
      case 'attractions':
        return suggestions.attractions;
      case 'restaurants':
        return suggestions.restaurants;
      case 'hotels':
        return suggestions.hotels;
      default:
        return [...suggestions.attractions, ...suggestions.restaurants, ...suggestions.hotels];
    }
  };

  const getFilterCount = (type) => {
    switch (type) {
      case 'attractions':
        return suggestions.attractions.length;
      case 'restaurants':
        return suggestions.restaurants.length;
      case 'hotels':
        return suggestions.hotels.length;
      default:
        return suggestions.attractions.length + suggestions.restaurants.length + suggestions.hotels.length;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading travel suggestions for {destination}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Travel Suggestions</h2>
              <p className="text-gray-600 mt-1">Discover amazing places in {destination}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({getFilterCount('all')})
            </button>
            <button
              onClick={() => setActiveFilter('attractions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'attractions'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏛️ Attractions ({getFilterCount('attractions')})
            </button>
            <button
              onClick={() => setActiveFilter('restaurants')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'restaurants'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🍽️ Restaurants ({getFilterCount('restaurants')})
            </button>
            <button
              onClick={() => setActiveFilter('hotels')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'hotels'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏨 Hotels ({getFilterCount('hotels')})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white max-h-[60vh] overflow-y-auto">
          {getFilteredPlaces().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredPlaces().map((place, index) => (
                <div key={place.id || index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                  {/* Image */}
                  {place.photoUrls && place.photoUrls.length > 0 && (
                    <div className="h-32 bg-gray-200">
                      <img 
                        src={place.photoUrls[0]} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{place.name}</h4>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full ml-2">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-yellow-700 font-semibold ml-1">{place.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-500 text-sm">({place.user_ratings_total} reviews)</span>
                      {place.price_level && (
                        <div className="bg-green-50 px-2 py-1 rounded-full">
                          <span className="text-green-700 font-semibold text-sm">
                            {Array(place.price_level).fill('$').join('')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.address}</p>
                    
                    {place.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{place.description}</p>
                    )}
                    
                    {place.website && (
                      <a href={place.website} target="_blank" rel="noopener noreferrer" 
                         className="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                        <span className="mr-1">🌐</span>
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No places found</h3>
              <p className="text-gray-500">Try selecting a different filter or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleTravelSuggestions;