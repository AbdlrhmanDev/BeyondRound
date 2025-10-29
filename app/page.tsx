import { Button } from '@/components/ui/button';
import { ArrowRight, Users, MessageSquare, Heart, Shield, Calendar } from 'lucide-react';
import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { MainFooter } from '@/components/layout/main-footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-muted/20">
          <div className="w-[80%] max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center items-center lg:items-start space-y-6 text-center lg:text-left">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Where Doctors
                    <span className="text-primary block">Become Friends</span>
                  </h1>
                  <p className="max-w-[600px] mx-auto lg:mx-0 text-lg text-muted-foreground md:text-xl">
                    Connect with medical professionals who share your interests, values, and passion for life beyond the hospital walls. 
                    Find your tribe and build meaningful friendships.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center lg:justify-start">
                  <Link href="/auth/signup">
                    <Button size="lg" className="text-lg px-8">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-3xl"></div>
                  <div className="relative bg-muted rounded-2xl p-8 border">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Weekly Matching</p>
                          <p className="text-sm text-muted-foreground">Every Thursday at 4:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Group Chats</p>
                          <p className="text-sm text-muted-foreground">Connect with 3-4 like-minded doctors</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Meaningful Connections</p>
                          <p className="text-sm text-muted-foreground">Build genuine friendships</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="w-[80%] max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                Why BeyondRounds?
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                A Platform Designed for Medical Professionals
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-lg">
                We understand the unique challenges doctors face in building social connections. BeyondRounds helps you find 
                your tribe – people who get both your profession and your personality.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-3">
              <div className="flex flex-col gap-4 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Verified Medical Professionals</h3>
                <p className="text-muted-foreground">
                  Every member is a verified medical professional. Connect with confidence knowing you&apos;re building relationships 
                  with fellow doctors who understand your world.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Matching</h3>
                <p className="text-muted-foreground">
                  Our algorithm considers location, interests, lifestyle, and preferences to create meaningful connections. 
                  Groups are formed weekly with 3-4 compatible members.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Safe & Private</h3>
                <p className="text-muted-foreground">
                  Your privacy is our priority. All interactions are secure, and we maintain strict community guidelines 
                  to ensure a respectful environment for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="w-[80%] max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-lg">
                Getting started is easy. Join thousands of doctors who&apos;ve already found their tribe.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Complete Your Profile</h3>
                <p className="text-muted-foreground">
                  Share your interests, preferences, and what you&apos;re looking for in friendships. The more you share, 
                  the better our matches.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Get Matched</h3>
                <p className="text-muted-foreground">
                  Every Thursday at 4:00 PM, we match compatible doctors into small groups. You&apos;ll be notified when 
                  your group is ready.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Connect & Meet</h3>
                <p className="text-muted-foreground">
                  Start chatting with your group, plan activities, and build genuine friendships. Your next great connection 
                  is just one match away.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="w-[80%] max-w-7xl mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                Ready to Find Your Tribe?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Join thousands of doctors who&apos;ve already found meaningful friendships through BeyondRounds. 
                Your next great connection is just one match away.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full text-lg">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                30-day friendship guarantee for new members
              </p>
            </div>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
