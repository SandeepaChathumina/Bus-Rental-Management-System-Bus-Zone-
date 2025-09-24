// src/pages/checkout/Checkout.jsx - FINALIZED VERSION
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { 
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  User,
  MapPin,
  Calendar,
  Clock,
  Users,
  Bus,
  Lock,
  AlertCircle,
  BadgeCheck,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Card Form Component
const StripeCardForm = ({ amount, bookingId, onSuccess, onError, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not initialized. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Bus Passenger',
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const token = localStorage.getItem('token');
        const confirmResponse = await axios.post(
          `${BACKEND_URL}/api/payments/stripe/confirm`,
          {
            paymentIntentId: paymentIntent.id,
            paymentId: localStorage.getItem('currentPaymentId')
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (confirmResponse.data.success) {
          onSuccess({
            paymentIntent: paymentIntent,
            booking: confirmResponse.data.booking,
            payment: confirmResponse.data.payment
          });
        } else {
          throw new Error(confirmResponse.data.message || 'Payment confirmation failed');
        }
      } else {
        throw new Error(`Payment ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      // Handle specific error types
      if (err.response?.status === 404) {
        setError('Payment session expired. Please start the booking process again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login and try again.');
      } else if (err.message.includes('card')) {
        setError('Card payment failed. Please check your card details and try again.');
      } else {
        setError(err.message || 'Payment processing failed. Please try again.');
      }
      
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
          <CardElement
            onChange={handleCardChange}
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: '24px',
                },
                invalid: {
                  color: '#EF4444',
                },
              },
              hidePostalCode: true,
              disabled: isProcessing
            }}
          />
        </div>
        
        {error && (
          <div className="flex items-start mt-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Test Card Numbers:</p>
            <p>Success: 4242 4242 4242 4242</p>
            <p>Declined: 4000 0000 0000 0002</p>
            <p>Use any future date and any 3-digit CVC</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !cardComplete || !clientSecret}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {isProcessing ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Pay Securely - LKR {amount.toLocaleString()}
          </>
        )}
      </button>

      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center">
            <Shield className="h-3 w-3 mr-1 text-green-500" />
            SSL Secured
          </span>
          <span>•</span>
          <span>Powered by Stripe</span>
          <span>•</span>
          <span>PCI Compliant</span>
        </div>
      </div>
    </form>
  );
};

// Security Badge Component
const SecurityBadge = ({ icon: Icon, text, color = "blue" }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
    <div className={`p-2 rounded-full bg-${color}-100 mr-3`}>
      <Icon className={`h-4 w-4 text-${color}-600`} />
    </div>
    <span className="text-sm font-medium text-gray-700">{text}</span>
  </div>
);

// Main Checkout Component
const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, bus, passengers, searchParams, contactInfo, pricing } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!booking || !bus) {
      navigate('/bus');
      return;
    }

    console.log('Checkout initialized with booking:', booking);
    initializePayment();
  }, []);

  useEffect(() => {
    let timer;
    if (paymentStatus === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStatus]);

  const initializePayment = async () => {
    try {
      setErrorMessage('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to continue with payment');
      }

      console.log('Creating payment intent for booking:', booking._id);

      const response = await axios.post(
        `${BACKEND_URL}/api/payments/stripe/create-intent`,
        {
          bookingId: booking._id,
          amount: booking.totalAmount,
          currency: 'lkr',
          description: `Bus booking payment for ${booking.bookingId}`
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment intent response:', response.data);

      if (response.data.success) {
        setStripeClientSecret(response.data.paymentIntent.clientSecret);
        localStorage.setItem('stripeClientSecret', response.data.paymentIntent.clientSecret);
        localStorage.setItem('currentPaymentId', response.data.payment.paymentId);
      } else {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      
      let errorMsg = 'Failed to initialize payment system';
      
      if (error.response?.status === 404) {
        errorMsg = 'Booking not found. Please start the booking process again.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Please login to continue with payment.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setPaymentStatus('error');
    }
  };

  const retryPaymentInitialization = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setPaymentStatus('idle');
      initializePayment();
    }
  };

  const handleStripePayment = async (result) => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      console.log('Payment successful:', result);
      
      // Wait a moment for the success animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to success page with actual data
      navigate('/booking-success', {
        state: {
          booking: result.booking || booking,
          payment: result.payment || { 
            id: result.paymentIntent.id, 
            amount: booking.totalAmount,
            paymentId: result.payment?.paymentId || 'STRIPE_' + result.paymentIntent.id
          },
          bus: bus,
          passengers: passengers
        }
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!termsAgreed) {
      setErrorMessage('Please agree to the Terms & Conditions');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to continue');
      }
      
      // Process direct payment using the booking payment endpoint
      const response = await axios.post(
        `${BACKEND_URL}/api/bookings/${booking._id}/payment`,
        {
          paymentMethod: 'card',
          paymentGateway: 'stripe',
          cardDetails: {
            cardNumber: '4242424242424242',
            cardHolder: 'Test User',
            expiryDate: '12/25',
            cvv: '123'
          }
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Direct payment response:', response.data);

      if (response.data.success) {
        setPaymentStatus('success');
        
        // Wait for success animation
        setTimeout(() => {
          navigate('/booking-success', {
            state: {
              booking: response.data.booking || booking,
              payment: response.data.payment,
              bus: bus,
              passengers: passengers
            }
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Direct payment error:', error);
      
      let errorMsg = 'Payment processing failed';
      
      if (error.response?.status === 404) {
        errorMsg = 'Booking not found. Please start the booking process again.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Please login to continue with payment.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setPaymentStatus('error');
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
    setErrorMessage(error);
    setIsProcessing(false);
  };

  if (!booking || !bus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Booking Session</h2>
            <p className="text-gray-600 mb-6">Your booking session has expired. Please start the booking process again.</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/bus')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Start New Booking
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-32 pb-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="relative inline-block mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
              <div className="absolute -top-1 -right-1">
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed and your tickets are being prepared.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-700 mb-2">Redirecting to booking details</div>
              <div className="text-2xl font-bold text-blue-600">{countdown}</div>
            </div>
            
            <div className="text-sm text-gray-600">
              <Loader className="h-4 w-4 inline animate-spin mr-2" />
              Finalizing your booking...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            disabled={isProcessing}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Passenger Details
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Complete Your Payment
            </h1>
            <p className="text-gray-600 mt-2 flex items-center justify-center">
              <Lock className="h-4 w-4 mr-1 text-green-500" />
              Secure payment powered by Stripe
            </p>
          </div>
          <div className="w-40"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Bus className="h-6 w-6 mr-2 text-blue-600" />
                  Booking Summary
                </h2>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  #{booking.bookingId}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Route</div>
                    <div className="text-sm">{booking.route?.from || searchParams.from} → {booking.route?.to || searchParams.to}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Travel Date</div>
                    <div className="text-sm">{new Date(booking.travelDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                  </div>
                </div>
                
                {booking.returnDate && (
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Return Date</div>
                      <div className="text-sm">{new Date(booking.returnDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Departure Time</div>
                    <div className="text-sm">{booking.departureTime}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Passengers</div>
                    <div className="text-sm">{booking.seats?.length || booking.numberOfPassengers} {(booking.seats?.length || booking.numberOfPassengers) === 1 ? 'person' : 'people'}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Bus className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Bus Details</div>
                    <div className="text-sm">{bus.busType} Coach - {bus.numberPlate}</div>
                  </div>
                </div>

                {booking.seats && booking.seats.length > 0 && (
                  <div className="flex items-center text-gray-700">
                    <User className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Assigned Seats</div>
                      <div className="text-sm">{booking.seats.map(seat => seat.seatNumber).join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Bus Rental ({booking.numberOfDays || 1} day{(booking.numberOfDays || 1) > 1 ? 's' : ''}):</span>
                    <span className="text-gray-700">LKR {bus.pricePerDay.toLocaleString()}</span>
                  </div>
                  
                  {(booking.numberOfDays || 1) > 1 && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Additional days ({(booking.numberOfDays - 1)} × 25%):</span>
                      <span>LKR {Math.round(bus.pricePerDay * 0.25 * ((booking.numberOfDays || 1) - 1)).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Platform Fee:</span>
                    <span>LKR 0</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Taxes & Fees:</span>
                    <span>LKR 0</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">LKR {booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Security & Trust</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <SecurityBadge icon={Lock} text="256-bit SSL encryption" color="green" />
                <SecurityBadge icon={BadgeCheck} text="PCI DSS compliant" color="blue" />
                <SecurityBadge icon={Shield} text="Stripe secure processing" color="purple" />
                <SecurityBadge icon={Zap} text="Instant confirmation" color="orange" />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <CreditCard className="h-7 w-7 mr-3 text-blue-600" />
                Payment Details
              </h2>
              <p className="text-gray-600 mb-8">Choose your preferred payment method and complete your booking</p>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <label className="text-gray-700 text-lg font-semibold mb-4 block">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      id: 'stripe', 
                      label: 'Credit/Debit Card', 
                      icon: CreditCard, 
                      description: 'Secure card payment via Stripe',
                      badge: 'Recommended',
                      available: !!stripeClientSecret
                    },
                    { 
                      id: 'direct', 
                      label: 'Quick Payment', 
                      icon: Zap, 
                      description: 'Instant booking confirmation',
                      badge: 'Demo Mode',
                      available: true
                    },
                  ].map(method => (
                    <label key={method.id} className={`cursor-pointer ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => method.available && setPaymentMethod(e.target.value)}
                        className="sr-only"
                        disabled={isProcessing || !method.available}
                      />
                      <div className={`p-5 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                        paymentMethod === method.id && method.available
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : method.available 
                            ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50'
                      }`}>
                        {method.badge && (
                          <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${
                            paymentMethod === method.id && method.available
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {method.badge}
                          </span>
                        )}
                        {!method.available && (
                          <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                            Unavailable
                          </span>
                        )}
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg mr-4 ${
                            paymentMethod === method.id && method.available ? 'bg-blue-100' : 'bg-white'
                          }`}>
                            <method.icon className={`h-6 w-6 ${
                              paymentMethod === method.id && method.available ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="text-gray-900 font-semibold">{method.label}</div>
                            <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Status Messages */}
              {paymentStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start text-red-700">
                    <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Payment Failed</div>
                      <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                      {retryCount < 3 && (
                        <button
                          onClick={retryPaymentInitialization}
                          className="mt-2 flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retry ({3 - retryCount} attempts left)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Loader className="h-5 w-5 mr-2 animate-spin flex-shrink-0" />
                    <div>
                      <div className="font-medium">Processing Your Payment</div>
                      <p className="text-blue-600 text-sm mt-1">Please do not close this page or refresh your browser...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <div className="mb-8">
                {paymentMethod === 'stripe' && stripeClientSecret ? (
                  <Elements stripe={stripePromise} options={{ 
                    clientSecret: stripeClientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        colorBackground: '#ffffff',
                        colorText: '#374151',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        borderRadius: '8px',
                      },
                    },
                  }}>
                    <StripeCardForm
                      amount={booking.totalAmount}
                      bookingId={booking._id}
                      clientSecret={stripeClientSecret}
                      onSuccess={handleStripePayment}
                      onError={handlePaymentError}
                    />
                  </Elements>
                ) : paymentMethod === 'stripe' && !stripeClientSecret && paymentStatus !== 'error' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-yellow-700">
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        <span className="font-medium">Initializing secure payment system...</span>
                      </div>
                      <p className="text-yellow-600 text-sm mt-1">Please wait while we prepare your secure payment form.</p>
                    </div>
                    
                    {retryCount > 0 && (
                      <div className="text-center">
                        <button
                          onClick={retryPaymentInitialization}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Taking too long? Click to retry
                        </button>
                      </div>
                    )}
                  </div>
                ) : paymentMethod === 'direct' ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Demo Payment Mode</p>
                          <p className="text-xs text-blue-600 mt-1">
                            This will instantly confirm your booking without actual payment processing. Perfect for testing the system.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Booking will be marked as confirmed</li>
                        <li>• QR code will be generated for boarding</li>
                        <li>• Confirmation email will be sent</li>
                        <li>• Invoice will be available for download</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={handleDirectPayment}
                      disabled={isProcessing || !termsAgreed}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Confirming Booking...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Confirm Booking - LKR {booking.totalAmount.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                ) : paymentStatus === 'error' ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment System Unavailable</h3>
                    <p className="text-gray-600 mb-4">We're having trouble initializing the payment system.</p>
                    <div className="space-y-2">
                      <button
                        onClick={retryPaymentInitialization}
                        disabled={retryCount >= 3}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                      </button>
                      <button
                        onClick={() => setPaymentMethod('direct')}
                        className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Use Demo Payment Instead
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Terms and Conditions */}
              <div className="pt-6 border-t border-gray-200">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mr-3 mt-1 w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    required
                    disabled={isProcessing}
                  />
                  <span className="text-gray-600 text-sm">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                      Privacy Policy
                    </a>
                    . I understand that this booking is subject to availability and cancellation policies. Payment processing is handled securely through Stripe.
                  </span>
                </label>

                {!termsAgreed && paymentMethod === 'direct' && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    Please accept the terms and conditions to proceed
                  </div>
                )}
              </div>

              {/* Additional Security Information */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start text-gray-700 text-sm">
                  <Lock className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Secure Payment Guarantee</p>
                    <p>This is a secure 256-bit SSL encrypted payment. Your financial information is protected by industry-standard security measures and is never stored on our servers. All payments are processed by Stripe, a PCI DSS Level 1 certified payment processor.</p>
                  </div>
                </div>
              </div>

              {/* Support Information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start text-blue-700 text-sm">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Need Help?</p>
                    <p>If you encounter any issues with your payment, please contact our support team at <span className="font-medium">support@buszone.com</span> or call <span className="font-medium">+94 704 222 777</span>. Include your booking reference: <span className="font-mono font-medium">{booking.bookingId}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Boarding Instructions
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Arrive 30 minutes before departure</li>
                  <li>• Bring valid ID for verification</li>
                  <li>• Have your QR code ready</li>
                  <li>• Check boarding location in confirmation</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                  Cancellation Policy
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Free cancellation up to 24 hours</li>
                  <li>• Partial refund 12-24 hours before</li>
                  <li>• No refund within 12 hours</li>
                  <li>• Emergency exceptions may apply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By completing this payment, you acknowledge that you have read and agree to our booking terms and conditions.
            For questions about your booking, contact us at{' '}
            <a href="mailto:support@buszone.com" className="text-blue-600 hover:underline">
              support@buszone.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;