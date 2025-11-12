# 🕐 Create Cron Jobs in Supabase Dashboard

Since you already have the Cron integration enabled in Supabase, follow these steps to create your 3 cron jobs.

---

## 📋 Quick Steps

1. Go to your Supabase Dashboard
2. Navigate to: **Integrations** → **Cron** → Click **"Create job"** button
3. Create each of the 3 jobs below

---

## ✅ Job 1: Weekly Matching Day Reminder

**Click "Create job" and enter:**

**Name:**
```
weekly-matching-day-reminder
```

**Schedule (Cron Expression):**
```
0 16 * * 4
```
(Every Thursday at 4:00 PM UTC)

**Command (SQL):**
```sql
INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
SELECT 
    p.user_id,
    'system',
    'Matching Day Reminder! 🎯',
    'Groups will be created soon. Make sure your profile is up to date!',
    '/dashboard/profile',
    jsonb_build_object(
        'reminder_type', 'weekly_matching',
        'sent_at', NOW()
    )
FROM public.profiles p
WHERE p.is_matchable = true;
```

**Active:** ✅ ON

Click **"Create job"**

---

## ✅ Job 2: Weekly Feedback Request

**Click "Create job" and enter:**

**Name:**
```
weekly-feedback-request
```

**Schedule (Cron Expression):**
```
0 10 * * 1
```
(Every Monday at 10:00 AM UTC)

**Command (SQL):**
```sql
WITH recent_groups AS (
    SELECT 
        g.id,
        g.name,
        g.created_at
    FROM public.groups g
    WHERE g.created_at >= NOW() - INTERVAL '7 days'
      AND g.created_at < NOW() - INTERVAL '3 days'
)
INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
SELECT 
    gm.user_id,
    'system',
    'How was your weekend meetup? 💭',
    CONCAT('Please share feedback about your experience with ', rg.name),
    CONCAT('/dashboard/groups/', rg.id),
    jsonb_build_object(
        'group_id', rg.id,
        'group_name', rg.name,
        'action_required', true,
        'feedback_request', true
    )
FROM recent_groups rg
INNER JOIN public.group_members gm ON gm.group_id = rg.id
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.group_feedback gf 
    WHERE gf.group_id = rg.id 
      AND gf.user_id = gm.user_id
);
```

**Active:** ✅ ON

Click **"Create job"**

---

## ✅ Job 3: Weekly Matches Thursday

**For the matching algorithm, you have 2 options:**

### Option A: Direct SQL (Simple Version - Groups of 4)

**Name:**
```
weekly_matches_thursday
```

**Schedule:**
```
0 16 * * 4
```
(Every Thursday at 4:00 PM UTC)

**Command:**
```sql
-- Create a simple matching function
DO $$
DECLARE
    matchable_users UUID[];
    group_size INT := 4;
    group_count INT := 0;
    i INT;
    new_group_id UUID;
    current_members UUID[];
BEGIN
    -- Get all matchable user IDs
    SELECT ARRAY_AGG(user_id)
    INTO matchable_users
    FROM public.profiles
    WHERE is_matchable = true;

    -- If we have users to match
    IF array_length(matchable_users, 1) >= 2 THEN
        -- Create groups of 4
        FOR i IN 1..array_length(matchable_users, 1) BY group_size LOOP
            current_members := matchable_users[i:LEAST(i+group_size-1, array_length(matchable_users, 1))];
            
            -- Only create group if we have at least 2 members
            IF array_length(current_members, 1) >= 2 THEN
                -- Create new group
                INSERT INTO public.groups (name, description)
                VALUES (
                    'Group ' || (group_count + 1) || ' - ' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
                    'Matched on ' || TO_CHAR(NOW(), 'Month DD, YYYY')
                )
                RETURNING id INTO new_group_id;
                
                -- Add members to group
                INSERT INTO public.group_members (group_id, user_id, role)
                SELECT new_group_id, unnest(current_members), 'member';
                
                -- Send notifications
                INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
                SELECT 
                    unnest(current_members),
                    'group',
                    '🎉 You''ve been matched!',
                    'You''ve been added to a new group. Check it out and start connecting!',
                    '/dashboard/groups/' || new_group_id,
                    jsonb_build_object(
                        'group_id', new_group_id,
                        'match_date', NOW()
                    );
                
                group_count := group_count + 1;
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Created % groups with matchable users', group_count;
    ELSE
        RAISE NOTICE 'Not enough matchable users (need at least 2)';
    END IF;
END $$;
```

**Active:** ✅ ON

---

### Option B: Use Supabase Edge Function (Recommended for Complex Matching)

If you need advanced matching with compatibility scores:

**Name:**
```
weekly_matches_thursday
```

**Schedule:**
```
0 16 * * 4
```

**Command:**
```sql
SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-matching',
    headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer YOUR_ANON_KEY'
    ),
    body:=jsonb_build_object()
);
```

Then create an Edge Function at `supabase/functions/weekly-matching/index.ts` with your custom matching algorithm.

---

## 🎯 After Creating All Jobs

### 1. Verify Jobs Are Created

Go back to **Integrations** → **Cron** and you should see:

| Name | Schedule | Next Run | Status |
|------|----------|----------|--------|
| weekly-matching-day-reminder | 0 16 * * 4 | Next Thursday 4PM | ✅ Active |
| weekly-feedback-request | 0 10 * * 1 | Next Monday 10AM | ✅ Active |
| weekly_matches_thursday | 0 16 * * 4 | Next Thursday 4PM | ✅ Active |

### 2. Test a Job Manually

You can test by running the SQL command directly in the SQL Editor:

```sql
-- Test the reminder job
INSERT INTO public.notifications (user_id, type, title, message, link)
SELECT 
    p.user_id,
    'system',
    'TEST: Matching Day Reminder! 🎯',
    'This is a test notification',
    '/dashboard/profile'
FROM public.profiles p
WHERE p.is_matchable = true
LIMIT 1;
```

Then check your notifications table:
```sql
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 Monitor Your Cron Jobs

### View Job History

In Supabase SQL Editor:
```sql
SELECT 
    jobid,
    jobname,
    schedule,
    active
FROM cron.job
ORDER BY jobname;
```

### View Recent Runs
```sql
SELECT 
    j.jobname,
    jr.status,
    jr.start_time,
    jr.end_time,
    jr.return_message
FROM cron.job j
LEFT JOIN cron.job_run_details jr ON j.jobid = jr.jobid
ORDER BY jr.start_time DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Jobs Not Appearing?
- Make sure pg_cron extension is enabled: `CREATE EXTENSION IF NOT EXISTS pg_cron;`
- Check your database permissions

### Notifications Not Sending?
- Verify the `notifications` table exists
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'notifications';`
- Test the SQL command manually in SQL Editor

### Wrong Time?
- Remember: Cron uses UTC time
- Convert your local time to UTC
- Use [crontab.guru](https://crontab.guru/) to validate expressions

---

## 💡 Next Steps

1. ✅ Create all 3 cron jobs in Supabase Dashboard
2. ✅ Test each job manually by running the SQL
3. ✅ Verify notifications are created
4. ⏳ Wait for the scheduled time to see automatic execution
5. ⏳ Monitor the job history for any errors

---

## 📚 Resources

- [Supabase Cron Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Cron Expression Guide](https://crontab.guru/)
- Your API endpoints: `app/api/cron/*/route.ts` (for reference)

---

**Need help?** The SQL commands above work directly with your database and don't require the API endpoints. They're simpler and more reliable for basic tasks!


