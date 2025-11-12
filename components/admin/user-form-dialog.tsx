'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/utils/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_onboarding_complete: boolean | null;
  is_matchable: boolean | null;
}

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onSuccess: () => void;
}

export function UserFormDialog({ isOpen, onClose, user, onSuccess }: UserFormDialogProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    is_onboarding_complete: false,
    is_matchable: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        avatar_url: user.avatar_url || '',
        is_onboarding_complete: user.is_onboarding_complete || false,
        is_matchable: user.is_matchable || false,
      });
    } else {
      setFormData({
        full_name: '',
        avatar_url: '',
        is_onboarding_complete: false,
        is_matchable: false,
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name || null,
            avatar_url: formData.avatar_url || null,
            is_onboarding_complete: formData.is_onboarding_complete,
            is_matchable: formData.is_matchable,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new profile (requires user_id - typically from auth.users)
        // For admin-created users, you should create auth user first via admin API
        // This creates a profile entry that can be linked to an auth user later
        setError('To create a new user profile, you need a user ID from auth.users. Use the admin user creation script or create the auth user first.');
        setIsLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information' : 'Create a new user account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="onboarding">Onboarding Complete</Label>
              <p className="text-sm text-muted-foreground">
                User has completed the onboarding process
              </p>
            </div>
            <Switch
              id="onboarding"
              checked={formData.is_onboarding_complete}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_onboarding_complete: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="matchable">Matchable</Label>
              <p className="text-sm text-muted-foreground">
                User is ready for matching
              </p>
            </div>
            <Switch
              id="matchable"
              checked={formData.is_matchable}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_matchable: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

