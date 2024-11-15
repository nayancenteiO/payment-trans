'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface SelectedPlan {
  id: string;
  name: string;
  price: number;
}

const planFeatures = {
  basic: [
    'Up to 1,000 translations per month',
    'Access to 50+ languages',
    'Basic support',
    'No ads',
  ],
  pro: [
    'Unlimited translations',
    'Access to all languages',
    'Priority support',
    'No ads',
    'API access',
    'Custom terminology',
  ],
  enterprise: [
    'Everything in Professional',
    'Dedicated account manager',
    'Custom AI model training',
    'Advanced analytics',
    'SLA guarantee',
    'Team collaboration tools',
  ],
};

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null)

  useEffect(() => {
    try {
      const planData = localStorage.getItem('selectedPlan')
      if (planData) {
        setSelectedPlan(JSON.parse(planData))
      }
    } catch (error) {
      console.error('Error retrieving plan data:', error)
    }
  }, [])

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p>Loading plan details...</p>
        </Card>
      </div>
    )
  }

  const benefits = planFeatures[selectedPlan.id as keyof typeof planFeatures] || []

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Thank you for subscribing to {selectedPlan.name}. Your account has been upgraded and you now have access to all premium features.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Your premium benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium">Subscription Details:</p>
            <p className="text-sm text-gray-600">
              Plan: {selectedPlan.name}<br />
              Price: ${selectedPlan.price}/month
            </p>
          </div>

          <Button 
            className="w-full"
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </Button>

          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your inbox with your subscription details.
          </p>
        </div>
      </Card>
    </div>
  )
}
