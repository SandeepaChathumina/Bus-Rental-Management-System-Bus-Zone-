// src/components/PassengerDetails.jsx - FIXED
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Clock,
  Users,
  Calendar,
  Calculator,
  Loader
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, passengers, selectedSeats, searchParams } = location.state || {};
  
  const [passengerDetails, setPassengerDetails] = useState(
    passengers || []
  );
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Calculate number of days and total amount
  const calculatePricing = () => {
    if (!searchParams || !bus) return { totalAmount: 0, numberOfDays: 1 };
    
    const isRoundTrip = searchParams.tripType === 'round-trip';
    let numberOfDays = 1;
    
    if (isRoundTrip && searchParams.travelDate && searchParams.returnDate) {
      const travelDate = new Date(searchParams.travelDate);
      const returnDate = new Date(searchParams.returnDate);
      const timeDiff = returnDate.getTime() - travelDate.getTime();
      numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both days
    }
    
    // Calculate total amount: basePrice + (basePrice * 1/4) for each additional day
    const basePrice = bus.pricePerDay || 0;
    let totalAmount = basePrice;
    
    if (numberOfDays > 1) {
      totalAmount = basePrice + (basePrice * (1/4) * (numberOfDays - 1));
    }
    
    return {
      totalAmount: Math.round(totalAmount),
      numberOfDays,
      basePrice,
      isRoundTrip
    };
  };

  const pricing = calculatePricing();

  if (!bus || !passengers) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid booking session</h2>
          <button
            onClick={() => navigate('/bus')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index][field] = value;
    setPassengerDetails(updatedPassengers);
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createBookingInDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to continue with booking');
      }

      // Prepare booking data matching the backend schema
      const bookingData = {
        busId: bus._id,
        travelDate: searchParams.travelDate,
        returnDate: searchParams.returnDate || null,
        tripType: searchParams.tripType || 'one-way',
        departureTime: searchParams.departureTime,
        seats: passengerDetails.map((passenger, index) => ({
          seatNumber: passenger.seatNumber,
          passengerName: passenger.name,
          passengerNIC: passenger.nic,
          passengerAge: parseInt(passenger.age),
          passengerGender: passenger.gender
        })),
        numberOfPassengers: passengerDetails.length,
        route: {
          from: searchParams.from,
          to: searchParams.to
        },
        contactInfo: contactInfo
      };

      console.log('Creating booking with data:', bookingData);

      const response = await axios.post(
        `${BACKEND_URL}/api/bookings`,
        bookingData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Booking creation response:', response.data);

      if (response.data.success) {
        return response.data.booking;
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to create booking');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const allPassengersValid = passengerDetails.every(passenger => 
      passenger.name && passenger.nic && passenger.age && passenger.gender
    );
    
    if (!allPassengersValid) {
      alert('Please fill in all passenger details');
      return;
    }
    
    if (!contactInfo.email || !contactInfo.phone) {
      alert('Please fill in your contact information');
      return;
    }

    setIsCreatingBooking(true);
    
    try {
      // Create booking in database first
      const createdBooking = await createBookingInDatabase();
      
      console.log('Booking created successfully:', createdBooking);
      
      // Proceed to checkout with the actual booking data from database
      navigate('/checkout', {
        state: {
          booking: createdBooking, // Use the actual booking from database
          bus: bus,
          passengers: passengerDetails,
          selectedSeats: selectedSeats,
          searchParams: searchParams,
          contactInfo: contactInfo,
          pricing: {
            ...pricing,
            totalAmount: createdBooking.totalAmount // Use the amount calculated by backend
          }
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Failed to create booking: ${error.message}`);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
            disabled={isCreatingBooking}
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Passenger Details</h1>
            <p className="text-slate-400">Complete your booking information</p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-slate-300">
                  <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Route:</span>
                  <span className="ml-2">{searchParams?.from} → {searchParams?.to}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Departure:</span>
                  <span className="ml-2">{searchParams?.departureTime}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{searchParams?.travelDate}</span>
                </div>
                
                {searchParams?.returnDate && (
                  <div className="flex items-center text-slate-300">
                    <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                    <span className="font-medium">Return:</span>
                    <span className="ml-2">{searchParams?.returnDate}</span>
                  </div>
                )}
                
                <div className="flex items-center text-slate-300">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Passengers:</span>
                  <span className="ml-2">{passengers.length}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <span className="font-medium">Seats:</span>
                  <span className="ml-2">{selectedSeats.join(', ')}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <span className="font-medium">Bus Type:</span>
                  <span className="ml-2">{bus.busType} - {bus.numberPlate}</span>
                </div>
                
                {/* Pricing Breakdown */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="mb-3">
                    <h4 className="text-slate-300 font-medium mb-2 flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Pricing Breakdown
                    </h4>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Base Price ({pricing.numberOfDays} day{pricing.numberOfDays > 1 ? 's' : ''}):</span>
                        <span>Rs. {pricing.basePrice}/day</span>
                      </div>
                      {pricing.numberOfDays > 1 && (
                        <div className="flex justify-between">
                          <span>Additional days ({pricing.numberOfDays - 1} × 25%):</span>
                          <span>Rs. {Math.round(pricing.basePrice * 0.25 * (pricing.numberOfDays - 1))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-slate-300 font-medium">Total Amount:</span>
                    <span className="text-blue-400 font-bold text-xl">Rs. {pricing.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Passenger Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Passenger Information</h2>
              
              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isCreatingBooking}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isCreatingBooking}
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Passenger Details</h3>
                <div className="space-y-6">
                  {passengerDetails.map((passenger, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-xl p-4">
                      <h4 className="text-white font-medium mb-4 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Passenger {index + 1} - Seat {passenger.seatNumber}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">Full Name</label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isCreatingBooking}
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">NIC/Passport</label>
                          <input
                            type="text"
                            value={passenger.nic}
                            onChange={(e) => handlePassengerChange(index, 'nic', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isCreatingBooking}
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">Age</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isCreatingBooking}
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">Gender</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isCreatingBooking}
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
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isCreatingBooking}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  {isCreatingBooking ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Creating Booking...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Proceed to Payment - Rs. {pricing.totalAmount}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;