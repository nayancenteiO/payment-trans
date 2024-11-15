'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    features: [
      'Up to 1,000 translations per month',
      'Access to 50+ languages',
      'Basic support',
      'No ads',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    features: [
      'Unlimited translations',
      'Access to all languages',
      'Priority support',
      'No ads',
      'API access',
      'Custom terminology',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom AI model training',
      'Advanced analytics',
      'SLA guarantee',
      'Team collaboration tools',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleGetStarted = (plan: Plan) => {
    try {
      // Store plan details in localStorage
      localStorage.setItem('selectedPlan', JSON.stringify({
        id: plan.id,
        name: plan.name,
        price: plan.price
      }));
      
      // Redirect to payment page
      router.push('/payment');
    } catch (error) {
      console.error('Error storing plan data:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600">
          Select the perfect plan for your translation needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative p-6 ${plan.popular ? 'border-blue-500 border-2' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm rounded-bl-lg rounded-tr-lg">
                Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <div className="text-3xl font-bold">
                ${plan.price}
                <span className="text-base font-normal text-gray-500">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => handleGetStarted(plan)}
            >
              {plan.popular && <Zap className="h-4 w-4 mr-2" />}
              Get Started
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
