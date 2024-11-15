'use client'

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import "./payment.css";

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializePayment() {
      try {
        // Get the selected plan from localStorage
        const planData = typeof window !== 'undefined' ? localStorage.getItem('selectedPlan') : null;
        
        if (!planData) {
          throw new Error('No plan selected. Please select a plan first.');
        }

        const plan = JSON.parse(planData);
        setSelectedPlan(plan);

        // Convert price to cents and ensure it's a valid number
        const amount = Math.round(parseFloat(plan.price) * 100);
        
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Invalid plan price');
        }

        // Create PaymentIntent
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount,
            planId: plan.id
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to create payment intent');
        }

        if (!data.clientSecret) {
          throw new Error('No client secret received from the server');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError(err.message || 'An error occurred while setting up the payment.');
      } finally {
        setLoading(false);
      }
    }

    initializePayment();
  }, []);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Pricing
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPlan || loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center p-4">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mr-2"></div>
          <span className="text-gray-600">Loading payment details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Complete Your {selectedPlan.name} Plan Purchase
      </h1>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-lg font-semibold">
          Selected Plan: {selectedPlan.name}
        </p>
        <p className="text-gray-600">
          Price: ${selectedPlan.price}/month
        </p>
      </div>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0066cc',
            },
          }
        }}>
          <CheckoutForm />
        </Elements>
      ) : (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mr-2"></div>
          <span className="text-blue-600">Initializing payment form...</span>
        </div>
      )}
    </div>
  );
}
