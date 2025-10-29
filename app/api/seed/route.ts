import { createAdminClient } from '@/utils/supabase/client';
import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  // Delete all data
  const { data: usersList, error: getUsersError } = await supabase.auth.admin.listUsers();
  if (getUsersError) {
    return NextResponse.json({ error: getUsersError.message }, { status: 500 });
  }

  for (const user of usersList.users) {
    await supabase.auth.admin.deleteUser(user.id);
  }
  
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('group_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('activity_levels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('availability').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lifestyle').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('medical_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('social_preferences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('user_preferences').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const users = [];

  for (let i = 0; i < 20; i++) {
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email: faker.internet.email(),
      password: faker.internet.password(),
      email_confirm: true,
    });

    if (authError || !user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 500 });
    }
    users.push(user);

    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 100 }),
      gender: faker.helpers.arrayElement(['male', 'female', 'non-binary', 'prefer_not_to_say']),
      city: faker.location.city(),
      nationality: faker.location.country(),
      avatar_url: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { error: activityLevelError } = await supabase.from('activity_levels').insert({
        user_id: user.id,
        level: faker.helpers.arrayElement(['very_active', 'active', 'moderately_active', 'occasionally_active', 'prefer_non_physical']),
    });

    if (activityLevelError) {
        return NextResponse.json({ error: activityLevelError.message }, { status: 500 });
    }

    const { error: availabilityError } = await supabase.from('availability').insert({
        user_id: user.id,
        preferred_times: faker.helpers.arrayElements(['morning', 'afternoon', 'evening']),
        frequency: faker.helpers.arrayElement(['weekly', 'bi-weekly', 'monthly', 'flexible']),
    });

    if (availabilityError) {
        return NextResponse.json({ error: availabilityError.message }, { status: 500 });
    }

    const { error: lifestyleError } = await supabase.from('lifestyle').insert({
        user_id: user.id,
        dietary_restrictions: faker.helpers.arrayElements(['vegetarian', 'vegan', 'gluten-free']),
        life_stage: faker.helpers.arrayElement(['single_no_kids', 'relationship_no_kids', 'married_no_kids', 'young_children', 'older_children', 'empty_nester', 'prefer_not_to_say']),
    });

    if (lifestyleError) {
        return NextResponse.json({ error: lifestyleError.message }, { status: 500 });
    }

    const { error: medicalProfileError } = await supabase.from('medical_profiles').insert({
        user_id: user.id,
        specialties: faker.helpers.arrayElements(['cardiology', 'neurology', 'pediatrics']),
        career_stage: faker.helpers.arrayElement(['medical_student', 'resident_1-2', 'resident_3+', 'fellow', 'attending_0-5', 'attending_5+', 'private_practice', 'academic', 'other']),
        specialty_preference: faker.helpers.arrayElement(['same', 'different', 'no_preference']),
        gender_preference: faker.helpers.arrayElement(['no_preference', 'mixed_preferred', 'same_only', 'same_preferred_mixed_ok']),
    });

    if (medicalProfileError) {
        return NextResponse.json({ error: medicalProfileError.message }, { status: 500 });
    }

    const { error: socialPreferencesError } = await supabase.from('social_preferences').insert({
        user_id: user.id,
        meeting_activities: faker.helpers.arrayElements(['coffee', 'dinner', 'drinks', 'park']),
        social_energy: faker.helpers.arrayElement(['high_energy', 'moderate_energy', 'low_key', 'varies']),
        conversation_style: faker.helpers.arrayElement(['deep_meaningful', 'light_fun', 'hobby_focused', 'professional', 'mix']),
        ideal_weekend: faker.lorem.sentence(),
        looking_for: faker.helpers.arrayElements(['friendship', 'networking', 'mentorship']),
    });

    if (socialPreferencesError) {
        return NextResponse.json({ error: socialPreferencesError.message }, { status: 500 });
    }

    const { error: userPreferencesError } = await supabase.from('user_preferences').insert({
        user_id: user.id,
    });

    if (userPreferencesError) {
        return NextResponse.json({ error: userPreferencesError.message }, { status: 500 });
    }

    const { error: verificationsError } = await supabase.from('verifications').insert({
        user_id: user.id,
        email_verified: true,
    });

    if (verificationsError) {
        return NextResponse.json({ error: verificationsError.message }, { status: 500 });
    }
  }

  const groups = [];
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase.from('groups').insert({
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      created_by: faker.helpers.arrayElement(users).id,
      group_type: faker.helpers.arrayElement(['specialty', 'activity', 'social', 'mixed']),
    }).select();
    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create group' }, { status: 500 });
    }
    groups.push(data[0]);
  }

  for (const user of users) {
    const numGroups = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < numGroups; i++) {
      const group = faker.helpers.arrayElement(groups);
      const { error } = await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user.id,
      });
      if (error) {
        // ignore unique constraint errors
        if (error.code !== '23505') {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }
  }

  for (let i = 0; i < 10; i++) {
    const user1 = faker.helpers.arrayElement(users);
    const user2 = faker.helpers.arrayElement(users.filter(u => u.id !== user1.id));
    const { error } = await supabase.from('matches').insert({
      user1_id: user1.id,
      user2_id: user2.id,
      compatibility_score: faker.number.int({ min: 0, max: 100 }),
      score_breakdown: {},
    });
    if (error) {
        // ignore unique constraint errors
        if (error.code !== '23505') {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
  }

  for (let i = 0; i < 50; i++) {
    const group = faker.helpers.arrayElement(groups);
    const user = faker.helpers.arrayElement(users);
    const { error } = await supabase.from('messages').insert({
      group_id: group.id,
      user_id: user.id,
      content: faker.lorem.sentence(),
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Database seeded successfully' });
}