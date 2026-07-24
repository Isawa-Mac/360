const DEV_SSO_BASE = 'http://sso.local:8111'
const DEV_SSO_BASE_LOCALHOST = 'http://localhost:8111'
const PROD_SSO_BASE = 'http://sso360.trirex.com:8111'

/**
 * เช็คว่าเป็น development environment หรือไม่ (client-side)
 */
function isDevelopment(): boolean {
  // เช็คจาก environment variable ก่อน
  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv === 'development') {
    return true
  }

  // เช็คว่า NODE_ENV ไม่ใช่ production
  if (nodeEnv !== 'production') {
    return true
  }

  // เช็คจาก window.location (client-side only)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port

    // เช็คว่าเป็น localhost, 127.0.0.1, .local domain หรือ local development
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.includes('.local') ||
      port === '8112' || // LOBBEY-360 dev port
      port === '3000' ||
      port === '3001'
    ) {
      return true
    }

    // ถ้า hostname ไม่ใช่ production domain ให้ถือว่าเป็น dev
    if (!hostname.includes('trirex.com') && !hostname.includes('lobbey360.trirex.com')) {
      return true
    }
  }

  // เช็คจาก environment variable อื่นๆ
  if (process.env.NEXT_PUBLIC_SSO_BASE_URL?.includes('localhost') ||
    process.env.NEXT_PUBLIC_SSO_BASE_URL?.includes('.local')) {
    return true
  }

  return false
}

/**
 * ดึง SSO Base URL ตาม environment (client-side)
 */
function getSSOBaseURL(): string {
  // ถ้ามี environment variable ตั้งค่าไว้ ให้ใช้ก่อน
  if (process.env.NEXT_PUBLIC_SSO_BASE_URL) {
    return process.env.NEXT_PUBLIC_SSO_BASE_URL
  }

  // เช็ค environment และเลือก URL ที่เหมาะสม
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname

    // ถ้าเป็น .local domain ให้ใช้ .local
    if (hostname.includes('.local')) {
      return DEV_SSO_BASE
    }

    // ถ้าเป็น localhost ให้ใช้ localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return DEV_SSO_BASE_LOCALHOST
    }
  }

  const isDev = isDevelopment()
  return isDev ? DEV_SSO_BASE_LOCALHOST : PROD_SSO_BASE
}

const SSO_BASE_URL = getSSOBaseURL()
const SSO_LOGIN_URL = `${SSO_BASE_URL}/login`

export interface SSOSession {
  authenticated: boolean
  user?: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    tenantId?: string
    avatarUrl?: string
    roles?: string[]
    permissions?: string[]
    isSuperAdmin?: boolean
  }
}

export interface RefreshTokenResponse {
  success: boolean
  message: string
  data?: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

/**
 * Decode JWT token (client-side only)
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true

    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch {
    return true
  }
}

/**
 * Get time until token expiration in seconds
 */
export function getTimeUntilExpiration(token: string): number {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return 0

    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const timeUntilExpiration = expirationTime - Date.now()
    return Math.max(0, Math.floor(timeUntilExpiration / 1000))
  } catch {
    return 0
  }
}

/**
 * Check if token is valid format
 */
export function isTokenValid(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  return parts.length === 3
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse | null> {
  try {
    const response = await fetch(`${SSO_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: errorData.message || 'Failed to refresh token',
      }
    }

    const data = await response.json()
    return data as RefreshTokenResponse
  } catch (error) {
    console.error('Error refreshing token:', error)
    return {
      success: false,
      message: 'Network error while refreshing token',
    }
  }
}

export async function checkSSOSession(): Promise<SSOSession | null> {
  try {
    // เช็คว่าอยู่ใน server-side หรือ client-side
    const isServerSide = typeof window === 'undefined'

    if (isServerSide) {
      // Server-side: เรียกตรงไปที่ SSO server (ไม่มี CORS issue)
      const response = await fetch(`${SSO_BASE_URL}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data as SSOSession
    } else {
      // Client-side: ใช้ API route เพื่อหลีกเลี่ยง CORS
      // ดึง token จาก localStorage เพื่อส่งผ่าน Authorization header
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('nexus_token') || null
        : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // ส่ง token ผ่าน Authorization header ถ้ามี
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('🔍 checkSSOSession - Sending token via Authorization header:', token.substring(0, 20) + '...')
      } else {
        console.log('⚠️ checkSSOSession - No token found in localStorage (nexus_token)')
        // ตรวจสอบ localStorage keys ทั้งหมดเพื่อ debug
        if (typeof window !== 'undefined') {
          const allKeys = Object.keys(localStorage)
          console.log('🔍 checkSSOSession - All localStorage keys:', allKeys)
          const tokenKeys = allKeys.filter(k => k.includes('token') || k.includes('Token'))
          console.log('🔍 checkSSOSession - Token-related keys:', tokenKeys)
        }
      }

      // สร้าง URL พร้อม query parameter (fallback)
      let sessionUrl = '/api/sso/session'
      if (token) {
        // ส่ง token ผ่าน query parameter เป็น fallback (ไม่แนะนำแต่ใช้ได้)
        sessionUrl += `?token=${encodeURIComponent(token)}`
      }

      const response = await fetch(sessionUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
      })

      console.log('🔍 checkSSOSession - API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.log('⚠️ checkSSOSession - API error:', response.status, errorText)
        return null
      }

      const data = await response.json()
      console.log('🔍 checkSSOSession - API response:', {
        authenticated: data?.authenticated,
        hasUser: !!data?.user,
        username: data?.user?.username
      })
      return data as SSOSession
    }
  } catch (error) {
    console.error('Error checking SSO session:', error)
    return null
  }
}

export function getSSOLoginUrl(redirectUrl?: string): string {
  const loginUrl = new URL(SSO_LOGIN_URL)
  if (redirectUrl) {
    // SSO ใช้ return_url แทน redirect
    loginUrl.searchParams.set('return_url', redirectUrl)
  }
  return loginUrl.toString()
}

/**
 * Get SSO logout URL with optional return URL
 */
export function getSSOLogoutUrl(returnUrl?: string): string {
  // ใช้ dynamic function เพื่อให้ได้ URL ที่ถูกต้องตาม environment
  const baseUrl = getSSOBaseURL()
  const logoutUrl = new URL(`${baseUrl}/logout`)
  if (returnUrl) {
    logoutUrl.searchParams.set('return_url', returnUrl)
  }
  return logoutUrl.toString()
}

export function hasGlobalSSOLogoutSignal(): boolean {
  return typeof document !== 'undefined'
    && document.cookie.split(';').some((cookie) => cookie.trim().startsWith('nexus_shared_logout='))
}

export async function revokeAllSSOSessions(token: string, userId: string): Promise<void> {
  if (!token || !userId) return
  const baseUrl = (process.env.NEXT_PUBLIC_SSO_URL || 'https://sso360.trirex.cloud').replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/api/sso/revoke-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    keepalive: true,
    body: JSON.stringify({ token, userId, all: true }),
  })
  if (!response.ok) throw new Error(`Global logout failed (${response.status})`)
}
