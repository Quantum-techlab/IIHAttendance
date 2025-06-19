-- Test script to verify RLS policies are working correctly

-- This script will help you verify that the policies are set up correctly
-- Run this after setting up the RLS policies

-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'pending_sign_ins', 'attendance_records');

-- List all policies for our tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'pending_sign_ins', 'attendance_records')
ORDER BY tablename, policyname;

-- Check if we have any sample data
SELECT 'profiles' as table_name, count(*) as row_count FROM profiles
UNION ALL
SELECT 'pending_sign_ins' as table_name, count(*) as row_count FROM pending_sign_ins
UNION ALL
SELECT 'attendance_records' as table_name, count(*) as row_count FROM attendance_records;
