"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AttendanceCalendar } from "@/components/attendance-calendar"
// Conditional supabase import
import { geolocationService } from "@/lib/geolocation"
import { formatTime, formatDate, getTodayDateString, isWeekday } from "@/lib/utils"
import { Clock, LogIn, LogOut, Calendar, TrendingUp, MapPin, CheckCircle, AlertTriangle, User } from "lucide-react"

// Conditional supabase import
const getSupabaseClient = async () => {
  try {
    const { supabase } = await import("@/lib/supabase")
    return supabase
  } catch {
    return null
  }
}

interface TodayRecord {
  id: string
  sign_in_time: string
  sign_out_time: string | null
  status: "pending" | "approved" | "rejected"
}

interface AttendanceStats {
  thisWeek: number
  thisMonth: number
  total: number
  pendingApprovals: number
}

export default function InternDashboard() {
  const { profile, signOut } = useAuth()
  const [todayRecord, setTodayRecord] = useState<TodayRecord | null>(null)
  const [stats, setStats] = useState<AttendanceStats>({
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    pendingApprovals: 0,
  })
  const [loading, setLoading] = useState(false)
  const [locationCheck, setLocationCheck] = useState<{ allowed: boolean; distance?: number; error?: string } | null>(
    null,
  )
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (profile) {
      fetchTodayRecord()
      fetchStats()
    }
  }, [profile])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchTodayRecord = async () => {
    if (!profile) return

    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Mock mode - use mock data
        setTodayRecord(null)
        return
      }

      const today = getTodayDateString()
      const { data, error } = await supabase
        .from("pending_sign_ins")
        .select("*")
        .eq("user_id", profile.id)
        .eq("sign_in_date", today)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching today's record:", error)
        return
      }

      setTodayRecord(data)
    } catch (error) {
      console.error("Error fetching today's record:", error)
    }
  }

  const fetchStats = async () => {
    if (!profile) return

    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Mock mode - use mock stats
        setStats({
          thisWeek: 3,
          thisMonth: 12,
          total: 45,
          pendingApprovals: 1,
        })
        return
      }

      const today = new Date()
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

      // Get this week's attendance
      const { count: thisWeek } = await supabase
        .from("attendance_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .gte("sign_in_date", weekStart.toISOString().split("T")[0])

      // Get this month's attendance
      const { count: thisMonth } = await supabase
        .from("attendance_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .gte("sign_in_date", monthStart.toISOString().split("T")[0])

      // Get total attendance
      const { count: total } = await supabase
        .from("attendance_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)

      // Get pending approvals
      const { count: pendingApprovals } = await supabase
        .from("pending_sign_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("status", "pending")

      setStats({
        thisWeek: thisWeek || 0,
        thisMonth: thisMonth || 0,
        total: total || 0,
        pendingApprovals: pendingApprovals || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Fallback to mock stats
      setStats({
        thisWeek: 3,
        thisMonth: 12,
        total: 45,
        pendingApprovals: 1,
      })
    }
  }

  const handleSignIn = async () => {
    if (!profile) return

    setLoading(true)

    try {
      // Check location first (with fallback)
      const locationResult = await geolocationService.checkLocation()
      setLocationCheck(locationResult)

      // Always allow sign-in, but show location status
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Mock mode - simulate sign in
        const now = new Date()
        const today = getTodayDateString()

        setTodayRecord({
          id: `mock-${Date.now()}`,
          sign_in_time: now.toISOString(),
          sign_out_time: null,
          status: "pending",
        })
        setLoading(false)
        return
      }

      const now = new Date()
      const today = getTodayDateString()

      const { error } = await supabase.from("pending_sign_ins").insert({
        user_id: profile.id,
        sign_in_time: now.toISOString(),
        sign_in_date: today,
        status: "pending",
      })

      if (error) throw error

      fetchTodayRecord()
      fetchStats()
    } catch (error) {
      console.error("Error signing in:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!profile || !todayRecord) return

    setLoading(true)
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Mock mode - simulate sign out
        setTodayRecord({
          ...todayRecord,
          sign_out_time: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      const now = new Date()

      const { error } = await supabase
        .from("pending_sign_ins")
        .update({ sign_out_time: now.toISOString() })
        .eq("id", todayRecord.id)

      if (error) throw error

      fetchTodayRecord()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const isToday = isWeekday(today)

  return (
    <ProtectedRoute requiredRole="intern">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
                  <p className="text-sm text-gray-600">
                    {formatTime(currentTime)} • {formatDate(today)}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
                <p className="text-xs text-muted-foreground">Days attended</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
                <p className="text-xs text-muted-foreground">Days attended</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Attendance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Today's Attendance</span>
              </CardTitle>
              <CardDescription>
                {isToday ? "Track your attendance for today" : "Attendance tracking is only available on weekdays"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isToday ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Today is a weekend. Attendance tracking is only available Monday through Friday.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {locationCheck && (
                    <Alert
                      className={
                        locationCheck.allowed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                      }
                    >
                      <MapPin className="h-4 w-4" />
                      <AlertDescription>
                        {locationCheck.allowed ? (
                          <span className="text-green-700">
                            ✓ Location verified {locationCheck.distance && `(${locationCheck.distance}m from IIH)`}
                          </span>
                        ) : (
                          <span className="text-yellow-700">⚠ {locationCheck.error}</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {todayRecord ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">Today's Record</h3>
                            <Badge
                              variant={
                                todayRecord.status === "approved"
                                  ? "default"
                                  : todayRecord.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {todayRecord.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Signed in at {formatTime(new Date(todayRecord.sign_in_time))}
                            {todayRecord.sign_out_time && (
                              <> • Signed out at {formatTime(new Date(todayRecord.sign_out_time))}</>
                            )}
                          </p>
                        </div>
                        {!todayRecord.sign_out_time && (
                          <Button onClick={handleSignOut} disabled={loading} variant="outline">
                            <LogOut className="w-4 h-4 mr-2" />
                            {loading ? "Signing Out..." : "Sign Out"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to start your day?</h3>
                      <p className="text-gray-600 mb-4">Sign in to begin tracking your attendance for today.</p>
                      <Button onClick={handleSignIn} disabled={loading} size="lg">
                        <LogIn className="w-5 h-5 mr-2" />
                        {loading ? "Signing In..." : "Sign In"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Calendar */}
          <AttendanceCalendar userId={profile?.id || ""} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
