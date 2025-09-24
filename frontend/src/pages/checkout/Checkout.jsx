// src/pages/checkout/Checkout.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
  AlertCircle,
  Zap
} from 'lucide-react';

// Test Stripe publishable key
const stripePromise = loadStripe('pk_test_51ABC123...' || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe Card Form
const StripeCardForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe not loaded yet. Please wait...');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      console.log('Simulating Stripe payment...');
      const testPaymentIntent = {
        id: 'pi_test_123456789',
        status: 'succeeded',
        amount: amount * 100,
        currency: 'lkr'
      };
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSuccess(testPaymentIntent);
    } catch (err) {
      const errorMsg = err.message || 'Payment failed. Please try again.';
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Card Details (Test Mode)
        </label>
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#f3f4f6',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
              },
            }}
          />
        </div>
        {error && (
          <div className="flex items-center mt-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay LKR {amount.toLocaleString()} (Test Mode)
          </>
        )}
      </button>

      <div className="text-center text-xs text-gray-400">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-3 w-3 text-green-500" />
          <span>This is a test transaction. No real money will be charged.</span>
        </div>
      </div>
    </form>
  );
};

// Main Checkout
const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const testData = {
    booking: { _id: 'test_001', bookingId: 'BK-TEST-001' },
    bus: { busType: 'Standard', busNumber: 'BC-1234' },
    passengers: [{ name: 'Test User', age: 30 }],
    searchParams: {
      from: 'Colombo',
      to: 'Kandy',
      travelDate: '2024-01-15',
      departureTime: '08:30 AM'
    },
    pricing: {
      basePrice: 1500,
      totalAmount: 1500,
      numberOfDays: 1
    }
  };

  const { booking, bus, passengers, searchParams, pricing } = location.state || testData;
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStripePayment = async (paymentIntent) => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    try {
      console.log('Payment successful:', paymentIntent);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPaymentStatus('success');
      setTimeout(() => {
        navigate('/booking-success', {
          state: {
            booking,
            payment: {
              id: paymentIntent.id,
              amount: pricing.totalAmount,
              method: 'Stripe',
              status: 'completed'
            },
            bus,
            passengers
          }
        });
      }, 2000);
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('Payment processing failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    try {
      console.log('Direct payment simulation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPaymentStatus('success');
      setTimeout(() => {
        navigate('/booking-success', {
          state: {
            booking,
            payment: {
              id: 'pay_direct_001',
              amount: pricing.totalAmount,
              method: 'Quick Payment',
              status: 'completed'
            },
            bus,
            passengers
          }
        });
      }, 2000);
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('Quick payment failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('error');
    setErrorMessage(error);
    setIsProcessing(false);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 pt-32 pb-16 px-6 text-white">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h2>
            <p className="mb-6">Your payment was completed successfully. Redirecting...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-32 pb-16 px-6 text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white bg-gray-800 px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Payment</h1>
            <p className="text-gray-400 mt-2">Stripe Test Mode - No real charges</p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Bus className="h-5 w-5 mr-2 text-blue-400" />
                Booking Summary
              </h2>
              <div className="space-y-3 mb-4 text-gray-300 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium">Route:</span>
                  <span className="ml-2">{searchParams.from} → {searchParams.to}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{searchParams.travelDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium">Time:</span>
                  <span className="ml-2">{searchParams.departureTime}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium">Passengers:</span>
                  <span className="ml-2">{passengers.length}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium">Bus:</span>
                  <span className="ml-2">{bus.busType} Coach</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2 text-gray-300">
                  <span>Base Price:</span>
                  <span>LKR {pricing.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-lg font-bold text-white">Total Amount:</span>
                  <span className="text-xl font-bold text-green-400">LKR {pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Test Mode Notice */}
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-300">Test Mode Active</h3>
              </div>
              <ul className="text-yellow-200 text-sm space-y-2">
                <li>• No real payment will be processed</li>
                <li>• Use test card: 4242 4242 4242 4242</li>
                <li>• This is for development testing only</li>
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <CreditCard className="h-7 w-7 mr-3 text-blue-400" />
                Payment Details (Test Mode)
              </h2>
              <p className="text-gray-400 mb-8">Choose payment method for testing</p>

              {/* Payment Methods */}
              <div className="mb-8">
                <label className="text-gray-200 text-lg font-semibold mb-4 block">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[{ id: 'stripe', label: 'Credit/Debit Card', icon: CreditCard }, { id: 'direct', label: 'Quick Payment', icon: Zap }]
                    .map(method => (
                      <label key={method.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-5 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id
                            ? 'border-blue-500 bg-gray-700 shadow-md'
                            : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                        }`}>
                          <div className="flex items-center">
                            <div className={`p-3 rounded-lg mr-4 ${
                              paymentMethod === method.id ? 'bg-blue-900/40' : 'bg-gray-800'
                            }`}>
                              <method.icon className={`h-6 w-6 ${
                                paymentMethod === method.id ? 'text-blue-400' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <div className="text-white font-semibold">{method.label}</div>
                              <p className="text-sm text-gray-400 mt-1">
                                {method.id === 'stripe'
                                  ? 'Test Stripe payment integration'
                                  : 'Simulate quick payment'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                  ))}
                </div>
              </div>

              {/* Status Messages */}
              {paymentStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg">
                  <div className="flex items-center text-red-400">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Payment Failed</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
                </div>
              )}

              {paymentStatus === 'processing' && (
                <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
                  <div className="flex items-center text-blue-400">
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    <span className="font-medium">Processing Test Payment</span>
                  </div>
                  <p className="text-blue-300 text-sm mt-1">Simulating payment process...</p>
                </div>
              )}

              {/* Payment Form */}
              <div className="mb-8">
                {paymentMethod === 'stripe' ? (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      amount={pricing.totalAmount}
                      onSuccess={handleStripePayment}
                      onError={handlePaymentError}
                    />
                  </Elements>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
                      <p className="text-sm text-blue-300">
                        Quick payment simulation - No card details required
                      </p>
                    </div>
                    <button
                      onClick={handleDirectPayment}
                      disabled={isProcessing}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Simulating Payment...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Test Quick Payment - LKR {pricing.totalAmount.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-2">Testing Instructions:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Select "Credit/Debit Card" for Stripe test</li>
                  <li>• Use card number: <strong>4242 4242 4242 4242</strong></li>
                  <li>• Any future expiry date and CVC will work</li>
                  <li>• Select "Quick Payment" for simulation test</li>
                  <li>• No real money will be charged</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
