-- Safely fix RLS policies to avoid infinite recursion
-- This script handles existing policies gracefully

-- Function to safely drop policies if they exist
CREATE OR REPLACE FUNCTION drop_policy_if_exists(policy_name text, table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if policy doesn't exist
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop all existing policies safely
SELECT drop_policy_if_exists('Users can view own profile', 'profiles');
SELECT drop_policy_if_exists('Admins can view all profiles', 'profiles');
SELECT drop_policy_if_exists('Users can update own profile', 'profiles');
SELECT drop_policy_if_exists('Users can insert own profile', 'profiles');
SELECT drop_policy_if_exists('Service role can insert profiles', 'profiles');
SELECT drop_policy_if_exists('Enable read access for users to own profile', 'profiles');
SELECT drop_policy_if_exists('Enable read access for admins to all profiles', 'profiles');
SELECT drop_policy_if_exists('Enable insert access for authenticated users', 'profiles');
SELECT drop_policy_if_exists('Enable update access for users to own profile', 'profiles');
SELECT drop_policy_if_exists('profiles_select_own', 'profiles');
SELECT drop_policy_if_exists('profiles_select_admin', 'profiles');
SELECT drop_policy_if_exists('profiles_insert_own', 'profiles');
SELECT drop_policy_if_exists('profiles_update_own', 'profiles');

-- Drop pending_sign_ins policies
SELECT drop_policy_if_exists('Users can view own pending sign-ins', 'pending_sign_ins');
SELECT drop_policy_if_exists('Admins can view all pending sign-ins', 'pending_sign_ins');
SELECT drop_policy_if_exists('Users can insert own sign-ins', 'pending_sign_ins');
SELECT drop_policy_if_exists('Users can update own pending sign-ins', 'pending_sign_ins');
SELECT drop_policy_if_exists('Admins can update pending sign-ins', 'pending_sign_ins');
SELECT drop_policy_if_exists('pending_sign_ins_select_own', 'pending_sign_ins');
SELECT drop_policy_if_exists('pending_sign_ins_select_admin', 'pending_sign_ins');
SELECT drop_policy_if_exists('pending_sign_ins_insert_own', 'pending_sign_ins');
SELECT drop_policy_if_exists('pending_sign_ins_update_own', 'pending_sign_ins');
SELECT drop_policy_if_exists('pending_sign_ins_update_admin', 'pending_sign_ins');

-- Drop attendance_records policies
SELECT drop_policy_if_exists('Users can view own attendance', 'attendance_records');
SELECT drop_policy_if_exists('Admins can view all attendance', 'attendance_records');
SELECT drop_policy_if_exists('Admins can insert attendance records', 'attendance_records');
SELECT drop_policy_if_exists('attendance_records_select_own', 'attendance_records');
SELECT drop_policy_if_exists('attendance_records_select_admin', 'attendance_records');
SELECT drop_policy_if_exists('attendance_records_insert_admin', 'attendance_records');

-- Create helper function to check admin status (avoids recursion)
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the user's role directly from auth.users metadata
  SELECT (auth.jwt() ->> 'user_metadata' ->> 'role') INTO user_role;
  
  -- If not in metadata, check profiles table with a simple query
  IF user_role IS NULL THEN
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simple, non-recursive RLS policies

-- Profiles policies
CREATE POLICY "profiles_own_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pending sign-ins policies
CREATE POLICY "pending_own_select" ON pending_sign_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pending_admin_select" ON pending_sign_ins
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "pending_own_insert" ON pending_sign_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pending_own_update" ON pending_sign_ins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pending_admin_update" ON pending_sign_ins
  FOR UPDATE USING (auth.is_admin());

-- Attendance records policies
CREATE POLICY "attendance_own_select" ON attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "attendance_admin_select" ON attendance_records
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "attendance_admin_insert" ON attendance_records
  FOR INSERT WITH CHECK (auth.is_admin());

-- Clean up the helper function
DROP FUNCTION IF EXISTS drop_policy_if_exists(text, text);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON pending_sign_ins TO authenticated;
GRANT ALL ON pending_sign_ins TO service_role;
GRANT ALL ON attendance_records TO authenticated;
GRANT ALL ON attendance_records TO service_role;
