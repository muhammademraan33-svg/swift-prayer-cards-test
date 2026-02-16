# Stripe Payment Integration Setup

## Overview
Complete Stripe checkout integration with backend payment processing.

## Setup Instructions

### 1. Environment Variables

Create `.env.local` in the project root:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
VITE_API_URL=http://localhost:3001
```

Create `server/.env`:
```env
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
PORT=3001
NODE_ENV=development
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**IMPORTANT**: Never commit `.env` files to Git. They're already in `.gitignore`.

### 2. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Publishable Key** (starts with `pk_live_` or `pk_test_`)
3. Get your **Secret Key** (starts with `sk_live_` or `sk_test_`)
4. Replace `YOUR_PUBLISHABLE_KEY` in both `.env.local` and `server/.env`

### 3. Run the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:server
```

### 4. Test the Payment Flow

1. Go to `http://localhost:8080`
2. Complete the wizard (upload image, select size, etc.)
3. On Step 5 (Review), click "PAY NOW"
4. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date, any CVC

### 5. Set Up Webhooks (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Add it to `server/.env` as `STRIPE_WEBHOOK_SECRET`

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React     │─────▶│  Express Server  │─────▶│   Stripe    │
│  Frontend   │      │  (Port 3001)     │      │     API     │
│ (Port 8080) │◀─────│                  │◀─────│             │
└─────────────┘      └──────────────────┘      └─────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │    Webhooks      │
                     │ (payment events) │
                     └──────────────────┘
```

## API Endpoints

### POST `/api/create-payment-intent`
Creates a Stripe PaymentIntent.

**Request:**
```json
{
  "amount": 150.00,
  "items": [...],
  "customerEmail": "customer@example.com",
  "orderDetails": {...}
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST `/api/webhook`
Handles Stripe webhook events (payment_intent.succeeded, etc.)

### GET `/api/payment-status/:paymentIntentId`
Retrieves payment status.

## Security Notes

1. **Never expose secret keys**: The secret key is only in `server/.env`
2. **Use HTTPS in production**: Required for Stripe
3. **Validate webhooks**: Uses Stripe signature verification
4. **CORS configured**: Only allows requests from your frontend

## Troubleshooting

### "Failed to create payment intent"
- Check that backend server is running on port 3001
- Verify `STRIPE_SECRET_KEY` in `server/.env`
- Check console for error messages

### "Stripe not loaded"
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Check browser console for errors

### Webhook not receiving events
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3001/api/webhook`
- Verify webhook secret matches

## Production Deployment

1. Set environment variables on your hosting platform
2. Update CORS origin in `server/index.ts` to your production domain
3. Deploy backend separately or use serverless functions
4. Set up webhook endpoint in Stripe Dashboard
5. Use live keys (not test keys)

## Files Created

- `server/index.ts` - Express server with Stripe integration
- `src/components/StripeCheckout.tsx` - Payment form component
- `src/components/wizard/StepReview.tsx` - Updated with checkout dialog
- `.env.local` - Frontend environment variables
- `server/.env` - Backend environment variables
