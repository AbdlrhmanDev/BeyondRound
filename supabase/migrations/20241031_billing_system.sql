-- ============================================
-- Billing & Subscription System Migration
-- ============================================

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('trial', 'monthly', 'annual')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT,
    type TEXT NOT NULL DEFAULT 'card' CHECK (type IN ('card')),
    brand TEXT,
    last4 TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create billing_history table
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    description TEXT NOT NULL,
    invoice_url TEXT,
    invoice_pdf_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON public.billing_history(subscription_id);

-- 5. Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (true);

-- 7. RLS Policies for payment_methods
CREATE POLICY "Users can view own payment methods"
    ON public.payment_methods FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
    ON public.payment_methods FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
    ON public.payment_methods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
    ON public.payment_methods FOR DELETE
    USING (auth.uid() = user_id);

-- 8. RLS Policies for billing_history
CREATE POLICY "Users can view own billing history"
    ON public.billing_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert billing history"
    ON public.billing_history FOR INSERT
    WITH CHECK (true);

-- 9. Function: Get user's active subscription
CREATE OR REPLACE FUNCTION public.get_active_subscription()
RETURNS TABLE (
    id UUID,
    plan TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
      AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$;

-- 10. Function: Cancel subscription
CREATE OR REPLACE FUNCTION public.cancel_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    active_sub_id UUID;
BEGIN
    SELECT id INTO active_sub_id
    FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    IF active_sub_id IS NOT NULL THEN
        UPDATE public.subscriptions
        SET 
            cancel_at_period_end = TRUE,
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE id = active_sub_id;
    END IF;
END;
$$;

-- 11. Function: Reactivate subscription
CREATE OR REPLACE FUNCTION public.reactivate_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cancelled_sub_id UUID;
BEGIN
    SELECT id INTO cancelled_sub_id
    FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND cancel_at_period_end = TRUE
    ORDER BY created_at DESC
    LIMIT 1;

    IF cancelled_sub_id IS NOT NULL THEN
        UPDATE public.subscriptions
        SET 
            cancel_at_period_end = FALSE,
            cancelled_at = NULL,
            updated_at = NOW()
        WHERE id = cancelled_sub_id;
    END IF;
END;
$$;

COMMENT ON TABLE public.subscriptions IS 'User subscription information';
COMMENT ON TABLE public.payment_methods IS 'User payment methods';
COMMENT ON TABLE public.billing_history IS 'Billing history and invoices';

