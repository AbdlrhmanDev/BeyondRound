'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { onboardingStep1Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { OnboardingStep1Props } from '@/types/onboarding';

type FormData = z.infer<typeof onboardingStep1Schema>;

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const GENDER_PREFERENCE_OPTIONS = [
  { value: 'No preference', label: 'No preference' },
  { value: 'Mixed groups preferred', label: 'Mixed groups preferred' },
  { value: 'Same gender only', label: 'Same gender only' },
  { value: 'Same gender preferred but mixed okay', label: 'Same gender preferred but mixed okay' },
];

export function OnboardingStep1({ data, onNext, onUpdate }: OnboardingStep1Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: data || {
      gender: 'Prefer not to say',
      genderPreference: 'No preference',
      city: '',
      nationality: '',
    },
  });

  // ✅ Watch specific form values to prevent infinite loops
  const gender = form.watch('gender');
  const genderPreference = form.watch('genderPreference');
  const city = form.watch('city');
  const nationality = form.watch('nationality');
  const formState = form.formState;

  useEffect(() => {
    // Only update if form is valid and has changed
    if (formState.isValid) {
      const formValues = {
        gender: gender || 'Prefer not to say',
        genderPreference: genderPreference || 'No preference',
        city: city || '',
        nationality: nationality || ''
      };
      if (Object.keys(formValues).length > 0) {
        onUpdate(formValues);
      }
    }
  }, [gender, genderPreference, city, nationality, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Let&apos;s start with some basic information about yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      {GENDER_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value === option.value
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md'
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

            <FormField
              control={form.control}
              name="genderPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Preference for Groups</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {GENDER_PREFERENCE_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value === option.value
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md'
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

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City of Residence <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your city" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your nationality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
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