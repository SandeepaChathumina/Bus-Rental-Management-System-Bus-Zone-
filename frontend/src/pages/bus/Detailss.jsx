// BusDetails.jsx (updated)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Bus from '../../assets/bus9.png';
import { 
  FaStar, 
  FaArrowLeft,
  FaUser,
  FaIdCard,
  FaVenusMars,
  FaCalendarAlt
} from 'react-icons/fa';
import { 
  Clock, 
  Users, 
  Wifi, 
  Snowflake, 
  Coffee, 
  Shield,
  MapPin,
  CreditCard,
  AlertCircle,
  Route,
  Navigation
} from 'lucide-react';

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bus, setBus] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);

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

  // Sample bus data
  const sampleBus = {
    id: 1,
    name: "Deluxe Coach",
    type: "Deluxe",
    capacity: 45,
    amenities: ["wifi", "ac", "refreshments", "entertainment", "charging"],
    rating: 4.5,
    reviews: 124,
    price: 1200,
    departureTime: "08:00",
    arrivalTime: "12:00",
    numberPlate: "CAB-1234",
  };

  useEffect(() => {
    const loadBusDetails = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setBus(sampleBus);
        
        // Get search params from navigation state
        const searchParams = location.state?.searchParams;
        if (searchParams) {
          // Calculate route information based on search params
          const from = searchParams.from.toLowerCase();
          const to = searchParams.to.toLowerCase();
          const key = `${from}-${to}`;
          const reverseKey = `${to}-${from}`;
          
          // Get distance information from predefined data
          let distanceData = predefinedDistances[key] || predefinedDistances[reverseKey];
          
          // If no predefined data exists, use default values
          if (!distanceData) {
            distanceData = { distance: 150, duration: 180 }; // Default values
          }
          
          // Calculate arrival time based on departure time and duration
          const departureTime = sampleBus.departureTime;
          const [hours, minutes] = departureTime.split(':').map(Number);
          const departureDate = new Date();
          departureDate.setHours(hours, minutes, 0, 0);
          
          const arrivalDate = new Date(departureDate.getTime() + distanceData.duration * 60000);
          const arrivalTime = arrivalDate.toTimeString().substring(0, 5);
          
          setRouteInfo({
            from: searchParams.from,
            to: searchParams.to,
            distance: Math.round(distanceData.distance),
            duration: Math.round(distanceData.duration),
            departureTime: sampleBus.departureTime,
            arrivalTime: arrivalTime
          });
          
          // Initialize passenger details based on search params
          if (searchParams.passengers) {
            const initialPassengers = Array(searchParams.passengers).fill().map((_, index) => ({
              id: index + 1,
              name: '',
              nic: '',
              age: '',
              gender: '',
              seatNumber: ''
            }));
            setPassengerDetails(initialPassengers);
          }
        }
      } catch (error) {
        console.error('Error loading bus details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusDetails();
  }, [id, location.state]);

  const handleSelectBus = () => {
    // Navigate to seat selection page or directly to passenger details
    navigate('/seat-selection', {
      state: {
        bus,
        searchParams: location.state?.searchParams,
        routeInfo,
        passengerCount: passengerDetails.length
      }
    });
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
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
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
            <h1 className="text-3xl font-bold text-white">{bus.name}</h1>
            <p className="text-slate-400">{bus.type} Coach</p>
          </div>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Bus Details */}
          <div className="space-y-6">
            {/* Bus Image */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <img
                src={Bus}
                alt={bus.name}
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
                        <Clock className="mr-1 h-4 w-4" />
                        Duration
                      </div>
                      <div className="text-white font-semibold">
                        {Math.floor(routeInfo.duration / 60)}h {routeInfo.duration % 60}m
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                      </div>
                      <span className="text-slate-300 text-sm capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Select Button and Basic Info */}
          <div className="space-y-6">
            {/* Bus Selection Card */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Bus Information</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Bus Type:</span>
                  <span className="text-white font-semibold">{bus.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="text-white font-semibold">{bus.capacity} seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Price per seat:</span>
                  <span className="text-blue-400 font-bold">Rs. {bus.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rating:</span>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-white font-semibold">{bus.rating}</span>
                    <span className="text-slate-400 ml-1">({bus.reviews} reviews)</span>
                  </div>
                </div>
                {passengerDetails.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Passengers:</span>
                    <span className="text-white font-semibold">{passengerDetails.length}</span>
                  </div>
                )}
              </div>

              {/* Select Button */}
              <button
                onClick={handleSelectBus}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Select This Bus
              </button>

              {/* Quick Info */}
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center text-slate-300 text-sm">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  Free cancellation up to 24 hours before departure
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Important Information</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start">
                  <div className="text-blue-400 mr-2">•</div>
                  Please arrive at the boarding point 15 minutes before departure
                </li>
                <li className="flex items-start">
                  <div className="text-blue-400 mr-2">•</div>
                  Valid photo ID required for all passengers
                </li>
                <li className="flex items-start">
                  <div className="text-blue-400 mr-2">•</div>
                  Luggage allowance: 1 cabin bag + 1 check-in bag per passenger
                </li>
                <li className="flex items-start">
                  <div className="text-blue-400 mr-2">•</div>
                  Children under 5 travel free (without separate seat)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;