require('dotenv').config({ path: '.env.local' }); // eslint-disable-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js'); // eslint-disable-line @typescript-eslint/no-require-imports

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin user configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
const ADMIN_ROLE = process.env.ADMIN_ROLE || 'super_admin'; // 'admin' or 'super_admin'

// --------------------

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdminUser() {
  console.log('🔐 Creating admin user...');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Name: ${ADMIN_NAME}`);
  console.log(`   Role: ${ADMIN_ROLE}`);
  console.log('');

  try {
    // 1. Check if admin_roles table exists, if not create it
    const { error: tableCheckError } = await supabaseAdmin
      .from('admin_roles')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.error('❌ admin_roles table does not exist!');
      console.error('   Please run the migration: supabase/migrations/20250101_admin_roles.sql');
      console.error('   Or run: supabase db push');
      process.exit(1);
    }

    // 2. Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }

    const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL);

    let userId;

    if (existingUser) {
      console.log(`⚠️  User with email ${ADMIN_EMAIL} already exists.`);
      userId = existingUser.id;
      
      // Check if already has admin role
      const { data: existingRole, error: roleError } = await supabaseAdmin
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingRole && !roleError) {
        console.log(`✅ User already has admin role: ${existingRole.role}`);
        console.log('   Updating to:', ADMIN_ROLE);
        
        const { error: updateError } = await supabaseAdmin
          .from('admin_roles')
          .update({ role: ADMIN_ROLE, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Error updating admin role:', updateError.message);
          process.exit(1);
        }
        
        console.log('✅ Admin role updated successfully!');
        console.log('');
        console.log('🎉 Admin user is ready!');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Role: ${ADMIN_ROLE}`);
        return;
      }
    } else {
      // 3. Create new user
      console.log('📝 Creating new user...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { 
          full_name: ADMIN_NAME,
          role: 'admin'
        }
      });

      if (authError) {
        console.error('❌ Error creating user:', authError.message);
        process.exit(1);
      }

      userId = authData.user.id;
      console.log(`✅ User created: ${authData.user.email}`);

      // 4. Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: ADMIN_EMAIL,
          full_name: ADMIN_NAME,
          is_onboarding_complete: true,
          is_matchable: false, // Admins typically don't need matching
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn('⚠️  Warning: Could not create profile:', profileError.message);
      } else {
        console.log('✅ Profile created');
      }
    }

    // 5. Add admin role
    console.log('🔑 Adding admin role...');
    const { error: roleError } = await supabaseAdmin
      .from('admin_roles')
      .upsert({
        user_id: userId,
        role: ADMIN_ROLE,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (roleError) {
      console.error('❌ Error adding admin role:', roleError.message);
      process.exit(1);
    }

    console.log('✅ Admin role added successfully!');
    console.log('');
    console.log('🎉 ═══════════════════════════════════════');
    console.log('🎉  Admin User Created Successfully!');
    console.log('🎉 ═══════════════════════════════════════');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`👤 Name: ${ADMIN_NAME}`);
    console.log(`🛡️  Role: ${ADMIN_ROLE}`);
    console.log('🎉 ═══════════════════════════════════════');
    console.log('');
    console.log('💡 You can now log in at: /auth/login');
    console.log('💡 Admin panel: /admin');
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createAdminUser();

