import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .rpc('get_active_subscription');

    if (subError) {
      console.error('Error fetching subscription:', subError);
    }

    // Get default payment method
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (pmError && pmError.code !== 'PGRST116') {
      console.error('Error fetching payment method:', pmError);
    }

    // Get billing history
    const { data: billingHistory, error: bhError } = await supabase
      .from('billing_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (bhError) {
      console.error('Error fetching billing history:', bhError);
    }

    return NextResponse.json({
      subscription: subscription?.[0] || null,
      paymentMethod: paymentMethod || null,
      billingHistory: billingHistory || [],
    });
  } catch (error) {
    console.error('Error in billing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

