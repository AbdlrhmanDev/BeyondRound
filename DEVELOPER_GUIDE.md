# 👨‍💻 Developer Guide - Medical Matching System

## 📚 Project Structure

```
supabase-auth-main/
├── app/
│   ├── (onboarding)/
│   │   └── onboarding/
│   │       └── page.tsx              # ✅ 8-step onboarding wizard
│   ├── api/
│   │   ├── onboarding/
│   │   │   └── route.ts              # ✅ Modified: Added is_matchable
│   │   ├── groups/
│   │   ├── matches/
│   │   └── messages/
│   └── dashboard/
│       ├── page.tsx                  # ✅ Modified: Added waiting state
│       ├── messages/
│       │   ├── page.tsx              # Existing: Groups list
│       │   └── [id]/
│       │       └── page.tsx          # ✅ NEW: Group chat page
│       └── profile/
├── components/
│   ├── dashboard/
│   │   ├── feedback-modal.tsx        # ✅ NEW: Feedback modal
│   │   └── ...
│   ├── onboarding/
│   │   ├── Step1.tsx through Step8.tsx
│   │   └── ...
│   └── ui/
│       ├── dialog.tsx                # Existing
│       ├── radio-group.tsx           # ✅ NEW
│       ├── textarea.tsx              # ✅ NEW
│       └── ...
├── supabase/
│   └── migrations/
│       └── 20241029_add_matchable_and_feedback.sql  # ✅ NEW
└── utils/
    └── supabase/
```

---

## 🔄 Data Flow

### 1. Onboarding Flow
```
User Signs Up
    ↓
POST /api/onboarding
    ↓
Validate with Zod schema
    ↓
Save to multiple tables:
- profiles (is_onboarding_complete, is_matchable)
- medical_profiles
- activity_levels
- user_activities
- user_interests
- social_preferences
- availability
- lifestyle
    ↓
Redirect to /dashboard
```

### 2. Dashboard State Logic
```typescript
// In app/dashboard/page.tsx

if (!userProfile?.is_onboarding_complete) {
  // Show "Complete Onboarding" card
}

if (userProfile.is_matchable && userGroups.length === 0) {
  // Show "Waiting State" - Next match: Thursday 4:00 PM
}

if (userGroups.length > 0) {
  // Show groups list with "Open Chat" buttons
}
```

### 3. Group Chat Flow
```
User clicks "Open Chat"
    ↓
Navigate to /dashboard/messages/[groupId]
    ↓
Fetch:
- Group details
- Group members
- Messages (ordered by created_at)
    ↓
Subscribe to Realtime channel for new messages
    ↓
Display chat interface
```

### 4. Feedback Flow
```
User clicks "Give Feedback"
    ↓
Open FeedbackModal
    ↓
User fills:
- Rating (1-5 stars)
- Would meet again? (yes/no/maybe)
- Comments (optional)
    ↓
POST to match_feedback table
    ↓
Show success message
```

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
```sql
id                      uuid PRIMARY KEY
email                   text
full_name               text
avatar_url              text
city                    text
nationality             text
gender                  text
is_onboarding_complete  boolean DEFAULT false
is_matchable            boolean DEFAULT false  ✅ NEW
created_at              timestamp
updated_at              timestamp
```

#### `groups`
```sql
id              uuid PRIMARY KEY
name            text
description     text
avatar_url      text
created_at      timestamp
```

#### `group_members`
```sql
id          uuid PRIMARY KEY
group_id    uuid → groups(id)
user_id     uuid → profiles(id)
joined_at   timestamp
```

#### `messages`
```sql
id          uuid PRIMARY KEY
group_id    uuid → groups(id)
user_id     uuid → profiles(id)
content     text
created_at  timestamp
```

#### `match_feedback` ✅ NEW
```sql
id                  uuid PRIMARY KEY
user_id             uuid → profiles(id)
group_id            uuid → groups(id)
rating              integer (1-5)
would_meet_again    boolean
comments            text (nullable)
created_at          timestamp
updated_at          timestamp

UNIQUE(user_id, group_id)  -- One feedback per user per group
```

### Supporting Tables
- `medical_profiles` - Specialties, career stage, preferences
- `activity_levels` - User activity level
- `user_activities` - Sports and interest levels
- `user_interests` - Music, movies, hobbies
- `social_preferences` - Meeting activities, energy, conversation style
- `availability` - Preferred times, frequency
- `lifestyle` - Dietary restrictions, life stage

---

## 🔐 Security (RLS Policies)

### `match_feedback` Policies
```sql
-- Insert: Users can only create their own feedback
CREATE POLICY "Users can insert their own feedback"
ON match_feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Select: Users can only read their own feedback
CREATE POLICY "Users can view their own feedback"
ON match_feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update: Users can only update their own feedback
CREATE POLICY "Users can update their own feedback"
ON match_feedback FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete: Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
ON match_feedback FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## 🎨 UI Components

### New Components Created

#### 1. `FeedbackModal`
**Location:** `components/dashboard/feedback-modal.tsx`
**Props:**
```typescript
interface FeedbackModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}
```
**Features:**
- Star rating (1-5)
- Radio group for "would meet again"
- Textarea for comments
- Form validation
- Success/error alerts

#### 2. `RadioGroup` & `RadioGroupItem`
**Location:** `components/ui/radio-group.tsx`
**Usage:**
```typescript
<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option1" id="opt1" />
  <RadioGroupItem value="option2" id="opt2" />
</RadioGroup>
```

#### 3. `Textarea`
**Location:** `components/ui/textarea.tsx`
**Usage:**
```typescript
<Textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Enter text..."
  maxLength={500}
/>
```

---

## 🔄 Realtime Implementation

### Group Chat Realtime
```typescript
// In app/dashboard/messages/[id]/page.tsx

const channel = supabase
  .channel(`group-${groupId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `group_id=eq.${groupId}`,
    },
    async (payload) => {
      // Fetch profile for new message
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', payload.new.user_id)
        .single();

      const newMessage = {
        ...payload.new,
        profiles: profile,
      } as Message;

      setMessages((prev) => [...prev, newMessage]);
    }
  )
  .subscribe();
```

### Cleanup
```typescript
useEffect(() => {
  // Setup subscription
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [groupId]);
```

---

## 🧪 Testing Checklist

### Manual Testing

#### 1. Onboarding Flow
- [ ] Sign up new user
- [ ] Complete all 8 steps
- [ ] Verify data saved correctly in all tables
- [ ] Check `is_matchable = true` after completion
- [ ] Redirect to dashboard works

#### 2. Dashboard States
- [ ] New user sees "Complete Onboarding" card
- [ ] User with completed profile but no groups sees waiting state
- [ ] User with groups sees groups list
- [ ] "Edit Profile" button works

#### 3. Group Chat
- [ ] Can open chat for a group
- [ ] Messages load correctly
- [ ] Can send new messages
- [ ] Messages appear in real-time
- [ ] Members list shows correctly
- [ ] Back button works

#### 4. Feedback Modal
- [ ] Modal opens when clicking "Give Feedback"
- [ ] Star rating works
- [ ] Radio selection works
- [ ] Can enter comments
- [ ] Character counter updates
- [ ] Submit button disabled until required fields filled
- [ ] Success message shows after submit
- [ ] Modal closes automatically after success

---

## 🚀 Deployment Checklist

### Before Deploying

1. **Database Migration**
   ```bash
   # Run migration
   supabase migration up
   
   # Or manually in Supabase Dashboard
   # Execute: supabase/migrations/20241029_add_matchable_and_feedback.sql
   ```

2. **Environment Variables**
   Ensure these are set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Supabase Settings**
   - [ ] Realtime enabled for `messages` table
   - [ ] RLS policies applied to all tables
   - [ ] API rate limits configured

4. **Dependencies**
   ```bash
   npm install @radix-ui/react-radio-group
   ```

5. **Build Test**
   ```bash
   npm run build
   ```

---

## 🔮 Future Enhancements

### Phase 1: Notifications
```typescript
// Send notification when group is ready
await sendNotification({
  userId: user.id,
  title: "Your Group is Ready! 🎉",
  body: "Check out your new matched group",
  link: `/dashboard/messages/${groupId}`
});

// Send notification on new message
await sendNotification({
  userId: memberId,
  title: `New message in ${groupName}`,
  body: message.content,
  link: `/dashboard/messages/${groupId}`
});
```

### Phase 2: Matching Algorithm
```typescript
// Edge Function: match-users.ts
export async function matchUsers() {
  // 1. Get all matchable users
  const users = await getMatchableUsers();
  
  // 2. Calculate compatibility scores
  const scores = calculateCompatibilityMatrix(users);
  
  // 3. Form optimal groups (3-5 people)
  const groups = formGroups(scores, { minSize: 3, maxSize: 5 });
  
  // 4. Create groups in database
  await createGroupsInDB(groups);
  
  // 5. Send notifications
  await notifyUsers(groups);
}
```

### Phase 3: Advanced Features
- File uploads in chat
- Voice messages
- Video calls integration
- Group activities scheduling
- Feedback analytics dashboard
- Admin panel for monitoring

---

## 📝 Code Style Guide

### TypeScript Best Practices
```typescript
// ✅ Good: Explicit return types
async function fetchUser(): Promise<User | null> {
  const { data } = await supabase.from('profiles').select('*');
  return data;
}

// ✅ Good: Error handling
try {
  await supabase.from('messages').insert(message);
} catch (error) {
  console.error('Error sending message:', error);
  showErrorToast('Failed to send message');
}

// ✅ Good: Type safety
interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}
```

### React Best Practices
```typescript
// ✅ Good: useEffect cleanup
useEffect(() => {
  const channel = supabase.channel('my-channel');
  channel.subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);

// ✅ Good: Memoization
const supabase = useMemo(() => createClient(), []);

// ✅ Good: Loading states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Content data={data} />;
```

---

## 🐛 Common Issues & Solutions

### Issue: "User not authenticated"
**Solution:** Check if user is logged in before making requests
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  router.push('/sign-in');
  return;
}
```

### Issue: Realtime not working
**Solution:** 
1. Enable Realtime in Supabase Dashboard
2. Check RLS policies allow SELECT
3. Verify channel subscription

### Issue: "Cannot read property 'id' of null"
**Solution:** Add optional chaining and null checks
```typescript
const userName = user?.full_name || 'Anonymous';
const groupName = group?.name ?? 'Unnamed Group';
```

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Radix UI:** https://www.radix-ui.com/

---

**Last Updated:** October 29, 2024
**Status:** ✅ Production Ready

