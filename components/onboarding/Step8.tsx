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

type FormData = z.infer<typeof onboardingStep8Schema>;

interface OnboardingStep8Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
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

export function OnboardingStep8({ data, onNext, onPrevious, onUpdate }: OnboardingStep8Props) {
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
    onNext(formData);
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