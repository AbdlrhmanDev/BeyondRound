# 🕐 Cron Jobs API Endpoints

This directory contains API endpoints that are triggered by pg_cron scheduled jobs.

## 📋 Available Endpoints

### 1. Weekly Matches (`/api/cron/weekly-matches`)
**Schedule:** Every Thursday at 4:00 PM UTC  
**Cron:** `0 16 * * 4`  
**Purpose:** Creates weekly matches for all matchable users

**What it does:**
- Fetches all users with `is_matchable = true`
- Groups them based on matching algorithm (currently groups of 4)
- Creates groups in the database
- Sends notifications to matched users
- Logs the activity

**Response:**
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

---

### 2. Weekly Reminder (`/api/cron/weekly-reminder`)
**Schedule:** Every Thursday at 4:00 PM UTC  
**Cron:** `0 16 * * 4`  
**Purpose:** Reminds matchable users about upcoming matching

**What it does:**
- Fetches all users with `is_matchable = true`
- Sends reminder notification to update profiles before matching
- Links to profile page

**Response:**
```json
{
  "success": true,
  "message": "Weekly reminders sent successfully",
  "notificationsSent": 20,
  "timestamp": "2024-11-03T16:00:00.000Z"
}
```

---

### 3. Feedback Request (`/api/cron/feedback-request`)
**Schedule:** Every Monday at 10:00 AM UTC  
**Cron:** `0 10 * * 1`  
**Purpose:** Requests feedback from group members after weekend meetings

**What it does:**
- Finds groups created 3-7 days ago
- Identifies members who haven't submitted feedback
- Sends feedback request notifications

**Response:**
```json
{
  "success": true,
  "message": "Feedback requests sent successfully",
  "groupsProcessed": 5,
  "notificationsSent": 15,
  "timestamp": "2024-11-03T10:00:00.000Z"
}
```

---

## 🔐 Security

All endpoints require the `CRON_SECRET` environment variable for authentication.

**Request Format:**
```bash
curl -X POST 'https://your-app.com/api/cron/weekly-matches' \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Add to `.env.local`:**
```env
CRON_SECRET=your-secure-random-string-here
```

---

## 🧪 Testing Manually

You can test these endpoints manually using curl or Postman:

```bash
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

---

## 📝 Database Setup

1. **Enable pg_cron:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. **Run the cron schedule migration:**
   ```bash
   psql -d your_database -f supabase/migrations/20251103_schedule_cron_jobs.sql
   ```

3. **Set environment variables in Supabase:**
   - `SUPABASE_URL`: Your Supabase project URL
   - `CRON_SECRET`: Your secure cron secret

---

## 🔍 Monitoring

### View Scheduled Jobs
```sql
SELECT * FROM cron.job;
```

### View Job History
```sql
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### Unschedule a Job
```sql
SELECT cron.unschedule('weekly_matches_thursday');
```

---

## 🛠️ Customization

### Change Schedule Time

Edit the cron expression in `supabase/migrations/20251103_schedule_cron_jobs.sql`:

```sql
-- Change from Thursday 4 PM to Friday 5 PM
SELECT cron.schedule(
    'weekly_matches_thursday',
    '0 17 * * 5',  -- 5:00 PM on Friday
    $$...$$
);
```

### Modify Matching Algorithm

Edit the matching logic in `app/api/cron/weekly-matches/route.ts`:

```typescript
// TODO: Implement your matching algorithm
const groups = yourMatchingAlgorithm(matchableUsers);
```

---

## 📚 Related Files

- **Migrations:**
  - `supabase/migrations/20251103_enable_pg_cron.sql`
  - `supabase/migrations/20251103_schedule_cron_jobs.sql`

- **API Routes:**
  - `app/api/cron/weekly-matches/route.ts`
  - `app/api/cron/weekly-reminder/route.ts`
  - `app/api/cron/feedback-request/route.ts`

---

## 🚨 Troubleshooting

### Cron Job Not Running?

1. Check if pg_cron is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check job status:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'weekly_matches_thursday';
   ```

3. Check for errors in job history:
   ```sql
   SELECT * FROM cron.job_run_details WHERE status = 'failed';
   ```

### 401 Unauthorized Error

- Verify `CRON_SECRET` is set in both:
  - Your Next.js app environment variables
  - The cron job curl command uses `$$CRON_SECRET`

### Notifications Not Sending

- Check if notifications table exists
- Verify RLS policies allow inserts
- Check API logs for errors

---

## 💡 Best Practices

1. **Always test locally first** before deploying to production
2. **Monitor job_run_details** for failures
3. **Use idempotent operations** (safe to run multiple times)
4. **Log all important actions** to activity_logs
5. **Handle errors gracefully** with try/catch blocks
6. **Keep jobs lightweight** - if processing takes > 5 minutes, consider splitting

---

## 🔗 Resources

- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Supabase Cron Guide](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Cron Expression Generator](https://crontab.guru/)


