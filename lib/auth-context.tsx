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
    key !== "placeholder-key"
  )
}

// Mock users for testing
const mockUsers = [
  {
    email: "intern@iih.ng",
    password: "password123",
    role: "intern" as const,
    full_name: "Test Intern",
    phone_number: "+234 123 456 7890",
    intern_id: "IIH-2024-001",
  },
  {
    email: "admin@iih.ng",
    password: "admin123",
    role: "admin" as const,
    full_name: "Test Admin",
    phone_number: "+234 987 654 3210",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSupabaseConfigured] = useState(checkSupabaseConfig())

  useEffect(() => {
    if (isSupabaseConfigured) {
      initializeSupabaseAuth()
    } else {
      initializeMockAuth()
    }
  }, [isSupabaseConfigured])

  const initializeSupabaseAuth = async () => {
    try {
      const { supabase } = await import("./supabase")

      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await fetchProfileSafely(session.user.id)
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth event:", event, session?.user?.email)
        setUser(session?.user ?? null)

        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          await fetchProfileSafely(session.user.id)
        } else {
          setProfile(null)
        }
      })

      setLoading(false)
      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("Supabase auth error:", error)
      initializeMockAuth()
    }
  }

  const initializeMockAuth = () => {
    try {
      const mockSession = localStorage.getItem("mock-auth-session")
      if (mockSession) {
        const { user: mockUser, profile: mockProfile } = JSON.parse(mockSession)
        setUser(mockUser)
        setProfile(mockProfile)
      }
    } catch (error) {
      console.error("Error parsing mock session:", error)
    }
    setLoading(false)
  }

  const fetchProfileSafely = async (userId: string): Promise<void> => {
    try {
      const { supabase } = await import("./supabase")

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        if (error.code === "PGRST116") {
          console.log("Profile not found - user may need to complete signup")
        }
        return
      }

      console.log("Profile fetched:", data)
      setProfile(data)
    } catch (error) {
      console.error("Profile fetch error:", error)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return mockSignIn(email, password)
    }

    try {
      const { supabase } = await import("./supabase")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase sign in error:", error)

        // If it's invalid credentials and we're using test accounts, try mock mode
        if (error.message.includes("Invalid login credentials")) {
          const mockResult = await mockSignIn(email, password)
          if (!mockResult.error) {
            console.log("Falling back to mock authentication")
            return mockResult
          }
        }

        return { error: error.message }
      }

      console.log("Sign in successful:", data.user?.email)
      // Profile will be fetched by the auth state change listener
      return {}
    } catch (error) {
      console.error("Sign in error:", error)
      // Try mock mode as fallback
      const mockResult = await mockSignIn(email, password)
      if (!mockResult.error) {
        console.log("Falling back to mock authentication due to error")
        return mockResult
      }
      return { error: "Sign in failed" }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone_number?: string; intern_id?: string; role: "intern" | "admin" },
  ): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return mockSignUp(email, password, userData.full_name, userData.role)
    }

    try {
      const { supabase } = await import("./supabase")
      const { error } = await supabase.auth.signUp({
        email,
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
        console.error("Supabase sign up error:", error)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: "Sign up failed" }
    }
  }

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem("mock-auth-session")
      setUser(null)
      setProfile(null)
      return
    }

    try {
      const { supabase } = await import("./supabase")
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const mockSignIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const mockUser = mockUsers.find((u) => u.email === email && u.password === password)
    if (!mockUser) {
      return { error: "Invalid credentials" }
    }

    const mockUserData = {
      id: `mock-${mockUser.role}-${Date.now()}`,
      email: mockUser.email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { role: mockUser.role },
    } as User

    const mockProfile: Profile = {
      id: mockUserData.id,
      email: mockUser.email,
      role: mockUser.role,
      full_name: mockUser.full_name,
      phone_number: mockUser.phone_number,
      intern_id: mockUser.intern_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setUser(mockUserData)
    setProfile(mockProfile)

    localStorage.setItem(
      "mock-auth-session",
      JSON.stringify({
        user: mockUserData,
        profile: mockProfile,
      }),
    )

    return {}
  }

  const mockSignUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "intern" | "admin",
  ): Promise<{ error?: string }> => {
    // In mock mode, immediately sign in after signup
    const mockUserData = {
      id: `mock-${role}-${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { role },
    } as User

    const mockProfile: Profile = {
      id: mockUserData.id,
      email,
      role,
      full_name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Don't auto-login in mock mode for signup - let the confirmation page handle it
    return {}
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
