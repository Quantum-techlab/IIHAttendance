-- Insert sample admin user (you'll need to replace the UUID with actual user ID from auth.users)
-- This is just for reference - you'll need to sign up through the app first

-- Sample function to create test notifications (for development only)
CREATE OR REPLACE FUNCTION create_sample_notifications()
RETURNS void AS $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Get a sample intern user (replace with actual user ID)
  SELECT id INTO sample_user_id FROM profiles WHERE role = 'intern' LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample notifications
    INSERT INTO notifications (user_id, title, message, type) VALUES
    (sample_user_id, 'Welcome!', 'Welcome to the IIH Attendance System. Please sign in daily during weekdays.', 'info'),
    (sample_user_id, 'Reminder', 'Don''t forget to sign out when leaving the Hub.', 'info');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- You can call this function after creating your first intern user:
-- SELECT create_sample_notifications();
