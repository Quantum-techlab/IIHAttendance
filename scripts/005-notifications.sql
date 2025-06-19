-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing notification policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
  DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
END $$;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS handle_updated_at_notifications ON notifications;
CREATE TRIGGER handle_updated_at_notifications BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Create function to automatically check missed days
CREATE OR REPLACE FUNCTION check_missed_days()
RETURNS void AS $$
DECLARE
  intern_record RECORD;
  yesterday_date DATE;
  attendance_exists BOOLEAN;
BEGIN
  -- Get yesterday's date
  yesterday_date := CURRENT_DATE - INTERVAL '1 day';
  
  -- Skip weekends (0 = Sunday, 6 = Saturday)
  IF EXTRACT(DOW FROM yesterday_date) IN (0, 6) THEN
    RETURN;
  END IF;
  
  -- Loop through all interns
  FOR intern_record IN 
    SELECT id, full_name, email 
    FROM profiles 
    WHERE role = 'intern'
  LOOP
    -- Check if intern has attendance record for yesterday
    SELECT EXISTS(
      SELECT 1 FROM attendance_records 
      WHERE user_id = intern_record.id 
      AND sign_in_date = yesterday_date
    ) INTO attendance_exists;
    
    -- If no attendance record, create notification
    IF NOT attendance_exists THEN
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        intern_record.id,
        'Missed Day Alert',
        'You missed attendance on ' || TO_CHAR(yesterday_date, 'Day, Month DD, YYYY') || '. Please ensure you sign in daily during weekdays.',
        'warning'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
