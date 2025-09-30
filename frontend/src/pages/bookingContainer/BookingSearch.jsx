// src/pages/bookingContainer/BookingSearch.jsx - UPDATED
import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight,
  Search,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingSearch = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    travelDate: '',
    returnDate: '',
    departureTime: '08:00',
    passengers: 1,
    tripType: 'one-way'
  });
  const [isLoading, setIsLoading] = useState(false);

  const locations = [
    // Western Province
    'Colombo', 'Gampaha', 'Kalutara',
    // Central Province
    'Kandy', 'Matale', 'Nuwara Eliya',
    // Southern Province
    'Galle', 'Matara', 'Hambantota',
    // Northern Province
    'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
    // Eastern Province
    'Batticaloa', 'Ampara', 'Trincomalee',
    // North Western Province
    'Kurunegala', 'Puttalam',
    // North Central Province
    'Anuradhapura', 'Polonnaruwa',
    // Uva Province
    'Badulla', 'Monaragala',
    // Sabaragamuwa Province
    'Ratnapura', 'Kegalle'
  ];

  const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchData.from || !searchData.to || !searchData.travelDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates
    if (searchData.travelDate < today) {
      alert('Departure date cannot be in the past');
      return;
    }

    if (isReturnTrip && searchData.returnDate) {
      if (searchData.returnDate <= searchData.travelDate) {
        alert('Return date must be after departure date');
        return;
      }
    }

    // Validate passengers
    if (searchData.passengers < 1 || searchData.passengers > 50) {
      alert('Number of passengers must be between 1 and 50');
      return;
    }

    setIsLoading(true);
    try {
      // Navigate to bus listing with search parameters
      navigate('/bus', { 
        state: { 
          searchParams: searchData
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
  };

  const isReturnTrip = searchData.tripType === 'round-trip';
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate minimum return date (departure date + 1 day)
  const minReturnDate = searchData.travelDate ? 
    new Date(new Date(searchData.travelDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
    today;

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
                      min={minReturnDate}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={isReturnTrip}
                    />
                  </div>
                </div>
              )}

              {/* Departure Time */}
              <div className="lg:col-span-2">
                <label className="text-slate-300 text-sm font-medium mb-2 block">Departure Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={searchData.departureTime}
                    onChange={(e) => handleInputChange('departureTime', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passengers */}
              <div className="lg:col-span-2">
                <label className="text-slate-300 text-sm font-medium mb-2 block">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={searchData.passengers}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value) || 1)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of passengers (1-50)"
                    required
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading}
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
                      travelDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      departureTime: '08:00'
                    }));
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