-- Simple RLS fix that works without auth schema access
-- Drop existing policies safely

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
    DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
    DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
    DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
    DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    -- Drop pending_sign_ins policies
    DROP POLICY IF EXISTS "Users can view own pending sign-ins" ON pending_sign_ins;
    DROP POLICY IF EXISTS "Admins can view all pending sign-ins" ON pending_sign_ins;
    DROP POLICY IF EXISTS "Users can insert own sign-ins" ON pending_sign_ins;
    DROP POLICY IF EXISTS "Users can update own pending sign-ins" ON pending_sign_ins;
    DROP POLICY IF EXISTS "Admins can update pending sign-ins" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_sign_ins_select_own" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_sign_ins_select_admin" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_sign_ins_insert_own" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_sign_ins_update_own" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_sign_ins_update_admin" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_own_select" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_admin_select" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_own_insert" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_own_update" ON pending_sign_ins;
    DROP POLICY IF EXISTS "pending_admin_update" ON pending_sign_ins;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    -- Drop attendance_records policies
    DROP POLICY IF EXISTS "Users can view own attendance" ON attendance_records;
    DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance_records;
    DROP POLICY IF EXISTS "Admins can insert attendance records" ON attendance_records;
    DROP POLICY IF EXISTS "attendance_records_select_own" ON attendance_records;
    DROP POLICY IF EXISTS "attendance_records_select_admin" ON attendance_records;
    DROP POLICY IF EXISTS "attendance_records_insert_admin" ON attendance_records;
    DROP POLICY IF EXISTS "attendance_own_select" ON attendance_records;
    DROP POLICY IF EXISTS "attendance_admin_select" ON attendance_records;
    DROP POLICY IF EXISTS "attendance_admin_insert" ON attendance_records;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create simple helper function in public schema
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- Simple check without recursion
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create very simple RLS policies

-- Profiles: Allow users to see their own profile, admins see all
CREATE POLICY "simple_profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "simple_profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "simple_profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pending sign-ins: Users see own, admins see all
CREATE POLICY "simple_pending_select" ON pending_sign_ins
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "simple_pending_insert" ON pending_sign_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "simple_pending_update" ON pending_sign_ins
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Attendance records: Users see own, admins see all and can insert
CREATE POLICY "simple_attendance_select" ON attendance_records
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "simple_attendance_insert" ON attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON pending_sign_ins TO authenticated;
GRANT ALL ON pending_sign_ins TO service_role;
GRANT ALL ON attendance_records TO authenticated;
GRANT ALL ON attendance_records TO service_role;
