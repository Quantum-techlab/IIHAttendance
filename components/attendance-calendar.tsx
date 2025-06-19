"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isWeekday } from "@/lib/utils"

interface AttendanceDay {
  date: string
  status: "present" | "absent" | "weekend" | "future"
  signInTime?: string
  signOutTime?: string
}

interface AttendanceCalendarProps {
  userId: string
}

export function AttendanceCalendar({ userId }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [currentDate, userId])

  // Add conditional supabase import
  const getSupabaseClient = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")
      return supabase
    } catch {
      return null
    }
  }

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Mock mode - generate sample calendar data
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const lastDay = new Date(year, month + 1, 0)
        const today = new Date()

        const calendarData: AttendanceDay[] = []

        for (let day = 1; day <= lastDay.getDate(); day++) {
          const date = new Date(year, month, day)
          const dateString = date.toISOString().split("T")[0]

          let status: AttendanceDay["status"]
          if (date > today) {
            status = "future"
          } else if (!isWeekday(date)) {
            status = "weekend"
          } else if (Math.random() > 0.3) {
            // 70% attendance rate for demo
            status = "present"
          } else {
            status = "absent"
          }

          calendarData.push({
            date: dateString,
            status,
            signInTime: status === "present" ? "09:00:00" : undefined,
            signOutTime: status === "present" ? "17:00:00" : undefined,
          })
        }

        setAttendanceData(calendarData)
        setLoading(false)
        return
      }

      // Real Supabase mode - existing logic
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // Fetch attendance records for the month
      const { data: attendanceRecords, error } = await supabase
        .from("attendance_records")
        .select("sign_in_date, sign_in_time, sign_out_time")
        .eq("user_id", userId)
        .gte("sign_in_date", firstDay.toISOString().split("T")[0])
        .lte("sign_in_date", lastDay.toISOString().split("T")[0])

      if (error) throw error

      // Create attendance map
      const attendanceMap = new Map()
      attendanceRecords?.forEach((record) => {
        attendanceMap.set(record.sign_in_date, {
          signInTime: record.sign_in_time,
          signOutTime: record.sign_out_time,
        })
      })

      // Generate calendar data
      const calendarData: AttendanceDay[] = []
      const today = new Date()

      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        const dateString = date.toISOString().split("T")[0]
        const attendance = attendanceMap.get(dateString)

        let status: AttendanceDay["status"]
        if (date > today) {
          status = "future"
        } else if (!isWeekday(date)) {
          status = "weekend"
        } else if (attendance) {
          status = "present"
        } else {
          status = "absent"
        }

        calendarData.push({
          date: dateString,
          status,
          signInTime: attendance?.signInTime,
          signOutTime: attendance?.signOutTime,
        })
      }

      setAttendanceData(calendarData)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDayColor = (status: AttendanceDay["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200"
      case "absent":
        return "bg-red-100 text-red-800 border-red-200"
      case "weekend":
        return "bg-gray-100 text-gray-500 border-gray-200"
      case "future":
        return "bg-gray-50 text-gray-400 border-gray-100"
      default:
        return "bg-white text-gray-900 border-gray-200"
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-32 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                <span>Weekend</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map(
                (_, index) => (
                  <div key={`empty-${index}`} className="p-2"></div>
                ),
              )}

              {/* Calendar days */}
              {attendanceData.map((day, index) => {
                const dayNumber = new Date(day.date).getDate()
                return (
                  <div
                    key={day.date}
                    className={`p-2 border rounded text-center text-sm cursor-pointer hover:opacity-80 transition-opacity ${getDayColor(day.status)}`}
                    title={
                      day.status === "present" && day.signInTime
                        ? `Present - In: ${new Date(day.signInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}${
                            day.signOutTime
                              ? `, Out: ${new Date(day.signOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                              : ""
                          }`
                        : day.status === "absent"
                          ? "Absent"
                          : day.status === "weekend"
                            ? "Weekend"
                            : "Future date"
                    }
                  >
                    {dayNumber}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
