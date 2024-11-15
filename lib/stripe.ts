import Stripe from 'stripe';

// For client-side
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QKzcxDSLnjOQfn7s1DE4XoAyiofhlYVytCmTszve8BvDhHBY3SgwU3S8jhyB6m6ffmsUDGwMRViBqezV85mMaK900sY16jxpc';

// For server-side
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51QKzcxDSLnjOQfn7zEwTgdSFA9AHq4glfmNnALQXIoUM3UPbPNuQueelpoYjrSgliLFbio4TrljYoOCsFBJxkTlE0001F9R7Y5';

if (!stripeSecretKey) {
  throw new Error('Missing required STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// Helper function to format price amount for Stripe (converts dollars to cents)
export const formatAmountForStripe = (amount: number, currency: string): number => {
  const currencies = ['USD', 'EUR', 'GBP']; // Add more currencies as needed
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};
