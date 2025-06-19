import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Shield, ArrowLeft } from "lucide-react"

export default function AuthSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
          <p className="text-gray-600">Select how you'd like to access the IIH Attendance System</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Intern Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">I'm an Intern</CardTitle>
              <CardDescription>
                Track your daily attendance, view your progress, and manage your internship journey at IIH.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Daily sign-in and sign-out
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  View attendance history
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Track your progress
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Receive notifications
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/auth/intern/signup">
                  <Button className="w-full">Create Intern Account</Button>
                </Link>
                <Link href="/auth/intern/login">
                  <Button variant="outline" className="w-full">
                    Sign In as Intern
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">I'm an Administrator</CardTitle>
              <CardDescription>
                Manage intern attendance, approve entries, view analytics, and oversee the internship program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-slate-700 rounded-full mr-2"></div>
                  Approve/reject attendance
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-slate-700 rounded-full mr-2"></div>
                  View analytics dashboard
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-slate-700 rounded-full mr-2"></div>
                  Manage intern accounts
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-slate-700 rounded-full mr-2"></div>
                  Export reports
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/auth/admin/signup">
                  <Button className="w-full bg-slate-700 hover:bg-slate-800">Create Admin Account</Button>
                </Link>
                <Link href="/auth/admin/login">
                  <Button variant="outline" className="w-full">
                    Sign In as Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
