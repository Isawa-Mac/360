import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null
  }
  return null
}

/**
 * Parse permissions from cookie
 * Expected format: comma-separated list of permissions like "bi.sales.view,user.profile.view"
 */
export function getPermissionsFromCookie(cookieName: string = "permissions"): string[] {
  const cookieValue = getCookie(cookieName)
  if (!cookieValue) return []

  try {
    // Try to parse as JSON first (in case it's JSON encoded)
    const parsed = JSON.parse(cookieValue)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    // If not JSON, treat as comma-separated string
    return cookieValue.split(",").map((p) => p.trim()).filter(Boolean)
  }


  return []
}

export function checkPermission(permissions: string[] | undefined, requiredPermission: string): boolean {
  if (!permissions || permissions.length === 0) return false

  // Super Admin
  if (permissions.includes("*")) return true

  // Direct match
  if (permissions.includes(requiredPermission)) return true

  // Check with standard patterns
  const parts = requiredPermission.split('.')
  const moduleName = parts[0]
  const scope = parts[1] || moduleName

  const checks = [
    `sso.${moduleName}.${scope}.full`,
    `sso.${moduleName}.${scope}.read`,
    `sso.${moduleName}.${scope}.view`,
    `sso.${moduleName}.${scope}.*`,
    `sso.${moduleName}.*`,
    `${moduleName}.${scope}.full`,
    `${moduleName}.${scope}.read`,
    `${moduleName}.${scope}.view`,
    `${moduleName}.${scope}.*`,
    `${moduleName}.*`,
  ]

  return checks.some(p => permissions.includes(p))
}
