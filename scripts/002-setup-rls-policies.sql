-- Drop all existing policies first to avoid conflicts
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

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for pending_sign_ins
CREATE POLICY "Users can view own pending sign-ins" ON pending_sign_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending sign-ins" ON pending_sign_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own sign-ins" ON pending_sign_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending sign-ins" ON pending_sign_ins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update pending sign-ins" ON pending_sign_ins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for attendance_records
CREATE POLICY "Users can view own attendance" ON attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attendance" ON attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert attendance records" ON attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON pending_sign_ins TO authenticated;
GRANT ALL ON pending_sign_ins TO service_role;
GRANT ALL ON attendance_records TO authenticated;
GRANT ALL ON attendance_records TO service_role;
