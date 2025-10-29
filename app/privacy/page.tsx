import { ContentPageLayout, ContentSection, ContentDivider } from '@/components/layout/content-page-layout';

export default function PrivacyPage() {
  return (
    <ContentPageLayout title="Privacy Policy" lastUpdated="October 29, 2024">
      <ContentSection title="Your Privacy Matters">
        <p>
          At BeyondRounds, we are committed to protecting your privacy and ensuring the security of your personal information. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Information We Collect">
        <h3 className="text-xl font-semibold mb-2">Account Information:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Name, email address, and contact information</li>
          <li>Medical credentials and verification data</li>
          <li>Profile photos and biographical information</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2 mt-4">Verification Data:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Professional medical license numbers (for verification purposes)</li>
          <li>Hospital or practice affiliation</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2 mt-4">Profile Information:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Location and city</li>
          <li>Medical specialty and career stage</li>
          <li>Interests, hobbies, and preferences</li>
          <li>Lifestyle information (activity levels, dietary preferences, etc.)</li>
          <li>Social preferences and availability</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2 mt-4">Usage Data:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Messages and communications within the platform</li>
          <li>Feedback and ratings on group experiences</li>
          <li>Platform interaction data (pages visited, features used)</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="How We Use Your Information">
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li><strong>Provide and improve our services:</strong> Create matches, facilitate group connections, and enhance the user experience</li>
          <li><strong>Verify your identity:</strong> Ensure all members are verified medical professionals</li>
          <li><strong>Communicate with you:</strong> Send notifications, updates, and respond to your inquiries</li>
          <li><strong>Ensure safety:</strong> Monitor for inappropriate behavior and enforce our community guidelines</li>
          <li><strong>Analyze usage:</strong> Understand how our platform is used to make improvements</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Information Sharing">
        <p>
          <strong>We never sell your personal information.</strong>
        </p>
        <p className="mt-2">
          We only share your information in the following circumstances:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li><strong>With your matched group members:</strong> Your profile information is shared with members of your matched groups to facilitate connections</li>
          <li><strong>Service providers:</strong> We may share data with trusted service providers who help us operate our platform (e.g., cloud hosting, email services)</li>
          <li><strong>Legal requirements:</strong> If required by law or to protect our rights and the safety of our users</li>
          <li><strong>With your consent:</strong> In any other situation where you have explicitly given us permission</li>
        </ul>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Data Security">
        <p>
          We implement industry-standard security measures to protect your information, including encryption, secure servers, 
          and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot 
          guarantee absolute security.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your account and data</li>
          <li>Opt-out of certain communications</li>
          <li>Export your data</li>
        </ul>
        <p className="mt-4">
          To exercise these rights, please contact us at <a href="mailto:privacy@beyondrounds.com" className="underline">privacy@beyondrounds.com</a>.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Cookies and Tracking">
        <p>
          We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. 
          You can control cookie preferences through your browser settings.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Children&apos;s Privacy">
        <p>
          BeyondRounds is intended for verified medical professionals. We do not knowingly collect information from 
          individuals under the age of 18.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
          the new policy on this page and updating the &quot;Last Updated&quot; date.
        </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Contact Us">
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mt-2">
          Email: <a href="mailto:privacy@beyondrounds.com" className="underline">privacy@beyondrounds.com</a>
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}

