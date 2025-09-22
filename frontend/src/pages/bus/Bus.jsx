import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users,
  ArrowRight
} from 'lucide-react';
import Bus1 from "../../../src/assets/bus1.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Bus = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [busTypeFilter, setBusTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch buses from API
  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/buses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter only available buses
        const availableBuses = response.data.buses
          .filter(bus => bus.status === 'Available')
          .map(bus => ({
            ...bus,
            // Add sample data for demonstration
            price: bus.busType === 'Luxury' ? 1800 : 
                   bus.busType === 'Deluxe' ? 1200 : 800,
            amenities: bus.busType === 'Luxury' ? 
                      ["wifi", "ac", "refreshments", "entertainment", "charging", "leather"] :
                      bus.busType === 'Deluxe' ? 
                      ["wifi", "ac", "refreshments", "entertainment"] :
                      ["ac", "charging"]
          }));
        
        setBuses(availableBuses);
        setFilteredBuses(availableBuses);
      } catch (error) {
        console.error('Error loading buses:', error);
        // Fallback to sample data if API fails
        const sampleBuses = [
          {
            _id: 1,
            name: "Deluxe Coach",
            busType: "Deluxe",
            capacity: 45,
            amenities: ["wifi", "ac", "refreshments", "entertainment"],
            price: 1200,
            numberPlate: "CAB-1234"
          },
          {
            _id: 2,
            name: "Luxury Sleeper",
            busType: "Luxury",
            capacity: 30,
            amenities: ["wifi", "ac", "refreshments", "leather", "charging"],
            price: 1800,
            numberPlate: "CAB-5678"
          },
          {
            _id: 3,
            name: "Standard Coach",
            busType: "Standard",
            capacity: 52,
            amenities: ["ac", "charging"],
            price: 800,
            numberPlate: "CAB-9012"
          }
        ];
        setBuses(sampleBuses);
        setFilteredBuses(sampleBuses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuses();
  }, []);

  useEffect(() => {
    let results = buses;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(bus =>
        (bus.name || bus.busType + ' Bus').toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.busType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (busTypeFilter) {
      results = results.filter(bus => bus.busType.toLowerCase() === busTypeFilter.toLowerCase());
    }

    setFilteredBuses(results);
  }, [buses, searchTerm, busTypeFilter]);

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <div className="text-sm">📶</div>;
      case 'ac': return <div className="text-sm">❄️</div>;
      case 'refreshments': return <div className="text-sm">☕</div>;
      case 'charging': return <div className="text-sm">🔋</div>;
      case 'entertainment': return <div className="text-sm">📺</div>;
      case 'leather': return <div className="text-sm">💺</div>;
      default: return null;
    }
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
          <h1 className="text-4xl font-bold text-white mb-2">Available Buses</h1>
          <p className="text-slate-400">Choose from our premium fleet</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search buses by name, type, or number plate..."
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
            </select>
          </div>
        </div>

        {/* Bus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div key={bus._id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
              {/* Bus Image */}
              <div className="mb-4">
                <img
                  src={bus.vehiclePhoto || Bus1}
                  alt={bus.name || bus.busType + ' Bus'}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>

              {/* Bus Info */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{bus.name || `${bus.busType} Bus`}</h3>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {bus.busType}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {bus.capacity} seats
                  </div>
                </div>

                <div className="flex items-center text-slate-400 text-sm mb-3">
                  <span>Plate: {bus.numberPlate}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {bus.amenities.map((amenity, index) => (
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
                  <div className="text-2xl font-bold text-white">Rs. {bus.price}</div>
                  <div className="text-slate-400 text-sm">per seat</div>
                </div>
                <Link
                  to={`/bus/bus-details/${bus._id}`}
                  state={{ busData: bus }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
                >
                  <span>View Seats</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredBuses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">No buses found matching your criteria</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setBusTypeFilter('');
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