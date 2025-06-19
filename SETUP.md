# IIH Attendance System Setup Guide

## Prerequisites
1. Supabase project created
2. Environment variables configured in your deployment platform

## Database Setup

Execute the SQL scripts in the following order:

### 1. Initial Schema (scripts/001-initial-schema.sql)
Creates the main tables: profiles, pending_sign_ins, attendance_records
Sets up basic table structure and indexes

### 2. RLS Policies (scripts/002-setup-rls-policies.sql)
Sets up Row Level Security policies for all tables
Grants necessary permissions

### 3. Auth Triggers (scripts/003-auth-triggers.sql)
Creates automatic profile creation when users sign up
Sets up timestamp update triggers

### 4. Utility Functions (scripts/004-utility-functions.sql)
Creates helper functions for date calculations and statistics

### 5. Notifications (scripts/005-notifications.sql)
Creates notifications table and missed day checking function

### 6. Sample Data (scripts/006-sample-data.sql) - Optional
Creates sample notifications for testing

## Environment Variables Required

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Post-Setup Steps

1. **Create Admin User**: Sign up through the app and manually update the role to 'admin' in the profiles table
2. **Test Authentication**: Verify user registration and login work correctly
3. **Test Attendance**: Try signing in/out as an intern
4. **Test Admin Features**: Access admin dashboard and approve/reject attendance

## Troubleshooting

### Common Issues:

1. **"must be owner of table users"**: This is expected - we don't modify auth.users directly
2. **"relation profiles does not exist"**: Run scripts in order, starting with 001-initial-schema.sql
3. **RLS Policy Errors**: Ensure you're running scripts as the database owner in Supabase SQL Editor
4. **Policy already exists**: The new scripts handle this automatically with DROP IF EXISTS

### Manual Admin Creation:
After signing up your first admin user, run:
\`\`\`sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
\`\`\`

## Features Included

- ✅ User authentication with Supabase Auth
- ✅ Role-based access (intern/admin)
- ✅ Weekday-only attendance tracking
- ✅ Admin approval workflow
- ✅ Missed days detection
- ✅ Notifications system
- ✅ Analytics dashboard
- ✅ Calendar view
- ✅ Geolocation validation (optional)
- ✅ CSV export functionality
- ✅ Responsive design
