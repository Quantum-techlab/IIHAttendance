"use client"

let supabaseClient: any = null

export async function getSupabase() {
  if (supabaseClient) return supabaseClient

  // Dynamically import Supabase only when needed
  const { createClient } = await import("@supabase/supabase-js")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string | null
          intern_id: string | null
          role: "intern" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone_number?: string | null
          intern_id?: string | null
          role?: "intern" | "admin"
        }
        Update: {
          email?: string
          full_name?: string
          phone_number?: string | null
          intern_id?: string | null
          role?: "intern" | "admin"
        }
      }
      pending_sign_ins: {
        Row: {
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
        Insert: {
          user_id: string
          sign_in_time: string
          sign_out_time?: string | null
          sign_in_date: string
          status?: "pending" | "approved" | "rejected"
          admin_notes?: string | null
          approved_by?: string | null
        }
        Update: {
          sign_out_time?: string | null
          status?: "pending" | "approved" | "rejected"
          admin_notes?: string | null
          approved_by?: string | null
        }
      }
      attendance_records: {
        Row: {
          id: string
          user_id: string
          sign_in_time: string
          sign_out_time: string | null
          sign_in_date: string
          total_hours: number | null
          created_at: string
        }
        Insert: {
          user_id: string
          sign_in_time: string
          sign_out_time?: string | null
          sign_in_date: string
          total_hours?: number | null
        }
        Update: {
          sign_out_time?: string | null
          total_hours?: number | null
        }
      }
    }
  }
}
