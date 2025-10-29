'use client';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep7Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof onboardingStep7Schema>;

interface OnboardingStep7Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
}

const DIETARY_PREFERENCES = [
  { value: 'No restrictions', label: 'No restrictions' },
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Halal', label: 'Halal' },
  { value: 'Kosher', label: 'Kosher' },
  { value: 'Gluten-free', label: 'Gluten-free' },
  { value: 'Other allergies/restrictions', label: 'Other allergies/restrictions' },
];

const LIFE_STAGE_OPTIONS = [
  { value: 'Single, no kids', label: 'Single, no kids' },
  { value: 'In a relationship, no kids', label: 'In a relationship, no kids' },
  { value: 'Married, no kids', label: 'Married, no kids' },
  { value: 'Have young children', label: 'Have young children' },
  { value: 'Have older children', label: 'Have older children' },
  { value: 'Empty nester', label: 'Empty nester' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const LOOKING_FOR_OPTIONS = [
  'Casual friendships (grab a coffee, hang out, chill)',
  'Close friendships (deeper, long-term connection)',
  'Activity partners (sports, gym, hobbies, events)',
  'A social group to belong to (regular circle of doctors)',
  'Professional peer connections (sharing knowledge, same specialty or hospital)',
  'Mentorship (giving or receiving guidance)',
  'Entrepreneurial connections (doctors building projects/businesses together)',
  'Networking & opportunities (expanding your doctor circle globally)',
  'Study / learning partners (for exams, courses, or medical education)',
  'Travel buddies (short trips, conferences, or holidays)',
];

export function OnboardingStep7({ data, onNext, onPrevious, onUpdate }: OnboardingStep7Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep7Schema),
    defaultValues: data || {
      dietaryPreferences: 'No restrictions',
      lifeStage: 'Single, no kids',
      lookingFor: [],
    },
  });

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  const handleLookingForChange = (option: string, checked: boolean) => {
    const currentOptions = form.getValues('lookingFor') || [];
    if (checked) {
      form.setValue('lookingFor', [...currentOptions, option]);
    } else {
      form.setValue('lookingFor', currentOptions.filter(o => o !== option));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lifestyle & Values</CardTitle>
        <CardDescription>
          Tell us about your lifestyle and what you&apos;re looking for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Preferences/Restrictions</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {DIETARY_PREFERENCES.map((option) => (
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

            <FormField
              control={form.control}
              name="lifeStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Life Stage</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {LIFE_STAGE_OPTIONS.map((option) => (
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

            <FormField
              control={form.control}
              name="lookingFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What you&apos;re looking for (select all that apply)</FormLabel>
                  <FormControl>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {LOOKING_FOR_OPTIONS.map((option) => (
                        <Label
                          key={option}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            field.value?.includes(option)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(option) || false}
                            onChange={(e) => handleLookingForChange(option, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{option}</span>
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
