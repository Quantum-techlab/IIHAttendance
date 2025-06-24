# 🕒 Intern Attendance System – Ilorin Innovation Hub

A modern, secure, and role-based web application designed to manage and track intern attendance at **Ilorin Innovation Hub**. This system ensures accurate daily tracking, admin approval of attendance, and real-time reporting using Supabase as a backend service.

---

## ✨ Features

### ✅ Interns
- Register using email, name, intern ID, and phone number.
- Sign in/out each day (Monday–Friday).
- View attendance history and missed days.
- Track status of pending sign-ins/outs (awaiting admin approval).

### ✅ Admins
- Secure admin login.
- Approve or reject intern attendance records.
- View all intern profiles and attendance history.
- Access missed days report and attendance dashboard.

---

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Router
- **Backend/Auth**: [Supabase](https://supabase.com)
- **Database**: Supabase Postgres
- **State Management**: React Context + TanStack Query

---

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/Quantum-techlab/IIHAttendance.git
cd IIHAttendance

2. Install Dependencies

npm install
3. Set Up Supabase
Create a project at supabase.com.

Enable email/password authentication.

Copy your Supabase project URL and anon/public key.

Create the necessary database tables using supabase-schema.sql.

Set up environment variables:

VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
4. Start Development Server

npm run dev
🧠 Authentication & Logic
Interns and Admins share the same login page.

During sign-up, users select their role (intern or admin).

Supabase RLS ensures:

Interns access only their data.

Admins manage global data.

Attendance entries must be approved by an admin before they reflect in official records.

🗃️ Database Overview
profiles: User information and role.

pending_sign_ins: Unverified intern sign-in/out entries.

attendance_records: Approved daily attendance.

missed_days (view): Tracks absences for each intern over weekdays.

All tables are protected by Row-Level Security using get_current_user_role().

🔒 Security Highlights
Role-based route protection in React.

Supabase RLS ensures data isolation and admin privileges.

SECURITY DEFINER functions to control visibility based on roles.

📷 UI Screens
🔐 Auth Pages: Sign Up, Log In

📊 Intern Dashboard: View status & history

✅ Admin Dashboard: Approve pending sign-ins

📅 Reports: Missed days, attendance analytics

👨‍💻 Contributing
Fork the repository.

Create your feature branch: git checkout -b feature/feature-name

Commit changes: git commit -m 'Add feature'

Push and open a pull request.

📄 License
This project is licensed under the MIT License.

💡 Future Enhancements
Email notifications for approvals

Export reports to CSV

Face recognition or QR code login

Mobile app version

🙌 Acknowledgments
Supabase for backend and auth

Ilorin Innovation Hub for project inspiration
