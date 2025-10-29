import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export const signupSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Onboarding schemas
export const onboardingStep1Schema = z.object({
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
  genderPreference: z.enum(['No preference', 'Mixed groups preferred', 'Same gender only', 'Same gender preferred but mixed okay']),
  city: z.string().min(1, { message: 'City is required' }),
  nationality: z.string().optional(),
});

export const onboardingStep2Schema = z.object({
  medicalSpecialties: z.array(z.string()).min(1, { message: 'Please select at least one specialty' }),
  specialtyPreference: z.enum(['Same specialty preferred', 'Different specialty preferred', 'No preference']),
  careerStage: z.enum(['Medical Student', 'Resident (1st-2nd year)', 'Resident (3rd+ year)', 'Fellow', 'Attending/Consultant (0-5 years)', 'Attending/Consultant (5+ years)', 'Private Practice', 'Academic Medicine', 'Other']),
});

export const onboardingStep3Schema = z.object({
  sports: z.array(z.object({
    sport: z.string(),
    interest: z.number().min(1).max(5)
  })).optional(),
  activityLevel: z.enum(['Very active (5+ times/week)', 'Active (3-4 times/week)', 'Moderately active (1-2 times/week)', 'Occasionally active', 'Prefer non-physical activities']),
});

export const onboardingStep4Schema = z.object({
  musicPreferences: z.array(z.string()).optional(),
  moviePreferences: z.array(z.string()).optional(),
  otherInterests: z.array(z.string()).optional(),
});

export const onboardingStep5Schema = z.object({
  meetingActivities: z.array(z.string()).min(1, { message: 'Please select at least one preferred meeting activity' }),
  socialEnergyLevel: z.enum(['High energy, love big groups', 'Moderate energy, prefer small groups', 'Low key, intimate settings preferred', 'Varies by mood']),
  conversationStyle: z.enum(['Deep, meaningful conversations', 'Light, fun, casual chat', 'Hobby-focused discussions', 'Professional/career topics', 'Mix of everything']),
});

export const onboardingStep6Schema = z.object({
  meetingTimes: z.array(z.string()).min(1, { message: 'Please select at least one preferred meeting time' }),
  meetingFrequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly', 'As schedules allow']),
});

export const onboardingStep7Schema = z.object({
  dietaryPreferences: z.enum(['No restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Other allergies/restrictions']),
  lifeStage: z.enum(['Single, no kids', 'In a relationship, no kids', 'Married, no kids', 'Have young children', 'Have older children', 'Empty nester', 'Prefer not to say']),
  lookingFor: z.array(z.string()).min(1, { message: 'Please select what you are looking for' }),
});

export const onboardingStep8Schema = z.object({
  idealWeekend: z.enum(['Adventure and exploration', 'Relaxation and self-care', 'Social activities with friends', 'Cultural activities (museums, shows)', 'Sports and fitness', 'Home projects and hobbies', 'Mix of active and relaxing']),
});

export const onboardingSchema = z.object({
  step1: onboardingStep1Schema,
  step2: onboardingStep2Schema,
  step3: onboardingStep3Schema,
  step4: onboardingStep4Schema,
  step5: onboardingStep5Schema,
  step6: onboardingStep6Schema,
  step7: onboardingStep7Schema,
  step8: onboardingStep8Schema,
});
