"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Download, Smartphone, X } from "lucide-react"

const APK_DOWNLOAD_URL = "https://trirexinter-my.sharepoint.com/:u:/g/personal/isara-it_trirex_co_th/IQAxMBs-h9-uRb-n5vYwDEjJAayJhhzmKF6YQkgNd5-oSGg?e=K3gq4I"

export function MobileAppDownload() {
  const [open, setOpen] = useState(false)

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
            <p className="mt-3 text-xs text-muted-foreground">สำหรับ Android เท่านั้น</p>
          </section>
        </div>
      )}
    </>
  )
}
