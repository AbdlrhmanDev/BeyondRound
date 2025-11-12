'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep2Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormData = z.infer<typeof onboardingStep2Schema>;

interface OnboardingStep2Props {
  data?: FormData;
  onNext: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
}

const MEDICAL_SPECIALTIES = [
  'General Practice/Family Medicine',
  'Internal Medicine',
  'Surgery (General)',
  'Pediatrics',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Emergency Medicine',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Dermatology',
  'Ophthalmology',
  'Orthopedics',
  'Gynecology',
  'Urology',
  'Oncology',
  'Medical Student',
  'Resident',
  'Fellow',
  'Other (specify)',
];

const SPECIALTY_PREFERENCE_OPTIONS = [
  { value: 'Same specialty preferred', label: 'Same specialty preferred' },
  { value: 'Different specialties preferred', label: 'Different specialties preferred' },
  { value: 'No preference', label: 'No preference' },
];

const CAREER_STAGE_OPTIONS = [
  { value: 'Medical Student', label: 'Medical Student' },
  { value: 'Resident (1st-2nd year)', label: 'Resident (1st-2nd year)' },
  { value: 'Resident (3rd+ year)', label: 'Resident (3rd+ year)' },
  { value: 'Fellow', label: 'Fellow' },
  { value: 'Attending/Consultant (0-5 years)', label: 'Attending/Consultant (0-5 years)' },
  { value: 'Attending/Consultant (5+ years)', label: 'Attending/Consultant (5+ years)' },
  { value: 'Private Practice', label: 'Private Practice' },
  { value: 'Academic Medicine', label: 'Academic Medicine' },
  { value: 'Other', label: 'Other' },
];

export function OnboardingStep2({ data, onNext, onPrevious, onUpdate }: OnboardingStep2Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep2Schema),
    defaultValues: data || {
      medicalSpecialties: [],
      specialtyPreference: 'No preference',
      careerStage: 'Medical Student',
    },
  });

  // ✅ Watch specific form values to prevent infinite loops
  const medicalSpecialties = form.watch('medicalSpecialties');
  const specialtyPreference = form.watch('specialtyPreference');
  const careerStage = form.watch('careerStage');
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid) {
      const formValues = {
        medicalSpecialties: medicalSpecialties || [],
        specialtyPreference: specialtyPreference || 'No preference',
        careerStage: careerStage || 'Medical Student'
      };
      onUpdate(formValues);
    }
  }, [medicalSpecialties, specialtyPreference, careerStage, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext(formData);
  };

  // ✅ Improved specialty change handler with validation trigger
  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    const currentSpecialties = form.getValues('medicalSpecialties');
    if (checked) {
      form.setValue('medicalSpecialties', [...currentSpecialties, specialty], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      form.setValue('medicalSpecialties', currentSpecialties.filter(s => s !== specialty), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Medical Background</CardTitle>
        <CardDescription>
          Tell us about your medical specialty and career stage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="medicalSpecialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Medical Specialty/Position <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Select at least one)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                      {MEDICAL_SPECIALTIES.map((specialty) => (
                        <Label
                          key={specialty}
                          className={`group flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm text-center ${
                            field.value?.includes(specialty)
                              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50 bg-card'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(specialty) || false}
                            onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium text-center ${
                            field.value?.includes(specialty) 
                              ? 'text-foreground' 
                              : 'text-muted-foreground'
                          }`}>
                            {specialty}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </FormControl>
                  {field.value && field.value.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      Selected: {field.value.length} {field.value.length === 1 ? 'specialty' : 'specialties'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialtyPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty Preference for Groups</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {SPECIALTY_PREFERENCE_OPTIONS.map((option) => (
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
                          <span className={`text-sm font-medium ${
                            field.value === option.value 
                              ? 'text-foreground' 
                              : 'text-muted-foreground'
                          }`}>
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
              name="careerStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Career Stage <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {CAREER_STAGE_OPTIONS.map((option) => (
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
                          <span className={`text-sm font-medium ${
                            field.value === option.value 
                              ? 'text-foreground' 
                              : 'text-muted-foreground'
                          }`}>
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