'use client';

import { useEffect, useRef } from 'react';
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

  // ✅ Watch specific form values to prevent infinite loops
  const musicPreferences = form.watch('musicPreferences');
  const moviePreferences = form.watch('moviePreferences');
  const otherInterests = form.watch('otherInterests');
  const formState = form.formState;
  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    // Only update if form is valid and values have actually changed
    if (formState.isValid) {
      const formValues = {
        musicPreferences: musicPreferences || [],
        moviePreferences: moviePreferences || [],
        otherInterests: otherInterests || [],
      };
      
      // Create a string representation to compare
      const valuesKey = JSON.stringify(formValues);
      
      // Only call onUpdate if values have changed
      if (valuesKey !== prevValuesRef.current) {
        prevValuesRef.current = valuesKey;
        onUpdate(formValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicPreferences, moviePreferences, otherInterests, formState.isValid]);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="musicPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Music Preferences (optional)
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                      {MUSIC_PREFERENCES.map((preference) => (
                        <Label
                          key={preference}
                          className={`group flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
                            field.value?.includes(preference)
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 bg-card'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(preference) || false}
                            onChange={(e) => handleMultiSelectChange('musicPreferences', preference, e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium text-center ${field.value?.includes(preference) ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {preference}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {musicCount > 0 && (
                    <p className="text-xs text-primary mt-2">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                      {MOVIE_PREFERENCES.map((preference) => (
                        <Label
                          key={preference}
                          className={`group flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
                            field.value?.includes(preference)
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 bg-card'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(preference) || false}
                            onChange={(e) => handleMultiSelectChange('moviePreferences', preference, e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium text-center ${field.value?.includes(preference) ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {preference}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {movieCount > 0 && (
                    <p className="text-xs text-primary mt-2">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                      {OTHER_INTERESTS.map((interest) => (
                        <Label
                          key={interest}
                          className={`group flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
                            field.value?.includes(interest)
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 bg-card'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(interest) || false}
                            onChange={(e) => handleMultiSelectChange('otherInterests', interest, e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium text-center ${field.value?.includes(interest) ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {interest}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {interestsCount > 0 && (
                    <p className="text-xs text-primary mt-2">
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
                className="px-8"
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