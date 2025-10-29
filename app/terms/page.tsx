import { ContentPageLayout, ContentSection, ContentDivider } from '@/components/layout/content-page-layout';

export default function TermsPage() {
  return (
    <ContentPageLayout title="Terms & Conditions" lastUpdated="October 29, 2024">
      <ContentSection title="1. Acceptance of Terms">
        <p>
          By accessing and using BeyondRounds, you accept and agree to be bound by the terms and provision of this agreement. 
          If you do not agree to these Terms & Conditions, please do not use our service.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="2. Eligibility">
        <p>
          BeyondRounds is exclusively for verified medical professionals. To use our service, you must:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Be a licensed medical professional (doctor, physician, surgeon, etc.)</li>
          <li>Be at least 18 years of age</li>
          <li>Complete the verification process with valid medical credentials</li>
          <li>Provide accurate and truthful information during registration</li>
          <li>Maintain the accuracy of your account information</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="3. Account and Verification">
        <h3 className="text-xl font-semibold mb-2">Account Creation:</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities 
          that occur under your account.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-4">Verification:</h3>
        <p>
          All members must complete identity and professional verification. We reserve the right to verify your medical 
          credentials and may suspend or terminate accounts that cannot be verified or that provide false information.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="4. Subscription and Billing">
        <p>
          BeyondRounds operates on a subscription basis. By subscribing, you agree to pay the fees specified at the time 
          of subscription. Subscriptions automatically renew unless cancelled.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Billing cycles are monthly from your signup date</li>
          <li>Price changes require 30 days advance notice</li>
          <li>Charges appear as &quot;BeyondRounds&quot; on your billing statement</li>
        </ul>
        <p className="mt-4">
          For billing questions, contact <a href="mailto:support@beyondrounds.com" className="underline">support@beyondrounds.com</a>.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="5. Code of Conduct">
        <p>
          All members must adhere to our community guidelines:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Treat all members with respect and professionalism</li>
          <li>Maintain appropriate boundaries in all interactions</li>
          <li>Do not engage in harassment, discrimination, or inappropriate behavior</li>
          <li>Respect the privacy of other members</li>
          <li>Do not share personal information of other members without consent</li>
          <li>Report any concerns or violations to support@beyondrounds.com</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="6. Prohibited Behaviors">
        <p>The following behaviors are strictly prohibited:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Using the platform for professional solicitation or business purposes</li>
          <li>Harassment, threats, or abusive language</li>
          <li>Sharing false or misleading information</li>
          <li>Attempting to circumvent platform security measures</li>
          <li>Creating multiple accounts</li>
          <li>Using automated systems to access the platform</li>
          <li>Violating any applicable laws or regulations</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="7. Intellectual Property">
        <p>
          All content on BeyondRounds, including text, graphics, logos, and software, is the property of BeyondRounds 
          or its licensors and is protected by copyright and other intellectual property laws.
        </p>
        <p className="mt-4">
          You retain ownership of content you create and share on the platform, but grant BeyondRounds a license to use, 
          display, and distribute such content for the purpose of operating the platform.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="8. Privacy and Data">
        <p>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect 
          your information. By using BeyondRounds, you consent to our privacy practices as described in the Privacy Policy.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="9. Limitation of Liability">
        <p>
          BeyondRounds provides a platform for connecting medical professionals. We do not guarantee specific outcomes, 
          matches, or relationships. We are not responsible for the actions of members or the content they share.
        </p>
        <p className="mt-4">
          To the maximum extent permitted by law, BeyondRounds shall not be liable for any indirect, incidental, special, 
          consequential, or punitive damages arising from your use of the service.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="10. Termination">
        <p>
          We reserve the right to suspend or terminate your account at any time for violations of these Terms, misconduct, 
          or other reasons at our sole discretion.
        </p>
        <p className="mt-4">
          You may terminate your account at any time through your account settings or by contacting support. Upon termination, 
          your right to use the service will immediately cease.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="11. Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be communicated via email or 
          prominent notice on the platform. Your continued use of the service after changes constitutes acceptance of 
          the modified Terms.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="12. Contact Information">
        <p>
          If you have questions about these Terms & Conditions, please contact us:
        </p>
        <p className="mt-4">
          Email: <a href="mailto:support@beyondrounds.com" className="underline">support@beyondrounds.com</a>
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}

