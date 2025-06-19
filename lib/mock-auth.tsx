"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  email: string
}

type Profile = {
  id: string
  email: string
  full_name: string
  phone_number: string | null
  intern_id: string | null
  role: "intern" | "admin"
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
    email: string,
    password: string,
    userData: { full_name: string; phone_number?: string; intern_id?: string; role: "intern" | "admin" },
  ) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data for demonstration
const mockUsers: { [key: string]: { password: string; profile: Profile } } = {
  "intern@iih.ng": {
    password: "password123",
    profile: {
      id: "intern-1",
      email: "intern@iih.ng",
      full_name: "John Doe",
      phone_number: "+234 123 456 7890",
      intern_id: "IIH-2024-001",
      role: "intern",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  "admin@iih.ng": {
    password: "admin123",
    profile: {
      id: "admin-1",
      email: "admin@iih.ng",
      full_name: "Admin User",
      phone_number: "+234 987 654 3210",
      intern_id: null,
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("mock-user")
    const storedProfile = localStorage.getItem("mock-profile")

    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser))
      setProfile(JSON.parse(storedProfile))
    }

    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const mockUser = mockUsers[email]

    if (!mockUser || mockUser.password !== password) {
      return { error: { message: "Invalid email or password" } }
    }

    const user = { id: mockUser.profile.id, email }
    setUser(user)
    setProfile(mockUser.profile)

    // Store in localStorage for persistence
    localStorage.setItem("mock-user", JSON.stringify(user))
    localStorage.setItem("mock-profile", JSON.stringify(mockUser.profile))

    return { error: null }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; phone_number?: string; intern_id?: string; role: "intern" | "admin" },
  ) => {
    // Check if user already exists
    if (mockUsers[email]) {
      return { error: { message: "User already exists" } }
    }

    // Create new user
    const newProfile: Profile = {
      id: `${userData.role}-${Date.now()}`,
      email,
      full_name: userData.full_name,
      phone_number: userData.phone_number || null,
      intern_id: userData.intern_id || null,
      role: userData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockUsers[email] = {
      password,
      profile: newProfile,
    }

    return { error: null }
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem("mock-user")
    localStorage.removeItem("mock-profile")
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
