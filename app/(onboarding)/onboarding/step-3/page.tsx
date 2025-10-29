'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep3Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof onboardingStep3Schema>;

interface OnboardingStep3Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
}

const SPORTS_OPTIONS = [
  'Running/Jogging',
  'Cycling',
  'Swimming',
  'Gym/Weight Training',
  'Tennis',
  'Football/Soccer',
  'Basketball',
  'Volleyball',
  'Rock Climbing/Bouldering',
  'Hiking',
  'Yoga',
  'Pilates',
  'Martial Arts',
  'Golf',
  'Skiing/Snowboarding',
  'Dancing',
  'Team Sports (general)',
  'Water Sports',
  'Other (specify)',
];

const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'Very active (5+ times/week)', label: 'Very active (5+ times/week)' },
  { value: 'Active (3-4 times/week)', label: 'Active (3-4 times/week)' },
  { value: 'Moderately active (1-2 times/week)', label: 'Moderately active (1-2 times/week)' },
  { value: 'Occasionally active', label: 'Occasionally active' },
  { value: 'Prefer non-physical activities', label: 'Prefer non-physical activities' },
];

export function OnboardingStep3({ data, onNext, onPrevious, onUpdate }: OnboardingStep3Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep3Schema),
    defaultValues: data || {
      sports: [],
      activityLevel: 'Moderately active (1-2 times/week)',
    },
  });

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  const handleSportChange = (sport: string, interest: number) => {
    const currentSports = form.getValues('sports') || [];
    const existingIndex = currentSports.findIndex(s => s.sport === sport);
    
    if (existingIndex >= 0) {
      // Update existing sport interest
      const updatedSports = [...currentSports];
      updatedSports[existingIndex] = { sport, interest };
      form.setValue('sports', updatedSports);
    } else {
      // Add new sport
      form.setValue('sports', [...currentSports, { sport, interest }]);
    }
  };

  const removeSport = (sport: string) => {
    const currentSports = form.getValues('sports') || [];
    form.setValue('sports', currentSports.filter(s => s.sport !== sport));
  };

  const getSportInterest = (sport: string) => {
    const currentSports = form.getValues('sports') || [];
    const existingSport = currentSports.find(s => s.sport === sport);
    return existingSport?.interest || 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sports & Physical Activities</CardTitle>
        <CardDescription>
          Tell us about your sports interests and activity level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sports"
              render={() => (
                <FormItem>
                  <FormLabel>Sports You Enjoy (multi-select, rate interest 1-5)</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {SPORTS_OPTIONS.map((sport) => {
                        const interest = getSportInterest(sport);
                        return (
                          <div key={sport} className="space-y-2">
                            <Label className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                              interest > 0
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            }`}>
                              <input
                                type="checkbox"
                                checked={interest > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleSportChange(sport, 3); // Default to 3
                                  } else {
                                    removeSport(sport);
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sport}</span>
                            </Label>
                            {interest > 0 && (
                              <div className="flex items-center space-x-2 px-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Interest:</span>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                      key={rating}
                                      type="button"
                                      onClick={() => handleSportChange(sport, rating)}
                                      className={`w-6 h-6 rounded-full text-xs transition-all duration-200 hover:scale-110 ${
                                        rating <= interest
                                          ? 'bg-blue-500 text-white shadow-md'
                                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                      }`}
                                    >
                                      {rating}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {ACTIVITY_LEVEL_OPTIONS.map((option) => (
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
                          <span className="text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious} className="hover:scale-105 transition-transform duration-200">
                Previous
              </Button>
              <Button type="submit" className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
