// config/stripe.js
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not defined in environment variables. Stripe functionality will be disabled.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_development', {
  apiVersion: '2023-10-16',
});

export default stripe;