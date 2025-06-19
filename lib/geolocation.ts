// Mock geolocation service for development/testing
class GeolocationService {
  private readonly IIH_COORDINATES = {
    latitude: 6.5244, // Lagos, Nigeria (approximate)
    longitude: 3.3792,
  }

  private readonly MAX_DISTANCE = 100 // meters

  async checkLocation(): Promise<{ allowed: boolean; distance?: number; error?: string }> {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        return {
          allowed: true, // Allow access if geolocation is not supported
          error: "Geolocation not supported by this browser. Access granted by default.",
        }
      }

      // Get current position with timeout and error handling
      const position = await this.getCurrentPosition()

      if (!position) {
        return {
          allowed: true, // Allow access if location can't be determined
          error: "Location access denied or unavailable. Access granted by default.",
        }
      }

      const distance = this.calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        this.IIH_COORDINATES.latitude,
        this.IIH_COORDINATES.longitude,
      )

      const allowed = distance <= this.MAX_DISTANCE

      return {
        allowed,
        distance: Math.round(distance),
        error: allowed
          ? undefined
          : `You are ${Math.round(distance)}m away from IIH. Please be within ${this.MAX_DISTANCE}m to sign in.`,
      }
    } catch (error) {
      console.warn("Geolocation error:", error)
      // In case of any error, allow access by default
      return {
        allowed: true,
        error: "Location verification failed. Access granted by default.",
      }
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000, // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.warn("Geolocation error:", error.message)
          resolve(null) // Return null instead of throwing
        },
        options,
      )
    })
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Mock method for testing
  async mockLocationCheck(withinRange = true): Promise<{ allowed: boolean; distance?: number; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (withinRange) {
      return {
        allowed: true,
        distance: 50,
      }
    } else {
      return {
        allowed: false,
        distance: 150,
        error: "You are 150m away from IIH. Please be within 100m to sign in.",
      }
    }
  }
}

export const geolocationService = new GeolocationService()
