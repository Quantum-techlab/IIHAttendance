"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, AlertTriangle } from "lucide-react"

export default function AdminSignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    adminCode: "", // Special code for admin registration
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signUp } = useAuth()
  const router = useRouter()

  // In a real application, this should be stored securely and configurable
  const ADMIN_REGISTRATION_CODE = "IIH-ADMIN-2024"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (formData.adminCode !== ADMIN_REGISTRATION_CODE) {
      setError("Invalid admin registration code. Please contact the system administrator.")
      setLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone_number: formData.phoneNumber || undefined,
      role: "admin",
    })

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      // Redirect to confirmation page
      router.push("/auth/confirm/admin")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Admin Account</CardTitle>
          <CardDescription>Set up your IIH Attendance admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Admin registration requires a special code. Contact the system administrator if you don't have one.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Registration Code</Label>
              <Input
                id="adminCode"
                type="password"
                value={formData.adminCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminCode: e.target.value }))}
                required
                placeholder="Enter admin registration code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                placeholder="admin@iih.ng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
                placeholder="At least 6 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                placeholder="Confirm your password"
              />
            </div>

            <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={loading}>
              {loading ? "Creating Admin Account..." : "Create Admin Account"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an admin account?{" "}
                <Link href="/auth/admin/login" className="text-slate-700 hover:text-slate-900 font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
