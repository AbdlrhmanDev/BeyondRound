import { ContentPageLayout, ContentSection, ContentDivider } from '@/components/layout/content-page-layout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PricingPage() {
  const plans = [
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
    },
  ];

  return (
    <ContentPageLayout title="Pricing">
      <div className="text-center mb-12">
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Choose the plan that works best for you. All plans include full access to matching, 
          group chats, and our community features. Start your journey to finding meaningful friendships today.
        </p>
      </div>

      {/* Pricing Cards - Glossy Black Style */}
      <div className="grid gap-8 md:gap-10 md:grid-cols-3 mb-16 items-start pt-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-visible rounded-2xl border h-full flex flex-col ${
              plan.popular 
                ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20 md:scale-105 bg-gradient-to-br from-gray-900 via-blue-950/30 to-black' 
                : 'border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 hover:shadow-xl hover:shadow-gray-900/50'
            } backdrop-blur-xl transition-all duration-300`}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl" />
            
            {/* Top shine effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl shadow-blue-500/30 whitespace-nowrap">
                  ⭐ Most Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center pb-6 pt-8 relative">
              <CardTitle className="text-3xl mb-3 text-white font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-base text-gray-400">{plan.description}</CardDescription>
              
              <div className="mt-8 mb-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
                    {plan.price}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-400 mt-3">{plan.period}</p>
                {plan.savings && (
                  <div className="mt-3 inline-block">
                    <span className="text-sm font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                      {plan.savings}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 relative flex-1 flex flex-col px-6 pb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4" />
              
              <ul className="space-y-4 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-base text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/auth/signup" className="block mt-6">
                <Button
                  className={`w-full font-bold text-base py-6 rounded-xl ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/60'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border-2 border-gray-700 hover:border-gray-600 shadow-lg shadow-gray-900/50'
                  } transition-all duration-300`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContentDivider />

      <ContentSection title="Frequently Asked Questions About Pricing">
        <div className="space-y-6">
          <div className="space-y-2 p-5 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Can I switch plans later?</h3>
            <p className="text-base leading-relaxed text-gray-300">
              Yes! You can upgrade, downgrade, or change your plan at any time through your account settings. 
              Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div className="space-y-2 p-5 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">What payment methods do you accept?</h3>
            <p className="text-base leading-relaxed text-gray-300">
              We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. 
              Payments are processed securely through our payment provider.
            </p>
          </div>
          <div className="space-y-2 p-5 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Is there a free trial?</h3>
            <p className="text-base leading-relaxed text-gray-300">
              Yes! Your first month is available at a discounted trial rate of €9.99. This gives you full 
              access to all features so you can experience BeyondRounds risk-free.
            </p>
          </div>
          <div className="space-y-2 p-5 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Do you offer refunds?</h3>
            <p className="text-base leading-relaxed text-gray-300">
              We offer a 30-day friendship guarantee for new members. If you don&apos;t have at least two 
              meaningful meetups within your first 30 days, we&apos;ll provide a full refund. See our{' '}
              <Link href="/cancellation" className="text-blue-400 hover:underline">
                Cancellation Policy
              </Link>{' '}
              for more details.
            </p>
          </div>
          <div className="space-y-2 p-5 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">How does billing work?</h3>
            <p className="text-base leading-relaxed text-gray-300">
              Monthly plans are billed monthly from your signup date. Annual plans are billed once per year. 
              You can cancel anytime, and your access will continue until the end of your current billing period.
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="All Plans Include">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <div className="space-y-2 p-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/30 to-black/30">
            <h4 className="font-semibold text-blue-400">Weekly Matching</h4>
            <p className="text-sm text-gray-300">
              Get matched with compatible doctors every Thursday at 4:00 PM
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/30 to-black/30">
            <h4 className="font-semibold text-blue-400">Group Chats</h4>
            <p className="text-sm text-gray-300">
              Private group messaging with your matched members
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/30 to-black/30">
            <h4 className="font-semibold text-blue-400">Profile Creation</h4>
            <p className="text-sm text-gray-300">
              Complete profile setup to help us find the best matches
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/30 to-black/30">
            <h4 className="font-semibold text-blue-400">Feedback Tools</h4>
            <p className="text-sm text-gray-300">
              Rate and provide feedback on your group experiences
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/30 to-black/30">
            <h4 className="font-semibold text-blue-400">Verified Community</h4>
            <p className="text-sm text-gray-300">
              Connect only with verified medical professionals
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900/30 to-black/30">
            <h4 className="font-semibold text-blue-400">Customer Support</h4>
            <p className="text-sm text-gray-300">
              Responsive support team ready to help
            </p>
          </div>
        </div>
      </ContentSection>

      <div className="mt-12 text-center">
        <p className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Ready to find your tribe?
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-900/50 font-bold">
            Get Started Now
          </Button>
        </Link>
      </div>
    </ContentPageLayout>
  );
}

