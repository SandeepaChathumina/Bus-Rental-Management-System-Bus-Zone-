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
        (bus.busId && bus.busId.toString().includes(searchTerm))
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
      <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800 rounded-2xl p-6 h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {searchParams.from && searchParams.to ? `Buses from ${searchParams.from} to ${searchParams.to}` : 'Available Buses'}
          </h1>
          {searchParams.from && searchParams.to && (
            <div className="flex items-center space-x-6 text-slate-400">
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

        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search buses by plate, type, or bus ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={busTypeFilter}
              onChange={(e) => setBusTypeFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Sort by Price</option>
              <option value="capacity">Sort by Capacity</option>
            </select>
          </div>
        </div>

        {/* Bus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div 
              key={bus._id} 
              className={`bg-slate-800/50 rounded-2xl p-6 border transition-all duration-300 ${
                selectedBus?._id === bus._id 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-slate-700/50 hover:border-blue-500/30'
              }`}
            >
              {/* Bus Image */}
              <div className="mb-4 relative">
                {bus.vehiclePhoto && !imageErrors[bus._id] ? (
                  <img
                    src={bus.vehiclePhoto}
                    alt={`${bus.busType} Coach - ${bus.numberPlate}`}
                    className="w-full h-48 object-cover rounded-xl"
                    onError={() => handleImageError(bus._id)}
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-700 rounded-xl flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-slate-500 mb-2" />
                    <span className="text-slate-400 text-sm">No Image Available</span>
                  </div>
                )}
                
                {/* Image type indicator */}
                {bus.vehiclePhoto && isDataURL(bus.vehiclePhoto) && (
                  <div className="absolute top-2 right-2 bg-blue-500/80 text-white px-2 py-1 rounded text-xs">
                    Uploaded Image
                  </div>
                )}
              </div>

              {/* Bus Info */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{bus.busType} Coach</h3>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {bus.busType}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <span className="text-slate-400 text-sm">
                      Bus ID: {bus.busId || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {bus.capacity} seats
                  </div>
                  <div className="flex items-center text-slate-400 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Plate: {bus.numberPlate}
                  </div>
                </div>

                <div className="flex items-center text-slate-400 text-sm mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Available
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {getAmenities(bus.busType).map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-slate-700 rounded-lg text-slate-300 text-sm"
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
                  <div className="text-2xl font-bold text-white">Rs. {bus.pricePerDay || 0}</div>
                  <div className="text-slate-400 text-sm">per day</div>
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
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 rounded-xl p-4 shadow-2xl border border-slate-700 z-50">
            <div className="flex items-center justify-between space-x-4">
              <div className="text-white">
                <span className="text-slate-400">Selected: </span>
                {selectedBus.busType} Coach - Rs. {selectedBus.pricePerDay}/day
              </div>
              <button
                onClick={handleProceedToBooking}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <span>Proceed to Booking</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {filteredBuses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">No buses found matching your criteria</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setBusTypeFilter('');
                setSortBy('price');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
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