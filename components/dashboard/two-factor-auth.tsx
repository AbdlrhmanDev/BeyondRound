'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Image from 'next/image';

export function TwoFactorAuth() {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    async function checkTfaStatus() {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) {
        console.error('Error getting authenticator assurance level:', error);
        return;
      }
      if (data?.currentLevel === 'aal2') {
        setIsEnrolled(true);
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
          console.error('Error listing factors:', factorsError);
          return;
        }
        const totpFactor = factorsData?.totp?.[0];
        if (totpFactor) {
          setFactorId(totpFactor.id);
        }
      }
    }

    checkTfaStatus();
  }, []);

  const handleSetup = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setFactorId(data!.id);
    setQrCode(data!.totp.qr_code);
  };

  const handleVerify = async () => {
    const supabase = await createClient();
    if (!factorId) {
      toast.error('Please set up MFA first.');
      return;
    }
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      toast.error(challenge.error.message);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data!.id,
      code: verificationCode,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Two-factor authentication enabled!');
      setIsEnrolled(true);
      setIsOpen(false);
    }
  };

  const handleUnenroll = async () => {
    const supabase = await createClient();
    if (!factorId) {
      toast.error('No MFA factor found to unenroll.');
      return;
    }
    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Two-factor authentication disabled!');
      setIsEnrolled(false);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => !isEnrolled && handleSetup()}>
          {isEnrolled ? 'Manage' : 'Setup'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEnrolled
              ? 'Manage Two-Factor Authentication'
              : 'Setup Two-Factor Authentication'}
          </DialogTitle>
          <DialogDescription>
            {isEnrolled
              ? 'You can disable two-factor authentication here.'
              : 'Scan the QR code with your authenticator app.'}
          </DialogDescription>
        </DialogHeader>
        {isEnrolled ? (
          <div className="space-y-4">
            <p>Two-factor authentication is currently enabled.</p>
            <Button variant="destructive" onClick={handleUnenroll}>
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {qrCode && (
              <div className="flex flex-col items-center">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={200}
                  height={200}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Secret: {secret}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          {!isEnrolled && (
            <Button onClick={handleVerify}>Verify and Enable</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
