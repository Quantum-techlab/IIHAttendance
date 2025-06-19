"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Mail, CheckCircle, ArrowRight } from "lucide-react"

export default function AdminConfirmPage() {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = "/auth/admin/login"
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Check Your Email!</CardTitle>
          <CardDescription>Your admin account has been created successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-slate-200 bg-slate-50">
            <Mail className="h-4 w-4 text-slate-600" />
            <AlertDescription className="text-slate-700">
              We've sent a confirmation email to your inbox. Please click the verification link to activate your admin
              account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Access Granted!</h3>
              <p className="text-gray-600 text-sm">
                Once you've confirmed your email, you can access the admin dashboard to manage intern attendance and
                view analytics.
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                <span>Review and approve attendance entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                <span>View comprehensive analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                <span>Export attendance reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                <span>Manage intern accounts</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/admin/login">
              <Button className="w-full bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900">
                <Shield className="w-4 h-4 mr-2" />
                Go to Admin Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <div className="text-center text-sm text-gray-500">Redirecting automatically in {countdown} seconds...</div>
          </div>

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Didn't receive the email? Check your spam folder.</p>
            <p>
              Need help?{" "}
              <Link href="mailto:admin@iih.ng" className="text-slate-700 hover:underline">
                Contact admin support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
