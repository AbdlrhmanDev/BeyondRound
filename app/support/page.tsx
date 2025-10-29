import { ContentPageLayout, ContentSection, ContentDivider } from '@/components/layout/content-page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Clock, HelpCircle, Bug, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <ContentPageLayout title="Support">
      <div className="text-center mb-12">
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          We&apos;re here to help! Get in touch with our support team for assistance with your account, 
          technical issues, billing questions, or any other inquiries.
        </p>
      </div>

      {/* Quick Links - Glossy Black Style */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:shadow-2xl hover:shadow-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-lg text-white">FAQ</CardTitle>
            <CardDescription className="text-gray-400">Find quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/faq">
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">View FAQ</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:shadow-2xl hover:shadow-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-lg text-white">Billing</CardTitle>
            <CardDescription className="text-gray-400">Questions about pricing or subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pricing">
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">View Pricing</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:shadow-2xl hover:shadow-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-lg text-white">Privacy</CardTitle>
            <CardDescription className="text-gray-400">Learn about our privacy practices</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/privacy">
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">Privacy Policy</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:shadow-2xl hover:shadow-gray-900/50 hover:border-gray-700 transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-lg text-white">Contact</CardTitle>
            <CardDescription className="text-gray-400">Get in touch with our team</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="mailto:support@beyondrounds.com">
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">Email Us</Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <ContentDivider />

      {/* Contact Form */}
      <ContentSection title="Contact Us">
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <CardTitle className="text-white">Send us a Message</CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form below and we&apos;ll get back to you within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input id="name" placeholder="Your name" required className="bg-gray-900 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" required className="bg-gray-900 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                  <Input id="subject" placeholder="What can we help you with?" required className="bg-gray-900 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="account">Account Issues</option>
                    <option value="matching">Matching & Groups</option>
                    <option value="safety">Safety & Concerns</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    className="min-h-[150px] bg-gray-900 border-gray-700 text-white"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-900/50" size="lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      <ContentDivider />

      {/* Contact Information */}
      <ContentSection title="Contact Information">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Email Support</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                For all inquiries, questions, or support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@beyondrounds.com"
                className="text-blue-400 hover:underline font-medium text-lg"
              >
                support@beyondrounds.com
              </a>
              <p className="text-sm text-gray-400 mt-2">
                We typically respond within 24-48 hours
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Response Time</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Our support team availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-white">Standard Response: 24-48 hours</p>
                <p className="text-sm text-gray-300">
                  For urgent matters, please mark your email as urgent and we&apos;ll prioritize it.
                </p>
                <p className="text-sm text-gray-300 mt-4">
                  <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM CET
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      <ContentDivider />

      {/* Support Categories */}
      <ContentSection title="What Can We Help You With?">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <Bug className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Technical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Problems logging in, app errors, bugs, or other technical difficulties. 
                Please include screenshots when possible.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <CreditCard className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Billing & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Questions about subscriptions, payments, refunds, or cancellation. 
                See our <Link href="/cancellation" className="text-blue-400 hover:underline">Cancellation Policy</Link>.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <HelpCircle className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Account Help</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Account verification, profile updates, password reset, or account access issues.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Matching & Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Questions about the matching process, group management, or feedback on your matches.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Safety Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Report inappropriate behavior, safety concerns, or code of conduct violations. 
                These are handled with high priority.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-black">
            <CardHeader>
              <Mail className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">General Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Questions about features, suggestions, partnerships, or any other general inquiries.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      <ContentDivider />

      {/* Before Contacting */}
      <ContentSection title="Before Contacting Us">
        <div className="border border-gray-800 bg-gradient-to-br from-gray-900/50 to-black/50 p-6 rounded-lg space-y-4">
          <p className="text-base leading-relaxed text-gray-300">
            To help us assist you more quickly, please consider the following:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
            <li>
              <strong>Check the FAQ:</strong> Many common questions are answered in our{' '}
              <Link href="/faq" className="text-blue-400 hover:underline">FAQ section</Link>
            </li>
            <li>
              <strong>Include details:</strong> When reporting technical issues, please include:
              <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                <li>Your device type (iPhone, Android, Desktop, etc.)</li>
                <li>Browser or app version</li>
                <li>Screenshots or error messages</li>
                <li>Steps to reproduce the issue</li>
              </ul>
            </li>
            <li>
              <strong>For billing questions:</strong> Include your account email and any relevant transaction IDs
            </li>
            <li>
              <strong>For urgent safety concerns:</strong> Mark your email as urgent or contact us immediately
            </li>
          </ul>
        </div>
      </ContentSection>

      <div className="mt-12 text-center">
        <p className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Still have questions?
        </p>
        <a href="mailto:support@beyondrounds.com">
          <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-900/50 font-bold">
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </a>
      </div>
    </ContentPageLayout>
  );
}

