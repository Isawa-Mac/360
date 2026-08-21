"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Download, MonitorDown, Smartphone, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePermission } from "@/hooks/use-permission"
import { DESKTOP_VERSION } from "@/lib/desktop-version"

const APK_DOWNLOAD_URL = "/download/mobile-app"
const WINDOWS_DOWNLOAD_URL = `/desktop/360-Setup-${DESKTOP_VERSION}-win-x64.exe`

export function MobileAppDownload() {
  const [open, setOpen] = useState(false)
  const [windowsDownloadStarted, setWindowsDownloadStarted] = useState(false)
  const { user } = useAuth()
  const { isSuperAdmin } = usePermission()
  const allowedRoles = new Set(["administrator", "admin", "super"])
  const canManageMobileApp = isSuperAdmin || (user?.roles ?? []).some((role) =>
    allowedRoles.has(role.trim().toLowerCase())
  )

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ดาวน์โหลด Mobile App"
        title="ดาวน์โหลด Mobile App"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/35 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Smartphone className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-app-dialog-title"
            className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิดหน้าต่างดาวน์โหลด"
              className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 id="mobile-app-dialog-title" className="text-xl font-semibold">
              ดาวน์โหลด Mobile App
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              สแกน QR Code เพื่อดาวน์โหลด APK
            </p>

            <div className="mx-auto my-5 w-fit rounded-xl border bg-white p-3 shadow-sm">
              <Image
                src="/download-apk-qr.png"
                alt="QR Code สำหรับดาวน์โหลด Mobile App"
                width={208}
                height={208}
                priority
              />
            </div>

            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              ดาวน์โหลด APK
            </a>
            <a
              href={WINDOWS_DOWNLOAD_URL}
              download
              onClick={() => setWindowsDownloadStarted(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <MonitorDown className="h-4 w-4" aria-hidden="true" />
              ดาวน์โหลด 360 สำหรับ Windows
            </a>
            {windowsDownloadStarted && (
              <div
                className="mt-4 rounded-xl border border-orange-300/60 bg-orange-50 p-4 text-left text-sm text-orange-950"
                role="alertdialog"
                aria-labelledby="windows-install-title"
              >
                <p id="windows-install-title" className="font-semibold">
                  ดาวน์โหลดตัวติดตั้งแล้วหรือยัง?
                </p>
                <p className="mt-1 text-xs leading-5 text-orange-900/80">
                  เมื่อดาวน์โหลดเสร็จ ให้เปิดไฟล์ 360-Setup ในแถบ Downloads หรือโฟลเดอร์ Downloads เพื่อเริ่มติดตั้ง
                </p>
                <button
                  type="button"
                  onClick={() => setWindowsDownloadStarted(false)}
                  className="mt-3 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <span className="text-muted-foreground">รองรับ Android และ Windows</span>
              {canManageMobileApp && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <Link
                    href="/settings/mobile-app"
                    onClick={() => setOpen(false)}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    ตั้งค่า Mobile App
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
