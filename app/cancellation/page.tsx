import { ContentPageLayout, ContentSection, ContentDivider } from '@/components/layout/content-page-layout';

export default function CancellationPage() {
  return (
    <ContentPageLayout title="Cancellation & Refund Policy" lastUpdated="October 29, 2024">
      <ContentSection title="Easy Cancellation">
        <h3 className="text-xl font-semibold mb-2">How to Cancel:</h3>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Log into your BeyondRounds account</li>
          <li>Go to Settings → Billing</li>
          <li>Click &quot;Cancel Subscription&quot;</li>
          <li>Confirm your cancellation</li>
        </ol>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="What Happens When You Cancel">
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You will continue to receive matches until the end of your current billing period</li>
          <li>You will retain access to premium features until your subscription expires</li>
          <li>Your account and profile will remain active until the end of your billing cycle</li>
          <li>No additional charges will be made after cancellation</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="30-Day Friendship Guarantee">
        <p>
          <strong>New members only:</strong> If you don&apos;t have at least two meaningful meetups with other doctors within 
          your first 30 days, we&apos;ll provide a full refund.
        </p>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">To claim your guarantee:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Email <a href="mailto:support@beyondrounds.com" className="underline">support@beyondrounds.com</a> within 30 days of signing up</li>
          <li>Provide a brief explanation of your experience</li>
          <li>Refunds are processed within 5-7 business days</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Regular Refund Policy">
        <p>
          After the 30-day guarantee period, subscriptions are <strong>non-refundable</strong>. This policy allows us to:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Maintain consistent group composition</li>
          <li>Ensure serious commitment from members</li>
          <li>Keep membership costs low for everyone</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Special Circumstances">
        <p>
          We may consider refund requests in exceptional circumstances, such as:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Technical issues preventing use of the platform</li>
          <li>Medical emergencies affecting participation</li>
          <li>Relocation outside our service areas</li>
        </ul>
        <p className="mt-4">
          Please contact <a href="mailto:support@beyondrounds.com" className="underline">support@beyondrounds.com</a> to discuss your situation.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Billing Questions">
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Charges appear as &quot;BeyondRounds&quot; on your billing statement</li>
          <li>Billing cycles are monthly from your signup date</li>
          <li>Price changes require 30 days advance notice</li>
          <li>Contact <a href="mailto:support@beyondrounds.com" className="underline">support@beyondrounds.com</a> for billing inquiries</li>
        </ul>
      </ContentSection>
    </ContentPageLayout>
  );
}

