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
import { GraduationCap, ArrowLeft, AlertTriangle } from "lucide-react"

export default function InternLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signIn(email, password)

    if (error) {
      if (error.includes("Invalid login credentials")) {
        setError("Invalid credentials. For testing, use: intern@iih.ng / password123 or create a new intern account.")
      } else if (error.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before signing in.")
      } else {
        setError(error)
      }
      setLoading(false)
    } else {
      // Redirect will be handled by ProtectedRoute based on user role
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Intern Sign In</CardTitle>
          <CardDescription>Access your IIH internship attendance dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Credentials:</strong> intern@iih.ng / password123
              <br />
              Or create a new intern account to get started.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                New intern?{" "}
                <Link href="/auth/intern/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Create your account
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
