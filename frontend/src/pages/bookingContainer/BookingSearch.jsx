import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight,
  Search,
  RefreshCw,
  Navigation,
  DollarSign,
  Route
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingSearch = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    travelDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'one-way'
  });
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const googleMapsLoaded = useRef(false);

  // Load Google Maps API script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPAuy_l0ZxrrEJpQHZwlpuBuLFbvJuWjw&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleMapsLoaded.current = true;
      };
      document.head.appendChild(script);
    } else {
      googleMapsLoaded.current = true;
    }
  }, []);

  // Initialize autocomplete for inputs
  useEffect(() => {
    if (googleMapsLoaded.current && window.google && fromInputRef.current && toInputRef.current) {
      const fromAutocomplete = new window.google.maps.places.Autocomplete(fromInputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'lk' } // Restrict to Sri Lanka
      });

      const toAutocomplete = new window.google.maps.places.Autocomplete(toInputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'lk' } // Restrict to Sri Lanka
      });

      fromAutocomplete.addListener('place_changed', () => {
        const place = fromAutocomplete.getPlace();
        if (place.formatted_address) {
          setSearchData(prev => ({ ...prev, from: place.formatted_address }));
          setShowFromSuggestions(false);
        }
      });

      toAutocomplete.addListener('place_changed', () => {
        const place = toAutocomplete.getPlace();
        if (place.formatted_address) {
          setSearchData(prev => ({ ...prev, to: place.formatted_address }));
          setShowToSuggestions(false);
        }
      });
    }
  }, [googleMapsLoaded.current]);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear previous results when locations change
    if (field === 'from' || field === 'to') {
      setDistanceInfo(null);
      setApiError('');
    }

    // Show suggestions for location inputs
    if (field === 'from' && value.length > 2) {
      searchPlaces(value, setFromSuggestions);
      setShowFromSuggestions(true);
    } else if (field === 'from' && value.length <= 2) {
      setShowFromSuggestions(false);
    }

    if (field === 'to' && value.length > 2) {
      searchPlaces(value, setToSuggestions);
      setShowToSuggestions(true);
    } else if (field === 'to' && value.length <= 2) {
      setShowToSuggestions(false);
    }
  };

  const searchPlaces = (query, setSuggestions) => {
    if (!window.google || !window.google.maps) return;

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'lk' },
        types: ['(cities)']
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(prediction => prediction.description));
        }
      }
    );
  };

  const selectSuggestion = (suggestion, field) => {
    setSearchData(prev => ({ ...prev, [field]: suggestion }));
    if (field === 'from') {
      setShowFromSuggestions(false);
    } else {
      setShowToSuggestions(false);
    }
  };

  const calculateDistance = async () => {
    if (!searchData.from || !searchData.to) {
      setApiError('Please select both departure and destination locations');
      return;
    }
    
    setIsCalculating(true);
    setApiError('');
    
    try {
      // Use Google Maps Distance Matrix API
      const distanceService = new window.google.maps.DistanceMatrixService();
      
      distanceService.getDistanceMatrix(
        {
          origins: [searchData.from],
          destinations: [searchData.to],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK') {
            const element = response.rows[0].elements[0];
            
            if (element.status === 'OK') {
              const distance = element.distance.value / 1000; // Convert to km
              const duration = Math.round(element.duration.value / 60); // Convert to minutes
              
              // Calculate fare based on distance and bus type
              const fareRates = {
                'standard': 25, // Rs per km
                'deluxe': 35,
                'luxury': 50
              };
              
              const baseFare = fareRates['standard'];
              const totalFare = Math.round(baseFare * distance);
              
              setDistanceInfo({
                distance: Math.round(distance),
                duration: duration,
                fare: totalFare,
                total: totalFare * searchData.passengers
              });
            } else {
              throw new Error('Could not calculate route between these locations');
            }
          } else {
            throw new Error('Error calculating distance: ' + status);
          }
          setIsCalculating(false);
        }
      );
    } catch (error) {
      console.error('Error calculating distance:', error);
      setApiError(error.message);
      setIsCalculating(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchData.from || !searchData.to || !searchData.travelDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (!distanceInfo) {
      alert('Please calculate distance first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to bus listing with search parameters
      navigate('/bus', { 
        state: { 
          searchParams: {
            ...searchData,
            distance: distanceInfo?.distance,
            duration: distanceInfo?.duration,
            estimatedFare: distanceInfo?.fare
          },
          fromBookingSearch: true 
        } 
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    setDistanceInfo(null);
    setApiError('');
  };

  const isReturnTrip = searchData.tripType === 'round-trip';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Ride</h2>
            <p className="text-slate-400">Search and book luxury buses with real-time route information</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Trip Type Selection */}
            <div className="flex space-x-4 mb-6">
              {['one-way', 'round-trip'].map(type => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value={type}
                    checked={searchData.tripType === type}
                    onChange={(e) => handleInputChange('tripType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    searchData.tripType === type
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                    {type === 'one-way' ? 'One Way' : 'Round Trip'}
                  </div>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {/* From Location */}
              <div className="lg:col-span-3 relative">
                <label className="text-slate-300 text-sm font-medium mb-2 block">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    ref={fromInputRef}
                    type="text"
                    value={searchData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    placeholder="Enter departure city"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {fromSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectSuggestion(suggestion, 'from')}
                        className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-300 border-b border-slate-600 last:border-b-0"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="lg:col-span-1 flex items-end justify-center">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                  title="Swap locations"
                >
                  <RefreshCw className="h-5 w-5 text-slate-300" />
                </button>
              </div>

              {/* To Location */}
              <div className="lg:col-span-3 relative">
                <label className="text-slate-300 text-sm font-medium mb-2 block">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    ref={toInputRef}
                    type="text"
                    value={searchData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    placeholder="Enter destination city"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {showToSuggestions && toSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {toSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectSuggestion(suggestion, 'to')}
                        className="px-4 py-3 hover:bg-slate-700 cursor-pointer text-slate-300 border-b border-slate-600 last:border-b-0"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculate Distance Button */}
              <div className="lg:col-span-7 flex justify-center mt-2">
                <button
                  type="button"
                  onClick={calculateDistance}
                  disabled={!searchData.from || !searchData.to || isCalculating || !window.google}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  {!window.google ? 'Loading Maps...' : isCalculating ? 'Calculating Route...' : 'Calculate Distance & Fare'}
                </button>
              </div>

              {/* API Error Message */}
              {apiError && (
                <div className="lg:col-span-7">
                  <div className="p-3 rounded-xl text-center bg-red-900/20 text-red-400">
                    {apiError}
                  </div>
                </div>
              )}

              {/* Display Distance Information */}
              {distanceInfo && (
                <div className="lg:col-span-7 bg-slate-700/30 rounded-xl p-4 mt-2">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Route className="mr-2 h-5 w-5 text-blue-400" />
                    Real-time Route Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-slate-400 text-sm mb-1">Distance</div>
                      <div className="text-white font-bold text-xl">{distanceInfo.distance} km</div>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-slate-400 text-sm mb-1">Est. Duration</div>
                      <div className="text-white font-bold text-xl">
                        {Math.floor(distanceInfo.duration / 60)}h {distanceInfo.duration % 60}m
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-slate-400 text-sm mb-1">Est. Fare (per person)</div>
                      <div className="text-white font-bold text-xl">Rs. {distanceInfo.fare}</div>
                    </div>
                    <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                      <div className="text-slate-300 text-sm mb-1 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Total for {searchData.passengers} {searchData.passengers === 1 ? 'person' : 'people'}
                      </div>
                      <div className="text-blue-400 font-bold text-xl">Rs. {distanceInfo.total}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Departure Date */}
              <div className="lg:col-span-2">
                <label className="text-slate-300 text-sm font-medium mb-2 block">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="date"
                    value={searchData.travelDate}
                    onChange={(e) => handleInputChange('travelDate', e.target.value)}
                    min={today}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Return Date */}
              {isReturnTrip && (
                <div className="lg:col-span-2">
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="date"
                      value={searchData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      min={searchData.travelDate || today}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={isReturnTrip}
                    />
                  </div>
                </div>
              )}

              {/* Passengers */}
              <div className="lg:col-span-2">
                <label className="text-slate-300 text-sm font-medium mb-2 block">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={searchData.passengers}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !distanceInfo}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-8">
            <h3 className="text-slate-300 text-sm font-medium mb-3">Popular Routes</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { from: 'Colombo, Sri Lanka', to: 'Kandy, Sri Lanka' },
                { from: 'Colombo, Sri Lanka', to: 'Galle, Sri Lanka' },
                { from: 'Kandy, Sri Lanka', to: 'Nuwara Eliya, Sri Lanka' },
                { from: 'Colombo, Sri Lanka', to: 'Jaffna, Sri Lanka' }
              ].map((route, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchData(prev => ({
                      ...prev,
                      from: route.from,
                      to: route.to,
                      travelDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    }));
                    setDistanceInfo(null);
                    setApiError('');
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm transition-colors"
                >
                  {route.from.split(',')[0]} → {route.to.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSearch;