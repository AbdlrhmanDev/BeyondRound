'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, Download, ArrowUpRight, ArrowDownRight, Check, X } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { PricingModal } from '@/components/dashboard/pricing-modal';
import { CancelSubscriptionDialog } from '@/components/dashboard/cancel-subscription-dialog';

interface Subscription {
  id: string;
  plan: 'trial' | 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  description: string;
  invoice_url: string | null;
  invoice_pdf_url: string | null;
}

export default function BillingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        const response = await fetch('/api/v1/billing');
        if (!response.ok) {
          throw new Error('Failed to fetch billing data');
        }

        const data = await response.json();
        setSubscription(data.subscription);
        setPaymentMethod(data.paymentMethod);
        setBillingHistory(data.billingHistory || []);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [supabase, router]);

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'trial':
        return { name: 'Trial', price: '€9.99', period: 'first month' };
      case 'monthly':
        return { name: 'Monthly', price: '€19.99', period: 'per month' };
      case 'annual':
        return { name: 'Annual', price: '€199.99', period: 'per year' };
      default:
        return { name: 'Free', price: '€0.00', period: '' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCancelSubscription = async () => {
    setUpdating(true);
    setError(null);
    setShowCancelDialog(false);

    try {
      const response = await fetch('/api/v1/billing/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Refresh data
      const billingResponse = await fetch('/api/v1/billing');
      const billingData = await billingResponse.json();
      setSubscription(billingData.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/billing/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      // Refresh data
      const billingResponse = await fetch('/api/v1/billing');
      const billingData = await billingResponse.json();
      setSubscription(billingData.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    // This would typically open a payment method form or Stripe checkout
    // For now, we'll show an alert
    alert('Payment method update functionality will be integrated with your payment provider (e.g., Stripe).');
  };

  const handleSelectPlan = async (planId: 'trial' | 'monthly' | 'annual') => {
    setUpdating(true);
    setError(null);

    try {
      // Calculate period dates
      const now = new Date();
      const periodStart = now.toISOString();
      const periodEnd = new Date();
      
      if (planId === 'annual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const response = await fetch('/api/v1/billing/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_subscription',
          plan: planId,
          periodStart,
          periodEnd,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update subscription');
      }

      // Refresh data
      const billingResponse = await fetch('/api/v1/billing');
      const billingData = await billingResponse.json();
      setSubscription(billingData.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const planDetails = subscription ? getPlanDetails(subscription.plan) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground mt-2">Manage your subscription and payment methods</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Current Plan */}
        {subscription && planDetails ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">{planDetails.name}</h3>
                    {subscription.status === 'active' && (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-500/10 text-green-500 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {planDetails.price} {planDetails.period}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-2"
                >
                  {subscription.plan === 'annual' ? (
                    <>
                      <ArrowDownRight className="h-4 w-4" />
                      Change Plan
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4" />
                      Upgrade Plan
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Period</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Billing Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your subscription will be cancelled on {formatDate(subscription.current_period_end)}. 
                    You&apos;ll continue to have access until then.
                  </p>
                </div>
              )}

              {!subscription.cancel_at_period_end ? (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={updating}
                >
                  Cancel Subscription
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReactivateSubscription}
                  disabled={updating}
                >
                  {updating ? 'Reactivating...' : 'Reactivate Subscription'}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>Subscribe to a plan to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowPricingModal(true)}
                className="w-full"
              >
                View Plans
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        {paymentMethod && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Your default payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdatePaymentMethod}
                  disabled={updating}
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {billingHistory.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No billing history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {billingHistory.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        invoice.status === 'paid' 
                          ? 'bg-green-500/10' 
                          : invoice.status === 'pending'
                          ? 'bg-yellow-500/10'
                          : 'bg-red-500/10'
                      }`}>
                        {invoice.status === 'paid' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : invoice.status === 'pending' ? (
                          <Calendar className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.created_at)}
                    </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                        <p className={`text-xs ${
                          invoice.status === 'paid' 
                            ? 'text-green-500' 
                            : invoice.status === 'pending'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </p>
                      </div>
                      {(invoice.invoice_url || invoice.invoice_pdf_url) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.invoice_pdf_url || invoice.invoice_url || '#', '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
                <p>
                  If you have questions about your billing or subscription, please{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => router.push('/support')}
                  >
                    contact our support team
                  </Button>
                  .
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Cancellation Policy</h4>
                <p>
                  You can cancel your subscription at any time. Your access will continue until the end of your current billing period.{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => router.push('/cancellation')}
                  >
                    Learn more
                  </Button>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={subscription?.plan}
        onSelectPlan={handleSelectPlan}
      />

      {/* Cancel Subscription Dialog */}
      {subscription && (
        <CancelSubscriptionDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancelSubscription}
          cancellationDate={formatDate(subscription.current_period_end)}
          isLoading={updating}
        />
      )}
    </DashboardLayout>
  );
}

