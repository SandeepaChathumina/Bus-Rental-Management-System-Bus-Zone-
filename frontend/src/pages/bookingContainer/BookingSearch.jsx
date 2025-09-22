import React, { useState } from 'react';
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

  const locations = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Trincomalee',
    'Anuradhapura', 'Polonnaruwa', 'Matara', 'Hambantota', 'Ratnapura'
  ];

  // Predefined distances between major cities (in km)
  const predefinedDistances = {
    'colombo-kandy': { distance: 116, duration: 180 },
    'colombo-galle': { distance: 116, duration: 120 },
    'kandy-nuwara-eliya': { distance: 77, duration: 120 },
    'colombo-jaffna': { distance: 396, duration: 480 },
    'colombo-anuradhapura': { distance: 206, duration: 240 },
    'colombo-trincomalee': { distance: 265, duration: 300 },
    'colombo-matara': { distance: 160, duration: 180 },
    'colombo-ratnapura': { distance: 101, duration: 150 },
    'kandy-galle': { distance: 200, duration: 240 },
    'kandy-matara': { distance: 200, duration: 240 },
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDistance = async () => {
    if (!searchData.from || !searchData.to) return;
    
    setIsCalculating(true);
    try {
      // Simulate API call - in a real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a key for the predefined distances lookup
      const key = `${searchData.from.toLowerCase()}-${searchData.to.toLowerCase()}`;
      const reverseKey = `${searchData.to.toLowerCase()}-${searchData.from.toLowerCase()}`;
      
      // Get distance information from predefined data
      let distanceData = predefinedDistances[key] || predefinedDistances[reverseKey];
      
      // If no predefined data exists, use default values
      if (!distanceData) {
        distanceData = { distance: 150, duration: 180 }; // Default values
      }
      
      // Calculate fare based on distance and bus type (standard rate)
      const fareRates = {
        'standard': 25, // Rs per km
        'deluxe': 35,
        'luxury': 50
      };
      
      const baseFare = fareRates['standard']; // Using standard as default for estimation
      const totalFare = Math.round(baseFare * distanceData.distance);
      
      setDistanceInfo({
        distance: Math.round(distanceData.distance),
        duration: Math.round(distanceData.duration),
        fare: totalFare,
        total: totalFare * searchData.passengers
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchData.from || !searchData.to || !searchData.travelDate) {
      alert('Please fill in all required fields');
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
  };

  const isReturnTrip = searchData.tripType === 'round-trip';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Ride</h2>
            <p className="text-slate-400">Search and book luxury buses with ease</p>
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
              <div className="lg:col-span-3">
                <label className="text-slate-300 text-sm font-medium mb-2 block">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={searchData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Departure</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
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
              <div className="lg:col-span-3">
                <label className="text-slate-300 text-sm font-medium mb-2 block">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={searchData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Destination</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculate Distance Button */}
              <div className="lg:col-span-7 flex justify-center mt-2">
                <button
                  type="button"
                  onClick={calculateDistance}
                  disabled={!searchData.from || !searchData.to || isCalculating}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  {isCalculating ? 'Calculating...' : 'Calculate Distance & Fare'}
                </button>
              </div>

              {/* Display Distance Information */}
              {distanceInfo && (
                <div className="lg:col-span-7 bg-slate-700/30 rounded-xl p-4 mt-2">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Route className="mr-2 h-5 w-5 text-blue-400" />
                    Route Information
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
                { from: 'Colombo', to: 'Kandy' },
                { from: 'Colombo', to: 'Galle' },
                { from: 'Kandy', to: 'Nuwara Eliya' },
                { from: 'Colombo', to: 'Jaffna' }
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
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm transition-colors"
                >
                  {route.from} → {route.to}
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