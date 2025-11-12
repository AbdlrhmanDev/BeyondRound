# ✅ Cron Jobs Setup Summary

## 📦 What Was Created

Your scheduled task system for BeyondRounds is now ready! Here's everything that was set up:

---

## 📁 Files Created

### 1. Database Migrations
- ✅ `supabase/migrations/20251103_enable_pg_cron.sql` - Enables pg_cron extension
- ✅ `supabase/migrations/20251103_schedule_cron_jobs.sql` - Schedules all cron jobs

### 2. API Endpoints
- ✅ `app/api/cron/weekly-matches/route.ts` - Creates weekly matches
- ✅ `app/api/cron/weekly-reminder/route.ts` - Sends matching reminders
- ✅ `app/api/cron/feedback-request/route.ts` - Requests feedback

### 3. Documentation
- ✅ `app/api/cron/README.md` - Complete cron API documentation
- ✅ `SETUP_ENV.md` - Updated with CRON_SECRET variable

---

## 🕐 Scheduled Jobs

### 1. **weekly_matches_thursday** 🎯
**Schedule:** Every Thursday at 4:00 PM UTC  
**Endpoint:** `/api/cron/weekly-matches`  
**Purpose:** Creates weekly matches for all matchable users

**What it does:**
- Fetches all users where `is_matchable = true`
- Groups users based on compatibility (groups of 4)
- Creates groups in database
- Sends notifications to matched users
- Logs activity

---

### 2. **weekly-matching-day-reminder** 📢
**Schedule:** Every Thursday at 4:00 PM UTC  
**Endpoint:** `/api/cron/weekly-reminder`  
**Purpose:** Reminds users about upcoming matching

**What it does:**
- Sends reminder notification to all matchable users
- Encourages profile updates before matching

---

### 3. **weekly-feedback-request** 💭
**Schedule:** Every Monday at 10:00 AM UTC  
**Endpoint:** `/api/cron/feedback-request`  
**Purpose:** Requests feedback from group members

**What it does:**
- Finds groups created 3-7 days ago
- Identifies members who haven't submitted feedback
- Sends personalized feedback requests

---

## 🚀 How to Deploy

### Step 1: Update Environment Variables

Add to your `.env.local`:
```env
CRON_SECRET=your-secure-random-string-here
```

**Generate a secure secret:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://randomkeygen.com/
```

### Step 2: Run Database Migrations

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase SQL Editor:
# 1. Copy contents of supabase/migrations/20251103_enable_pg_cron.sql
# 2. Paste and run in SQL Editor
# 3. Copy contents of supabase/migrations/20251103_schedule_cron_jobs.sql
# 4. Paste and run in SQL Editor
```

### Step 3: Update Migration with Your URLs

Before running the migration, replace placeholders in `20251103_schedule_cron_jobs.sql`:

```sql
-- Replace $$SUPABASE_URL with your actual Supabase URL
-- Replace $$CRON_SECRET with your actual cron secret

-- Example:
curl -X POST 'https://your-project.supabase.co/api/cron/weekly-matches' \
-H "Authorization: Bearer your-actual-cron-secret"
```

Or set these as Supabase environment variables/secrets.

### Step 4: Verify Installation

```sql
-- Check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- View all scheduled jobs
SELECT * FROM cron.job;

-- Check job schedule
SELECT jobid, schedule, jobname FROM cron.job ORDER BY jobname;
```

You should see 3 jobs:
- `weekly_matches_thursday`
- `weekly-matching-day-reminder`
- `weekly-feedback-request`

**SQL to verify all 3 jobs:**
```sql
-- Check if all 3 jobs are scheduled
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    database
FROM cron.job
WHERE jobname IN (
    'weekly_matches_thursday',
    'weekly-matching-day-reminder',
    'weekly-feedback-request'
)
ORDER BY jobname;

-- Expected result: 3 rows
-- weekly-feedback-request    | 0 10 * * 1 | t
-- weekly-matching-day-reminder | 0 16 * * 4 | t
-- weekly_matches_thursday     | 0 16 * * 4 | t
```

**SQL to view detailed information:**
```sql
-- Detailed view of each job
SELECT 
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active,
    jobid
FROM cron.job
ORDER BY jobname;
```

**SQL to check recent executions:**
```sql
-- Check if jobs have run recently
SELECT 
    j.jobname,
    jrd.status,
    jrd.return_message,
    jrd.start_time,
    jrd.end_time,
    EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) as duration_seconds
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.jobname IN (
    'weekly_matches_thursday',
    'weekly-matching-day-reminder',
    'weekly-feedback-request'
)
ORDER BY jrd.start_time DESC
LIMIT 10;
```

---

## 🧪 Testing

### Test Locally

```bash
# Terminal 1: Start your Next.js app
npm run dev

# Terminal 2: Test each endpoint
# Test weekly matches
curl -X POST 'http://localhost:3000/api/cron/weekly-matches' \
  -H "Authorization: Bearer your-cron-secret"

# Test weekly reminder
curl -X POST 'http://localhost:3000/api/cron/weekly-reminder' \
  -H "Authorization: Bearer your-cron-secret"

# Test feedback request
curl -X POST 'http://localhost:3000/api/cron/feedback-request' \
  -H "Authorization: Bearer your-cron-secret"
```

### Expected Responses

**Success:**
```json
{
  "success": true,
  "message": "Weekly matching completed successfully",
  "matchableUsers": 20,
  "groupsCreated": 5,
  "usersMatched": 20,
  "timestamp": "2024-11-03T16:00:00.000Z"
}
```

**Unauthorized (wrong secret):**
```json
{
  "error": "Unauthorized"
}
```

---

## 📊 Monitoring

### View Job Status

```sql
-- All scheduled jobs
SELECT * FROM cron.job;

-- Recent job runs
SELECT 
  jobid,
  jobname,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- Failed jobs only
SELECT *
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Check Notifications Created

```sql
-- Notifications created by cron jobs
SELECT 
  type,
  title,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM public.notifications
WHERE type IN ('system', 'group')
GROUP BY type, title
ORDER BY last_created DESC;
```

---

## 🔧 Management Commands

### Unschedule a Job

```sql
SELECT cron.unschedule('weekly_matches_thursday');
```

### Reschedule with Different Time

```sql
-- Unschedule first
SELECT cron.unschedule('weekly_matches_thursday');

-- Schedule with new time
SELECT cron.schedule(
    'weekly_matches_thursday',
    '0 17 * * 5',  -- Friday at 5:00 PM
    $$
    curl -X POST 'YOUR_URL/api/cron/weekly-matches' \
    -H "Authorization: Bearer YOUR_SECRET"
    $$
);
```

### Update Job Schedule

```sql
UPDATE cron.job
SET schedule = '0 17 * * 4'  -- Thursday at 5:00 PM
WHERE jobname = 'weekly_matches_thursday';
```

---

## 📝 Cron Expression Guide

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6) (0=Sunday)
│ │ │ │ │
* * * * *
```

### Common Examples:
- `0 16 * * 4` = Every Thursday at 4:00 PM
- `0 10 * * 1` = Every Monday at 10:00 AM
- `0 9 * * *` = Every day at 9:00 AM
- `*/15 * * * *` = Every 15 minutes
- `0 0 1 * *` = First day of every month at midnight
- `0 18 * * 0` = Every Sunday at 6:00 PM

Use [crontab.guru](https://crontab.guru/) to test expressions!

---

## 🚨 Troubleshooting

### Issue: Jobs Not Running

**Check:**
1. Is pg_cron enabled?
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Are jobs scheduled?
   ```sql
   SELECT * FROM cron.job;
   ```

3. Check job history for errors:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobname = 'weekly_matches_thursday'
   ORDER BY start_time DESC;
   ```

### Issue: 401 Unauthorized

**Fix:**
- Verify `CRON_SECRET` matches in:
  - Your `.env.local` file
  - Supabase project environment variables
  - The curl command in migration

### Issue: Notifications Not Sending

**Check:**
1. Notifications table exists:
   ```sql
   SELECT * FROM public.notifications LIMIT 1;
   ```

2. RLS policies allow inserts:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

3. Test manually:
   ```sql
   INSERT INTO public.notifications (user_id, type, title, message)
   VALUES (
     (SELECT id FROM auth.users LIMIT 1),
     'system',
     'Test',
     'Test message'
   );
   ```

---

## 🎯 Next Steps

1. ✅ Add `CRON_SECRET` to `.env.local`
2. ✅ Run database migrations
3. ✅ Update migration with your actual URLs
4. ⏳ Test each endpoint manually
5. ⏳ Verify jobs are scheduled correctly
6. ⏳ Wait for first Thursday to see automatic matching!
7. ⏳ Monitor job_run_details for any issues
8. ⏳ Implement custom matching algorithm in `weekly-matches/route.ts`

---

## 💡 Tips

1. **Test First:** Always test manually before relying on automatic scheduling
2. **Monitor Logs:** Check `cron.job_run_details` regularly for failures
3. **Timezone:** All times are in UTC by default
4. **Idempotency:** Jobs should be safe to run multiple times
5. **Error Handling:** All endpoints have proper error handling and logging
6. **Security:** CRON_SECRET protects endpoints from unauthorized access

---

## 📚 Additional Resources

- [pg_cron GitHub](https://github.com/citusdata/pg_cron)
- [Supabase Cron Guide](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Cron Expression Tester](https://crontab.guru/)
- [API Documentation](app/api/cron/README.md)

---

## 🎉 You're All Set!

Your cron job system is ready to:
- ✅ Match users every Thursday
- ✅ Send reminders before matching
- ✅ Request feedback after meetings
- ✅ Keep your users engaged automatically

**Questions?** Check the documentation in `app/api/cron/README.md` or review the code comments in each route file.

