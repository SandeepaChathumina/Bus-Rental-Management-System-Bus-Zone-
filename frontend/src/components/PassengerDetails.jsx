// PassengerDetails.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Clock,
  Users,
  Calendar
} from 'lucide-react';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, passengers, selectedSeats, searchParams, routeInfo, totalAmount } = location.state || {};
  
  const [passengerDetails, setPassengerDetails] = useState(passengers || []);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });

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

  const handleSubmit = (e) => {
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
    
    // Proceed to payment
    navigate('/checkout', {
      state: {
        bus,
        passengers: passengerDetails,
        selectedSeats,
        searchParams,
        routeInfo,
        contactInfo,
        totalAmount
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white transition-colors"
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
                  <span className="ml-2">{routeInfo?.from} → {routeInfo?.to}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Departure:</span>
                  <span className="ml-2">{routeInfo?.departureTime}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{searchParams?.travelDate}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">Passengers:</span>
                  <span className="ml-2">{passengers.length}</span>
                </div>
                
                <div className="flex items-center text-slate-300">
                  <span className="font-medium">Seats:</span>
                  <span className="ml-2">{selectedSeats.join(', ')}</span>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Total Amount:</span>
                    <span className="text-blue-400 font-bold text-xl">Rs. {totalAmount}</span>
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Passenger Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Passenger Details</h3>
                <div className="space-y-6">
                  {passengerDetails.map((passenger, index) => (
                    <div key={index} className="bg-slate-700/30 p-4 rounded-xl">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-400" />
                        Passenger {index + 1} - Seat {selectedSeats[index]}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">Full Name *</label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">NIC Number *</label>
                          <input
                            type="text"
                            value={passenger.nic}
                            onChange={(e) => handlePassengerChange(index, 'nic', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">Age *</label>
                          <input
                            type="number"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="120"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-sm mb-2 block">Gender *</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
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
              
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
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