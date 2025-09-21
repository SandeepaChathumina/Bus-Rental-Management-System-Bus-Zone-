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
  AlertCircle
} from 'lucide-react';
import Destination from '../../components/destination/Destination';
import DepartTime from '../../components/departtime/DepartTime';
import Seat from '../../components/seat/Seat';

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Sample bus data - replace with API call
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
    route: {
      from: "Colombo",
      to: "Kandy",
      distance: "120 km",
      duration: "4 hours"
    },
    features: [
      "Reclining seats",
      "Onboard entertainment",
      "USB charging ports",
      "Air conditioning",
      "Complimentary snacks"
    ]
  };

  useEffect(() => {
    const loadBusDetails = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setBus(sampleBus);
        
        // Initialize passenger details based on search params
        const searchParams = location.state?.searchParams;
        if (searchParams?.passengers) {
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
    } else if (selectedSeats.length < passengerDetails.length) {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index][field] = value;
    setPassengerDetails(updatedPassengers);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length !== passengerDetails.length) {
      alert('Please select seats for all passengers');
      return;
    }

    const allPassengersValid = passengerDetails.every((passenger, index) => {
      if (!passenger.name || !passenger.nic) {
        alert(`Please fill in all details for passenger ${index + 1}`);
        return false;
      }
      return true;
    });

    if (allPassengersValid) {
      // Assign seat numbers to passengers
      const passengersWithSeats = passengerDetails.map((passenger, index) => ({
        ...passenger,
        seatNumber: selectedSeats[index]
      }));

      navigate('/checkout', {
        state: {
          bus,
          passengers: passengersWithSeats,
          selectedSeats,
          searchParams: location.state?.searchParams,
          totalAmount: bus.price * passengerDetails.length
        }
      });
    }
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
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Route Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">From</div>
                    <div className="text-white font-semibold">{bus.route.from}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">To</div>
                    <div className="text-white font-semibold">{bus.route.to}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">Distance</div>
                    <div className="text-white font-semibold">{bus.route.distance}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm mb-1">Duration</div>
                    <div className="text-white font-semibold">{bus.route.duration}</div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="flex items-center text-slate-400 mb-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Departure
                    </div>
                    <div className="text-white font-semibold">{bus.departureTime}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl">
                    <div className="flex items-center text-slate-400 mb-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Arrival
                    </div>
                    <div className="text-white font-semibold">{bus.arrivalTime}</div>
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
                      </div>
                      <span className="text-slate-300 text-sm capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Process */}
          <div className="space-y-6">
            {/* Step 1: Select Seats */}
            {currentStep === 1 && (
              <div className="bg-slate-800/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Select Seats</h3>
                <p className="text-slate-400 mb-6">
                  Choose {passengerDetails.length} seat(s) for your journey
                </p>
                
                <Seat 
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  totalSeats={bus.capacity}
                  maxSeats={passengerDetails.length}
                />
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-slate-300">
                    Selected: {selectedSeats.length} of {passengerDetails.length}
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={selectedSeats.length !== passengerDetails.length}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                  >
                    Continue to Passenger Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Passenger Details */}
            {currentStep === 2 && (
              <div className="bg-slate-800/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Passenger Details</h3>
                <p className="text-slate-400 mb-6">
                  Please provide details for all passengers
                </p>

                <div className="space-y-4">
                  {passengerDetails.map((passenger, index) => (
                    <div key={passenger.id} className="bg-slate-700/30 p-4 rounded-xl">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Passenger {index + 1} - Seat {selectedSeats[index]}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-400 text-sm mb-1 flex items-center">
                            <FaUser className="mr-2" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 text-sm mb-1 flex items-center">
                            <FaIdCard className="mr-2" />
                            NIC Number *
                          </label>
                          <input
                            type="text"
                            value={passenger.nic}
                            onChange={(e) => handlePassengerChange(index, 'nic', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 text-sm mb-1">Age</label>
                          <input
                            type="number"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="120"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 text-sm mb-1 flex items-center">
                            <FaVenusMars className="mr-2" />
                            Gender
                          </label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                  >
                    Back to Seat Selection
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Price Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Fare (x{passengerDetails.length})</span>
                  <span className="text-white">Rs. {bus.price * passengerDetails.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxes & Fees</span>
                  <span className="text-white">Rs. 0</span>
                </div>
                <div className="border-t border-slate-600 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-blue-400">Rs. {bus.price * passengerDetails.length}</span>
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