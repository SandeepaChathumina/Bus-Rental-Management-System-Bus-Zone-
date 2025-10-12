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
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    message: '',
    isChecking: false
  });
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    message: '',
    isChecking: false
  });
  const [passengerValidations, setPassengerValidations] = useState({});

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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Invalid booking session</h2>
          <button
            onClick={() => navigate('/bus')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const validatePhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Passenger validation functions
  // Name validation removed - no validation needed

  const validateNIC = (nic) => {
    const nicRegex = /^\d{9}[Vv]$|^\d{12}$/;
    return nicRegex.test(nic);
  };

  const validateAge = (age) => {
    const ageNum = parseInt(age);
    return ageNum >= 1 && ageNum <= 120;
  };

  const validateGender = (gender) => {
    return ['male', 'female', 'other'].includes(gender);
  };

  // Handle email change with validation
  const handleEmailChange = (value) => {
    setContactInfo(prev => ({
      ...prev,
      email: value
    }));

    // Reset validation state
    setEmailValidation({
      isValid: false,
      message: '',
      isChecking: false
    });

    // Only validate if email is not empty
    if (value.trim()) {
      setEmailValidation(prev => ({
        ...prev,
        isChecking: true
      }));

      // Debounce validation
      setTimeout(() => {
        const isValid = validateEmail(value);
        setEmailValidation({
          isValid,
          message: isValid ? '✓ Valid email address' : '✗ Please enter a valid email address',
          isChecking: false
        });
      }, 500);
    }
  };

  // Handle phone change with validation
  const handlePhoneChange = (value) => {
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    
    setContactInfo(prev => ({
      ...prev,
      phone: cleanValue
    }));

    // Reset validation state
    setPhoneValidation({
      isValid: false,
      message: '',
      isChecking: false
    });

    // Only validate if phone is not empty
    if (cleanValue.trim()) {
      setPhoneValidation(prev => ({
        ...prev,
        isChecking: true
      }));

      // Debounce validation
      setTimeout(() => {
        const isValid = validatePhone(cleanValue);
        setPhoneValidation({
          isValid,
          message: isValid ? '✓ Valid phone number' : '✗ Phone must start with 0 and be exactly 10 digits',
          isChecking: false
        });
      }, 500);
    }
  };

  // Handle passenger field changes with validation
  const handlePassengerFieldChange = (index, field, value) => {
    // Update passenger data
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index][field] = value;
    setPassengerDetails(updatedPassengers);

    // Initialize validation for this passenger if not exists
    if (!passengerValidations[index]) {
      setPassengerValidations(prev => ({
        ...prev,
        [index]: {}
      }));
    }

    // Validate the specific field
    let isValid = false;
    let message = '';

    switch (field) {
      case 'name':
        // No validation for name - always valid
        isValid = true;
        message = '';
        break;
      case 'nic':
        isValid = validateNIC(value);
        message = isValid ? '✓ Valid NIC' : '✗ NIC must be 9 digits + V or 12 digits';
        break;
      case 'age':
        isValid = validateAge(value);
        message = isValid ? '✓ Valid age' : '✗ Age must be between 1 and 120 years';
        break;
      case 'gender':
        isValid = validateGender(value);
        message = isValid ? '✓ Gender selected' : '✗ Please select a gender';
        break;
      default:
        return;
    }

    // Update validation state for this field
    setPassengerValidations(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: {
          isValid,
          message
        }
      }
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
    
    // Validate all passenger fields
    const allPassengersValid = passengerDetails.every((passenger, index) => {
      const validations = passengerValidations[index] || {};
      return (
        passenger.name && // Just check if name exists, no validation
        passenger.nic && validateNIC(passenger.nic) &&
        passenger.age && validateAge(passenger.age) &&
        passenger.gender && validateGender(passenger.gender)
      );
    });
    
    if (!allPassengersValid) {
      alert('Please fill in all passenger details with valid information');
      return;
    }
    
    if (!contactInfo.email || !contactInfo.phone) {
      alert('Please fill in your contact information');
      return;
    }

    // Check email validation
    if (!emailValidation.isValid && contactInfo.email.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    // Check phone validation
    if (!phoneValidation.isValid && contactInfo.phone.trim()) {
      alert('Please enter a valid phone number (must start with 0 and be exactly 10 digits)');
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 pt-32 pb-16 px-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-sky-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors bg-white/80 backdrop-blur-lg px-4 py-2 rounded-xl shadow-lg hover:shadow-xl"
            disabled={isCreatingBooking}
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">Passenger Details</h1>
            <p className="text-slate-600">Complete your booking information</p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-blue-200/50 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-slate-600">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Route:</span>
                  <span className="ml-2">{searchParams?.from} → {searchParams?.to}</span>
                </div>
                
                <div className="flex items-center text-slate-600">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Departure:</span>
                  <span className="ml-2">{searchParams?.departureTime}</span>
                </div>
                
                <div className="flex items-center text-slate-600">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{searchParams?.travelDate}</span>
                </div>
                
                {searchParams?.returnDate && (
                  <div className="flex items-center text-slate-600">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Return:</span>
                    <span className="ml-2">{searchParams?.returnDate}</span>
                  </div>
                )}
                
                <div className="flex items-center text-slate-600">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Passengers:</span>
                  <span className="ml-2">{passengers.length}</span>
                </div>
                
                <div className="flex items-center text-slate-600">
                  <span className="font-medium">Seats:</span>
                  <span className="ml-2">{selectedSeats.join(', ')}</span>
                </div>
                
                <div className="flex items-center text-slate-600">
                  <span className="font-medium">Bus Type:</span>
                  <span className="ml-2">{bus.busType} - {bus.numberPlate}</span>
                </div>
                
                {/* Pricing Breakdown */}
                <div className="pt-4 border-t border-blue-200">
                  <div className="mb-3">
                    <h4 className="text-slate-700 font-medium mb-2 flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Pricing Breakdown
                    </h4>
                    <div className="text-sm text-slate-600 space-y-1">
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
                  
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-slate-700 font-medium">Total Amount:</span>
                    <span className="text-blue-600 font-bold text-xl">Rs. {pricing.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Passenger Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Passenger Information</h2>
              
              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 text-sm mb-2 block flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full px-4 py-3 bg-blue-50/50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                        emailValidation.isValid 
                          ? 'border-green-500 focus:ring-green-500' 
                          : emailValidation.message && !emailValidation.isValid
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-blue-200 focus:ring-blue-500'
                      }`}
                      required
                      disabled={isCreatingBooking}
                      placeholder="Enter your email address"
                    />
                    {emailValidation.message && (
                      <p className={`text-xs mt-1 flex items-center ${
                        emailValidation.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {emailValidation.isChecking ? (
                          <>
                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          emailValidation.message
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-slate-700 text-sm mb-2 block flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full px-4 py-3 bg-blue-50/50 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                        phoneValidation.isValid 
                          ? 'border-green-500 focus:ring-green-500' 
                          : phoneValidation.message && !phoneValidation.isValid
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-blue-200 focus:ring-blue-500'
                      }`}
                      required
                      disabled={isCreatingBooking}
                      placeholder="0XXXXXXXXX (10 digits)"
                    />
                    {phoneValidation.message && (
                      <p className={`text-xs mt-1 flex items-center ${
                        phoneValidation.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {phoneValidation.isChecking ? (
                          <>
                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          phoneValidation.message
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Passenger Details</h3>
                <div className="space-y-6">
                  {passengerDetails.map((passenger, index) => (
                    <div key={index} className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50">
                      <h4 className="text-slate-800 font-medium mb-4 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Passenger {index + 1} - Seat {passenger.seatNumber}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-700 text-sm mb-2 block">Full Name</label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => handlePassengerFieldChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isCreatingBooking}
                            placeholder="Enter full name"
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-700 text-sm mb-2 block">NIC/Passport</label>
                          <input
                            type="text"
                            value={passenger.nic}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Auto-uppercase 'v' for NIC
                              if (value.toLowerCase().endsWith('v') && value.length <= 10) {
                                value = value.slice(0, -1) + 'V';
                              }
                              handlePassengerFieldChange(index, 'nic', value);
                            }}
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                              passengerValidations[index]?.nic?.isValid 
                                ? 'border-green-500 focus:ring-green-500' 
                                : passengerValidations[index]?.nic?.message && !passengerValidations[index]?.nic?.isValid
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-blue-200 focus:ring-blue-500'
                            }`}
                            required
                            disabled={isCreatingBooking}
                            placeholder="9 digits + V or 12 digits"
                            maxLength={12}
                          />
                          {passengerValidations[index]?.nic?.message && (
                            <p className={`text-xs mt-1 ${
                              passengerValidations[index].nic.isValid ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {passengerValidations[index].nic.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-slate-700 text-sm mb-2 block">Age</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={passenger.age}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Prevent negative values
                              if (value < 0) {
                                return;
                              }
                              handlePassengerFieldChange(index, 'age', value);
                            }}
                            onKeyDown={(e) => {
                              // Prevent minus key and other invalid keys
                              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                e.preventDefault();
                              }
                            }}
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                              passengerValidations[index]?.age?.isValid 
                                ? 'border-green-500 focus:ring-green-500' 
                                : passengerValidations[index]?.age?.message && !passengerValidations[index]?.age?.isValid
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-blue-200 focus:ring-blue-500'
                            }`}
                            required
                            disabled={isCreatingBooking}
                            placeholder="Enter age (1-120)"
                          />
                          {passengerValidations[index]?.age?.message && (
                            <p className={`text-xs mt-1 ${
                              passengerValidations[index].age.isValid ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {passengerValidations[index].age.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-slate-700 text-sm mb-2 block">Gender</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerFieldChange(index, 'gender', e.target.value)}
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                              passengerValidations[index]?.gender?.isValid 
                                ? 'border-green-500 focus:ring-green-500' 
                                : passengerValidations[index]?.gender?.message && !passengerValidations[index]?.gender?.isValid
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-blue-200 focus:ring-blue-500'
                            }`}
                            required
                            disabled={isCreatingBooking}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {passengerValidations[index]?.gender?.message && (
                            <p className={`text-xs mt-1 ${
                              passengerValidations[index].gender.isValid ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {passengerValidations[index].gender.message}
                            </p>
                          )}
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
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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