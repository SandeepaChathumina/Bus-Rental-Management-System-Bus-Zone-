// utils/paymentGateway.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class PaymentGatewayService {
  // Create Stripe payment intent
  static async createStripePaymentIntent(paymentData) {
    try {
      const { amount, currency, description, metadata, customerEmail } = paymentData;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        description: description,
        metadata: metadata,
        receipt_email: customerEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirm Stripe payment
  static async confirmStripePayment(paymentIntentId, paymentMethodId = null) {
    try {
      let paymentIntent;
      
      if (paymentMethodId) {
        paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        });
      } else {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      }

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntent: paymentIntent,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process card payment directly
  static async processStripeCardPayment(paymentData) {
    try {
      const { amount, currency, cardDetails, description, metadata } = paymentData;

      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardDetails.cardNumber,
          exp_month: parseInt(cardDetails.expiryDate.split('/')[0]),
          exp_year: parseInt(cardDetails.expiryDate.split('/')[1]),
          cvc: cardDetails.cvv,
        },
        billing_details: {
          name: cardDetails.cardHolder,
          email: metadata.customerEmail,
        },
      });

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        payment_method: paymentMethod.id,
        confirm: true,
        description: description,
        metadata: metadata,
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId: paymentIntent.id,
        paymentIntent: paymentIntent,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe card payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund payment
  static async processStripeRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        refund: refund
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Retrieve payment intent
  static async retrieveStripePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Stripe retrieve payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create customer in Stripe
  static async createStripeCustomer(customerData) {
    try {
      const { email, name, phone, metadata } = customerData;

      const customer = await stripe.customers.create({
        email: email,
        name: name,
        phone: phone,
        metadata: metadata
      });

      return {
        success: true,
        customerId: customer.id,
        customer: customer
      };
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}