-- Simple RLS policies that avoid all recursion
-- This approach uses only basic auth.uid() checks without any subqueries

-- Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
    
    -- Drop all policies on pending_sign_ins table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pending_sign_ins') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON pending_sign_ins';
    END LOOP;
    
    -- Drop all policies on attendance_records table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'attendance_records') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON attendance_records';
    END LOOP;
END $$;

-- Create the simplest possible policies that work

-- PROFILES: Only allow users to see their own profile
CREATE POLICY "profiles_own_only" ON profiles
    FOR ALL USING (auth.uid() = id);

-- PENDING_SIGN_INS: Only allow users to see their own pending sign-ins
CREATE POLICY "pending_own_only" ON pending_sign_ins
    FOR ALL USING (auth.uid() = user_id);

-- ATTENDANCE_RECORDS: Only allow users to see their own attendance
CREATE POLICY "attendance_own_only" ON attendance_records
    FOR ALL USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON pending_sign_ins TO authenticated;
GRANT ALL ON attendance_records TO authenticated;
