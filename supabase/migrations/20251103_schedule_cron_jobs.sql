-- Grant usage of the cron schema to the postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Grant all privileges on all tables in the cron schema to the postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;


-- Schedule weekly matching day reminder
-- Runs every Thursday at 4:00 PM UTC
SELECT cron.schedule(
    'weekly-matching-day-reminder',
    '0 16 * * 4',
    $$
    curl -X POST '$$SUPABASE_URL/api/cron/weekly-reminder' \
    -H "Authorization: Bearer $$CRON_SECRET"
    $$
);

-- Schedule weekly matches on Thursday
-- Runs every Thursday at 4:00 PM UTC to create weekly matches
SELECT cron.schedule(
    'weekly_matches_thursday',
    '0 16 * * 4',
    $$
    curl -X POST '$$SUPABASE_URL/api/cron/weekly-matches' \
    -H "Authorization: Bearer $$CRON_SECRET"
    $$
);

-- Schedule weekly feedback request
-- Runs every Monday at 10:00 AM UTC
SELECT cron.schedule(
    'weekly-feedback-request',
    '0 10 * * 1',
    $$
    curl -X POST '$$SUPABASE_URL/api/cron/feedback-request' \
    -H "Authorization: Bearer $$CRON_SECRET"
    $$
);

