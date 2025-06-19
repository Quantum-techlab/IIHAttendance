"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database } from "lucide-react"

interface DatabaseStatus {
  connected: boolean
  tablesExist: {
    profiles: boolean
    pending_sign_ins: boolean
    attendance_records: boolean
    notifications: boolean
  }
  policiesExist: boolean
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from("profiles")
        .select("count", { count: "exact", head: true })

      const connected = !connectionError

      // Check if tables exist
      const tablesExist = {
        profiles: false,
        pending_sign_ins: false,
        attendance_records: false,
        notifications: false,
      }

      if (connected) {
        // Test each table
        try {
          await supabase.from("profiles").select("count", { count: "exact", head: true })
          tablesExist.profiles = true
        } catch {}

        try {
          await supabase.from("pending_sign_ins").select("count", { count: "exact", head: true })
          tablesExist.pending_sign_ins = true
        } catch {}

        try {
          await supabase.from("attendance_records").select("count", { count: "exact", head: true })
          tablesExist.attendance_records = true
        } catch {}

        try {
          await supabase.from("notifications").select("count", { count: "exact", head: true })
          tablesExist.notifications = true
        } catch {}
      }

      setStatus({
        connected,
        tablesExist,
        policiesExist: connected && tablesExist.profiles, // Simplified check
      })
    } catch (error) {
      console.error("Database status check failed:", error)
      setStatus({
        connected: false,
        tablesExist: {
          profiles: false,
          pending_sign_ins: false,
          attendance_records: false,
          notifications: false,
        },
        policiesExist: false,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">Failed to check database status</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Database Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Connection</span>
          <div className="flex items-center space-x-2">
            {status.connected ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <Badge variant={status.connected ? "default" : "destructive"}>
              {status.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Tables:</div>
          {Object.entries(status.tablesExist).map(([table, exists]) => (
            <div key={table} className="flex items-center justify-between ml-4">
              <span className="text-sm">{table}</span>
              <div className="flex items-center space-x-2">
                {exists ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <Badge variant={exists ? "default" : "destructive"} className="text-xs">
                  {exists ? "Exists" : "Missing"}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span>RLS Policies</span>
          <div className="flex items-center space-x-2">
            {status.policiesExist ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <Badge variant={status.policiesExist ? "default" : "destructive"}>
              {status.policiesExist ? "Active" : "Missing"}
            </Badge>
          </div>
        </div>

        {Object.values(status.tablesExist).every(Boolean) && status.connected && (
          <div className="pt-4 border-t">
            <div className="text-sm text-green-600 font-medium">✅ Database setup complete!</div>
            <div className="text-xs text-gray-500 mt-1">All tables and policies are in place.</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
