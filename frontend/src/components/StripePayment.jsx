// components/StripePayment.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Stripe Checkout Form Component
const StripeCheckoutForm = ({ booking, amount, onSuccess, onError }) => {
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
      // Create payment intent
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payments/stripe/create-intent`, {
        bookingId: booking._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!data.success) {
        throw new Error(data.message);
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: booking.contactInfo?.name,
              email: booking.contactInfo?.email,
              phone: booking.contactInfo?.phone,
            },
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
      <div className="border rounded-lg p-3 bg-white">
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
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay LKR ${amount}`}
      </button>
    </form>
  );
};

// Main Payment Component
const StripePayment = ({ booking, onPaymentSuccess, onPaymentError }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  const handleDirectPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payments/stripe/direct-payment`, {
        bookingId: booking._id,
        cardDetails: cardDetails
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        onPaymentSuccess(data.payment);
      } else {
        onPaymentError(data.message);
      }
    } catch (error) {
      onPaymentError(error.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
      
      <div className="mb-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`px-4 py-2 rounded ${
              paymentMethod === 'card' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod('checkout')}
            className={`px-4 py-2 rounded ${
              paymentMethod === 'checkout' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Stripe Checkout
          </button>
        </div>

        {paymentMethod === 'checkout' ? (
          <Elements stripe={stripePromise}>
            <StripeCheckoutForm
              booking={booking}
              amount={booking.totalAmount}
              onSuccess={onPaymentSuccess}
              onError={onPaymentError}
            />
          </Elements>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-3 border rounded"
              value={cardDetails.cardNumber}
              onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                className="p-3 border rounded"
                value={cardDetails.expiryDate}
                onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
              />
              <input
                type="text"
                placeholder="CVV"
                className="p-3 border rounded"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
              />
            </div>
            <input
              type="text"
              placeholder="Card Holder Name"
              className="w-full p-3 border rounded"
              value={cardDetails.cardHolder}
              onChange={(e) => setCardDetails({...cardDetails, cardHolder: e.target.value})}
            />
            <button
              onClick={handleDirectPayment}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Pay LKR {booking.totalAmount}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripePayment;