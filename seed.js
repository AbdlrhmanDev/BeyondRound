require('dotenv').config({ path: '.env.local' }); // eslint-disable-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js'); // eslint-disable-line @typescript-eslint/no-require-imports
// --- CONFIGURATION ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NUMBER_OF_USERS = 50;
const PASSWORD = '123456789';
const GENDERS = ['male', 'female'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
const LIFESTAGES = ['single_no_kids', 'relationship_no_kids', 'young_children', 'empty_nester'];
const ACTIVITY_LEVELS = ['very_active', 'moderately_active', 'prefer_non_physical'];
const CAREER_STAGES = ['resident_1-2', 'attending_0-5', 'fellow', 'academic'];
const MEETING_ACTIVITIES = ['coffee', 'drinks', 'hike', 'board_games', 'dinner', 'movies'];
const CONVERSATION_STYLES = ['deep_meaningful', 'light_fun', 'professional', 'mix'];
// --------------------

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr) => {
    const subset = [];
    const count = Math.floor(Math.random() * arr.length) + 1;
    const shuffled = arr.sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
        subset.push(shuffled[i]);
    }
    return subset;
};

async function clearDatabase() {
    console.log('🧹 Clearing database...');

    // 1. Delete all data from tables first (without FK constraints)
    const tablesToClear = ['group_members', 'messages', 'match_feedback'];
    for (const table of tablesToClear) {
        const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) console.log(`Note: ${table} cleanup - ${error.message}`);
    }
    
    // 2. Delete groups and matches
    await supabaseAdmin.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Get all users
    const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
        console.error('❌ Error listing users:', listUsersError.message);
        return;
    }

    console.log(`Found ${users.length} users to delete...`);

    // 4. Delete each user's data
    for (const user of users) {
        // Delete user-specific tables
        const userTables = [
            'medical_profiles',
            'activity_levels',
            'lifestyle',
            'social_preferences',
            'user_preferences',
        ];

        for (const table of userTables) {
            await supabaseAdmin.from(table).delete().eq('user_id', user.id);
        }

        // Delete auth user (this will cascade to profiles due to ON DELETE CASCADE)
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteUserError) {
            console.log(`⚠️  Could not delete user ${user.email}: ${deleteUserError.message}`);
        } else {
            console.log(`✅ Deleted user: ${user.email}`);
        }
    }
    console.log('✅ Database cleared!');
}

function calculateCompatibilityScore(user1, user2) {
    let score = 0;
    if (user1.profile.city === user2.profile.city) score += 10;
    if (Math.abs(user1.profile.age - user2.profile.age) <= 5) score += 10;
    if (user1.medical_profile?.specialty_preference === 'same' && user1.medical_profile?.specialties.some(s => user2.medical_profile?.specialties.includes(s))) score += 15;
    if (user1.medical_profile?.specialty_preference === 'different' && !user1.medical_profile?.specialties.some(s => user2.medical_profile?.specialties.includes(s))) score += 15;
    if (user1.medical_profile?.gender_preference !== 'no_preference') {
        if (user1.medical_profile.gender_preference === 'same_preferred_mixed_ok' && user1.profile.gender === user2.profile.gender) score += 15;
        if (user1.medical_profile.gender_preference === 'mixed_preferred' && user1.profile.gender !== user2.profile.gender) score += 15;
    }
    if (user1.activity_level?.level === user2.activity_level?.level) score += 10;
    if (user1.lifestyle?.life_stage === user2.lifestyle?.life_stage) score += 10;
    const sharedActivities = user1.social_preference?.meeting_activities.filter(a => user2.social_preference?.meeting_activities.includes(a));
    score += (sharedActivities?.length || 0) * 5;
    const sharedLookingFor = user1.social_preference?.looking_for.filter(l => user2.social_preference?.looking_for.includes(l));
    score += (sharedLookingFor?.length || 0) * 5;

    return Math.min(100, score);
}

async function seedUsers() {
    await clearDatabase();
    console.log(`\n🌱 Starting to seed ${NUMBER_OF_USERS} users...`);
    
    const users = [];
    for (let i = 1; i <= NUMBER_OF_USERS; i++) {
        const full_name = `Seed User ${i}`;
        const email = `seed_user_${i}@example.com`;
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { full_name }
        });

        if (authError) {
            if (authError.message.includes('already been registered')) {
                console.log(`⚠️  User ${i} already exists, skipping...`);
            } else {
                console.error(`❌ Auth Error for ${email}:`, authError.message);
            }
            continue; 
        }
        users.push(authData.user);
        console.log(`✅ Created user ${i}/${NUMBER_OF_USERS}: ${email}`);
    }
    
    if (users.length === 0) {
        console.error('\n❌ No users were created! Please check the errors above.');
        return;
    }
    
    console.log(`\n📊 Successfully created ${users.length} users!`)

    const detailedUsers = [];

    for (const user of users) {
        const full_name = user.user_metadata.full_name;
        const gender = getRandom(GENDERS);
        const city = getRandom(CITIES);
        const age = Math.floor(Math.random() * (55 - 25 + 1)) + 25;

        const profileData = {
            id: user.id,
            full_name: full_name,
            age: age,
            gender: gender,
            city: city,
            bio: `Hello, I'm ${full_name}. I'm a seed user interested in professional connections and hobbies.`,
            is_onboarding_complete: true,
            is_matchable: true,
        };
        await supabaseAdmin.from('profiles').upsert(profileData, { onConflict: 'id' });

        const medicalProfileData = {
            user_id: user.id,
            specialties: ['Internal Medicine', 'Pediatrics'],
            career_stage: getRandom(CAREER_STAGES),
            specialty_preference: getRandom(['same', 'different', 'no_preference']),
            gender_preference: getRandom(['no_preference', 'mixed_preferred', 'same_preferred_mixed_ok']),
        };
        await supabaseAdmin.from('medical_profiles').insert(medicalProfileData);

        const activityLevelData = { user_id: user.id, level: getRandom(ACTIVITY_LEVELS) };
        await supabaseAdmin.from('activity_levels').insert(activityLevelData);

        const lifestyleData = {
            user_id: user.id,
            dietary_restrictions: getRandomSubset(['vegetarian', 'gluten_free', 'kosher']),
            life_stage: getRandom(LIFESTAGES),
        };
        await supabaseAdmin.from('lifestyle').insert(lifestyleData);

        const socialPreferenceData = {
            user_id: user.id,
            meeting_activities: getRandomSubset(MEETING_ACTIVITIES),
            social_energy: getRandom(['high_energy', 'moderate_energy', 'low_key']),
            conversation_style: getRandom(CONVERSATION_STYLES),
            ideal_weekend: 'Spending time outdoors and relaxing with a book or friends.',
            looking_for: getRandomSubset(['mentorship', 'friendship', 'coworkers', 'activity_partners']),
        };
        await supabaseAdmin.from('social_preferences').insert(socialPreferenceData);
        
        await supabaseAdmin.from('user_preferences').insert({ user_id: user.id });

        detailedUsers.push({
            id: user.id,
            profile: profileData,
            medical_profile: medicalProfileData,
            activity_level: activityLevelData,
            lifestyle: lifestyleData,
            social_preference: socialPreferenceData,
        });
    }

    console.log('\n👥 Creating groups with 3-4 members each...');
    let userIndex = 0;
    let groupCount = 0;
    const groupsCreated = [];
    
    // Create groups with proper member distribution
    for (let i = 0; i < Math.ceil(NUMBER_OF_USERS / 4); i++) {
        if (userIndex >= users.length) break; // No more users to add
        
        const groupName = `Group ${i + 1}`;
        const { data: groupData, error: groupError } = await supabaseAdmin
            .from('groups')
            .insert({ 
                name: groupName, 
                description: `A seed generated group ${i + 1} with multiple members` 
            })
            .select();
            
        if (groupError) {
            console.error('❌ Error creating group:', groupError.message);
            continue;
        }
        
        const group = groupData[0];
        const memberCount = Math.floor(Math.random() * 2) + 3; // 3-4 members
        
        // Prepare members array
        const membersToAdd = [];
        for (let j = 0; j < memberCount && userIndex < users.length; j++) {
            membersToAdd.push({
                group_id: group.id,
                user_id: users[userIndex].id
            });
            userIndex++;
        }
        
        // Insert all members at once
        if (membersToAdd.length > 0) {
            const { error: membersError } = await supabaseAdmin
                .from('group_members')
                .insert(membersToAdd);
                
            if (membersError) {
                console.error(`❌ Error adding members to group ${i + 1}:`, membersError.message);
            } else {
                groupsCreated.push({
                    id: group.id,
                    name: group.name,
                    memberCount: membersToAdd.length
                });
                console.log(`✅ Created ${groupName} with ${membersToAdd.length} members`);
            }
        }
        
        groupCount++;
    }
    
    console.log(`\n✅ Created ${groupCount} groups!`);
    console.log(`📊 Groups summary:`);
    groupsCreated.forEach(g => {
        console.log(`   • ${g.name}: ${g.memberCount} members`);
    });

    console.log('\n🤝 Creating matches based on compatibility score...');
    const matches = [];
    for (let i = 0; i < detailedUsers.length; i++) {
        for (let j = i + 1; j < detailedUsers.length; j++) {
            const user1 = detailedUsers[i];
            const user2 = detailedUsers[j];
            const score = calculateCompatibilityScore(user1, user2);
            if (score > 50) { // Threshold for creating a match
                matches.push({
                    user1_id: user1.id,
                    user2_id: user2.id,
                    compatibility_score: score,
                    score_breakdown: {},
                });
            }
        }
    }

    // Sort matches by score descending and take the top ones
    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
    const topMatches = matches.slice(0, users.length * 2); // Create a good number of matches

    for (const match of topMatches) {
        await supabaseAdmin.from('matches').insert(match);
    }

    console.log(`✅ Created ${topMatches.length} matches!`);
    console.log(`\n🎉 ═══════════════════════════════════════`);
    console.log(`🎉  Seeding Complete!`);
    console.log(`🎉 ═══════════════════════════════════════`);
    console.log(`📊 Summary:`);
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Groups: ${groupCount}`);
    console.log(`   • Matches: ${topMatches.length}`);
    console.log(`🎉 ═══════════════════════════════════════\n`);
}

seedUsers();
