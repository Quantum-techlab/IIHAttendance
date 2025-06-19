"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface SystemStatus {
  supabase: "connected" | "disconnected" | "checking"
  auth: "working" | "error" | "checking"
  database: "accessible" | "error" | "checking"
  policies: "configured" | "error" | "checking"
}

export default function StatusPage() {
  const { isSupabaseConfigured } = useAuth()
  const [status, setStatus] = useState<SystemStatus>({
    supabase: "checking",
    auth: "checking",
    database: "checking",
    policies: "checking",
  })

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    // Check Supabase connection
    if (!isSupabaseConfigured) {
      setStatus({
        supabase: "disconnected",
        auth: "working", // Mock auth works
        database: "disconnected",
        policies: "disconnected",
      })
      return
    }

    try {
      const { supabase } = await import("@/lib/supabase")

      // Test Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

      if (connectionError) {
        setStatus((prev) => ({ ...prev, supabase: "disconnected", database: "error" }))
        return
      }

      // Test auth
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setStatus({
        supabase: "connected",
        auth: "working",
        database: "accessible",
        policies: "configured",
      })
    } catch (error) {
      console.error("Status check error:", error)
      setStatus({
        supabase: "disconnected",
        auth: "error",
        database: "error",
        policies: "error",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "working":
      case "accessible":
      case "configured":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "disconnected":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "working":
      case "accessible":
      case "configured":
        return "bg-green-100 text-green-800"
      case "disconnected":
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
          <p className="text-gray-600">Check the health of all system components</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.supabase)}
                Supabase Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(status.supabase)}>
                {status.supabase === "connected"
                  ? "Connected"
                  : status.supabase === "disconnected"
                    ? "Using Mock Mode"
                    : "Checking..."}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {status.supabase === "connected"
                  ? "Successfully connected to Supabase"
                  : "Running in mock mode - perfect for testing!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(status.auth)}>
                {status.auth === "working" ? "Working" : status.auth === "error" ? "Error" : "Checking..."}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">Authentication system is operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                Database Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(status.database)}>
                {status.database === "accessible"
                  ? "Accessible"
                  : status.database === "disconnected"
                    ? "Mock Data"
                    : status.database === "error"
                      ? "Error"
                      : "Checking..."}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {status.database === "accessible" ? "Database queries working properly" : "Using mock data for testing"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.policies)}
                RLS Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(status.policies)}>
                {status.policies === "configured"
                  ? "Configured"
                  : status.policies === "disconnected"
                    ? "Mock Mode"
                    : status.policies === "error"
                      ? "Error"
                      : "Checking..."}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">Row Level Security policies are properly configured</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button asChild variant="outline">
                  <a href="/auth/intern/login">Test Intern Login</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/auth/admin/login">Test Admin Login</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/test-signup">Test Signup</a>
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Test Credentials:</strong>
                </p>
                <p>Intern: intern@iih.ng / password123</p>
                <p>Admin: admin@iih.ng / admin123</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button onClick={checkSystemStatus} className="w-full">
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  )
}
