import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Bus from '../../assets/bus9.png';
import { 
  FaArrowLeft
} from 'react-icons/fa';
import { 
  Users, 
  Wifi, 
  Snowflake, 
  Coffee,
  MapPin,
  Navigation,
  Route
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const loadBusDetails = async () => {
      setIsLoading(true);
      try {
        // Try to fetch bus details from API first
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BACKEND_URL}/api/buses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const busData = {
            ...response.data.bus,
            price: response.data.bus.busType === 'Luxury' ? 1800 : 
                   response.data.bus.busType === 'Deluxe' ? 1200 : 800,
            amenities: response.data.bus.busType === 'Luxury' ? 
                      ["wifi", "ac", "refreshments", "entertainment", "charging", "leather"] :
                      response.data.bus.busType === 'Deluxe' ? 
                      ["wifi", "ac", "refreshments", "entertainment"] :
                      ["ac", "charging"]
          };
          
          setBus(busData);
        } catch (apiError) {
          console.error('API error, using passed data:', apiError);
          if (location.state?.busData) {
            setBus(location.state.busData);
          } else {
            const sampleBus = {
              _id: id,
              name: "Deluxe Coach",
              busType: "Deluxe",
              capacity: 45,
              amenities: ["wifi", "ac", "refreshments", "entertainment", "charging"],
              price: 1200,
              numberPlate: "CAB-1234",
            };
            setBus(sampleBus);
          }
        }
        
        // Get search params from navigation state
        const searchParams = location.state?.searchParams;
        if (searchParams) {
          setRouteInfo({
            from: searchParams.from,
            to: searchParams.to,
            distance: 150,
            duration: 180
          });
        }
      } catch (error) {
        console.error('Error loading bus details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusDetails();
  }, [id, location.state]);

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Generate seats based on bus capacity
  const generateSeats = () => {
    if (!bus) return [];
    
    const seats = [];
    const rows = Math.ceil(bus.capacity / 4);
    
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      const seatsInRow = row === rows ? bus.capacity % 4 || 4 : 4;
      
      for (let seat = 1; seat <= seatsInRow; seat++) {
        const seatNumber = (row - 1) * 4 + seat;
        rowSeats.push({
          number: seatNumber,
          isSelected: selectedSeats.includes(seatNumber),
          isAvailable: true // All seats are available for demo
        });
      }
      seats.push(rowSeats);
    }
    
    return seats;
  };

  const Seat = ({ seat, onSelect }) => {
    return (
      <button
        onClick={() => onSelect(seat.number)}
        disabled={!seat.isAvailable}
        className={`w-12 h-12 m-1 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
          seat.isSelected 
            ? 'bg-blue-500 text-white' 
            : seat.isAvailable 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-red-500 text-white cursor-not-allowed'
        }`}
      >
        {seat.number}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-slate-800 rounded-2xl"></div>
              <div className="h-96 bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Bus not found</h2>
          <button
            onClick={() => navigate('/bus')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Back to Buses
          </button>
        </div>
      </div>
    );
  }

  const seats = generateSeats();

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">{bus.name || `${bus.busType} Bus`}</h1>
            <p className="text-slate-400">{bus.busType} Coach - {bus.capacity} Seats</p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Bus Details */}
          <div className="space-y-6">
            {/* Bus Image */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <img
                src={bus.vehiclePhoto || Bus}
                alt={bus.name || bus.busType + ' Bus'}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              
              {/* Route Information */}
              {routeInfo && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Route className="mr-2 text-blue-400" />
                    Route Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-xl">
                      <div className="text-slate-400 text-sm mb-1 flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        From
                      </div>
                      <div className="text-white font-semibold">{routeInfo.from}</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl">
                      <div className="text-slate-400 text-sm mb-1 flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        To
                      </div>
                      <div className="text-white font-semibold">{routeInfo.to}</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl">
                      <div className="text-slate-400 text-sm mb-1 flex items-center">
                        <Navigation className="mr-1 h-4 w-4" />
                        Distance
                      </div>
                      <div className="text-white font-semibold">{routeInfo.distance} km</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl">
                      <div className="text-slate-400 text-sm mb-1 flex items-center">
                        <span className="mr-1">⏱️</span>
                        Duration
                      </div>
                      <div className="text-white font-semibold">
                        {Math.floor(routeInfo.duration / 60)}h {routeInfo.duration % 60}m
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bus Details */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Bus Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">Number Plate</div>
                    <div className="text-white font-semibold">{bus.numberPlate}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1 flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      Capacity
                    </div>
                    <div className="text-white font-semibold">{bus.capacity} seats</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">Engine Number</div>
                    <div className="text-white font-semibold">{bus.engineNumber || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">Bus Type</div>
                    <div className="text-white font-semibold">{bus.busType}</div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bus.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center bg-slate-700/50 p-3 rounded-xl">
                      <div className="text-blue-400 mr-2">
                        {amenity === 'wifi' && <Wifi className="h-4 w-4" />}
                        {amenity === 'ac' && <Snowflake className="h-4 w-4" />}
                        {amenity === 'refreshments' && <Coffee className="h-4 w-4" />}
                        {amenity === 'charging' && <div className="text-sm">🔋</div>}
                        {amenity === 'entertainment' && <div className="text-sm">📺</div>}
                        {amenity === 'leather' && <div className="text-sm">💺</div>}
                      </div>
                      <span className="text-slate-300 text-sm capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Seat Selection */}
          <div className="space-y-6">
            {/* Seat Selection */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Select Seats</h3>
              <p className="text-slate-400 mb-6">
                Choose your preferred seats
              </p>
              
              {/* Seat Layout */}
              <div className="mb-6">
                <div className="bg-slate-700/30 p-4 rounded-xl mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Driver</span>
                    <span className="text-slate-300">Front</span>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-slate-300 text-sm">
                      Entrance
                    </div>
                  </div>

                  {/* Seats Grid */}
                  <div className="space-y-4">
                    {seats.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center space-x-2">
                        {row.map((seat, seatIndex) => (
                          <React.Fragment key={seat.number}>
                            <Seat seat={seat} onSelect={handleSeatSelect} />
                            {seatIndex === 1 && <div className="w-8"></div>}
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat Legend */}
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-slate-300">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-slate-300">Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-slate-300">Occupied</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-slate-300">
                  Selected: {selectedSeats.length} seat(s)
                </div>
                <div className="text-xl font-bold text-white">
                  Total: Rs. {bus.price * selectedSeats.length}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Price Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Fare (x{selectedSeats.length})</span>
                  <span className="text-white">Rs. {bus.price * selectedSeats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxes & Fees</span>
                  <span className="text-white">Rs. 0</span>
                </div>
                <div className="border-t border-slate-600 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-blue-400">Rs. {bus.price * selectedSeats.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;