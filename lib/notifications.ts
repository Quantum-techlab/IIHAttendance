"use client"

import { supabase } from "./supabase"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  created_at: string
}

export const notificationService = {
  // Get notifications for a user
  getNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return []
    }
  },

  // Create a notification
  createNotification: async (
    userId: string,
    title: string,
    message: string,
    type: "info" | "warning" | "error" | "success" = "info",
  ): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        read: false,
      })

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Check for missed days and create notifications
  checkMissedDays: async (): Promise<void> => {
    try {
      // Get all interns
      const { data: interns, error: internsError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "intern")

      if (internsError) throw internsError

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Skip weekends
      if (yesterday.getDay() === 0 || yesterday.getDay() === 6) return

      const yesterdayString = yesterday.toISOString().split("T")[0]

      for (const intern of interns || []) {
        // Check if intern signed in yesterday
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance_records")
          .select("id")
          .eq("user_id", intern.id)
          .eq("sign_in_date", yesterdayString)
          .single()

        if (attendanceError && attendanceError.code !== "PGRST116") {
          console.error("Error checking attendance:", attendanceError)
          continue
        }

        // If no attendance record, create missed day notification
        if (!attendance) {
          await notificationService.createNotification(
            intern.id,
            "Missed Day Alert",
            `You missed attendance on ${yesterday.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}. Please ensure you sign in daily during weekdays.`,
            "warning",
          )
        }
      }
    } catch (error) {
      console.error("Error checking missed days:", error)
    }
  },
}
