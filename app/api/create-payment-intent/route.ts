import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { amount, planId } = body;

    if (!amount || !planId) {
      console.error('Missing required fields:', { amount, planId });
      return NextResponse.json(
        { error: 'Missing required fields: amount and planId are required' },
        { status: 400 }
      );
    }

    try {
      // Create a PaymentIntent with the minimum required fields
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
      });

      console.log('Payment intent created successfully:', paymentIntent.id);

      return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (stripeError: any) {
      console.error('Stripe API Error:', {
        type: stripeError.type,
        message: stripeError.message,
        code: stripeError.code,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to create payment intent',
          details: stripeError.message
        }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('General error:', error);
    return NextResponse.json(
      { error: 'Error processing request' }, 
      { status: 500 }
    );
  }
}
