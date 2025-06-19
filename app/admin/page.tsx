"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTime, formatDate, calculateHours } from "@/lib/utils"
import { Clock, Users, CheckCircle, XCircle, Eye, Download, Filter, BarChart3 } from "lucide-react"
import Link from "next/link"

interface PendingRecord {
  id: string
  user_id: string
  sign_in_time: string
  sign_out_time: string | null
  sign_in_date: string
  status: "pending" | "approved" | "rejected"
  admin_notes: string | null
  user_profile: {
    full_name: string
    email: string
    intern_id: string | null
  }
}

interface AdminStats {
  totalInterns: number
  pendingReviews: number
  todayAttendance: number
  thisWeekAttendance: number
}

export default function AdminDashboard() {
  const { profile, signOut, isSupabaseConfigured } = useAuth()
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([])
  const [allRecords, setAllRecords] = useState<PendingRecord[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalInterns: 0,
    pendingReviews: 0,
    todayAttendance: 0,
    thisWeekAttendance: 0,
  })
  const [selectedRecord, setSelectedRecord] = useState<PendingRecord | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState("")

  const getSupabaseClient = async () => {
    try {
      const supabaseModule = await import("@/lib/supabase")
      return supabaseModule.supabase
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchPendingRecords()
      fetchAllRecords()
      fetchAdminStats()
    } else {
      // Mock data for testing
      setMockData()
    }
  }, [isSupabaseConfigured])

  const setMockData = () => {
    const mockRecords: PendingRecord[] = [
      {
        id: "1",
        user_id: "user1",
        sign_in_time: new Date().toISOString(),
        sign_out_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        sign_in_date: new Date().toISOString().split("T")[0],
        status: "pending",
        admin_notes: null,
        user_profile: {
          full_name: "John Doe",
          email: "john@example.com",
          intern_id: "INT001",
        },
      },
      {
        id: "2",
        user_id: "user2",
        sign_in_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sign_out_time: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        sign_in_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "approved",
        admin_notes: "Good work",
        user_profile: {
          full_name: "Jane Smith",
          email: "jane@example.com",
          intern_id: "INT002",
        },
      },
    ]

    setPendingRecords(mockRecords.filter((r) => r.status === "pending"))
    setAllRecords(mockRecords)
    setStats({
      totalInterns: 5,
      pendingReviews: 1,
      todayAttendance: 3,
      thisWeekAttendance: 12,
    })
  }

  const fetchPendingRecords = async () => {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        setMockData()
        return
      }

      const { data, error } = await supabase
        .from("pending_sign_ins")
        .select(`
        id,
        user_id,
        sign_in_time,
        sign_out_time,
        sign_in_date,
        status,
        admin_notes,
        profiles!pending_sign_ins_user_id_fkey (
          full_name,
          email,
          intern_id
        )
      `)
        .eq("status", "pending")
        .order("sign_in_date", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        setMockData()
        return
      }

      // Transform the data to match expected structure
      const transformedData =
        data?.map((record) => ({
          ...record,
          user_profile: record.profiles,
        })) || []

      setPendingRecords(transformedData)
    } catch (error) {
      console.error("Error fetching pending records:", error)
      setMockData()
    }
  }

  const fetchAllRecords = async () => {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        setMockData()
        return
      }

      let query = supabase
        .from("pending_sign_ins")
        .select(`
          id,
          user_id,
          sign_in_time,
          sign_out_time,
          sign_in_date,
          status,
          admin_notes,
          profiles!pending_sign_ins_user_id_fkey (
            full_name,
            email,
            intern_id
          )
        `)
        .order("sign_in_date", { ascending: false })
        .limit(50)

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus)
      }

      if (filterDate) {
        query = query.eq("sign_in_date", filterDate)
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase error:", error)
        setMockData()
        return
      }

      const transformedData =
        data?.map((record) => ({
          ...record,
          user_profile: record.profiles,
        })) || []

      setAllRecords(transformedData)
    } catch (error) {
      console.error("Error fetching all records:", error)
      setMockData()
    }
  }

  const fetchAdminStats = async () => {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        setStats({
          totalInterns: 5,
          pendingReviews: 1,
          todayAttendance: 3,
          thisWeekAttendance: 12,
        })
        return
      }

      const today = new Date().toISOString().split("T")[0]
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
      const weekStartString = weekStart.toISOString().split("T")[0]

      const { count: totalInterns } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "intern")

      const { count: pendingReviews } = await supabase
        .from("pending_sign_ins")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      const { count: todayAttendance } = await supabase
        .from("pending_sign_ins")
        .select("*", { count: "exact", head: true })
        .eq("sign_in_date", today)

      const { count: thisWeekAttendance } = await supabase
        .from("pending_sign_ins")
        .select("*", { count: "exact", head: true })
        .gte("sign_in_date", weekStartString)

      setStats({
        totalInterns: totalInterns || 0,
        pendingReviews: pendingReviews || 0,
        todayAttendance: todayAttendance || 0,
        thisWeekAttendance: thisWeekAttendance || 0,
      })
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      setStats({
        totalInterns: 5,
        pendingReviews: 1,
        todayAttendance: 3,
        thisWeekAttendance: 12,
      })
    }
  }

  const handleApprove = async (recordId: string, notes?: string) => {
    if (!profile) return

    setLoading(true)
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        setMockData()
        return
      }

      const { error: updateError } = await supabase
        .from("pending_sign_ins")
        .update({
          status: "approved",
          admin_notes: notes || null,
          approved_by: profile.id,
        })
        .eq("id", recordId)

      if (updateError) throw updateError

      const record = pendingRecords.find((r) => r.id === recordId) || allRecords.find((r) => r.id === recordId)
      if (record && record.sign_out_time) {
        const totalHours = calculateHours(record.sign_in_time, record.sign_out_time)

        const { error: insertError } = await supabase.from("attendance_records").insert({
          user_id: record.user_id,
          sign_in_time: record.sign_in_time,
          sign_out_time: record.sign_out_time,
          sign_in_date: record.sign_in_date,
          total_hours: totalHours,
        })

        if (insertError) throw insertError
      }

      fetchPendingRecords()
      fetchAllRecords()
      fetchAdminStats()

      setDialogOpen(false)
      setSelectedRecord(null)
      setAdminNotes("")
    } catch (error) {
      console.error("Error approving record:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (recordId: string, notes: string) => {
    if (!profile) return

    if (!notes.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setLoading(true)
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        setMockData()
        return
      }

      const { error } = await supabase
        .from("pending_sign_ins")
        .update({
          status: "rejected",
          admin_notes: notes,
          approved_by: profile.id,
        })
        .eq("id", recordId)

      if (error) throw error

      fetchPendingRecords()
      fetchAllRecords()
      fetchAdminStats()

      setDialogOpen(false)
      setSelectedRecord(null)
      setAdminNotes("")
    } catch (error) {
      console.error("Error rejecting record:", error)
    } finally {
      setLoading(false)
    }
  }

  const openReviewDialog = (record: PendingRecord) => {
    setSelectedRecord(record)
    setAdminNotes("")
    setDialogOpen(true)
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Intern Name", "Intern ID", "Sign In", "Sign Out", "Duration", "Status", "Admin Notes"],
      ...allRecords.map((record) => [
        record.sign_in_date,
        record.user_profile.full_name,
        record.user_profile.intern_id || "",
        formatTime(new Date(record.sign_in_time)),
        record.sign_out_time ? formatTime(new Date(record.sign_out_time)) : "",
        record.sign_out_time ? `${calculateHours(record.sign_in_time, record.sign_out_time)}h` : "",
        record.status,
        record.admin_notes || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchAllRecords()
    }
  }, [filterStatus, filterDate, isSupabaseConfigured])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Manage intern attendance {!isSupabaseConfigured && "(Mock Mode)"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href="/admin/analytics">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInterns}</div>
                <p className="text-xs text-muted-foreground">Registered interns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.todayAttendance}</div>
                <p className="text-xs text-muted-foreground">Sign-ins today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.thisWeekAttendance}</div>
                <p className="text-xs text-muted-foreground">Weekly attendance</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters & Export</span>
                </span>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Filter</Label>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    placeholder="Select date"
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterStatus("all")
                      setFilterDate("")
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {pendingRecords.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pending Attendance Reviews</CardTitle>
                <CardDescription>Review and approve or reject intern attendance entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{record.user_profile.full_name}</h3>
                          {record.user_profile.intern_id && (
                            <Badge variant="outline">{record.user_profile.intern_id}</Badge>
                          )}
                          {getStatusBadge(record.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{formatDate(new Date(record.sign_in_date))}</p>
                        <p className="text-sm text-gray-600">
                          In: {formatTime(new Date(record.sign_in_time))}
                          {record.sign_out_time && <span> • Out: {formatTime(new Date(record.sign_out_time))}</span>}
                          {record.sign_out_time && (
                            <span> • Duration: {calculateHours(record.sign_in_time, record.sign_out_time)}h</span>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openReviewDialog(record)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Attendance Records</CardTitle>
              <CardDescription>Complete attendance history with filters applied</CardDescription>
            </CardHeader>
            <CardContent>
              {allRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No records found with current filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{record.user_profile.full_name}</h3>
                          {record.user_profile.intern_id && (
                            <Badge variant="outline">{record.user_profile.intern_id}</Badge>
                          )}
                          {getStatusBadge(record.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{formatDate(new Date(record.sign_in_date))}</p>
                        <p className="text-sm text-gray-600">
                          In: {formatTime(new Date(record.sign_in_time))}
                          {record.sign_out_time && <> • Out: {formatTime(new Date(record.sign_out_time))}</>}
                          {record.sign_out_time && (
                            <> • Duration: {calculateHours(record.sign_in_time, record.sign_out_time)}h</>
                          )}
                        </p>
                        {record.admin_notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Notes:</strong> {record.admin_notes}
                          </p>
                        )}
                      </div>
                      {record.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openReviewDialog(record)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Review Attendance Entry</DialogTitle>
              <DialogDescription>Review and approve or reject this attendance entry</DialogDescription>
            </DialogHeader>

            {selectedRecord && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedRecord.user_profile.full_name}</h4>
                  <p className="text-sm text-gray-600">{selectedRecord.user_profile.email}</p>
                  {selectedRecord.user_profile.intern_id && (
                    <Badge variant="outline">{selectedRecord.user_profile.intern_id}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Date:</strong> {formatDate(new Date(selectedRecord.sign_in_date))}
                  </p>
                  <p className="text-sm">
                    <strong>Sign In:</strong> {formatTime(new Date(selectedRecord.sign_in_time))}
                  </p>
                  {selectedRecord.sign_out_time && (
                    <>
                      <p className="text-sm">
                        <strong>Sign Out:</strong> {formatTime(new Date(selectedRecord.sign_out_time))}
                      </p>
                      <p className="text-sm">
                        <strong>Duration:</strong>{" "}
                        {calculateHours(selectedRecord.sign_in_time, selectedRecord.sign_out_time)} hours
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this attendance entry..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRecord && handleReject(selectedRecord.id, adminNotes)}
                disabled={loading || !adminNotes.trim()}
              >
                <XCircle className="w-4 h-4 mr-1" />
                {loading ? "Rejecting..." : "Reject"}
              </Button>
              <Button onClick={() => selectedRecord && handleApprove(selectedRecord.id, adminNotes)} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-1" />
                {loading ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
