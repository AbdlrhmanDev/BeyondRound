import { z } from 'zod';
import { onboardingSchema } from '@/lib/utils/validation';

// Main onboarding data type
export type OnboardingData = z.infer<typeof onboardingSchema>;

// Individual step types
export type OnboardingStep1Data = {
  gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  genderPreference: 'No preference' | 'Mixed groups preferred' | 'Same gender only' | 'Same gender preferred but mixed okay';
  city: string;
  nationality?: string;
};

export type OnboardingStep2Data = {
  medicalSpecialties: string[];
  specialtyPreference: 'Same specialty preferred' | 'Different specialties preferred' | 'No preference';
  careerStage: 'Medical Student' | 'Resident (1st-2nd year)' | 'Resident (3rd+ year)' | 'Fellow' | 'Attending/Consultant (0-5 years)' | 'Attending/Consultant (5+ years)' | 'Private Practice' | 'Academic Medicine' | 'Other';
};

export type SportInterest = {
  sport: string;
  interest: number; // 1-5 rating
};

export type OnboardingStep3Data = {
  sports: SportInterest[];
  activityLevel: 'Very active (5+ times/week)' | 'Active (3-4 times/week)' | 'Moderately active (1-2 times/week)' | 'Occasionally active' | 'Prefer non-physical activities';
};

export type OnboardingStep4Data = {
  musicPreferences: string[];
  moviePreferences: string[];
  otherInterests: string[];
};

export type OnboardingStep5Data = {
  meetingActivities: string[];
  socialEnergyLevel: 'High energy, love big groups' | 'Moderate energy, prefer small groups' | 'Low key, intimate settings preferred' | 'Varies by mood';
  conversationStyle: 'Deep, meaningful conversations' | 'Light, fun, casual chat' | 'Hobby-focused discussions' | 'Professional/career topics' | 'Mix of everything';
};

export type OnboardingStep6Data = {
  meetingTimes: string[];
  meetingFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'As schedules allow';
};

export type OnboardingStep7Data = {
  dietaryPreferences: 'No restrictions' | 'Vegetarian' | 'Vegan' | 'Halal' | 'Kosher' | 'Gluten-free' | 'Other allergies/restrictions';
  lifeStage: 'Prefer not to say' | 'Single, no kids' | 'In a relationship, no kids' | 'Married, no kids' | 'Have young children' | 'Have older children' | 'Empty nester';
  lookingFor: string[];
};

export type OnboardingStep8Data = {
  idealWeekend: 'Adventure and exploration' | 'Relaxation and self-care' | 'Social activities with friends' | 'Cultural activities (museums, shows)' | 'Sports and fitness' | 'Home projects and hobbies' | 'Mix of active and relaxing';
};

// Component prop types
export interface OnboardingStep1Props {
  data?: OnboardingStep1Data;
  onNext: (data: OnboardingStep1Data) => void;
  onUpdate: (data: OnboardingStep1Data) => void;
}

export interface OnboardingStep2Props {
  data?: OnboardingStep2Data;
  onNext: (data: OnboardingStep2Data) => void;
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep2Data) => void;
}

export interface OnboardingStep3Props {
  data?: OnboardingStep3Data;
  onNext: (data: OnboardingStep3Data) => void;
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep3Data) => void;
}

export interface OnboardingStep4Props {
  data?: OnboardingStep4Data;
  onNext: (data: OnboardingStep4Data) => void;
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep4Data) => void;
}

export interface OnboardingStep5Props {
  data?: OnboardingStep5Data;
  onNext: (data: OnboardingStep5Data) => void;
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep5Data) => void;
}

export interface OnboardingStep6Props {
  data?: OnboardingStep6Data;
  onNext: (data: OnboardingStep6Data) => void;
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep6Data) => void;
}

export interface OnboardingStep7Props {
  data?: OnboardingStep7Data;
  onNext: (data: OnboardingStep7Data) => void;
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep7Data) => void;
}

// ✅ Updated Step8 Props
export interface OnboardingStep8Props {
  data?: OnboardingStep8Data;
  onComplete: (data: OnboardingStep8Data) => void; // ✅ Now accepts data
  onPrevious: () => void;
  onUpdate: (data: OnboardingStep8Data) => void;
  isLoading?: boolean; // ✅ Made optional
}

// API response types
export interface OnboardingApiResponse {
  success: boolean;
  error?: string;
}

export interface OnboardingGetResponse {
  data: OnboardingData;
  isOnboardingComplete: boolean;
}

// Form validation types
export type FormValidationError = {
  field: string;
  message: string;
};

export type OnboardingFormState = {
  currentStep: number;
  completedSteps: Set<number>;
  isLoading: boolean;
  error: string | null;
  data: Partial<OnboardingData>;
};

// Step navigation types
export type StepNavigation = {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep: boolean;
};

// ✅ Added localStorage draft type
export type OnboardingDraft = {
  data: Partial<OnboardingData>;
  currentStep: number;
  completedSteps: number[];
  timestamp: string;
};

// Database mapping types (for Supabase)
export type DatabaseGender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type DatabaseCareerStage = 'medical_student' | 'resident_1_2_year' | 'resident_3_year' | 'fellow' | 'attending_0_5_years' | 'attending_5_years' | 'private_practice' | 'academic_medicine' | 'other';
export type DatabaseActivityLevel = 'very_active' | 'active' | 'moderately_active' | 'occasionally_active' | 'prefer_non_physical';
export type DatabaseSocialEnergy = 'high_energy' | 'moderate_energy' | 'low_key' | 'varies_by_mood';
export type DatabaseConversationStyle = 'deep_meaningful' | 'light_fun' | 'hobby_focused' | 'professional_career' | 'mix_of_everything';
export type DatabaseMeetingFrequency = 'weekly' | 'bi_weekly' | 'monthly' | 'as_schedules_allow';
export type DatabaseDietaryPreferences = 'no_restrictions' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten_free' | 'other_allergies';
export type DatabaseLifeStage = 'prefer_not_to_say' | 'single_no_kids' | 'in_relationship_no_kids' | 'married_no_kids' | 'have_young_children' | 'have_older_children' | 'empty_nester';
export type DatabaseIdealWeekend = 'adventure_exploration' | 'relaxation_self_care' | 'social_activities' | 'cultural_activities' | 'sports_fitness' | 'home_projects' | 'mix_active_relaxing';

// Utility types for form handling
export type OnboardingStepData = 
  | OnboardingStep1Data 
  | OnboardingStep2Data 
  | OnboardingStep3Data 
  | OnboardingStep4Data 
  | OnboardingStep5Data 
  | OnboardingStep6Data 
  | OnboardingStep7Data 
  | OnboardingStep8Data;

export type OnboardingStepProps = 
  | OnboardingStep1Props 
  | OnboardingStep2Props 
  | OnboardingStep3Props 
  | OnboardingStep4Props 
  | OnboardingStep5Props 
  | OnboardingStep6Props 
  | OnboardingStep7Props 
  | OnboardingStep8Props;