'use client';

import { useEffect } from 'react';
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

  // ✅ Watch specific form values to prevent infinite loops
  const sports = form.watch('sports');
  const activityLevel = form.watch('activityLevel');
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid) {
      const formValues = {
        sports: sports || [],
        activityLevel: activityLevel || 'Moderately active (1-2 times/week)'
      };
      onUpdate(formValues);
    }
  }, [sports, activityLevel, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  // ✅ Improved sport change handler with validation
  const handleSportChange = (sport: string, interest: number) => {
    const currentSports = form.getValues('sports') || [];
    const existingIndex = currentSports.findIndex(s => s.sport === sport);
    
    if (existingIndex >= 0) {
      // Update existing sport interest
      const updatedSports = [...currentSports];
      updatedSports[existingIndex] = { sport, interest };
      form.setValue('sports', updatedSports, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // Add new sport
      form.setValue('sports', [...currentSports, { sport, interest }], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // ✅ Improved remove sport handler with validation
  const removeSport = (sport: string) => {
    const currentSports = form.getValues('sports') || [];
    form.setValue('sports', currentSports.filter(s => s.sport !== sport), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const getSportInterest = (sport: string) => {
    const currentSports = form.getValues('sports') || [];
    const existingSport = currentSports.find(s => s.sport === sport);
    return existingSport?.interest || 0;
  };

  // ✅ Get selected sports count
  const selectedSportsCount = form.watch('sports')?.length || 0;

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
                  <FormLabel>
                    Sports You Enjoy (optional)
                    <span className="text-xs text-muted-foreground ml-2">
                      Click to select, then rate your interest 1-5
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto p-1">
                      {SPORTS_OPTIONS.map((sport) => {
                        const interest = getSportInterest(sport);
                        return (
                          <div
                            key={sport}
                            className={`group relative border rounded-lg transition-all duration-200 ${
                              interest > 0
                                ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50 bg-card'
                            }`}
                          >
                            <div className="flex items-center justify-between p-3">
                              <Label
                                className="flex items-center flex-1 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (interest === 0) {
                                    handleSportChange(sport, 3);
                                  }
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={interest > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleSportChange(sport, 3);
                                    } else {
                                      removeSport(sport);
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <span className={`text-sm font-medium ${interest > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {sport}
                                </span>
                              </Label>
                              
                              {interest > 0 && (
                                <div className="flex items-center gap-1 ml-3">
                                  <span className="text-xs text-muted-foreground mr-1">Interest:</span>
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <button
                                        key={rating}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSportChange(sport, rating);
                                        }}
                                        className={`w-7 h-7 rounded-md text-xs font-semibold transition-all duration-200 hover:scale-110 ${
                                          rating <= interest
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                        title={`Rate ${rating} out of 5`}
                                      >
                                        {rating}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {interest === 0 && (
                              <div className="absolute inset-0 flex items-center justify-end pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-muted-foreground">Click to add</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  {selectedSportsCount > 0 && (
                    <p className="text-xs text-primary mt-2">
                      Selected: {selectedSportsCount} {selectedSportsCount === 1 ? 'sport' : 'sports'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Activity Level <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
                            field.value === option.value
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 bg-card'
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">
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