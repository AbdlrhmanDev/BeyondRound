'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep4Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof onboardingStep4Schema>;

interface OnboardingStep4Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
}

const MUSIC_PREFERENCES = [
  'Pop',
  'Rock',
  'Hip-Hop/Rap',
  'Electronic/EDM',
  'Classical',
  'Jazz',
  'Country',
  'R&B/Soul',
  'Indie/Alternative',
  'Folk',
  'Reggae',
  'Latin',
  'World Music',
  'Metal',
  'Blues',
  'Other (specify)',
];

const MOVIE_PREFERENCES = [
  'Action/Adventure',
  'Comedy',
  'Drama',
  'Horror/Thriller',
  'Sci-Fi/Fantasy',
  'Documentaries',
  'Romance',
  'Crime/Mystery',
  'Historical',
  'Animated',
  'Foreign Films',
  'TV Series Binge-watcher',
  'Netflix originals',
  'Other (specify)',
];

const OTHER_INTERESTS = [
  'Reading',
  'Cooking/Baking',
  'Photography',
  'Travel',
  'Art/Museums',
  'Board Games',
  'Video Games',
  'Podcasts',
  'Wine/Beer Tasting',
  'Coffee Culture',
  'Gardening',
  'DIY/Crafts',
  'Volunteering',
  'Technology/Gadgets',
  'Fashion',
  'Other (specify)',
];

export function OnboardingStep4({ data, onNext, onPrevious, onUpdate }: OnboardingStep4Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep4Schema),
    defaultValues: data || {
      musicPreferences: [],
      moviePreferences: [],
      otherInterests: [],
    },
  });

  // ✅ Watch form values for real-time updates
  const formValues = form.watch();
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid && formValues) {
      onUpdate(formValues);
    }
  }, [formValues, formState.isValid, onUpdate]);

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  // ✅ Improved multi-select handler with validation
  const handleMultiSelectChange = (fieldName: keyof FormData, value: string, checked: boolean) => {
    const currentValues = form.getValues(fieldName) || [];
    if (checked) {
      form.setValue(fieldName, [...currentValues, value], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      form.setValue(fieldName, currentValues.filter(v => v !== value), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // ✅ Get counts for each category
  const musicCount = form.watch('musicPreferences')?.length || 0;
  const movieCount = form.watch('moviePreferences')?.length || 0;
  const interestsCount = form.watch('otherInterests')?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entertainment & Culture</CardTitle>
        <CardDescription>
          Tell us about your entertainment preferences and interests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="musicPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Music Preferences (optional)
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-3 max-h-40 overflow-y-auto p-1">
                      {MUSIC_PREFERENCES.map((preference) => (
                        <Label
                          key={preference}
                          className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value?.includes(preference)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(preference) || false}
                            onChange={(e) => handleMultiSelectChange('musicPreferences', preference, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {preference}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {musicCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Selected: {musicCount} {musicCount === 1 ? 'genre' : 'genres'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moviePreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Movies & TV Shows (optional)
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-3 max-h-40 overflow-y-auto p-1">
                      {MOVIE_PREFERENCES.map((preference) => (
                        <Label
                          key={preference}
                          className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value?.includes(preference)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(preference) || false}
                            onChange={(e) => handleMultiSelectChange('moviePreferences', preference, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {preference}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {movieCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Selected: {movieCount} {movieCount === 1 ? 'preference' : 'preferences'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otherInterests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Other Interests (optional)
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-3 max-h-40 overflow-y-auto p-1">
                      {OTHER_INTERESTS.map((interest) => (
                        <Label
                          key={interest}
                          className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value?.includes(interest)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(interest) || false}
                            onChange={(e) => handleMultiSelectChange('otherInterests', interest, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {interest}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {interestsCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Selected: {interestsCount} {interestsCount === 1 ? 'interest' : 'interests'}
                    </p>
                  )}
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