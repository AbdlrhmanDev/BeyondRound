# 🕐 Cron Jobs Quick Reference

## 📅 Schedule Overview

| Job Name | Day | Time (UTC) | Endpoint | Purpose |
|----------|-----|-----------|----------|---------|
| `weekly_matches_thursday` | Thursday | 4:00 PM | `/api/cron/weekly-matches` | Create weekly matches |
| `weekly-matching-day-reminder` | Thursday | 4:00 PM | `/api/cron/weekly-reminder` | Send matching reminders |
| `weekly-feedback-request` | Monday | 10:00 AM | `/api/cron/feedback-request` | Request feedback |

---

## 📊 Visual Timeline

```
SUNDAY
└── 6:00 PM → (Future: Inactive user reminder)

MONDAY
└── 10:00 AM → 💭 Feedback Request
              └── Targets: Groups from last weekend
              └── Action: Request feedback from members

TUESDAY
└── (No scheduled jobs)

WEDNESDAY
└── (No scheduled jobs)

THURSDAY
└── 4:00 PM → 📢 Matching Reminder + 🎯 Create Matches
              ├── Reminder: Update your profile!
              └── Matching: Create new groups

FRIDAY
└── (No scheduled jobs)

SATURDAY
└── (No scheduled jobs - Weekend meetups happen!)
```

---

## 🎯 Weekly Flow

### Thursday 4:00 PM
1. **Reminder sent** to all matchable users
2. **Matches created** immediately after
3. **Groups formed** with 4 members each
4. **Notifications sent** to all matched users

### Friday - Sunday
- Users see their new groups
- Members plan weekend meetup
- Groups meet over the weekend

### Monday 10:00 AM
- **Feedback requests** sent to members who met
- Users share their experience
- Data collected for future matching improvements

---

## 🔧 Common Commands

### View All Jobs
```sql
SELECT * FROM cron.job ORDER BY jobname;
```

### View Job History
```sql
SELECT jobname, status, start_time, return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Test Endpoint Manually
```bash
curl -X POST 'http://localhost:3000/api/cron/weekly-matches' \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Unschedule a Job
```sql
SELECT cron.unschedule('weekly_matches_thursday');
```

---

## ⚙️ Environment Variables

Add to `.env.local`:
```env
CRON_SECRET=your-secure-random-string
```

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Cron Expression Cheat Sheet

| Expression | Meaning |
|------------|---------|
| `0 16 * * 4` | Every Thursday at 4:00 PM |
| `0 10 * * 1` | Every Monday at 10:00 AM |
| `0 9 * * *` | Every day at 9:00 AM |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 * * 0` | Every Sunday at midnight |

Format: `minute hour day month weekday`
- Minute: 0-59
- Hour: 0-23 (UTC)
- Day: 1-31
- Month: 1-12
- Weekday: 0-6 (0=Sunday)

---

## 🚨 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Job not running | Check `SELECT * FROM cron.job;` |
| 401 Unauthorized | Verify `CRON_SECRET` matches |
| No notifications | Check RLS policies on notifications table |
| Wrong timezone | Cron uses UTC, convert your local time |

---

## 📊 Expected Results

### weekly_matches_thursday
```json
{
  "success": true,
  "matchableUsers": 20,
  "groupsCreated": 5,
  "usersMatched": 20
}
```

### weekly-matching-day-reminder
```json
{
  "success": true,
  "notificationsSent": 20
}
```

### weekly-feedback-request
```json
{
  "success": true,
  "groupsProcessed": 5,
  "notificationsSent": 15
}
```

---

## 🔗 Related Files

- **Setup Guide:** `CRON_SETUP_SUMMARY.md`
- **API Docs:** `app/api/cron/README.md`
- **Migrations:** `supabase/migrations/20251103_*.sql`
- **Routes:** `app/api/cron/*/route.ts`

---

## 💡 Pro Tips

1. Test manually before deploying ✅
2. Monitor `cron.job_run_details` daily 📊
3. Set up alerting for failed jobs 🚨
4. Keep matching algorithm updated 🔄
5. Collect feedback to improve matching 💭

---

**Need detailed info?** Check `CRON_SETUP_SUMMARY.md`  
**Need API reference?** Check `app/api/cron/README.md`


