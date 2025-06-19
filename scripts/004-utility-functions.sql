-- Create function to check if it's a weekday
CREATE OR REPLACE FUNCTION is_weekday(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXTRACT(DOW FROM check_date) BETWEEN 1 AND 5;
END;
$$ LANGUAGE plpgsql;

-- Create function to get missed days for a user
CREATE OR REPLACE FUNCTION get_missed_days(user_uuid UUID, start_date DATE, end_date DATE)
RETURNS TABLE(missed_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT generate_series(start_date, end_date, '1 day'::interval)::DATE as date
  WHERE EXTRACT(DOW FROM generate_series(start_date, end_date, '1 day'::interval)) BETWEEN 1 AND 5
  AND generate_series(start_date, end_date, '1 day'::interval)::DATE NOT IN (
    SELECT DISTINCT sign_in_date::DATE
    FROM attendance_records
    WHERE user_id = user_uuid
    AND sign_in_date BETWEEN start_date AND end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate attendance statistics
CREATE OR REPLACE FUNCTION get_attendance_stats(user_uuid UUID, start_date DATE, end_date DATE)
RETURNS TABLE(
  total_workdays INTEGER,
  present_days INTEGER,
  missed_days INTEGER,
  attendance_rate DECIMAL
) AS $$
DECLARE
  workdays INTEGER;
  present INTEGER;
  missed INTEGER;
  rate DECIMAL;
BEGIN
  -- Calculate total workdays (Monday to Friday)
  SELECT COUNT(*)::INTEGER INTO workdays
  FROM generate_series(start_date, end_date, '1 day'::interval) AS day
  WHERE EXTRACT(DOW FROM day) BETWEEN 1 AND 5;
  
  -- Calculate present days
  SELECT COUNT(*)::INTEGER INTO present
  FROM attendance_records
  WHERE user_id = user_uuid
  AND sign_in_date BETWEEN start_date AND end_date;
  
  -- Calculate missed days
  missed := workdays - present;
  
  -- Calculate attendance rate
  IF workdays > 0 THEN
    rate := ROUND((present::DECIMAL / workdays::DECIMAL) * 100, 2);
  ELSE
    rate := 0;
  END IF;
  
  RETURN QUERY SELECT workdays, present, missed, rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
