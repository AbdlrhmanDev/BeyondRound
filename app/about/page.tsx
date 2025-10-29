import { ContentPageLayout, ContentSection, ContentDivider } from '@/components/layout/content-page-layout';

export default function AboutPage() {
  return (
    <ContentPageLayout title="About Us">
      <ContentSection title="Where Doctors Become Friends">
        <p className="text-lg leading-relaxed mb-6">
          The idea for BeyondRounds was born during one of those late-night shifts that every doctor knows too well. 
          After years of moving between hospitals, specializing, and diving deep into the demanding world of medicine, 
          I found myself surrounded by colleagues but genuinely lonely.
          </p>
        <p className="text-lg leading-relaxed mb-6">
            Don&apos;t get me wrong – I loved connecting with people. I&apos;ve always been social, meeting new faces, sharing
          stories, and building connections wherever I went. But there was something missing. The conversations always 
          seemed to circle back to cases, protocols, and the latest medical research. While professionally enriching, 
          I craved something deeper – real friendships that went beyond the hospital walls.
          </p>
        <p className="text-lg leading-relaxed mb-6">
          Everything changed one evening when I was introduced to four other doctors through a mutual friend. We met for 
          drinks, and what started as casual conversation quickly evolved into something special. We discovered we shared 
          the same passion for hiking, had similar music tastes, and – surprisingly – the same quirky sense of humor that 
          only seemed to make sense to fellow doctors.
          </p>
        <p className="text-lg leading-relaxed mb-6">
          One of these doctors, now one of my closest friends, lived in Berlin. Despite the distance, we found ourselves 
          calling each other regularly, sharing not just our professional challenges, but our weekend adventures, travel plans, 
          and life dreams. It was then I realized something profound: <strong>there&apos;s an unspoken understanding between doctors 
          that&apos;s hard to find elsewhere.</strong>
          </p>
        <p className="text-lg leading-relaxed mb-6">
          We get each other. We understand the unique pressures, the irregular schedules, the weight of responsibility we 
          carry. But more importantly, we understand the person behind the white coat – someone who chose medicine not just 
          as a career, but as a calling.
          </p>
        <p className="text-lg leading-relaxed">
            That&apos;s when it hit me: if I felt this isolated despite working in environments filled with brilliant medical
          professionals, how many other doctors were experiencing the same thing? How many were moving to new cities for 
          residencies, fellowships, or positions, struggling to build meaningful friendships outside their specialty?
          </p>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="BeyondRounds: Our Mission">
        <p className="text-lg leading-relaxed mb-6">
          We created BeyondRounds because we believe <strong>every doctor deserves to find their tribe</strong> – people who 
          understand the unique rhythm of medical life but share interests that extend far beyond medicine. Whether you&apos;re 
          passionate about rock climbing, love exploring new restaurants, are a weekend warrior on the tennis court, or prefer 
          quiet coffee conversations about books and travel, there are doctors out there who share your interests and are 
          looking for the same genuine connections you are.
          </p>
        
        <div className="bg-muted/50 p-6 rounded-lg my-6">
          <p className="text-lg leading-relaxed mb-4">
            <strong>Our mission is simple:</strong> to help doctors discover friendships that enrich their lives outside the hospital. 
            Because when you find your people – your tribe – everything else falls into place.
          </p>
          <p className="text-lg leading-relaxed font-semibold text-primary">
            Join thousands of doctors who&apos;ve already found their tribe. Your next great friendship is just one match away.
          </p>
        </div>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="What Makes Us Different">
        <div className="grid gap-6 md:grid-cols-2 my-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-primary">Verified Community</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              Every member is a verified medical professional. This ensures you&apos;re connecting with real doctors who 
              understand your world and share your values.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-primary">Intentional Matching</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              Our algorithm considers not just medical specialty, but interests, lifestyle, and what you&apos;re looking for 
              in friendships to create meaningful connections.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-primary">Small Groups</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              We create groups of 3-4 members to encourage deeper connections and more meaningful interactions than large 
              networking events.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-primary">Beyond Medicine</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              We focus on what brings you joy outside the hospital – hobbies, interests, and the things that make you, you.
            </p>
          </div>
    </div>
      </ContentSection>

      <ContentDivider />

      <ContentSection title="Join Our Community">
        <p className="text-lg leading-relaxed mb-4">
          Whether you&apos;re a resident just starting out, an attending physician looking for connections in a new city, or 
          a doctor who simply wants to expand your social circle beyond work, BeyondRounds is here for you.
        </p>
        <p className="text-lg leading-relaxed">
          Start your journey today. Complete your profile, share what matters to you, and let us help you find your tribe.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
