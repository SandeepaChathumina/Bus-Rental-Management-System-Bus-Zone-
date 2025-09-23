// src/pages/checkout/Checkout.jsx
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
  ChevronRight,
  BadgeCheck,
  Zap
} from 'lucide-react';

// Use Vite environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Card Form Component
const StripeCardForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        localStorage.getItem('stripeClientSecret'),
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err.message);
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
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        
        {error && (
          <div className="flex items-center mt-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !cardComplete}
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

      <div className="text-center text-xs text-gray-500 mt-2">
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center">
            <Shield className="h-3 w-3 mr-1 text-green-500" />
            SSL Secured
          </span>
          <span>•</span>
          <span>Your payment details are encrypted</span>
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
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!booking || !bus) {
      navigate('/bus');
      return;
    }

    createStripePaymentIntent();
  }, []);

  useEffect(() => {
    let timer;
    if (paymentStatus === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/booking-success', {
              state: {
                booking: booking,
                payment: { id: 'mock_payment_id', amount: pricing.totalAmount },
                bus: bus,
                passengers: passengers
              }
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStatus]);

  const createStripePaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/stripe/create-intent`,
        {
          bookingId: booking._id,
          amount: pricing.totalAmount,
          description: `Bus booking payment for ${booking.bookingId}`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStripeClientSecret(response.data.paymentIntent.clientSecret);
        localStorage.setItem('stripeClientSecret', response.data.paymentIntent.clientSecret);
        localStorage.setItem('currentPaymentId', response.data.payment.paymentId);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setErrorMessage('Failed to initialize payment system');
    }
  };

  const handleStripePayment = async (paymentIntent) => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentStatus('success');
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.message || error.message);
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

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentStatus('success');
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.message || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
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
            <p className="text-gray-600 mb-6">Please start your booking process again.</p>
            <button
              onClick={() => navigate('/bus')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Back to Bus Search
            </button>
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
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              <div className="absolute -top-1 -right-1">
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed and your tickets have been issued.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-700 mb-2">Redirecting to booking details in</div>
              <div className="text-2xl font-bold text-blue-600">{countdown} seconds</div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/booking-success', {
                  state: {
                    booking: booking,
                    payment: { id: 'mock_payment_id', amount: pricing.totalAmount },
                    bus: bus,
                    passengers: passengers
                  }
                })}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Booking Now
              </button>
              <button
                onClick={() => navigate('/bus')}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Book Another Trip
              </button>
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
              Secure payment with encrypted transaction
            </p>
          </div>
          <div className="w-20"></div>
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
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  #{booking.bookingId || 'BK001'}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Route</div>
                    <div className="text-sm">{searchParams.from} → {searchParams.to}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div className="text-sm">{searchParams.travelDate}</div>
                  </div>
                </div>
                
                {searchParams.returnDate && (
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Return Date</div>
                      <div className="text-sm">{searchParams.returnDate}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Departure Time</div>
                    <div className="text-sm">{searchParams.departureTime}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Passengers</div>
                    <div className="text-sm">{passengers.length} {passengers.length === 1 ? 'person' : 'people'}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Bus Type</div>
                    <div className="text-sm capitalize">{bus.busType} Coach</div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Base Price ({pricing.numberOfDays} day{pricing.numberOfDays > 1 ? 's' : ''}):</span>
                    <span className="text-gray-700">LKR {pricing.basePrice.toLocaleString()}</span>
                  </div>
                  
                  {pricing.numberOfDays > 1 && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Additional days ({pricing.numberOfDays - 1} × 25%):</span>
                      <span>LKR {Math.round(pricing.basePrice * 0.25 * (pricing.numberOfDays - 1)).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Taxes & Fees:</span>
                    <span>LKR {Math.round(pricing.totalAmount * 0.05).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">LKR {pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Secure Payment Guarantee</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <SecurityBadge icon={Lock} text="256-bit SSL encryption" color="green" />
                <SecurityBadge icon={BadgeCheck} text="PCI DSS compliant" color="blue" />
                <SecurityBadge icon={Shield} text="No card data stored" color="purple" />
                <SecurityBadge icon={Zap} text="Instant confirmation" color="yellow" />
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
              <p className="text-gray-600 mb-8">Choose your preferred payment method</p>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <label className="text-gray-700 text-lg font-semibold mb-4 block">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      id: 'stripe', 
                      label: 'Credit/Debit Card', 
                      icon: CreditCard, 
                      description: 'Secure card payment with Stripe',
                      badge: 'Recommended'
                    },
                    { 
                      id: 'direct', 
                      label: 'Quick Payment', 
                      icon: Zap, 
                      description: 'Faster processing for returning customers',
                      badge: 'Fast'
                    },
                  ].map(method => (
                    <label key={method.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-5 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}>
                        {method.badge && (
                          <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${
                            paymentMethod === method.id 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {method.badge}
                          </span>
                        )}
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg mr-4 ${
                            paymentMethod === method.id ? 'bg-blue-100' : 'bg-white'
                          }`}>
                            <method.icon className={`h-6 w-6 ${
                              paymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
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
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                  <div className="flex items-center text-red-700">
                    <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="font-medium">Payment Failed</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Loader className="h-5 w-5 mr-2 animate-spin flex-shrink-0" />
                    <span className="font-medium">Processing Your Payment</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">Please wait while we process your transaction...</p>
                </div>
              )}

              {/* Payment Form */}
              <div className="mb-8">
                {paymentMethod === 'stripe' && stripeClientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                    <StripeCardForm
                      amount={pricing.totalAmount}
                      onSuccess={handleStripePayment}
                      onError={handlePaymentError}
                    />
                  </Elements>
                ) : paymentMethod === 'direct' ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Quick payment process with faster verification</p>
                          <p className="text-xs text-blue-600 mt-1">
                            Test card: <span className="font-mono">4242 4242 4242 4242</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDirectPayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Quick Pay - LKR {pricing.totalAmount.toLocaleString()}
                        </>
                      )}
                    </button>
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
                    className="mr-3 mt-1 w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-gray-600 text-sm">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>. I understand that payments are processed securely through Stripe and my payment details are encrypted.
                  </span>
                </label>
              </div>

              {/* Additional Security Note */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center text-gray-700 text-sm">
                  <Lock className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>This is a secure 256-bit SSL encrypted payment. Your financial information is never stored on our servers.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;