"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  role: "intern" | "admin"
  full_name: string
  phone_number?: string
  intern_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string,
    password: string,
    userData: { full_name: string; phone_number?: string; intern_id?: string; role: "intern" | "admin" },
  ) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isSupabaseConfigured: boolean
  isSupabaseMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Check if Supabase is properly configured
const checkSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    url &&
    key &&
    url !== "your-supabase-url" &&
    url !== "https://placeholder.supabase.co" &&
    key !== "your-supabase-anon-key" &&
    key !== "placeholder-key" &&
    url.includes("supabase.co")
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSupabaseConfigured] = useState(checkSupabaseConfig())

  useEffect(() => {
    if (isSupabaseConfigured) {
      initializeSupabaseAuth()
    } else {
      console.warn("Supabase not configured, using mock mode")
      setLoading(false)
    }
  }, [isSupabaseConfigured])

  const initializeSupabaseAuth = async () => {
    try {
      const { supabase } = await import("./supabase")

      // Get initial session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
      }

      if (session?.user) {
        console.log("Found existing session for:", session.user.email)
        setUser(session.user)
        await fetchProfile(session.user.id)
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth event:", event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
          if (!profile) {
            await fetchProfile(session.user.id)
          }
        }
      })

      setLoading(false)
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("Supabase auth initialization error:", error)
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { supabase } = await import("./supabase")

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        if (error.code === "PGRST116") {
          console.log("Profile not found - user may need to complete signup")
        }
        return
      }

      console.log("Profile fetched successfully:", data.email, data.role)
      setProfile(data)
    } catch (error) {
      console.error("Profile fetch error:", error)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase not configured" }
    }

    try {
      const { supabase } = await import("./supabase")
      
      console.log("Attempting sign in for:", email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Invalid email or password. Please check your credentials and try again." }
        } else if (error.message.includes("Email not confirmed")) {
          return { error: "Please check your email and click the confirmation link before signing in." }
        } else if (error.message.includes("Too many requests")) {
          return { error: "Too many login attempts. Please wait a moment and try again." }
        }
        
        return { error: error.message }
      }

      if (data.user) {
        console.log("Sign in successful for:", data.user.email)
        // The auth state change listener will handle setting user and fetching profile
        return {}
      }

      return { error: "Sign in failed - no user returned" }
    } catch (error) {
      console.error("Unexpected sign in error:", error)
      return { error: "An unexpected error occurred. Please try again." }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone_number?: string; intern_id?: string; role: "intern" | "admin" },
  ): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase not configured" }
    }

    try {
      const { supabase } = await import("./supabase")
      
      console.log("Attempting sign up for:", email, "as", userData.role)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            intern_id: userData.intern_id,
            role: userData.role,
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        
        if (error.message.includes("User already registered")) {
          return { error: "An account with this email already exists. Please sign in instead." }
        } else if (error.message.includes("Password should be at least")) {
          return { error: "Password must be at least 6 characters long." }
        } else if (error.message.includes("Invalid email")) {
          return { error: "Please enter a valid email address." }
        }
        
        return { error: error.message }
      }

      if (data.user) {
        console.log("Sign up successful for:", data.user.email)
        
        // Create profile manually if the trigger didn't work
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: email.trim().toLowerCase(),
              full_name: userData.full_name,
              phone_number: userData.phone_number,
              intern_id: userData.intern_id,
              role: userData.role,
            })

          if (profileError && !profileError.message.includes("duplicate key")) {
            console.error("Profile creation error:", profileError)
          }
        } catch (profileError) {
          console.error("Manual profile creation failed:", profileError)
        }
      }

      return {}
    } catch (error) {
      console.error("Unexpected sign up error:", error)
      return { error: "An unexpected error occurred. Please try again." }
    }
  }

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      const { supabase } = await import("./supabase")
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
      }
      
      // Clear state regardless of error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Unexpected sign out error:", error)
      // Clear state even if there's an error
      setUser(null)
      setProfile(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isSupabaseConfigured,
        isSupabaseMode: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
