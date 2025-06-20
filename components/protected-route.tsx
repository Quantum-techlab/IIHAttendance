"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "intern" | "admin"
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to appropriate login
        if (requiredRole === "admin") {
          router.push("/auth/admin/login")
        } else {
          router.push("/auth/intern/login")
        }
        return
      }

      if (requiredRole && profile?.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "intern") {
          router.push("/dashboard")
        } else {
          // No profile yet, redirect to appropriate login
          if (requiredRole === "admin") {
            router.push("/auth/admin/login")
          } else {
            router.push("/auth/intern/login")
          }
        }
        return
      }
    }
  }, [user, profile, loading, requiredRole, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (requiredRole && profile?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}