"use client"

interface PendingSignIn {
  id: string
  user_id: string
  sign_in_time: string
  sign_out_time: string | null
  sign_in_date: string
  status: "pending" | "approved" | "rejected"
  admin_notes: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

interface AttendanceRecord {
  id: string
  user_id: string
  sign_in_time: string
  sign_out_time: string | null
  sign_in_date: string
  total_hours: number | null
  created_at: string
}

// Mock data storage
const mockPendingSignIns: PendingSignIn[] = [
  {
    id: "pending-1",
    user_id: "intern-1",
    sign_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    sign_out_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    sign_in_date: new Date().toISOString().split("T")[0],
    status: "pending",
    admin_notes: null,
    approved_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockAttendanceRecords: AttendanceRecord[] = []

export const mockAttendanceService = {
  // Get pending sign-ins for a user
  getPendingSignIns: async (userId: string): Promise<PendingSignIn[]> => {
    return mockPendingSignIns.filter((record) => record.user_id === userId)
  },

  // Get today's record for a user
  getTodayRecord: async (userId: string, date: string): Promise<PendingSignIn | null> => {
    return mockPendingSignIns.find((record) => record.user_id === userId && record.sign_in_date === date) || null
  },

  // Create sign-in record
  createSignIn: async (userId: string, signInTime: string, date: string): Promise<{ error: any }> => {
    const existing = mockPendingSignIns.find((record) => record.user_id === userId && record.sign_in_date === date)

    if (existing) {
      return { error: { message: "Already signed in today" } }
    }

    const newRecord: PendingSignIn = {
      id: `pending-${Date.now()}`,
      user_id: userId,
      sign_in_time: signInTime,
      sign_out_time: null,
      sign_in_date: date,
      status: "pending",
      admin_notes: null,
      approved_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockPendingSignIns.push(newRecord)
    return { error: null }
  },

  // Update sign-out time
  updateSignOut: async (recordId: string, signOutTime: string): Promise<{ error: any }> => {
    const record = mockPendingSignIns.find((r) => r.id === recordId)
    if (!record) {
      return { error: { message: "Record not found" } }
    }

    record.sign_out_time = signOutTime
    record.updated_at = new Date().toISOString()
    return { error: null }
  },

  // Get all pending records (for admin)
  getAllPendingRecords: async (): Promise<
    (PendingSignIn & { profiles: { full_name: string; email: string; intern_id: string | null } })[]
  > => {
    // Mock profile data
    const profileMap: { [key: string]: { full_name: string; email: string; intern_id: string | null } } = {
      "intern-1": { full_name: "John Doe", email: "intern@iih.ng", intern_id: "IIH-2024-001" },
      "admin-1": { full_name: "Admin User", email: "admin@iih.ng", intern_id: null },
    }

    return mockPendingSignIns
      .filter((record) => record.status === "pending")
      .map((record) => ({
        ...record,
        profiles: profileMap[record.user_id] || { full_name: "Unknown", email: "unknown@example.com", intern_id: null },
      }))
  },

  // Approve record
  approveRecord: async (recordId: string, adminId: string, notes?: string): Promise<{ error: any }> => {
    const record = mockPendingSignIns.find((r) => r.id === recordId)
    if (!record) {
      return { error: { message: "Record not found" } }
    }

    record.status = "approved"
    record.approved_by = adminId
    record.admin_notes = notes || null
    record.updated_at = new Date().toISOString()

    // If complete, add to attendance records
    if (record.sign_out_time) {
      const signInTime = new Date(record.sign_in_time)
      const signOutTime = new Date(record.sign_out_time)
      const totalHours = Math.round(((signOutTime.getTime() - signInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100

      const attendanceRecord: AttendanceRecord = {
        id: `attendance-${Date.now()}`,
        user_id: record.user_id,
        sign_in_time: record.sign_in_time,
        sign_out_time: record.sign_out_time,
        sign_in_date: record.sign_in_date,
        total_hours: totalHours,
        created_at: new Date().toISOString(),
      }

      mockAttendanceRecords.push(attendanceRecord)
    }

    return { error: null }
  },

  // Reject record
  rejectRecord: async (recordId: string, adminId: string, notes: string): Promise<{ error: any }> => {
    const record = mockPendingSignIns.find((r) => r.id === recordId)
    if (!record) {
      return { error: { message: "Record not found" } }
    }

    record.status = "rejected"
    record.approved_by = adminId
    record.admin_notes = notes
    record.updated_at = new Date().toISOString()

    return { error: null }
  },
}
