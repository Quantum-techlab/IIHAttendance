"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { geolocationService } from "@/lib/geolocation"
import { MapPin, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function TestLocationPage() {
  const [locationResult, setLocationResult] = useState<{
    allowed: boolean
    distance?: number
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const testLocation = async () => {
    setLoading(true)
    setLocationResult(null)

    try {
      const result = await geolocationService.checkLocation()
      setLocationResult(result)
    } catch (error) {
      console.error("Location test error:", error)
      setLocationResult({
        allowed: true,
        error: "Location test failed, but access granted by default",
      })
    } finally {
      setLoading(false)
    }
  }

  const testMockLocation = async (withinRange: boolean) => {
    setLoading(true)
    setLocationResult(null)

    try {
      const result = await geolocationService.mockLocationCheck(withinRange)
      setLocationResult(result)
    } catch (error) {
      console.error("Mock location test error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location Service Test</span>
            </CardTitle>
            <CardDescription>Test the geolocation functionality for attendance tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button onClick={testLocation} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Real Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Test Real Location
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => testMockLocation(true)} disabled={loading} variant="outline" className="w-full">
                  Mock: Within Range
                </Button>
                <Button onClick={() => testMockLocation(false)} disabled={loading} variant="outline" className="w-full">
                  Mock: Out of Range
                </Button>
              </div>
            </div>

            {locationResult && (
              <Alert
                className={locationResult.allowed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}
              >
                {locationResult.allowed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <div className={locationResult.allowed ? "text-green-700" : "text-yellow-700"}>
                      <strong>Status:</strong> {locationResult.allowed ? "✓ Allowed" : "⚠ Not Allowed"}
                    </div>
                    {locationResult.distance && (
                      <div className="text-sm">
                        <strong>Distance:</strong> {locationResult.distance}m from IIH
                      </div>
                    )}
                    {locationResult.error && (
                      <div className="text-sm">
                        <strong>Message:</strong> {locationResult.error}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Note:</strong> The location service is designed to be permissive in development mode.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>If geolocation is not supported, access is granted by default</li>
                <li>If location access is denied, access is granted by default</li>
                <li>Only blocks access if clearly outside the allowed range</li>
                <li>Uses Lagos, Nigeria coordinates as the reference point</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
