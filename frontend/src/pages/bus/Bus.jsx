// src/pages/bus/Bus.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Wifi, 
  Snowflake, 
  Coffee, 
  MapPin,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import Bus1 from "../../../src/assets/bus1.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Bus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [busTypeFilter, setBusTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Get search parameters from URL or navigation state
  const searchParams = location.state?.searchParams || {};

  useEffect(() => {
    const loadBuses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/buses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter only available buses
        const availableBuses = response.data.buses.filter(bus => 
          bus.status === 'Available' && bus.isActive === true
        );
        
        setBuses(availableBuses);
        setFilteredBuses(availableBuses);
      } catch (error) {
        console.error('Error loading buses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBuses();
  }, []);

  useEffect(() => {
    let results = buses;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(bus =>
        bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.busType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.busId && bus.busId.toString().includes(searchTerm)) ||
        (bus.brand && bus.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bus.modelName && bus.modelName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (busTypeFilter) {
      results = results.filter(bus => bus.busType.toLowerCase() === busTypeFilter.toLowerCase());
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricePerDay - b.pricePerDay;
        case 'capacity':
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

    setFilteredBuses(results);
  }, [buses, searchTerm, busTypeFilter, sortBy]);

  const getAmenities = (busType) => {
    const amenitiesMap = {
      'Standard': ['ac', 'charging'],
      'Deluxe': ['wifi', 'ac', 'refreshments', 'charging'],
      'Luxury': ['wifi', 'ac', 'refreshments', 'leather', 'entertainment', 'charging'],
      'Mini': ['ac', 'charging'],
      'Double Decker': ['wifi', 'ac', 'refreshments', 'entertainment', 'charging']
    };
    return amenitiesMap[busType] || ['ac', 'charging'];
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'ac': return <Snowflake className="h-4 w-4" />;
      case 'refreshments': return <Coffee className="h-4 w-4" />;
      case 'charging': return <div className="text-sm">🔋</div>;
      case 'entertainment': return <div className="text-sm">📺</div>;
      case 'leather': return <div className="text-sm">💺</div>;
      default: return null;
    }
  };

  const getBusImage = (busType) => {
    return Bus1;
  };

  // Handle image loading errors
  const handleImageError = (busId) => {
    setImageErrors(prev => ({
      ...prev,
      [busId]: true
    }));
  };

  // Check if image is a data URL
  const isDataURL = (str) => {
    return str.startsWith('data:image');
  };

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
  };

  const handleProceedToBooking = () => {
    if (!selectedBus) {
      alert('Please select a bus first');
      return;
    }

    navigate('/passenger-details', {
      state: {
        bus: selectedBus,
        searchParams: searchParams,
        passengers: Array(searchParams.passengers).fill().map((_, i) => ({
          id : selectedBus._id || Bus._id,
          seatNumber: `A${i + 1}`,
          name: '',
          nic: '',
          age: '',
          gender: ''
        })),
        selectedSeats: Array(searchParams.passengers).fill().map((_, i) => `A${i + 1}`)
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 h-96 border border-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Available Buses
          </h1>
          {searchParams.from && searchParams.to && (
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {searchParams.travelDate}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {searchParams.departureTime}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {searchParams.passengers} {searchParams.passengers === 1 ? 'Passenger' : 'Passengers'}
              </div>
              {searchParams.returnDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Return: {searchParams.returnDate}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/booking')}
            className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-gray-400 shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search buses by plate, type, or bus ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={busTypeFilter}
              onChange={(e) => setBusTypeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Bus Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="luxury">Luxury</option>
              <option value="mini">Mini</option>
              <option value="double decker">Double Decker</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="price">Sort by Capacity</option>
              <option value="capacity">Sort by Price</option>
            </select>
          </div>
        </div>

        {/* Bus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div 
              key={bus._id} 
              className={`bg-white rounded-2xl p-6 border transition-all duration-300 shadow-lg ${
                selectedBus?._id === bus._id 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
              }`}
            >
              {/* Bus Image */}
              <div className="mb-4 relative">
                {bus.vehiclePhoto && !imageErrors[bus._id] ? (
                  <div className="relative">
                    <img
                      src={bus.vehiclePhoto}
                      alt={`${bus.brand && bus.modelName ? `${bus.brand} ${bus.modelName}` : `${bus.busType} Coach`} - ${bus.numberPlate}`}
                      className="w-full h-48 object-cover rounded-xl"
                      onError={() => handleImageError(bus._id)}
                    />
                    {/* Image type indicator */}
                    {bus.vehiclePhoto && (isDataURL(bus.vehiclePhoto) || bus.vehiclePhoto.includes('supabase')) && (
                      <div className="absolute top-2 right-2 bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
                        {isDataURL(bus.vehiclePhoto) ? 'Uploaded Image' : 'Cloud Image'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Bus Info */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {bus.brand && bus.modelName ? `${bus.brand} ${bus.modelName}` : `${bus.busType} Coach`}
                  </h3>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {bus.busType}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-sm">
                      Bus ID: {bus.busId || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {bus.capacity} seats
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Plate: {bus.numberPlate}
                  </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Available
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <h4 className="text-gray-700 text-sm font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {getAmenities(bus.busType).map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-gray-100 rounded-lg text-gray-700 text-sm"
                      title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    >
                      {getAmenityIcon(amenity)}
                      <span className="ml-1 hidden sm:inline">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">Rs. {bus.pricePerDay || 0}</div>
                  <div className="text-gray-600 text-sm">per day</div>
                </div>
                
                {/* Select Button */}
                <button
                  onClick={() => handleSelectBus(bus)}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    selectedBus?._id === bus._id
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white'
                  }`}
                >
                  {selectedBus?._id === bus._id ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <span>Select</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Bus Action */}
        {selectedBus && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-4 shadow-2xl border border-gray-200 z-50">
            <div className="flex items-center justify-between space-x-4">
              <div className="text-gray-800">
                <span className="text-gray-600">Selected: </span>
                {selectedBus.busType} Coach - Rs. {selectedBus.pricePerDay}/day
              </div>
              <button
                onClick={handleProceedToBooking}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <span>Proceed to Booking</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {filteredBuses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">No buses found matching your criteria</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setBusTypeFilter('');
                setSortBy('price');
              }}
              className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bus;