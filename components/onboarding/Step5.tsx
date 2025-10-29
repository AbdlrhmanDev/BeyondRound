'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep5Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof onboardingStep5Schema>;

interface OnboardingStep5Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
}

const MEETING_ACTIVITIES = [
  'Coffee/Café meetups',
  'Dinner at restaurants',
  'Casual drinks/bar',
  'Outdoor activities/walks',
  'Sports activities',
  'Movie/theater outings',
  'Museums/cultural events',
  'House parties/home gatherings',
  'Concerts/live music',
  'Fitness activities together',
  'Weekend trips/day trips',
  'Game nights',
  'Other (specify)',
];

const SOCIAL_ENERGY_OPTIONS = [
  { value: 'High energy, love big groups', label: 'High energy, love big groups' },
  { value: 'Moderate energy, prefer small groups', label: 'Moderate energy, prefer small groups' },
  { value: 'Low key, intimate settings preferred', label: 'Low key, intimate settings preferred' },
  { value: 'Varies by mood', label: 'Varies by mood' },
];

const CONVERSATION_STYLE_OPTIONS = [
  { value: 'Deep, meaningful conversations', label: 'Deep, meaningful conversations' },
  { value: 'Light, fun, casual chat', label: 'Light, fun, casual chat' },
  { value: 'Hobby-focused discussions', label: 'Hobby-focused discussions' },
  { value: 'Professional/career topics', label: 'Professional/career topics' },
  { value: 'Mix of everything', label: 'Mix of everything' },
];

export function OnboardingStep5({ data, onNext, onPrevious, onUpdate }: OnboardingStep5Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep5Schema),
    defaultValues: data || {
      meetingActivities: [],
      socialEnergyLevel: 'Moderate energy, prefer small groups',
      conversationStyle: 'Mix of everything',
    },
  });

  // ✅ Watch specific form values to prevent infinite loops
  const meetingActivities = form.watch('meetingActivities');
  const socialEnergyLevel = form.watch('socialEnergyLevel');
  const conversationStyle = form.watch('conversationStyle');
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid) {
      const formValues = {
        meetingActivities: meetingActivities || [],
        socialEnergyLevel: socialEnergyLevel || 'Moderate energy, prefer small groups',
        conversationStyle: conversationStyle || 'Mix of everything'
      };
      onUpdate(formValues);
    }
  }, [meetingActivities, socialEnergyLevel, conversationStyle, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  // ✅ Improved activity change handler with validation
  const handleMeetingActivityChange = (activity: string, checked: boolean) => {
    const currentActivities = form.getValues('meetingActivities') || [];
    if (checked) {
      form.setValue('meetingActivities', [...currentActivities, activity], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      form.setValue('meetingActivities', currentActivities.filter(a => a !== activity), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // ✅ Get selected activities count
  const activitiesCount = form.watch('meetingActivities')?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Preferences</CardTitle>
        <CardDescription>
          Tell us about your social preferences and how you like to interact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="meetingActivities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Preferred Meeting Activities <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (Select at least one)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                      {MEETING_ACTIVITIES.map((activity) => (
                        <Label
                          key={activity}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value?.includes(activity)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(activity) || false}
                            onChange={(e) => handleMeetingActivityChange(activity, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {activity}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {activitiesCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Selected: {activitiesCount} {activitiesCount === 1 ? 'activity' : 'activities'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialEnergyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Social Energy Level <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {SOCIAL_ENERGY_OPTIONS.map((option) => (
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

            <FormField
              control={form.control}
              name="conversationStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Conversation Style <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {CONVERSATION_STYLE_OPTIONS.map((option) => (
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