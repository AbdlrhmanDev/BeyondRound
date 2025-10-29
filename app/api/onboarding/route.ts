import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { onboardingSchema } from '@/lib/utils/validation';
import { OnboardingApiResponse, OnboardingGetResponse } from '@/types/onboarding';

interface UserInterest {
  category: string;
  interest: string;
}

interface UserActivity {
  sport: string;
  interest_level: number;
}

// ✅ Helper function to convert string to database format
function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ✅ Helper function to convert career stage to database format
function convertCareerStage(stage: string): string {
  const mapping: Record<string, string> = {
    'Medical Student': 'medical_student',
    'Resident (1st-2nd year)': 'resident_1-2',
    'Resident (3rd+ year)': 'resident_3+',
    'Fellow': 'fellow',
    'Attending/Consultant (0-5 years)': 'attending_0-5',
    'Attending/Consultant (5+ years)': 'attending_5+',
    'Private Practice': 'private_practice',
    'Academic Medicine': 'academic',
    'Other': 'other'
  };
  return mapping[stage] || 'medical_student';
}

// ✅ Helper function to convert specialty preference to database format
function convertSpecialtyPreference(preference: string): string {
  const mapping: Record<string, string> = {
    'Same specialty preferred': 'same',
    'Different specialty preferred': 'different',
    'No preference': 'no_preference'
  };
  return mapping[preference] || 'no_preference';
}

// ✅ Helper function to convert gender preference to database format
function convertGenderPreference(preference: string): string {
  const mapping: Record<string, string> = {
    'No preference': 'no_preference',
    'Mixed groups preferred': 'mixed_preferred',
    'Same gender only': 'same_only',
    'Same gender preferred but mixed okay': 'same_preferred_mixed_ok'
  };
  return mapping[preference] || 'no_preference';
}

// ✅ Helper function to convert social energy to database format
function convertSocialEnergy(energy: string): string {
  const mapping: Record<string, string> = {
    'High energy, love big groups': 'high_energy',
    'Moderate energy, prefer small groups': 'moderate_energy',
    'Low key, intimate settings preferred': 'low_key',
    'Varies by mood': 'varies'
  };
  return mapping[energy] || 'moderate_energy';
}

// ✅ Helper function to convert conversation style to database format
function convertConversationStyle(style: string): string {
  const mapping: Record<string, string> = {
    'Deep, meaningful conversations': 'deep_meaningful',
    'Light, fun, casual chat': 'light_fun',
    'Hobby-focused discussions': 'hobby_focused',
    'Professional/career topics': 'professional',
    'Mix of everything': 'mix'
  };
  return mapping[style] || 'mix';
}

// ✅ Helper function to convert activity level to database format
function convertActivityLevel(level: string): string {
  const mapping: Record<string, string> = {
    'Very active (daily exercise)': 'very_active',
    'Active (3-4 times/week)': 'active',
    'Moderately active (1-2 times/week)': 'moderately_active',
    'Occasionally active': 'occasionally_active',
    'Prefer non-physical activities': 'prefer_non_physical'
  };
  return mapping[level] || 'moderately_active';
}

// ✅ Helper function to convert meeting frequency to database format
function convertMeetingFrequency(frequency: string): string {
  const mapping: Record<string, string> = {
    'Weekly': 'weekly',
    'Bi-weekly': 'bi-weekly',
    'Monthly': 'monthly',
    'Flexible': 'flexible'
  };
  return mapping[frequency] || 'weekly';
}

// ✅ Helper function to convert life stage to database format
function convertLifeStage(stage: string): string {
  const mapping: Record<string, string> = {
    'Single, no kids': 'single_no_kids',
    'In a relationship, no kids': 'relationship_no_kids',
    'Married, no kids': 'married_no_kids',
    'Young children (0-12)': 'young_children',
    'Older children (13+)': 'older_children',
    'Empty nester': 'empty_nester',
    'Prefer not to say': 'prefer_not_to_say'
  };
  return mapping[stage] || 'single_no_kids';
}

// ✅ Helper function to convert database format to display format
function toDisplayFormat(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ✅ Reverse mapping functions for GET endpoint
function convertCareerStageFromDB(stage: string): string {
  const mapping: Record<string, string> = {
    'medical_student': 'Medical Student',
    'resident_1-2': 'Resident (1st-2nd year)',
    'resident_3+': 'Resident (3rd+ year)',
    'fellow': 'Fellow',
    'attending_0-5': 'Attending/Consultant (0-5 years)',
    'attending_5+': 'Attending/Consultant (5+ years)',
    'private_practice': 'Private Practice',
    'academic': 'Academic Medicine',
    'other': 'Other'
  };
  return mapping[stage] || 'Medical Student';
}

function convertSpecialtyPreferenceFromDB(preference: string): string {
  const mapping: Record<string, string> = {
    'same': 'Same specialty preferred',
    'different': 'Different specialty preferred',
    'no_preference': 'No preference'
  };
  return mapping[preference] || 'No preference';
}

function convertGenderPreferenceFromDB(preference: string): string {
  const mapping: Record<string, string> = {
    'no_preference': 'No preference',
    'mixed_preferred': 'Mixed groups preferred',
    'same_only': 'Same gender only',
    'same_preferred_mixed_ok': 'Same gender preferred but mixed okay'
  };
  return mapping[preference] || 'No preference';
}

function convertSocialEnergyFromDB(energy: string): string {
  const mapping: Record<string, string> = {
    'high_energy': 'High energy, love big groups',
    'moderate_energy': 'Moderate energy, prefer small groups',
    'low_key': 'Low key, intimate settings preferred',
    'varies': 'Varies by mood'
  };
  return mapping[energy] || 'Moderate energy, prefer small groups';
}

function convertConversationStyleFromDB(style: string): string {
  const mapping: Record<string, string> = {
    'deep_meaningful': 'Deep, meaningful conversations',
    'light_fun': 'Light, fun, casual chat',
    'hobby_focused': 'Hobby-focused discussions',
    'professional': 'Professional/career topics',
    'mix': 'Mix of everything'
  };
  return mapping[style] || 'Mix of everything';
}

function convertActivityLevelFromDB(level: string): string {
  const mapping: Record<string, string> = {
    'very_active': 'Very active (daily exercise)',
    'active': 'Active (3-4 times/week)',
    'moderately_active': 'Moderately active (1-2 times/week)',
    'occasionally_active': 'Occasionally active',
    'prefer_non_physical': 'Prefer non-physical activities'
  };
  return mapping[level] || 'Moderately active (1-2 times/week)';
}

function convertMeetingFrequencyFromDB(frequency: string): string {
  const mapping: Record<string, string> = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-weekly',
    'monthly': 'Monthly',
    'flexible': 'Flexible'
  };
  return mapping[frequency] || 'Weekly';
}

function convertLifeStageFromDB(stage: string): string {
  const mapping: Record<string, string> = {
    'single_no_kids': 'Single, no kids',
    'relationship_no_kids': 'In a relationship, no kids',
    'married_no_kids': 'Married, no kids',
    'young_children': 'Young children (0-12)',
    'older_children': 'Older children (13+)',
    'empty_nester': 'Empty nester',
    'prefer_not_to_say': 'Prefer not to say'
  };
  return mapping[stage] || 'Single, no kids';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    // ✅ Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_onboarding_complete: true,
        is_matchable: true, // ✅ المستخدم جاهز للمطابقة
        gender: toSnakeCase(validatedData.step1.gender),
        city: validatedData.step1.city,
        nationality: validatedData.step1.nationality || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
        return NextResponse.json({ 
          error: 'Failed to update profile',
          details: profileError.message
        }, { status: 500 });
    }

    // ✅ Save medical profile data
    const { error: medicalError } = await supabase
      .from('medical_profiles')
      .upsert({
        user_id: user.id,
        specialties: validatedData.step2.medicalSpecialties,
        career_stage: convertCareerStage(validatedData.step2.careerStage),
        specialty_preference: convertSpecialtyPreference(validatedData.step2.specialtyPreference),
        gender_preference: convertGenderPreference(validatedData.step1.genderPreference),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (medicalError) {
      return NextResponse.json({ error: 'Failed to save medical profile' }, { status: 500 });
    }

    // ✅ Save activity level
    const { error: activityLevelError } = await supabase
      .from('activity_levels')
      .upsert({
        user_id: user.id,
        level: convertActivityLevel(validatedData.step3.activityLevel),
      }, {
        onConflict: 'user_id'
      });

    if (activityLevelError) {
      return NextResponse.json({ error: 'Failed to save activity level' }, { status: 500 });
    }

    // ✅ Save sports activities
    // Delete existing sports activities first
    await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', user.id);

    const sportsData = (validatedData.step3.sports || []).map(sport => ({
      user_id: user.id,
      sport: sport.sport,
      interest_level: sport.interest,
    }));

    if (sportsData.length > 0) {
      const { error: sportsError } = await supabase
        .from('user_activities')
        .insert(sportsData);

      if (sportsError) {
        return NextResponse.json({ error: 'Failed to save sports activities' }, { status: 500 });
      }
    }

    // ✅ Save interests
    const interestsData = [];
    if (validatedData.step4.musicPreferences) {
      interestsData.push(...validatedData.step4.musicPreferences.map(interest => ({
        user_id: user.id,
        category: 'music',
        interest: interest,
      })));
    }
    if (validatedData.step4.moviePreferences) {
      interestsData.push(...validatedData.step4.moviePreferences.map(interest => ({
        user_id: user.id,
        category: 'movies_tv',
        interest: interest,
      })));
    }
    if (validatedData.step4.otherInterests) {
      interestsData.push(...validatedData.step4.otherInterests.map(interest => ({
        user_id: user.id,
        category: 'other',
        interest: interest,
      })));
    }

    // Delete existing interests first
    await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', user.id);

    if (interestsData.length > 0) {
      const { error: interestsError } = await supabase
        .from('user_interests')
        .insert(interestsData);

      if (interestsError) {
        return NextResponse.json({ error: 'Failed to save interests' }, { status: 500 });
      }
    }

    // ✅ Save social preferences
    const { error: socialError } = await supabase
      .from('social_preferences')
      .upsert({
        user_id: user.id,
        meeting_activities: validatedData.step5.meetingActivities,
        social_energy: convertSocialEnergy(validatedData.step5.socialEnergyLevel),
        conversation_style: convertConversationStyle(validatedData.step5.conversationStyle),
        ideal_weekend: validatedData.step8.idealWeekend,
        looking_for: validatedData.step7.lookingFor,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (socialError) {
      return NextResponse.json({ error: 'Failed to save social preferences' }, { status: 500 });
    }

    // ✅ Save availability
    const { error: availabilityError } = await supabase
      .from('availability')
      .upsert({
        user_id: user.id,
        preferred_times: validatedData.step6.meetingTimes,
        frequency: convertMeetingFrequency(validatedData.step6.meetingFrequency),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (availabilityError) {
      return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
    }

    // ✅ Save lifestyle
    const { error: lifestyleError } = await supabase
      .from('lifestyle')
      .upsert({
        user_id: user.id,
        dietary_restrictions: [validatedData.step7.dietaryPreferences],
        life_stage: convertLifeStage(validatedData.step7.lifeStage),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (lifestyleError) {
      return NextResponse.json({ error: 'Failed to save lifestyle' }, { status: 500 });
    }

    return NextResponse.json({ success: true } as OnboardingApiResponse);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing onboarding data from all related tables
    const [
      { data: profile },
      { data: medicalProfile },
      { data: activityLevel },
      { data: userActivities },
      { data: userInterests },
      { data: socialPreferences },
      { data: availability },
      { data: lifestyle }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('medical_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('activity_levels').select('*').eq('user_id', user.id).single(),
      supabase.from('user_activities').select('*').eq('user_id', user.id),
      supabase.from('user_interests').select('*').eq('user_id', user.id),
      supabase.from('social_preferences').select('*').eq('user_id', user.id).single(),
      supabase.from('availability').select('*').eq('user_id', user.id).single(),
      supabase.from('lifestyle').select('*').eq('user_id', user.id).single()
    ]);

    // ✅ Reconstruct the onboarding data structure with proper formatting
    const onboardingData = {
      step1: {
        gender: profile?.gender ? toDisplayFormat(profile.gender) : 'Prefer not to say',
        genderPreference: medicalProfile?.gender_preference ? convertGenderPreferenceFromDB(medicalProfile.gender_preference) : 'No preference',
        city: profile?.city || '',
        nationality: profile?.nationality || '',
      },
      step2: {
        medicalSpecialties: medicalProfile?.specialties || [],
        specialtyPreference: medicalProfile?.specialty_preference ? convertSpecialtyPreferenceFromDB(medicalProfile.specialty_preference) : 'No preference',
        careerStage: medicalProfile?.career_stage ? convertCareerStageFromDB(medicalProfile.career_stage) : 'Medical Student',
      },
      step3: {
        sports: userActivities?.map((activity: UserActivity) => ({
          sport: activity.sport,
          interest: activity.interest_level,
        })) || [],
        activityLevel: activityLevel?.level ? convertActivityLevelFromDB(activityLevel.level) : 'Moderately active (1-2 times/week)',
      },
      step4: {
        musicPreferences: userInterests?.filter((i: UserInterest) => i.category === 'music').map((i: UserInterest) => i.interest) || [],
        moviePreferences: userInterests?.filter((i: UserInterest) => i.category === 'movies_tv').map((i: UserInterest) => i.interest) || [],
        otherInterests: userInterests?.filter((i: UserInterest) => i.category === 'other').map((i: UserInterest) => i.interest) || [],
      },
      step5: {
        meetingActivities: socialPreferences?.meeting_activities || [],
        socialEnergyLevel: socialPreferences?.social_energy ? convertSocialEnergyFromDB(socialPreferences.social_energy) : 'Moderate energy, prefer small groups',
        conversationStyle: socialPreferences?.conversation_style ? convertConversationStyleFromDB(socialPreferences.conversation_style) : 'Mix of everything',
      },
      step6: {
        meetingTimes: availability?.preferred_times || [],
        meetingFrequency: availability?.frequency ? convertMeetingFrequencyFromDB(availability.frequency) : 'Monthly',
      },
      step7: {
        dietaryPreferences: lifestyle?.dietary_restrictions?.[0] || 'No restrictions',
        lifeStage: lifestyle?.life_stage ? convertLifeStageFromDB(lifestyle.life_stage) : 'Single, no kids',
        lookingFor: socialPreferences?.looking_for || [],
      },
      step8: {
        idealWeekend: socialPreferences?.ideal_weekend || 'Mix of active and relaxing',
      },
    };

    return NextResponse.json({ 
      data: onboardingData,
      isOnboardingComplete: profile?.is_onboarding_complete || false 
    } as OnboardingGetResponse);
  } catch (error) {
    console.error('Onboarding GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}