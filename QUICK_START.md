# 🚀 Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Database Setup
Run the migration to add required fields and tables:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase migration up

# Option 2: Manual (Supabase Dashboard)
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of: supabase/migrations/20241029_add_matchable_and_feedback.sql
# 3. Click "Run"
```

### Step 2: Install Dependencies
```bash
# Install required packages
npm install @radix-ui/react-radio-group

# Install all dependencies (if not done already)
npm install
```

### Step 3: Environment Variables
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🧪 Quick Test Walkthrough

### 1. Test Onboarding Flow
1. Click "Sign Up"
2. Create a new account
3. Complete all 8 onboarding steps:
   - Step 1: Basic Info (gender, city, etc.)
   - Step 2: Medical Background
   - Step 3: Sports & Activities
   - Step 4: Entertainment & Culture
   - Step 5: Social Preferences
   - Step 6: Availability
   - Step 7: Lifestyle & Values
   - Step 8: Personality
4. Click "Complete Profile"

**Expected Result:** 
- ✅ Redirected to Dashboard
- ✅ See "Waiting State" page
- ✅ Message: "You're All Set! 🎉"

### 2. Test Dashboard States

**State A: Not Completed Onboarding**
- Navigate to: `/dashboard`
- **Expected:** "Complete Your Profile" card with button to `/onboarding`

**State B: Completed but No Groups**
- Complete onboarding
- Navigate to: `/dashboard`
- **Expected:** Waiting state with:
  - Green checkmark icon
  - "Next Matching Round: Every Thursday at 4:00 PM"
  - Information cards about what happens next

**State C: Has Groups**
- (Need to manually create a group and add user)
- Navigate to: `/dashboard`
- **Expected:** Groups list with "Open Chat" buttons

### 3. Test Group Chat (Manual Setup Required)

**Setup:**
```sql
-- In Supabase SQL Editor

-- Create a test group
INSERT INTO groups (id, name, description, avatar_url)
VALUES (
  gen_random_uuid(),
  'Test Group',
  'This is a test group',
  'https://github.com/shadcn.png'
);

-- Add yourself to the group
INSERT INTO group_members (group_id, user_id)
VALUES (
  'YOUR_GROUP_ID',  -- Replace with the group ID from above
  'YOUR_USER_ID'    -- Replace with your user ID
);
```

**Test:**
1. Go to: `/dashboard/messages`
2. Click on "Test Group"
3. **Expected:** Group chat page with:
   - Group name and member count
   - Members sidebar
   - Empty chat (or existing messages)
   - Message input at bottom

4. Type a message and send
5. **Expected:** Message appears immediately

### 4. Test Feedback Modal

**Test:**
1. In group chat, click "Give Feedback" button
2. **Expected:** Modal opens with:
   - 5 stars for rating
   - Radio buttons for "would meet again"
   - Textarea for comments
   - Submit button (disabled initially)

3. Fill out the form:
   - Click 5 stars
   - Select "Yes, I'd love to meet again"
   - Type some comments (optional)

4. Click "Submit Feedback"
5. **Expected:**
   - Success message appears
   - Modal closes after 2 seconds

**Verify in Database:**
```sql
SELECT * FROM match_feedback WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 Database Verification

### Check if is_matchable was set
```sql
SELECT id, email, is_onboarding_complete, is_matchable
FROM profiles
WHERE email = 'your_email@example.com';
```

**Expected:**
- `is_onboarding_complete` = `true`
- `is_matchable` = `true`

### Check feedback was saved
```sql
SELECT 
  mf.id,
  mf.rating,
  mf.would_meet_again,
  mf.comments,
  p.email,
  g.name as group_name
FROM match_feedback mf
JOIN profiles p ON mf.user_id = p.id
JOIN groups g ON mf.group_id = g.id
ORDER BY mf.created_at DESC
LIMIT 10;
```

---

## 🎯 Feature Checklist

After testing, verify:

- [ ] ✅ Onboarding completes successfully
- [ ] ✅ `is_matchable` set to `true` after onboarding
- [ ] ✅ Dashboard shows correct state based on profile
- [ ] ✅ Waiting state displays when no groups
- [ ] ✅ Groups list appears when user has groups
- [ ] ✅ Can navigate to group chat
- [ ] ✅ Messages display correctly
- [ ] ✅ Can send messages
- [ ] ✅ Messages appear in real-time
- [ ] ✅ Members list shows all group members
- [ ] ✅ Feedback modal opens
- [ ] ✅ Can rate with stars
- [ ] ✅ Can select "would meet again" option
- [ ] ✅ Can enter comments
- [ ] ✅ Feedback saves to database
- [ ] ✅ No console errors

---

## 🐛 Troubleshooting

### "Group not found" error
**Check:**
```sql
-- Are you a member of this group?
SELECT * FROM group_members 
WHERE user_id = 'YOUR_USER_ID' 
AND group_id = 'GROUP_ID';
```

### Messages not appearing in real-time
**Fix:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for `messages` table
3. Refresh the page

### Cannot submit feedback
**Check:**
```sql
-- Does the table exist?
SELECT * FROM match_feedback LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'match_feedback';
```

### Linter errors
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 📱 Mobile Testing

Test on different screen sizes:
```bash
# Open browser DevTools (F12)
# Click "Toggle device toolbar" (Ctrl+Shift+M)
# Test these sizes:
- iPhone 12 (390x844)
- iPad Air (820x1180)
- Desktop (1920x1080)
```

**Verify:**
- [ ] Dashboard layout responsive
- [ ] Chat interface works on mobile
- [ ] Feedback modal fits on mobile screen
- [ ] Waiting state looks good on all sizes

---

## 🎨 UI/UX Testing

### Visual Checks
- [ ] Colors consistent with theme
- [ ] Dark mode works (if applicable)
- [ ] Buttons have hover states
- [ ] Loading states show when needed
- [ ] Error messages are clear
- [ ] Success messages are visible

### Accessibility
- [ ] Can navigate with keyboard (Tab key)
- [ ] Form labels are clear
- [ ] Error messages are descriptive
- [ ] Color contrast is sufficient

---

## 🚀 Production Checklist

Before deploying:
- [ ] All migrations applied
- [ ] Environment variables set in production
- [ ] Realtime enabled
- [ ] RLS policies active
- [ ] Test with real users
- [ ] Monitor logs for errors
- [ ] Backup database
- [ ] Set up error tracking (e.g., Sentry)

---

## 📝 Next Steps

After basic testing:
1. **Create Matching Algorithm**
   - Edge Function that runs every Thursday 4 PM
   - Matches users based on profiles
   - Creates groups

2. **Add Notifications**
   - Email when group is ready
   - Push notification for new messages
   - Reminder for matching day

3. **Admin Dashboard**
   - View all matches
   - Monitor feedback
   - Manage groups

---

## 🎉 Success!

If all tests pass, your implementation is complete! 

**What's working:**
✅ Complete onboarding system
✅ Smart dashboard with waiting states
✅ Real-time group chat
✅ Feedback collection system

**Ready for:**
🚀 User testing
🚀 Matching algorithm integration
🚀 Production deployment

---

**Need Help?**
- Check `IMPLEMENTATION_SUMMARY.md` for detailed explanation
- Review `DEVELOPER_GUIDE.md` for technical details
- Check `NEXT_IMPLEMENTATION_README_AR.md` for Arabic documentation

