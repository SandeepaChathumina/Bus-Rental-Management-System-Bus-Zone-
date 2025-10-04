// Simple Travel Suggestions Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleTravelSuggestions = ({ destination, onClose }) => {
  const [suggestions, setSuggestions] = useState({ attractions: [], restaurants: [] });
  const [loading, setLoading] = useState(false);

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
          restaurants: response.data.data.restaurants.places || []
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback to empty data
      setSuggestions({ attractions: [], restaurants: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading suggestions for {destination}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Travel Suggestions for {destination}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Attractions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🏛️ Attractions</h3>
                {suggestions.attractions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.attractions.map((place, index) => (
                  <div key={place.id || index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{place.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500">⭐ {place.rating}</span>
                      <span className="text-gray-500 text-sm">({place.user_ratings_total} reviews)</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{place.address}</p>
                    {place.description && (
                      <p className="text-gray-500 text-xs mt-2">{place.description}</p>
                    )}
                    {place.website && (
                      <a href={place.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 text-xs hover:underline">
                        Visit Website
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No attractions found</p>
            )}
          </div>

          {/* Restaurants */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🍽️ Restaurants</h3>
            {suggestions.restaurants.length > 0 ? (
              <div className="space-y-3">
                {suggestions.restaurants.map((place, index) => (
                  <div key={place.id || index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{place.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500">⭐ {place.rating}</span>
                      <span className="text-gray-500 text-sm">({place.user_ratings_total} reviews)</span>
                      {place.price_level && (
                        <span className="text-green-600 text-sm font-medium">
                          {Array(place.price_level).fill('$').join('')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{place.address}</p>
                    {place.description && (
                      <p className="text-gray-500 text-xs mt-2">{place.description}</p>
                    )}
                    {place.website && (
                      <a href={place.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 text-xs hover:underline">
                        Visit Website
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No restaurants found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTravelSuggestions;
