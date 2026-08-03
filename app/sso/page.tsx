"use client"

import { useEffect } from "react"

const SSO_URL = process.env.NEXT_PUBLIC_SSO_BASE_URL || "https://sso360.trirex.cloud"

/**
 * Internal PWA entry point for SSO.
 * Keeping this as an app route means the Home card uses the installed PWA
 * navigation flow instead of carrying an external URL in its card data.
 */
export default function SSOPage() {
  useEffect(() => {
    window.location.replace(SSO_URL)
  }, [])

  return (
    <main className="min-h-screen grid place-items-center bg-background px-6">
      <p className="text-sm text-muted-foreground">กำลังเปิด Single Sign-On 360…</p>
    </main>
  )
}
