'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep8Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';

type FormData = z.infer<typeof onboardingStep8Schema>;

interface OnboardingStep8Props {
  data?: FormData;
  onComplete: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
  isLoading?: boolean;
}

const IDEAL_WEEKEND_OPTIONS = [
  { value: 'Adventure and exploration', label: 'Adventure and exploration' },
  { value: 'Relaxation and self-care', label: 'Relaxation and self-care' },
  { value: 'Social activities with friends', label: 'Social activities with friends' },
  { value: 'Cultural activities (museums, shows)', label: 'Cultural activities (museums, shows)' },
  { value: 'Sports and fitness', label: 'Sports and fitness' },
  { value: 'Home projects and hobbies', label: 'Home projects and hobbies' },
  { value: 'Mix of active and relaxing', label: 'Mix of active and relaxing' },
];

export function OnboardingStep8({ data, onComplete, onPrevious, onUpdate, isLoading }: OnboardingStep8Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep8Schema),
    defaultValues: data || {
      idealWeekend: 'Mix of active and relaxing',
    },
  });

  // ✅ Watch specific form values to prevent infinite loops
  const idealWeekend = form.watch('idealWeekend');
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid) {
      const formValues = {
        idealWeekend: idealWeekend || 'Mix of active and relaxing'
      };
      onUpdate(formValues);
    }
  }, [idealWeekend, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onComplete(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personality & Fun</CardTitle>
        <CardDescription>
          Almost done! Describe your ideal weekend to help us understand your personality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="idealWeekend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Describe your ideal weekend <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {IDEAL_WEEKEND_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value === option.value
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={field.onChange}
                            className="sr-only"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {option.label}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Completion message */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                    You&apos;re almost there!
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Once you complete this step, we&apos;ll create your profile and start finding perfect matches for you.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onPrevious}
                disabled={isLoading}
                className="hover:scale-105 transition-transform duration-200"
              >
                Previous
              </Button>
              <Button 
                type="submit" 
                disabled={!formState.isValid || isLoading}
                className="px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}