# Quick Test Guide

## Before Testing

You need to add your Stripe Publishable Key. The secret key is already configured.

### Step 1: Get Your Publishable Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)

### Step 2: Create Environment Files

Create `.env.local` in the project root:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_URL=http://localhost:3001
```

Create `server/.env`:
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
PORT=3001
NODE_ENV=development
```

### Step 3: Run Both Servers

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:server
```

OR run both together:
```bash
npm run dev:all
```

### Step 4: Test Payment

1. Open http://localhost:8080
2. Complete the wizard
3. Click "PAY NOW" on Review step
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any CVC
6. Submit payment

## What's Implemented

✅ Express backend server (port 3001)
✅ Stripe PaymentIntent API
✅ Checkout dialog with Stripe Elements
✅ Payment confirmation modal
✅ Webhook handler for payment_intent.succeeded
✅ Secure environment variable handling
✅ CORS configuration
✅ Error handling

## Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

## Troubleshooting

**Server won't start:**
- Make sure port 3001 is not in use
- Check `server/.env` exists with STRIPE_SECRET_KEY

**Payment fails:**
- Verify publishable key in `.env.local`
- Check browser console for errors
- Ensure backend is running

**Can't see checkout:**
- Make sure you're on Step 5 (Review)
- Click "PAY NOW" button
