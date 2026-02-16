import express, { Request, Response } from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules, get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://swift-metal-prints.lovable.app' 
    : 'http://localhost:8080',
  credentials: true,
}));

// Stripe webhook - must be before express.json() to get raw body
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('PaymentIntent succeeded:', paymentIntent.id);
          
          // TODO: Store order in database
          // const orderData = paymentIntent.metadata;
          // await saveOrderToDatabase(orderData);
          
          break;
        
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// Regular JSON middleware for other routes
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, items, customerEmail, orderDetails } = req.body;

    // Validate amount
    if (!amount || amount < 50) { // Stripe minimum is $0.50
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerEmail: customerEmail || '',
        orderDetails: JSON.stringify(orderDetails || {}),
        itemCount: items?.length || 0,
      },
      description: `Order for ${items?.length || 0} print(s)`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment status
app.get('/api/payment-status/:paymentIntentId', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent.metadata,
    });
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Stripe configured with key: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);
});
