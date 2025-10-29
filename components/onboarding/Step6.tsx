'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep6Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof onboardingStep6Schema>;

interface OnboardingStep6Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
}

const MEETING_TIMES = [
  'Friday evening',
  'Saturday morning',
  'Saturday afternoon',
  'Saturday evening',
  'Sunday morning',
  'Sunday afternoon',
  'Sunday evening',
  'Weekday evenings (if available)',
];

const MEETING_FREQUENCY_OPTIONS = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Bi-weekly', label: 'Bi-weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'As schedules allow', label: 'As schedules allow' },
];

export function OnboardingStep6({ data, onNext, onPrevious, onUpdate }: OnboardingStep6Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep6Schema),
    defaultValues: data || {
      meetingTimes: [],
      meetingFrequency: 'Monthly',
    },
  });

  // ✅ Watch specific form values to prevent infinite loops
  const meetingTimes = form.watch('meetingTimes');
  const meetingFrequency = form.watch('meetingFrequency');
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid) {
      const formValues = {
        meetingTimes: meetingTimes || [],
        meetingFrequency: meetingFrequency || 'Weekly'
      };
      onUpdate(formValues);
    }
  }, [meetingTimes, meetingFrequency, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  // ✅ Improved meeting time change handler with validation
  const handleMeetingTimeChange = (time: string, checked: boolean) => {
    const currentTimes = form.getValues('meetingTimes') || [];
    if (checked) {
      form.setValue('meetingTimes', [...currentTimes, time], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      form.setValue('meetingTimes', currentTimes.filter(t => t !== time), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // ✅ Get selected times count
  const timesCount = form.watch('meetingTimes')?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Availability & Logistics</CardTitle>
        <CardDescription>
          Tell us about your availability and meeting preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="meetingTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Preferred Meeting Times <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (Select at least one)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 p-1">
                      {MEETING_TIMES.map((time) => (
                        <Label
                          key={time}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value?.includes(time)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(time) || false}
                            onChange={(e) => handleMeetingTimeChange(time, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {time}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {timesCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Selected: {timesCount} {timesCount === 1 ? 'time slot' : 'time slots'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Meeting Frequency Preference <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {MEETING_FREQUENCY_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={field.onChange}
                            className="sr-only"
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

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onPrevious} 
                className="hover:scale-105 transition-transform duration-200"
              >
                Previous
              </Button>
              <Button 
                type="submit" 
                disabled={!formState.isValid}
                className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}