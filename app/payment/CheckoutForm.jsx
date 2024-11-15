'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log('Stripe or Elements not loaded');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`.
      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occurred.");
        }
        console.error('Payment error:', error);
      }
    } catch (err) {
      console.error('Error in payment submission:', err);
      setMessage("Failed to process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="stripe-form">
      <PaymentElement 
        id="payment-element" 
        className="mb-6"
        options={{
          layout: "tabs",
          defaultValues: {
            billingDetails: {
              name: 'Test User',
              email: 'test@example.com'
            }
          }
        }}
      />
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span id="button-text" className="flex items-center justify-center">
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            "Pay now"
          )}
        </span>
      </button>
      {message && (
        <div id="payment-message" className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg text-center">
          {message}
        </div>
      )}
    </form>
  );
}
