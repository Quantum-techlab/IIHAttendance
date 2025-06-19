-- Create profiles table (don't try to modify auth.users directly)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  intern_id TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('intern', 'admin')) DEFAULT 'intern',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pending_sign_ins table for approval workflow
CREATE TABLE IF NOT EXISTS pending_sign_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sign_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sign_out_time TIMESTAMP WITH TIME ZONE,
  sign_in_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sign_in_date)
);

-- Create attendance_records table for approved records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sign_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sign_out_time TIMESTAMP WITH TIME ZONE,
  sign_in_date DATE NOT NULL,
  total_hours DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sign_in_date)
);

-- Create function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_sign_ins_user_date ON pending_sign_ins(user_id, sign_in_date);
CREATE INDEX IF NOT EXISTS idx_pending_sign_ins_status ON pending_sign_ins(status);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_date ON attendance_records(user_id, sign_in_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
