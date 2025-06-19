"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Database, Wifi, WifiOff } from "lucide-react"

export default function TestSignupPage() {
  const [testResults, setTestResults] = useState<{ [key: string]: boolean | string }>({})
  const [loading, setLoading] = useState(false)
  const [envStatus, setEnvStatus] = useState<{
    hasSupabaseUrl: boolean
    hasSupabaseKey: boolean
    isConfigured: boolean
  }>({
    hasSupabaseUrl: false,
    hasSupabaseKey: false,
    isConfigured: false,
  })
  const { signUp } = useAuth()

  useEffect(() => {
    // Check environment variables
    const hasUrl = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url"
    )
    const hasKey = !!(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key"
    )

    setEnvStatus({
      hasSupabaseUrl: hasUrl,
      hasSupabaseKey: hasKey,
      isConfigured: hasUrl && hasKey,
    })
  }, [])

  const runTests = async () => {
    setLoading(true)
    setTestResults({})

    // Test 1: Try to create a test intern account
    try {
      const testEmail = `test-intern-${Date.now()}@example.com`
      const { error } = await signUp(testEmail, "password123", {
        full_name: "Test Intern",
        role: "intern",
      })

      if (error) {
        setTestResults((prev) => ({
          ...prev,
          internSignup: `Failed: ${error.message}`,
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          internSignup: true,
        }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        internSignup: `Error: ${error}`,
      }))
    }

    // Test 2: Try to create a test admin account
    try {
      const testEmail = `test-admin-${Date.now()}@example.com`
      const { error } = await signUp(testEmail, "password123", {
        full_name: "Test Admin",
        role: "admin",
      })

      if (error) {
        setTestResults((prev) => ({
          ...prev,
          adminSignup: `Failed: ${error.message}`,
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          adminSignup: true,
        }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        adminSignup: `Error: ${error}`,
      }))
    }

    setLoading(false)
  }

  const getResultIcon = (result: boolean | string) => {
    if (result === true) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getResultText = (result: boolean | string) => {
    if (result === true) {
      return "Success"
    } else {
      return typeof result === "string" ? result : "Unknown error"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-6">
          {/* Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Environment Status</span>
              </CardTitle>
              <CardDescription>Check if Supabase environment variables are configured</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Connection Mode</span>
                <div className="flex items-center space-x-2">
                  {envStatus.isConfigured ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-orange-600" />
                  )}
                  <Badge variant={envStatus.isConfigured ? "default" : "secondary"}>
                    {envStatus.isConfigured ? "Supabase" : "Mock Mode"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Supabase URL</span>
                  <div className="flex items-center space-x-2">
                    {envStatus.hasSupabaseUrl ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <Badge variant={envStatus.hasSupabaseUrl ? "default" : "destructive"} className="text-xs">
                      {envStatus.hasSupabaseUrl ? "Set" : "Missing"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Supabase Anon Key</span>
                  <div className="flex items-center space-x-2">
                    {envStatus.hasSupabaseKey ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <Badge variant={envStatus.hasSupabaseKey ? "default" : "destructive"} className="text-xs">
                      {envStatus.hasSupabaseKey ? "Set" : "Missing"}
                    </Badge>
                  </div>
                </div>
              </div>

              {!envStatus.isConfigured && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Running in mock mode. The system will simulate authentication without connecting to Supabase. To use
                    real Supabase, set up your environment variables.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Test Section */}
          <Card>
            <CardHeader>
              <CardTitle>Signup System Test</CardTitle>
              <CardDescription>
                Test the signup functionality in {envStatus.isConfigured ? "Supabase" : "mock"} mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  This page creates test accounts to verify the signup process.
                  {envStatus.isConfigured
                    ? " The accounts will be created in your Supabase database."
                    : " In mock mode, accounts are stored locally for testing."}
                </AlertDescription>
              </Alert>

              <Button onClick={runTests} disabled={loading} className="w-full">
                {loading ? "Running Tests..." : "Run Signup Tests"}
              </Button>

              {Object.keys(testResults).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Test Results:</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Intern Signup Test</div>
                        <div className="text-sm text-gray-600">Creating intern account with profile</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {testResults.internSignup && getResultIcon(testResults.internSignup)}
                        <span className="text-sm">
                          {testResults.internSignup && getResultText(testResults.internSignup)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Admin Signup Test</div>
                        <div className="text-sm text-gray-600">Creating admin account with profile</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {testResults.adminSignup && getResultIcon(testResults.adminSignup)}
                        <span className="text-sm">
                          {testResults.adminSignup && getResultText(testResults.adminSignup)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {Object.values(testResults).every((result) => result === true) && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        All tests passed! The signup system is working correctly in{" "}
                        {envStatus.isConfigured ? "Supabase" : "mock"} mode. You can now proceed to test the actual
                        signup pages.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">Next Steps:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>1. If tests pass, try the actual signup pages:</div>
                  <div className="ml-4">
                    <a href="/auth/intern/signup" className="text-blue-600 hover:underline">
                      • Intern Signup
                    </a>
                  </div>
                  <div className="ml-4">
                    <a href="/auth/admin/signup" className="text-blue-600 hover:underline">
                      • Admin Signup (use code: IIH-ADMIN-2024)
                    </a>
                  </div>
                  {envStatus.isConfigured ? (
                    <>
                      <div>2. Check the Supabase dashboard to see if profiles were created</div>
                      <div>3. Test the login functionality with real authentication</div>
                    </>
                  ) : (
                    <>
                      <div>2. In mock mode, you can use these test accounts:</div>
                      <div className="ml-4 text-xs">• intern@iih.ng / password123</div>
                      <div className="ml-4 text-xs">• admin@iih.ng / admin123</div>
                      <div>3. To use real Supabase, set up your environment variables</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
