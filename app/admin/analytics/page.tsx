"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Users, Calendar, AlertTriangle, Download } from "lucide-react"

interface AttendanceAnalytics {
  dailyAttendance: { date: string; count: number }[]
  weeklyTrends: { week: string; present: number; absent: number }[]
  internStats: { name: string; present: number; missed: number; rate: number }[]
  monthlyOverview: { month: string; totalDays: number; presentDays: number; absentDays: number }[]
}

export default function AnalyticsPage() {
  const { profile, signOut } = useAuth()
  const [analytics, setAnalytics] = useState<AttendanceAnalytics>({
    dailyAttendance: [],
    weeklyTrends: [],
    internStats: [],
    monthlyOverview: [],
  })
  const [timeRange, setTimeRange] = useState("30") // days
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(timeRange))

      // Fetch daily attendance counts
      const { data: dailyData, error: dailyError } = await supabase
        .from("attendance_records")
        .select("sign_in_date")
        .gte("sign_in_date", startDate.toISOString().split("T")[0])
        .lte("sign_in_date", endDate.toISOString().split("T")[0])

      if (dailyError) throw dailyError

      // Process daily attendance
      const dailyMap = new Map()
      dailyData?.forEach((record) => {
        const date = record.sign_in_date
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
      })

      const dailyAttendance = Array.from(dailyMap.entries())
        .map(([date, count]) => ({
          date: formatDate(new Date(date)),
          count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Fetch intern statistics
      const { data: internData, error: internError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          attendance_records (
            sign_in_date
          )
        `)
        .eq("role", "intern")

      if (internError) throw internError

      // Calculate intern stats
      const internStats =
        internData?.map((intern) => {
          const presentDays = intern.attendance_records?.length || 0
          const totalWorkdays = Math.floor((Number.parseInt(timeRange) * 5) / 7) // Approximate weekdays
          const missedDays = Math.max(0, totalWorkdays - presentDays)
          const rate = totalWorkdays > 0 ? Math.round((presentDays / totalWorkdays) * 100) : 0

          return {
            name: intern.full_name,
            present: presentDays,
            missed: missedDays,
            rate,
          }
        }) || []

      setAnalytics({
        dailyAttendance,
        weeklyTrends: [], // Simplified for now
        internStats,
        monthlyOverview: [], // Simplified for now
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    const csvContent = [
      ["Intern Name", "Present Days", "Missed Days", "Attendance Rate"],
      ...analytics.internStats.map((stat) => [
        stat.name,
        stat.present.toString(),
        stat.missed.toString(),
        `${stat.rate}%`,
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-600">Attendance insights and trends</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportAnalytics} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.internStats.length}</div>
                    <p className="text-xs text-muted-foreground">Active interns</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Attendance Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.internStats.length > 0
                        ? Math.round(
                            analytics.internStats.reduce((sum, stat) => sum + stat.rate, 0) /
                              analytics.internStats.length,
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">At-Risk Interns</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.internStats.filter((stat) => stat.rate < 80).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Below 80% attendance</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Perfect Attendance</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.internStats.filter((stat) => stat.rate >= 95).length}
                    </div>
                    <p className="text-xs text-muted-foreground">95%+ attendance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Attendance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Attendance Trends</CardTitle>
                  <CardDescription>Number of interns signing in each day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dailyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Intern Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Intern Attendance Performance</CardTitle>
                  <CardDescription>Individual attendance rates and missed days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.internStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#2563eb" name="Attendance Rate %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Intern Stats Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Intern Statistics</CardTitle>
                  <CardDescription>Complete breakdown of attendance by intern</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Intern Name</th>
                          <th className="text-center p-2">Present Days</th>
                          <th className="text-center p-2">Missed Days</th>
                          <th className="text-center p-2">Attendance Rate</th>
                          <th className="text-center p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.internStats.map((stat, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{stat.name}</td>
                            <td className="text-center p-2 text-green-600">{stat.present}</td>
                            <td className="text-center p-2 text-red-600">{stat.missed}</td>
                            <td className="text-center p-2">
                              <span
                                className={`font-medium ${stat.rate >= 95 ? "text-green-600" : stat.rate >= 80 ? "text-yellow-600" : "text-red-600"}`}
                              >
                                {stat.rate}%
                              </span>
                            </td>
                            <td className="text-center p-2">
                              {stat.rate >= 95 ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  Excellent
                                </span>
                              ) : stat.rate >= 80 ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                  Good
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">At Risk</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
