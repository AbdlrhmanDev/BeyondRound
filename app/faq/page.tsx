import { ContentPageLayout, ContentSection, ContentDivider, FAQItem } from '@/components/layout/content-page-layout';

export default function FAQPage() {
  return (
    <ContentPageLayout title="Frequently Asked Questions">
      <div className="mb-6">
        <p className="text-lg text-muted-foreground">
          Find answers to common questions about BeyondRounds. Can&apos;t find what you&apos;re looking for? 
          Contact us at <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline">support@beyondrounds.com</a>
        </p>
      </div>

      <ContentSection title="General Questions">
        <FAQItem
          question="What is BeyondRounds?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                BeyondRounds is a platform designed specifically for doctors to find meaningful friendships with other medical professionals. 
                We understand the unique challenges doctors face in building social connections and created a space where you can find 
                your tribe – people who share both your profession and your interests outside of medicine.
              </p>
              <p className="text-base leading-relaxed">
                Unlike professional networking platforms, BeyondRounds focuses on helping doctors build genuine, personal friendships 
                that extend beyond the hospital walls.
              </p>
            </div>
          }
        />
        <FAQItem
          question="How does BeyondRounds work?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                After completing your profile and onboarding, our matching algorithm connects you with compatible doctors based on 
                location, interests, and lifestyle preferences. We organize small groups (3-4 members) who meet regularly.
              </p>
              <p className="text-base leading-relaxed">
                <strong>Matching rounds occur every Thursday at 4:00 PM</strong>, and you&apos;ll be notified when your group is ready. 
                You can then start chatting with your group members and plan meetups based on shared interests.
              </p>
            </div>
          }
        />
        <FAQItem
          question="Is BeyondRounds only for finding friends?"
          answer={
            <p className="text-base leading-relaxed">
              Yes, BeyondRounds is specifically designed for building genuine friendships. While professional networking may happen 
              naturally, our focus is on helping doctors connect on a personal level and build meaningful relationships outside 
              the hospital. We believe the best friendships happen when you connect over shared interests and values, not just 
              professional affiliations.
            </p>
          }
        />
        <FAQItem
          question="Who can join BeyondRounds?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                BeyondRounds is exclusively for verified medical professionals, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Doctors and physicians</li>
                <li>Surgeons and specialists</li>
                <li>Residents and fellows</li>
                <li>Attending physicians</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                All members must complete identity verification with valid medical credentials.
              </p>
            </div>
          }
        />
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Matching & Groups">
        <FAQItem
          question="How are matches made?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                Our algorithm considers multiple factors to create the best possible matches:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Location:</strong> City and geographic proximity</li>
                <li><strong>Medical specialty:</strong> Your preferences for same or different specialties</li>
                <li><strong>Activity levels:</strong> How active you prefer to be in social settings</li>
                <li><strong>Lifestyle preferences:</strong> Dietary restrictions, life stage, and values</li>
                <li><strong>Shared interests:</strong> Hobbies, activities, and passions outside medicine</li>
                <li><strong>Social preferences:</strong> Conversation styles and energy levels</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                We aim to create diverse groups where doctors can connect over common hobbies and activities while 
                appreciating different medical perspectives.
              </p>
            </div>
          }
        />
        <FAQItem
          question="How often do matching rounds occur?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                <strong>Matching rounds happen every Thursday at 4:00 PM.</strong> Once you&apos;re matched, you&apos;ll receive 
                a notification and can immediately start chatting with your group members through our private group chat.
              </p>
              <p className="text-base leading-relaxed">
                If you&apos;re not matched in a particular week, you&apos;ll remain in the matching pool for the next round.
              </p>
            </div>
          }
        />
        <FAQItem
          question="How many people are in each group?"
          answer={
            <p className="text-base leading-relaxed">
              Each group consists of <strong>3-4 members</strong>. We keep groups small intentionally to encourage deeper 
              connections and more meaningful interactions. Smaller groups also make it easier to coordinate meetups and 
              activities that everyone enjoys.
            </p>
          }
        />
        <FAQItem
          question="What if I don&apos;t like my group?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                We encourage you to give the group a few meetings before deciding. Sometimes the best friendships take time 
                to develop. However, you can always provide feedback after group interactions through our feedback system.
              </p>
              <p className="text-base leading-relaxed">
                If you have ongoing concerns or feel the group isn&apos;t a good fit, please reach out to{' '}
                <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline">support@beyondrounds.com</a>, 
                and we&apos;ll work with you to find a better match in the next round.
              </p>
            </div>
          }
        />
        <FAQItem
          question="Can I request specific types of doctors to be matched with?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                During onboarding, you&apos;ll be able to specify preferences such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Specialty preferences (same specialty, different specialty, or no preference)</li>
                <li>Gender preferences</li>
                <li>Location and proximity</li>
                <li>Activity levels</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                While we try to honor these preferences, we also believe in the value of diverse groups. Sometimes the best 
                connections happen with people who have different perspectives but share core values and interests.
              </p>
            </div>
          }
        />
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Meetings & Safety">
        <FAQItem
          question="How do group meetings work?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                After matching, your group will have access to a private chat where you can coordinate meetups. Group members 
                typically organize activities based on shared interests – whether that&apos;s hiking, coffee, dinners, board games, 
                concerts, or other activities.
              </p>
              <p className="text-base leading-relaxed">
                There&apos;s no pressure or obligation to meet, but we encourage groups to plan at least one initial meetup to see 
                if the connection works in person.
              </p>
            </div>
          }
        />
        <FAQItem
          question="Are meetings safe?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                All members are verified medical professionals, which provides an additional layer of safety. However, we always 
                recommend:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Meeting in public places initially</li>
                <li>Letting someone know where you&apos;re going</li>
                <li>Using your judgment and trusting your instincts</li>
                <li>Reporting any concerns immediately</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                If you have any safety concerns, please contact us immediately at{' '}
                <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline">support@beyondrounds.com</a>.
              </p>
            </div>
          }
        />
        <FAQItem
          question="What happens if someone in my group behaves inappropriately?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                We take member conduct seriously. Our community is built on respect, professionalism, and mutual support. 
                If you experience inappropriate behavior, please:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Report it to <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline">support@beyondrounds.com</a> immediately</li>
                <li>Provide details about the incident</li>
                <li>Cease contact with the individual if you feel uncomfortable</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                All reports are thoroughly investigated, and members who violate our code of conduct will be removed from 
                the platform immediately.
              </p>
            </div>
          }
        />
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Pricing & Membership">
        <FAQItem
          question="How much does BeyondRounds cost?"
          answer={
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <ul className="list-none space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Trial (First Month)</span>
                    <span className="text-primary font-semibold">€9.99</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Monthly Subscription</span>
                    <span className="text-primary font-semibold">€19.99/month</span>
                  </li>
                  <li className="flex justify-between items-center border-t pt-3">
                    <span className="font-medium">Annual Subscription</span>
                    <span className="text-primary font-semibold">€199.99/year</span>
                  </li>
                  <li className="text-sm text-muted-foreground">
                    <em>Save €39.89 with annual subscription</em>
                  </li>
                </ul>
              </div>
              <p className="text-base leading-relaxed">
                All subscriptions automatically renew unless cancelled. You can cancel at any time through your account settings.
              </p>
            </div>
          }
        />
        <FAQItem
          question="What does my membership include?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                Your membership includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Weekly matching rounds (every Thursday at 4:00 PM)</li>
                <li>Private group chat functionality</li>
                <li>Feedback and rating tools</li>
                <li>Priority customer support</li>
                <li>Exclusive access to community events</li>
                <li>Resources and guides for building friendships</li>
              </ul>
            </div>
          }
        />
        <FAQItem
          question="Is there a free trial?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                Yes! Your first month is available at a discounted trial rate of <strong>€9.99</strong>. This gives you full 
                access to all features so you can experience BeyondRounds and see if it&apos;s right for you.
              </p>
              <p className="text-base leading-relaxed">
                If you&apos;re not satisfied, you can cancel anytime during your trial period. See our Cancellation Policy 
                for more details.
              </p>
            </div>
          }
        />
        <FAQItem
          question="Can I cancel my subscription?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                Yes, you can cancel your subscription at any time through your account settings or by contacting{' '}
                <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline">support@beyondrounds.com</a>. 
                Your access will continue until the end of your current billing period, and you&apos;ll receive a confirmation email.
              </p>
              <p className="text-base leading-relaxed">
                See our <a href="/cancellation" className="text-primary hover:underline">Cancellation & Refund Policy</a> for complete details, 
                including information about our 30-day friendship guarantee for new members.
              </p>
            </div>
          }
        />
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Account & Profile">
        <FAQItem
          question="How do I update my profile?"
          answer={
            <p className="text-base leading-relaxed">
              You can update your profile at any time by going to the Settings or Profile section in your dashboard. 
              Keeping your profile up to date – especially your interests, availability, and preferences – helps ensure 
              better matches. We recommend reviewing and updating your profile every few months.
            </p>
          }
        />
        <FAQItem
          question="What information is required for my profile?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                During onboarding, we&apos;ll ask for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Basic information:</strong> Name, location, age, gender</li>
                <li><strong>Medical background:</strong> Specialty, career stage, verification</li>
                <li><strong>Interests and activities:</strong> Hobbies, sports, entertainment preferences</li>
                <li><strong>Social preferences:</strong> Conversation styles, meeting activities, looking for</li>
                <li><strong>Availability:</strong> Best days/times for meetups</li>
                <li><strong>Lifestyle:</strong> Dietary restrictions, life stage, values</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                The more complete your profile, the better our algorithm can match you with compatible doctors.
              </p>
            </div>
          }
        />
        <FAQItem
          question="Is my information private?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                Yes, we take privacy seriously. Your personal information is only shared with your matched group members 
                once you&apos;re placed in a group. We never sell your data or share it with third parties for marketing purposes.
              </p>
              <p className="text-base leading-relaxed">
                Please review our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for complete 
                details on how we collect, use, and protect your information.
              </p>
            </div>
          }
        />
        <FAQItem
          question="How does verification work?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                All members must complete identity and professional verification. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Verifying your medical license or credentials</li>
                <li>Confirming your identity</li>
                <li>Validating your practice or hospital affiliation</li>
              </ul>
              <p className="text-base leading-relaxed mt-3">
                This process typically takes 24-48 hours. Verification is required before you can participate in matching rounds.
              </p>
            </div>
          }
        />
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Support">
        <FAQItem
          question="How can I contact support?"
          answer={
            <div className="space-y-3">
              <p className="text-base leading-relaxed">
                You can reach us at{' '}
                <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline font-medium">
                  support@beyondrounds.com
                </a>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We typically respond within 24-48 hours</li>
                <li>For urgent matters, please mark your email as urgent</li>
                <li>For technical issues, include screenshots and details about the problem</li>
              </ul>
            </div>
          }
        />
        <FAQItem
          question="Do you offer technical support?"
          answer={
            <p className="text-base leading-relaxed">
              Yes, if you&apos;re experiencing technical issues with the platform, please email{' '}
              <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline">support@beyondrounds.com</a> with 
              details about the problem (including screenshots if possible), and we&apos;ll help you resolve it as quickly as possible.
            </p>
          }
        />
        <FAQItem
          question="Still have questions?"
          answer={
            <p className="text-base leading-relaxed">
              Don&apos;t hesitate to reach out! We&apos;re here to help. Email us at{' '}
              <a href="mailto:support@beyondrounds.com" className="text-primary hover:underline font-medium">
                support@beyondrounds.com
              </a>{' '}
              or check out our <a href="/about" className="text-primary hover:underline">About page</a> to learn more about our mission.
            </p>
          }
        />
      </ContentSection>
    </ContentPageLayout>
  );
}
