import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'cancel':
        const { error: cancelError } = await supabase.rpc('cancel_subscription');
        if (cancelError) {
          return NextResponse.json({ error: cancelError.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });

      case 'reactivate':
        const { error: reactivateError } = await supabase.rpc('reactivate_subscription');
        if (reactivateError) {
          return NextResponse.json({ error: reactivateError.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });

      case 'update_payment_method':
        // Update payment method
        const { paymentMethodId, ...pmData } = data;
        if (!paymentMethodId) {
          return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from('payment_methods')
          .update({
            ...pmData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentMethodId)
          .eq('user_id', user.id);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });

      case 'create_subscription':
        // Create new subscription
        const { plan, stripeSubscriptionId, stripeCustomerId, periodStart, periodEnd } = data;
        
        if (!plan || !periodStart || !periodEnd) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Cancel any existing active subscriptions
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('status', 'active');

        // Create new subscription
        const { data: newSubscription, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan,
            status: 'active',
            stripe_subscription_id: stripeSubscriptionId || null,
            stripe_customer_id: stripeCustomerId || null,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 400 });
        }
        return NextResponse.json({ subscription: newSubscription });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in billing action API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

