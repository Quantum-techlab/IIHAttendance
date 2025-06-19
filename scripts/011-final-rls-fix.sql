-- Final RLS fix - safely drop and recreate all policies

-- Function to safely drop a policy if it exists
CREATE OR REPLACE FUNCTION drop_policy_if_exists(table_name text, policy_name text)
RETURNS void AS $$
BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors, policy might not exist
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop all existing policies safely
SELECT drop_policy_if_exists('profiles', 'simple_profiles_select');
SELECT drop_policy_if_exists('profiles', 'simple_profiles_insert');
SELECT drop_policy_if_exists('profiles', 'simple_profiles_update');
SELECT drop_policy_if_exists('profiles', 'Users can view own profile');
SELECT drop_policy_if_exists('profiles', 'Admins can view all profiles');
SELECT drop_policy_if_exists('profiles', 'Users can insert own profile');
SELECT drop_policy_if_exists('profiles', 'Users can update own profile');
SELECT drop_policy_if_exists('profiles', 'profiles_select_own');
SELECT drop_policy_if_exists('profiles', 'profiles_select_admin');
SELECT drop_policy_if_exists('profiles', 'profiles_insert_own');
SELECT drop_policy_if_exists('profiles', 'profiles_update_own');

SELECT drop_policy_if_exists('pending_sign_ins', 'simple_pending_select');
SELECT drop_policy_if_exists('pending_sign_ins', 'simple_pending_insert');
SELECT drop_policy_if_exists('pending_sign_ins', 'simple_pending_update');
SELECT drop_policy_if_exists('pending_sign_ins', 'Users can view own pending sign-ins');
SELECT drop_policy_if_exists('pending_sign_ins', 'Admins can view all pending sign-ins');
SELECT drop_policy_if_exists('pending_sign_ins', 'Users can insert own sign-ins');
SELECT drop_policy_if_exists('pending_sign_ins', 'Users can update own pending sign-ins');
SELECT drop_policy_if_exists('pending_sign_ins', 'Admins can update pending sign-ins');

SELECT drop_policy_if_exists('attendance_records', 'simple_attendance_select');
SELECT drop_policy_if_exists('attendance_records', 'simple_attendance_insert');
SELECT drop_policy_if_exists('attendance_records', 'Users can view own attendance');
SELECT drop_policy_if_exists('attendance_records', 'Admins can view all attendance');
SELECT drop_policy_if_exists('attendance_records', 'Admins can insert attendance records');

-- Create new, clean policies

-- Profiles policies
CREATE POLICY "allow_own_profile_select" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "allow_admin_profile_select" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p2 
            WHERE p2.id = auth.uid() AND p2.role = 'admin'
        )
    );

CREATE POLICY "allow_profile_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_profile_update" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Pending sign-ins policies
CREATE POLICY "allow_own_pending_select" ON pending_sign_ins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_admin_pending_select" ON pending_sign_ins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "allow_own_pending_insert" ON pending_sign_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_own_pending_update" ON pending_sign_ins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "allow_admin_pending_update" ON pending_sign_ins
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Attendance records policies
CREATE POLICY "allow_own_attendance_select" ON attendance_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_admin_attendance_select" ON attendance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "allow_admin_attendance_insert" ON attendance_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Clean up the helper function
DROP FUNCTION IF EXISTS drop_policy_if_exists(text, text);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON pending_sign_ins TO authenticated;
GRANT ALL ON pending_sign_ins TO service_role;
GRANT ALL ON attendance_records TO authenticated;
GRANT ALL ON attendance_records TO service_role;
