import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  BarChart3,
  GraduationCap,
  Shield,
  CheckCircle,
  Calendar,
  MapPin,
  Bell,
  FileText,
  TrendingUp,
  UserCheck,
  Settings,
  Download,
  ArrowRight,
  Star,
  Zap,
  TestTube,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  IIH Attendance
                </span>
                <div className="text-xs text-gray-500 font-medium">Innovation Hub</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#roles" className="text-gray-600 hover:text-gray-900 transition-colors">
                How It Works
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/test-signup" className="text-gray-600 hover:text-gray-900 transition-colors">
                <TestTube className="w-4 h-4 inline mr-1" />
                Test
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/intern/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Intern Login
                </Button>
              </Link>
              <Link href="/auth/admin/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-slate-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Modern Attendance System
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Smart Attendance
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    for Innovation Hub
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Streamline your internship journey with our intelligent attendance tracking system. Built for the
                  modern workplace at Ilorin Innovation Hub.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/intern/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Start as Intern
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/admin/signup">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-gray-50">
                    <Shield className="w-5 h-5 mr-2" />
                    Admin Access
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure & reliable</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Today's Attendance</h3>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sign In</div>
                          <div className="text-xs text-gray-500">09:00 AM</div>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sign Out</div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Explanations */}
      <section id="roles" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works for Everyone</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system is designed with specific workflows for interns and administrators, ensuring everyone has the
              tools they need to succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Intern Role */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">For Interns</CardTitle>
                    <CardDescription className="text-blue-600 font-medium">
                      Your Daily Attendance Journey
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What You'll Do:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Daily Check-in</div>
                        <div className="text-sm text-gray-600">Sign in when you arrive at IIH (weekdays only)</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Work & Learn</div>
                        <div className="text-sm text-gray-600">Focus on your internship tasks and projects</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Check-out</div>
                        <div className="text-sm text-gray-600">Sign out when leaving for the day</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Features You'll Love:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Calendar view</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Progress tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Smart notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Location verification</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Requirements:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Just your phone!
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Be physically present at IIH during weekdays. The system uses location verification to ensure
                    accurate attendance.
                  </p>
                </div>

                <Link href="/auth/intern/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Start Your Internship Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 to-gray-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900">For Administrators</CardTitle>
                    <CardDescription className="text-slate-600 font-medium">Manage & Monitor with Ease</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Responsibilities:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-slate-600">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Review Attendance</div>
                        <div className="text-sm text-gray-600">Approve or reject daily attendance submissions</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-slate-600">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Monitor Progress</div>
                        <div className="text-sm text-gray-600">Track intern attendance patterns and performance</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-slate-600">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Generate Reports</div>
                        <div className="text-sm text-gray-600">Export data and create comprehensive reports</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Admin Tools:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-gray-700">Analytics dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-gray-700">Approval workflow</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-gray-700">Export reports</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-gray-700">User management</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Requirements:</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      Admin access code
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Requires special admin registration code. Contact IIH management for access credentials.
                  </p>
                </div>

                <Link href="/auth/admin/signup">
                  <Button className="w-full bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900">
                    Access Admin Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Workplaces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to provide a seamless attendance tracking experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Check-In/Out</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  One-click attendance tracking with automatic time logging. Works only during weekdays to match your
                  internship schedule.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Location Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  GPS-based verification ensures attendance is marked only when you're physically present at IIH
                  premises.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Admin Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  All attendance entries require admin approval, ensuring accuracy and preventing fraudulent entries.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Comprehensive analytics for admins to track attendance patterns, identify trends, and generate
                  reports.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Automated alerts for missed days, pending approvals, and important updates to keep everyone informed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Export & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Generate detailed attendance reports in CSV format for record-keeping and performance evaluation.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  <Star className="w-3 h-3 mr-1" />
                  Innovation Hub
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">About Ilorin Innovation Hub</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ilorin Innovation Hub is a leading technology and innovation center dedicated to fostering
                  entrepreneurship, digital skills development, and technological advancement in Ilorin and beyond.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Hands-on Experience</div>
                    <div className="text-gray-600">
                      Real-world project development and cutting-edge technology exposure
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Skill Development</div>
                    <div className="text-gray-600">Comprehensive training programs and mentorship opportunities</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Innovation Focus</div>
                    <div className="text-gray-600">Entrepreneurship support and startup incubation programs</div>
                  </div>
                </div>
              </div>

              <Link
                href="https://iih.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Learn more about IIH
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <Image
                  src="/images/analytics-dashboard.png"
                  alt="IIH Innovation Hub"
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Modern Learning Environment</h3>
                  <p className="text-gray-600 text-sm">
                    State-of-the-art facilities designed to foster innovation and collaboration among interns and
                    professionals.
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Attendance Experience?
            </h2>
            <p className="text-xl text-blue-100">
              Join hundreds of interns and administrators who trust our platform for accurate, efficient attendance
              tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/intern/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Start Your Internship
                </Button>
              </Link>
              <Link href="/auth/admin/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Get Admin Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">IIH Attendance</span>
                  <div className="text-xs text-gray-400">Innovation Hub</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Professional attendance tracking system designed for the modern workplace at Ilorin Innovation Hub.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">For Interns</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/auth/intern/login" className="hover:text-white transition-colors">
                    Intern Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/intern/signup" className="hover:text-white transition-colors">
                    Join as Intern
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">System</h3>
              <div className="space-y-3 text-gray-400">
                <div>
                  <Link href="/test-signup" className="hover:text-white transition-colors">
                    Test Signup System
                  </Link>
                </div>
                <div>
                  <div className="font-medium text-white">Ilorin Innovation Hub</div>
                  <div>Ilorin, Kwara State</div>
                  <div>Nigeria</div>
                </div>
                <Link
                  href="https://iih.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:text-white transition-colors"
                >
                  Visit IIH Website
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ilorin Innovation Hub. All rights reserved. Built with ❤️ for the future of work.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
