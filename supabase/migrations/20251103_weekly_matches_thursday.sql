-- ============================================
-- Weekly Matches Thursday - Create Groups
-- Runs every Thursday at 4:00 PM UTC
-- ============================================

SELECT cron.schedule(
    'weekly_matches_thursday',
    '0 16 * * 4',
    $$
    DO $matching$
    DECLARE
        matchable_users UUID[];
        group_size INT := 4;
        group_count INT := 0;
        i INT;
        new_group_id UUID;
        current_members UUID[];
    BEGIN
        -- Get all matchable users
        SELECT ARRAY_AGG(user_id)
        INTO matchable_users
        FROM public.profiles
        WHERE is_matchable = true;

        -- If we have at least 2 users to match
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
                    
                    -- Add members to the group
                    INSERT INTO public.group_members (group_id, user_id, role)
                    SELECT new_group_id, unnest(current_members), 'member';
                    
                    -- Send notifications to all matched members
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
            
            RAISE NOTICE 'Weekly matching completed: Created % groups with % matchable users', 
                         group_count, array_length(matchable_users, 1);
        ELSE
            RAISE NOTICE 'Weekly matching skipped: Not enough matchable users (need at least 2)';
        END IF;
    END $matching$;
    $$
);

COMMENT ON EXTENSION pg_cron IS 'Weekly matching job scheduled every Thursday at 4:00 PM UTC';
