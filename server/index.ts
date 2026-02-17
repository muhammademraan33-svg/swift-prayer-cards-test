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

// Middleware - CORS with explicit preflight handling
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://swift-metal-prints.lovable.app' 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Content-Disposition', 'Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

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

// Regular JSON middleware for other routes - Increased limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Test endpoint
app.post('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Test endpoint works!' });
});

// Generate print-ready PDF - Lazy load the PDF generator
app.post('/api/generate-pdf', async (req: Request, res: Response) => {
  try {
    // Dynamically import PDF generator
    const { generatePrintReadyPDF } = await import('./pdfGenerator.js');
    
    const {
      imageBase64,
      backImageBase64,
      printDimensions,
      transform,
      backTransform,
      includeBleed,
      includeCropMarks,
      filename,
    } = req.body;

    // Validate required fields
    if (!imageBase64 || !printDimensions || !transform) {
      return res.status(400).json({ error: 'Missing required fields: imageBase64, printDimensions, transform' });
    }

    // Validate print dimensions
    if (!printDimensions.width || !printDimensions.height) {
      return res.status(400).json({ error: 'Invalid print dimensions' });
    }

    // Validate transform
    if (typeof transform.rotation !== 'number' || typeof transform.zoom !== 'number') {
      return res.status(400).json({ error: 'Invalid transform parameters' });
    }

    console.log('Generating PDF with dimensions:', printDimensions);

    // Generate PDF
    const pdfBuffer = await generatePrintReadyPDF({
      imageBase64,
      backImageBase64,
      printDimensions,
      transform,
      backTransform,
      includeBleed: includeBleed ?? false,
      includeCropMarks: includeCropMarks ?? false,
    });

    // Set response headers for PDF download
    const pdfFilename = filename || `print-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: `Failed to generate PDF: ${error.message}` });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Stripe configured with key: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);
  console.log(`✅ PDF generation endpoint: POST /api/generate-pdf`);
});
