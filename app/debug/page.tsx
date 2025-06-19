"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function DebugPage() {
  const { user, profile, loading, isSupabaseConfigured, signIn } = useAuth()
  const [testResult, setTestResult] = useState<string>("")

  const testLogin = async () => {
    setTestResult("Testing login...")
    const result = await signIn("intern@iih.ng", "password123")
    if (result.error) {
      setTestResult(`Login failed: ${result.error}`)
    } else {
      setTestResult("Login successful!")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

      <div className="grid gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Supabase Configured:</span>
              <Badge variant={isSupabaseConfigured ? "default" : "secondary"}>
                {isSupabaseConfigured ? "Yes" : "No (Mock Mode)"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Loading:</span>
              <Badge variant={loading ? "secondary" : "default"}>{loading ? "Yes" : "No"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Environment:</span>
              <Badge variant="outline">{typeof window !== "undefined" ? "Client" : "Server"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>User:</span>
              <Badge variant={user ? "default" : "secondary"}>{user ? "Logged In" : "Not Logged In"}</Badge>
            </div>
            {user && (
              <>
                <div className="flex items-center justify-between">
                  <span>User ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.email}</code>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span>Profile:</span>
              <Badge variant={profile ? "default" : "secondary"}>{profile ? "Loaded" : "Not Loaded"}</Badge>
            </div>
            {profile && (
              <>
                <div className="flex items-center justify-between">
                  <span>Name:</span>
                  <span>{profile.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Role:</span>
                  <Badge variant={profile.role === "admin" ? "destructive" : "default"}>{profile.role}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Test Login */}
        <Card>
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testLogin} disabled={loading}>
              Test Intern Login
            </Button>
            {testResult && (
              <div className="p-3 bg-gray-100 rounded">
                <code>{testResult}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>NEXT_PUBLIC_SUPABASE_URL:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "secondary"}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not Set"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "secondary"}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => (window.location.href = "/auth/intern/login")}>
                Intern Login
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/auth/admin/login")}>
                Admin Login
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
                Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
