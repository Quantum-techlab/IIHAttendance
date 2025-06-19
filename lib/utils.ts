import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5 // Monday = 1, Friday = 5
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

export function calculateHours(signIn: string, signOut: string): number {
  const signInTime = new Date(signIn)
  const signOutTime = new Date(signOut)
  const diffMs = signOutTime.getTime() - signInTime.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100
}
