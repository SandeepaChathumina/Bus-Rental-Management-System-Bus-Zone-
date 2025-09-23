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
  Bus
} from 'lucide-react';

// Use Vite environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Card Form Component
const StripeCardForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <XCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay LKR {amount}
          </>
        )}
      </button>
    </form>
  );
};

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

  useEffect(() => {
    if (!booking || !bus) {
      navigate('/bus');
      return;
    }

    createStripePaymentIntent();
  }, []);

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
      const token = localStorage.getItem('token');
      const paymentId = localStorage.getItem('currentPaymentId');

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/stripe/confirm`,
        {
          paymentIntentId: paymentIntent.id,
          paymentId: paymentId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPaymentStatus('success');
        
        setTimeout(() => {
          navigate('/booking-success', {
            state: {
              booking: response.data.booking,
              payment: response.data.payment,
              bus: bus,
              passengers: passengers
            }
          });
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.message || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const token = localStorage.getItem('token');
      
      // Test card details for demonstration
      const cardDetails = {
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123',
        cardHolder: contactInfo?.name || 'Test User'
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/stripe/direct-payment`,
        {
          bookingId: booking._id,
          cardDetails: cardDetails,
          paymentType: 'booking'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPaymentStatus('success');
        
        setTimeout(() => {
          navigate('/booking-success', {
            state: {
              booking: booking,
              payment: response.data.payment,
              bus: bus,
              passengers: passengers
            }
          });
        }, 3000);
      } else {
        throw new Error(response.data.message);
      }
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
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Booking Session</h2>
          <p className="text-gray-600 mb-6">Please start your booking process again.</p>
          <button
            onClick={() => navigate('/bus')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. Redirecting to booking details...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2" />
            Back to Passenger Details
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="text-gray-600">Secure payment with encrypted transaction</p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bus className="h-5 w-5 mr-2 text-blue-600" />
                Booking Summary
              </h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-700 text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Route:</span>
                  <span className="ml-2">{searchParams.from} → {searchParams.to}</span>
                </div>
                
                <div className="flex items-center text-gray-700 text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{searchParams.travelDate}</span>
                </div>
                
                {searchParams.returnDate && (
                  <div className="flex items-center text-gray-700 text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Return:</span>
                    <span className="ml-2">{searchParams.returnDate}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-700 text-sm">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Time:</span>
                  <span className="ml-2">{searchParams.departureTime}</span>
                </div>
                
                <div className="flex items-center text-gray-700 text-sm">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Passengers:</span>
                  <span className="ml-2">{passengers.length}</span>
                </div>

                <div className="flex items-center text-gray-700 text-sm">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">Bus:</span>
                  <span className="ml-2">{bus.busType} Coach</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Base Price ({pricing.numberOfDays} day{pricing.numberOfDays > 1 ? 's' : ''}):</span>
                  <span className="text-gray-700">LKR {pricing.basePrice}</span>
                </div>
                
                {pricing.numberOfDays > 1 && (
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                    <span>Additional days ({pricing.numberOfDays - 1} × 25%):</span>
                    <span>LKR {Math.round(pricing.basePrice * 0.25 * (pricing.numberOfDays - 1))}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">LKR {pricing.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
              </div>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  256-bit SSL encryption
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  PCI DSS compliant
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  No card data stored
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Instant confirmation
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                Payment Details
              </h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="text-gray-700 text-sm font-medium mb-3 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'stripe', label: 'Credit/Debit Card', icon: '💳', description: 'Secure card payment' },
                    { id: 'direct', label: 'Quick Payment', icon: '⚡', description: 'Faster processing' },
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
                      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{method.icon}</span>
                          <span className="text-gray-900 font-medium">{method.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              {paymentStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Payment Failed</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              )}

              {paymentMethod === 'stripe' && stripeClientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                  <StripeCardForm
                    amount={pricing.totalAmount}
                    onSuccess={handleStripePayment}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : paymentMethod === 'direct' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Quick payment process with faster verification. Test card: 4242 4242 4242 4242
                    </p>
                  </div>
                  <button
                    onClick={handleDirectPayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay LKR {pricing.totalAmount}
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              {/* Terms and Conditions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-gray-600 text-sm">
                    I agree to the Terms & Conditions and Privacy Policy. I understand that payments are processed securely through Stripe.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;