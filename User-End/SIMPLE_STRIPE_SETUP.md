# Simple Stripe Payment Integration

## Overview

This is a simplified Stripe payment integration for your Plant Disease Detection app.

## What's Included

### ✅ Simple Implementation

- **CartScreen.js**: Complete Stripe payment integration
- **App.js**: Basic StripeProvider setup
- **api/index.js**: Backend payment endpoints
- **No complex configuration files**

## Setup

### 1. Frontend (App.js)

```javascript
import { StripeProvider } from "@stripe/stripe-react-native";

<StripeProvider
  publishableKey="pk_test_51RrapwF3HAo508cLPgOEi6dABLM2ZSyzSROTOdiZEvw3K3juBOuffnhz2H1Vdb7eZ38vA6bloKgba6GCgSjMGphz00F6deJulp"
  merchantIdentifier="merchant.com.plantdisease.store"
>
  {/* Your app components */}
</StripeProvider>;
```

### 2. Backend (api/index.js)

```javascript
const stripe = require("stripe")(
  "sk_test_51RrapwF3HAo508cL8jqApLDRKeGo5j7PWkpyvPGiod6QiHUuHuSc5XYi2ESqQd5diyb7zSulAPMgdoh7ATVwyDvg002dMXj9Xr"
);
```

### 3. CartScreen.js

- Uses `useStripe()` hook
- Handles payment flow
- Creates orders after successful payment
- Shows loading states and error handling

## Testing

### Test Cards

- **Success**: `4242 4242 4242 4242`
- **Failure**: `4000 0000 0000 0002`
- **Authentication**: `4000 0025 0000 3155`

### Payment Flow

1. Add items to cart
2. Click "Proceed to Payment"
3. Enter test card details
4. Payment processes
5. Order created
6. Cart cleared

## Features

- ✅ Payment processing
- ✅ Order creation
- ✅ Error handling
- ✅ Loading states
- ✅ Cart management
- ✅ Success confirmation

## Files Modified

1. **App.js** - Added StripeProvider
2. **CartScreen.js** - Complete payment integration
3. **api/index.js** - Payment intent and order endpoints

That's it! Simple and straightforward. 🎉
