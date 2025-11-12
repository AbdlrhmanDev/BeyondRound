'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  originalPrice?: string;
  savings?: string;
  features: string[];
  cta: string;
  popular: boolean;
  planId: 'trial' | 'monthly' | 'annual';
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: 'trial' | 'monthly' | 'annual';
  onSelectPlan?: (planId: 'trial' | 'monthly' | 'annual') => void;
}

export function PricingModal({ isOpen, onClose, currentPlan, onSelectPlan }: PricingModalProps) {
  const plans: Plan[] = [
    {
      name: 'Trial',
      description: 'Perfect for trying out BeyondRounds',
      price: '€9.99',
      period: 'first month',
      features: [
        'Full access to all features',
        'Weekly matching rounds',
        'Group chat functionality',
        'Profile creation',
        '30-day friendship guarantee',
      ],
      cta: 'Start Trial',
      popular: false,
      planId: 'trial',
    },
    {
      name: 'Monthly',
      description: 'Flexible monthly subscription',
      price: '€19.99',
      period: 'per month',
      features: [
        'Full access to all features',
        'Weekly matching rounds',
        'Group chat functionality',
        'Priority customer support',
        'Feedback and rating tools',
        'Access to community events',
      ],
      cta: 'Get Started',
      popular: true,
      planId: 'monthly',
    },
    {
      name: 'Annual',
      description: 'Best value for committed members',
      price: '€199.99',
      period: 'per year',
      originalPrice: '€239.88',
      savings: 'Save €39.89',
      features: [
        'Full access to all features',
        'Weekly matching rounds',
        'Group chat functionality',
        'Priority customer support',
        'Feedback and rating tools',
        'Access to community events',
        'Exclusive annual member perks',
        'Early access to new features',
      ],
      cta: 'Choose Annual',
      popular: false,
      planId: 'annual',
    },
  ];

  const handleSelectPlan = (planId: 'trial' | 'monthly' | 'annual') => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      // Default action - redirect to pricing page
      window.location.href = '/pricing';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
          <DialogDescription>
            Select the plan that works best for you. All plans include full access to matching and group chats.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.planId === currentPlan;
            
            return (
              <Card
                key={plan.name}
                className={`relative overflow-visible rounded-xl border h-full flex flex-col ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105 bg-gradient-to-br from-primary/5 to-primary/10' 
                    : 'border-border hover:border-primary/50'
                } ${isCurrentPlan ? 'ring-2 ring-primary' : ''} transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-3 z-10">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Current
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-6 relative">
                  <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                    {plan.savings && (
                      <p className="text-xs font-semibold text-green-500 mt-1">{plan.savings}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col px-4 pb-4">
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90'
                        : isCurrentPlan
                        ? 'bg-muted hover:bg-muted/80'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.planId)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




