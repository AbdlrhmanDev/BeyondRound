'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeSectionProps {
  userName?: string | null;
  userEmail?: string | null;
  avatarUrl?: string | null;
  loading?: boolean;
  // إمّا تستخدم روابط جاهزة...
  viewProfileHref?: string;
  completeSetupHref?: string;
  // ...أو callbacks لو تحب
  onViewProfile?: () => void;
  onCompleteSetup?: () => void;
}

export function WelcomeSection({
  userName,
  userEmail,
  avatarUrl,
  loading = false,
  viewProfileHref,
  completeSetupHref,
  onViewProfile,
  onCompleteSetup,
}: WelcomeSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  const displayName =
    (userName && userName.trim()) ||
    (userEmail && userEmail.includes('@') ? userEmail.split('@')[0] : '') ||
    'there';

  if (loading) {
    return (
      <Card className="border-none">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="h-7 w-60 rounded bg-muted animate-pulse" />
            <div className="h-4 w-80 rounded bg-muted animate-pulse" />
            <div className="mt-4 flex gap-2">
              <div className="h-9 w-28 rounded bg-muted animate-pulse" />
              <div className="h-9 w-36 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      aria-live="polite"
    >
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={`${displayName}'s avatar`}
                    className="w-16 h-16 rounded-full border-2 border-primary/20 object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Welcome back, {displayName}!
                </h2>
                <p className="text-muted-foreground mt-1">
                  Here&apos;s what&apos;s happening with your account today.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {viewProfileHref ? (
                <Button asChild variant="outline">
                  <Link href={viewProfileHref}>View Profile</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={onViewProfile}>
                  View Profile
                </Button>
              )}

              {completeSetupHref ? (
                <Button asChild>
                  <Link href={completeSetupHref}>Complete Setup</Link>
                </Button>
              ) : (
                <Button onClick={onCompleteSetup}>Complete Setup</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
