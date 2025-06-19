-- Fix RLS policies to avoid infinite recursion
-- Drop all existing policies first
DO $$ 
BEGIN
  -- Drop profiles policies
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
  DROP POLICY IF EXISTS "Enable read access for users to own profile" ON profiles;
  DROP POLICY IF EXISTS "Enable read access for admins to all profiles" ON profiles;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON profiles;
  DROP POLICY IF EXISTS "Enable update access for users to own profile" ON profiles;

  -- Drop pending_sign_ins policies
  DROP POLICY IF EXISTS "Users can view own pending sign-ins" ON pending_sign_ins;
  DROP POLICY IF EXISTS "Admins can view all pending sign-ins" ON pending_sign_ins;
  DROP POLICY IF EXISTS "Users can insert own sign-ins" ON pending_sign_ins;
  DROP POLICY IF EXISTS "Users can update own pending sign-ins" ON pending_sign_ins;
  DROP POLICY IF EXISTS "Admins can update pending sign-ins" ON pending_sign_ins;

  -- Drop attendance_records policies
  DROP POLICY IF EXISTS "Users can view own attendance" ON attendance_records;
  DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance_records;
  DROP POLICY IF EXISTS "Admins can insert attendance records" ON attendance_records;
END $$;

-- Create simplified RLS policies that avoid recursion

-- Profiles table policies (simplified to avoid recursion)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pending sign-ins policies
CREATE POLICY "pending_sign_ins_select_own" ON pending_sign_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pending_sign_ins_select_admin" ON pending_sign_ins
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
    )
  );

CREATE POLICY "pending_sign_ins_insert_own" ON pending_sign_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pending_sign_ins_update_own" ON pending_sign_ins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pending_sign_ins_update_admin" ON pending_sign_ins
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
    )
  );

-- Attendance records policies
CREATE POLICY "attendance_records_select_own" ON attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "attendance_records_select_admin" ON attendance_records
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
    )
  );

CREATE POLICY "attendance_records_insert_admin" ON attendance_records
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON pending_sign_ins TO authenticated;
GRANT ALL ON pending_sign_ins TO service_role;
GRANT ALL ON attendance_records TO authenticated;
GRANT ALL ON attendance_records TO service_role;

-- Create a function to check if user is admin (to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin policies to use the function
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "pending_sign_ins_select_admin" ON pending_sign_ins;
CREATE POLICY "pending_sign_ins_select_admin" ON pending_sign_ins
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "pending_sign_ins_update_admin" ON pending_sign_ins;
CREATE POLICY "pending_sign_ins_update_admin" ON pending_sign_ins
  FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "attendance_records_select_admin" ON attendance_records;
CREATE POLICY "attendance_records_select_admin" ON attendance_records
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "attendance_records_insert_admin" ON attendance_records;
CREATE POLICY "attendance_records_insert_admin" ON attendance_records
  FOR INSERT WITH CHECK (is_admin(auth.uid()));
