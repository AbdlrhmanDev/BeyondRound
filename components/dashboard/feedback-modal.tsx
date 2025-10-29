'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeedbackModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ groupId, isOpen, onClose }: FeedbackModalProps) {
  const supabase = createClient();
  const [rating, setRating] = useState<number>(0);
  const [wouldMeetAgain, setWouldMeetAgain] = useState<string>('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit feedback');
      }

      // حفظ التغذية الراجعة في جدول match_feedback
      const { error: feedbackError } = await supabase
        .from('match_feedback')
        .insert({
          user_id: user.id,
          group_id: groupId,
          rating: rating,
          would_meet_again: wouldMeetAgain === 'yes',
          comments: comments.trim() || null,
        });

      if (feedbackError) throw feedbackError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // إعادة تعيين الحقول
        setRating(0);
        setWouldMeetAgain('');
        setComments('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Group Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your experience with this group
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Thank you for your feedback! 🎉
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="space-y-3">
              <Label>How would you rate this group experience? *</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Would Meet Again */}
            <div className="space-y-3">
              <Label>Would you like to meet with this group again? *</Label>
              <RadioGroup value={wouldMeetAgain} onValueChange={setWouldMeetAgain}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="font-normal cursor-pointer">
                    Yes, I&apos;d love to meet again
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="font-normal cursor-pointer">
                    No, I prefer to try a different group
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="maybe" />
                  <Label htmlFor="maybe" className="font-normal cursor-pointer">
                    Maybe, I&apos;m not sure yet
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <Label htmlFor="comments">Additional Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your thoughts, suggestions, or any feedback about this group..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comments.length}/500
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || rating === 0 || !wouldMeetAgain}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

