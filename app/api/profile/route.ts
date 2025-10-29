import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// ✅ Flexible profile update schema (allows partial updates)
const profileUpdateSchema = z.object({
  step1: z.object({
    gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']).optional(),
    genderPreference: z.enum(['No preference', 'Mixed groups preferred', 'Same gender only', 'Same gender preferred but mixed okay']).optional(),
    city: z.string().optional(),
    nationality: z.string().optional(),
  }).optional(),
  step2: z.object({
    medicalSpecialties: z.array(z.string()).optional(),
    specialtyPreference: z.enum(['Same specialty preferred', 'Different specialties preferred', 'No preference']).optional(),
    careerStage: z.enum(['Medical Student', 'Resident (1st-2nd year)', 'Resident (3rd+ year)', 'Fellow', 'Attending/Consultant (0-5 years)', 'Attending/Consultant (5+ years)', 'Private Practice', 'Academic Medicine', 'Other']).optional(),
  }).optional(),
  step3: z.object({
    sports: z.array(z.object({
      sport: z.string(),
      interest: z.number().min(1).max(5)
    })).optional(),
    activityLevel: z.enum(['Very active (5+ times/week)', 'Active (3-4 times/week)', 'Moderately active (1-2 times/week)', 'Occasionally active', 'Prefer non-physical activities']).optional(),
  }).optional(),
  step4: z.object({
    musicPreferences: z.array(z.string()).optional(),
    moviePreferences: z.array(z.string()).optional(),
    otherInterests: z.array(z.string()).optional(),
  }).optional(),
  step5: z.object({
    meetingActivities: z.array(z.string()).optional(),
    socialEnergyLevel: z.enum(['High energy, love big groups', 'Moderate energy, prefer small groups', 'Low key, intimate settings preferred', 'Varies by mood']).optional(),
    conversationStyle: z.enum(['Deep, meaningful conversations', 'Light, fun, casual chat', 'Hobby-focused discussions', 'Professional/career topics', 'Mix of everything']).optional(),
  }).optional(),
  step6: z.object({
    meetingTimes: z.array(z.string()).optional(),
    meetingFrequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly', 'As schedules allow']).optional(),
  }).optional(),
  step7: z.object({
    dietaryPreferences: z.enum(['No restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Other allergies/restrictions']).optional(),
    lifeStage: z.enum(['Single, no kids', 'In a relationship, no kids', 'Married, no kids', 'Have young children', 'Have older children', 'Empty nester', 'Prefer not to say']).optional(),
    lookingFor: z.array(z.string()).optional(),
  }).optional(),
  step8: z.object({
    idealWeekend: z.enum(['Adventure and exploration', 'Relaxation and self-care', 'Social activities with friends', 'Cultural activities (museums, shows)', 'Sports and fitness', 'Home projects and hobbies', 'Mix of active and relaxing']).optional(),
  }).optional(),
});

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
    'Different specialties preferred': 'different',
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

// ✅ Helper function to convert activity level to database format
function convertActivityLevel(level: string): string {
  const mapping: Record<string, string> = {
    'Very active (5+ times/week)': 'very_active',
    'Active (3-4 times/week)': 'active',
    'Moderately active (1-2 times/week)': 'moderately_active',
    'Occasionally active': 'occasionally_active',
    'Prefer non-physical activities': 'prefer_non_physical'
  };
  return mapping[level] || 'moderately_active';
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

// ✅ Helper function to convert meeting frequency to database format
function convertMeetingFrequency(frequency: string): string {
  const mapping: Record<string, string> = {
    'Weekly': 'weekly',
    'Bi-weekly': 'bi-weekly',
    'Monthly': 'monthly',
    'As schedules allow': 'flexible'
  };
  return mapping[frequency] || 'monthly';
}

// ✅ Helper function to convert life stage to database format
function convertLifeStage(stage: string): string {
  const mapping: Record<string, string> = {
    'Single, no kids': 'single_no_kids',
    'In a relationship, no kids': 'relationship_no_kids',
    'Married, no kids': 'married_no_kids',
    'Have young children': 'young_children',
    'Have older children': 'older_children',
    'Empty nester': 'empty_nester',
    'Prefer not to say': 'prefer_not_to_say'
  };
  return mapping[stage] || 'single_no_kids';
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
    'different': 'Different specialties preferred',
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

function convertActivityLevelFromDB(level: string): string {
  const mapping: Record<string, string> = {
    'very_active': 'Very active (5+ times/week)',
    'active': 'Active (3-4 times/week)',
    'moderately_active': 'Moderately active (1-2 times/week)',
    'occasionally_active': 'Occasionally active',
    'prefer_non_physical': 'Prefer non-physical activities'
  };
  return mapping[level] || 'Moderately active (1-2 times/week)';
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

function convertMeetingFrequencyFromDB(frequency: string): string {
  const mapping: Record<string, string> = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-weekly',
    'monthly': 'Monthly',
    'flexible': 'As schedules allow'
  };
  return mapping[frequency] || 'Monthly';
}

function convertLifeStageFromDB(stage: string): string {
  const mapping: Record<string, string> = {
    'single_no_kids': 'Single, no kids',
    'relationship_no_kids': 'In a relationship, no kids',
    'married_no_kids': 'Married, no kids',
    'young_children': 'Have young children',
    'older_children': 'Have older children',
    'empty_nester': 'Empty nester',
    'prefer_not_to_say': 'Prefer not to say'
  };
  return mapping[stage] || 'Single, no kids';
}

function convertGenderFromDB(gender: string): string {
  const mapping: Record<string, string> = {
    'male': 'Male',
    'female': 'Female',
    'non-binary': 'Non-binary',
    'prefer_not_to_say': 'Prefer not to say'
  };
  return mapping[gender] || 'Prefer not to say';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('POST Profile API - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id?.substring(0, 8), 
      authError: authError?.message 
    });
    
    if (authError || !user) {
      console.log('POST Profile API - Unauthorized:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Current user ID:', user.id);

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    console.log('Profile update data:', JSON.stringify(validatedData, null, 2));

    // ✅ Update profile if step1 data is provided
    if (validatedData.step1) {
      const profileUpdate: Record<string, string> = {
        updated_at: new Date().toISOString(),
      };

      if (validatedData.step1.gender) {
        profileUpdate.gender = toSnakeCase(validatedData.step1.gender);
      }
      if (validatedData.step1.city) {
        profileUpdate.city = validatedData.step1.city;
      }
      if (validatedData.step1.nationality) {
        profileUpdate.nationality = validatedData.step1.nationality;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return NextResponse.json({ 
          error: 'Failed to update profile',
          details: profileError.message
        }, { status: 500 });
      }
    }

    // ✅ Update medical profile if step2 data is provided
    if (validatedData.step2) {
      const medicalUpdate: Record<string, string | string[]> = {
        updated_at: new Date().toISOString(),
      };

      if (validatedData.step2.medicalSpecialties) {
        medicalUpdate.specialties = validatedData.step2.medicalSpecialties;
      }
      if (validatedData.step2.specialtyPreference) {
        medicalUpdate.specialty_preference = convertSpecialtyPreference(validatedData.step2.specialtyPreference);
      }
      if (validatedData.step2.careerStage) {
        medicalUpdate.career_stage = convertCareerStage(validatedData.step2.careerStage);
      }
      if (validatedData.step1?.genderPreference) {
        medicalUpdate.gender_preference = convertGenderPreference(validatedData.step1.genderPreference);
      }

      const { error: medicalError } = await supabase
        .from('medical_profiles')
        .upsert({
          user_id: user.id,
          ...medicalUpdate
        }, {
          onConflict: 'user_id'
        });

      if (medicalError) {
        console.error('Error updating medical profile:', medicalError);
        return NextResponse.json({ 
          error: 'Failed to update medical profile',
          details: medicalError.message
        }, { status: 500 });
      }
    }

    // ✅ Update activity level if step3 data is provided
    if (validatedData.step3?.activityLevel) {
      const convertedLevel = convertActivityLevel(validatedData.step3.activityLevel);
      console.log('Activity level conversion:', {
        original: validatedData.step3.activityLevel,
        converted: convertedLevel
      });
      
      // First try to delete existing record, then insert new one
      const { error: deleteError } = await supabase
        .from('activity_levels')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting existing activity level:', deleteError);
      }

      const { error: activityError } = await supabase
        .from('activity_levels')
        .insert({
          user_id: user.id,
          level: convertedLevel,
        });

      if (activityError) {
        console.error('Error updating activity level:', activityError);
        return NextResponse.json({ 
          error: 'Failed to update activity level',
          details: activityError.message
        }, { status: 500 });
      }
    }

    // ✅ Update user activities if step3 sports data is provided
    if (validatedData.step3?.sports) {
      // Delete existing activities
      await supabase
        .from('user_activities')
        .delete()
        .eq('user_id', user.id);

      // Insert new activities
      if (validatedData.step3.sports.length > 0) {
        const activities = validatedData.step3.sports.map(sport => ({
          user_id: user.id,
          sport: sport.sport,
          interest_level: sport.interest,
        }));

        const { error: activitiesError } = await supabase
          .from('user_activities')
          .insert(activities);

        if (activitiesError) {
          console.error('Error updating user activities:', activitiesError);
          return NextResponse.json({ 
            error: 'Failed to update user activities',
            details: activitiesError.message
          }, { status: 500 });
        }
      }
    }

    // ✅ Update user interests if step4 data is provided
    if (validatedData.step4) {
      // Delete existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      const interests: Array<{ user_id: string; category: string; interest: string }> = [];

      if (validatedData.step4.musicPreferences) {
        interests.push(...validatedData.step4.musicPreferences.map(interest => ({
          user_id: user.id,
          category: 'music',
          interest: interest,
        })));
      }

      if (validatedData.step4.moviePreferences) {
        interests.push(...validatedData.step4.moviePreferences.map(interest => ({
          user_id: user.id,
          category: 'movies_tv',
          interest: interest,
        })));
      }

      if (validatedData.step4.otherInterests) {
        interests.push(...validatedData.step4.otherInterests.map(interest => ({
          user_id: user.id,
          category: 'other',
          interest: interest,
        })));
      }

      if (interests.length > 0) {
        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interests);

        if (interestsError) {
          console.error('Error updating user interests:', interestsError);
          return NextResponse.json({ 
            error: 'Failed to update user interests',
            details: interestsError.message
          }, { status: 500 });
        }
      }
    }

    // ✅ Update social preferences if step5 data is provided
    if (validatedData.step5) {
      const socialUpdate: Record<string, string | string[]> = {
        updated_at: new Date().toISOString(),
      };

      if (validatedData.step5.meetingActivities) {
        socialUpdate.meeting_activities = validatedData.step5.meetingActivities;
      }
      if (validatedData.step5.socialEnergyLevel) {
        socialUpdate.social_energy = convertSocialEnergy(validatedData.step5.socialEnergyLevel);
      }
      if (validatedData.step5.conversationStyle) {
        socialUpdate.conversation_style = convertConversationStyle(validatedData.step5.conversationStyle);
      }

      const { error: socialError } = await supabase
        .from('social_preferences')
        .upsert({
          user_id: user.id,
          ...socialUpdate
        }, {
          onConflict: 'user_id'
        });

      if (socialError) {
        console.error('Error updating social preferences:', socialError);
        return NextResponse.json({ 
          error: 'Failed to update social preferences',
          details: socialError.message
        }, { status: 500 });
      }
    }

    // ✅ Update availability if step6 data is provided
    if (validatedData.step6) {
      const availabilityUpdate: Record<string, string | string[]> = {
        updated_at: new Date().toISOString(),
      };

      if (validatedData.step6.meetingTimes) {
        availabilityUpdate.preferred_times = validatedData.step6.meetingTimes;
      }
      if (validatedData.step6.meetingFrequency) {
        availabilityUpdate.frequency = convertMeetingFrequency(validatedData.step6.meetingFrequency);
      }

      const { error: availabilityError } = await supabase
        .from('availability')
        .upsert({
          user_id: user.id,
          ...availabilityUpdate
        }, {
          onConflict: 'user_id'
        });

      if (availabilityError) {
        console.error('Error updating availability:', availabilityError);
        return NextResponse.json({ 
          error: 'Failed to update availability',
          details: availabilityError.message
        }, { status: 500 });
      }
    }

    // ✅ Update lifestyle if step7 data is provided
    if (validatedData.step7) {
      const lifestyleUpdate: Record<string, string | string[]> = {
        updated_at: new Date().toISOString(),
      };

      if (validatedData.step7.dietaryPreferences) {
        lifestyleUpdate.dietary_restrictions = [validatedData.step7.dietaryPreferences];
      }
      if (validatedData.step7.lifeStage) {
        lifestyleUpdate.life_stage = convertLifeStage(validatedData.step7.lifeStage);
      }

      const { error: lifestyleError } = await supabase
        .from('lifestyle')
        .upsert({
          user_id: user.id,
          ...lifestyleUpdate
        }, {
          onConflict: 'user_id'
        });

      if (lifestyleError) {
        console.error('Error updating lifestyle:', lifestyleError);
        return NextResponse.json({ 
          error: 'Failed to update lifestyle',
          details: lifestyleError.message
        }, { status: 500 });
      }

      // Update looking for in social preferences
      if (validatedData.step7.lookingFor) {
        const { error: lookingForError } = await supabase
          .from('social_preferences')
          .upsert({
            user_id: user.id,
            looking_for: validatedData.step7.lookingFor,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (lookingForError) {
          console.error('Error updating looking for:', lookingForError);
          return NextResponse.json({ 
            error: 'Failed to update looking for',
            details: lookingForError.message
          }, { status: 500 });
        }
      }
    }

    // ✅ Update personality if step8 data is provided
    if (validatedData.step8?.idealWeekend) {
      const { error: personalityError } = await supabase
        .from('social_preferences')
        .upsert({
          user_id: user.id,
          ideal_weekend: validatedData.step8.idealWeekend,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (personalityError) {
        console.error('Error updating personality:', personalityError);
        return NextResponse.json({ 
          error: 'Failed to update personality',
          details: personalityError.message
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid data format',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('GET Profile API - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id?.substring(0, 8), 
      authError: authError?.message 
    });
    
    if (authError || !user) {
      console.log('GET Profile API - Unauthorized:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing profile data from all related tables
    const [
      { data: profile, error: profileError },
      { data: medicalProfile, error: medicalError },
      { data: activityLevel, error: activityError },
      { data: userActivities, error: activitiesError },
      { data: userInterests, error: interestsError },
      { data: socialPreferences, error: socialError },
      { data: availability, error: availabilityError },
      { data: lifestyle, error: lifestyleError }
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

    console.log('📊 Database Query Results:', {
      profile: { data: profile, error: profileError },
      medicalProfile: { data: medicalProfile, error: medicalError },
      activityLevel: { data: activityLevel, error: activityError },
      userActivities: { data: userActivities, error: activitiesError },
      userInterests: { data: userInterests, error: interestsError },
      socialPreferences: { data: socialPreferences, error: socialError },
      availability: { data: availability, error: availabilityError },
      lifestyle: { data: lifestyle, error: lifestyleError }
    });

    // Reconstruct the profile data structure
    const profileData = {
      step1: {
        gender: convertGenderFromDB(profile?.gender || 'prefer_not_to_say'),
        genderPreference: convertGenderPreferenceFromDB(medicalProfile?.gender_preference || 'no_preference'),
        city: profile?.city || '',
        nationality: profile?.nationality || '',
      },
      step2: {
        medicalSpecialties: medicalProfile?.specialties || [],
        specialtyPreference: convertSpecialtyPreferenceFromDB(medicalProfile?.specialty_preference || 'no_preference'),
        careerStage: convertCareerStageFromDB(medicalProfile?.career_stage || 'medical_student'),
      },
      step3: {
        sports: userActivities?.map((activity: { sport: string; interest_level: number }) => ({
          sport: activity.sport,
          interest: activity.interest_level
        })) || [],
        activityLevel: convertActivityLevelFromDB(activityLevel?.level || 'moderately_active'),
      },
      step4: {
        musicPreferences: userInterests?.filter((i: { category: string }) => i.category === 'music').map((i: { interest: string }) => i.interest) || [],
        moviePreferences: userInterests?.filter((i: { category: string }) => i.category === 'movies_tv').map((i: { interest: string }) => i.interest) || [],
        otherInterests: userInterests?.filter((i: { category: string }) => i.category === 'other').map((i: { interest: string }) => i.interest) || [],
      },
      step5: {
        meetingActivities: socialPreferences?.meeting_activities || [],
        socialEnergyLevel: convertSocialEnergyFromDB(socialPreferences?.social_energy || 'moderate_energy'),
        conversationStyle: convertConversationStyleFromDB(socialPreferences?.conversation_style || 'mix'),
      },
      step6: {
        meetingTimes: availability?.preferred_times || [],
        meetingFrequency: convertMeetingFrequencyFromDB(availability?.frequency || 'monthly'),
      },
      step7: {
        dietaryPreferences: lifestyle?.dietary_restrictions?.[0] || 'No restrictions',
        lifeStage: convertLifeStageFromDB(lifestyle?.life_stage || 'single_no_kids'),
        lookingFor: socialPreferences?.looking_for || [],
      },
      step8: {
        idealWeekend: socialPreferences?.ideal_weekend || 'Mix of active and relaxing',
      },
    };

    console.log('📊 Reconstructed Profile Data:', JSON.stringify(profileData, null, 2));

    return NextResponse.json({ 
      data: profileData,
      isOnboardingComplete: profile?.is_onboarding_complete || false 
    });

  } catch (error) {
    console.error('Profile GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
