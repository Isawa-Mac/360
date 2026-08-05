"use client"

import { FormEvent, useEffect, useState } from "react"
import { Download, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MobileAppSettingsPage() {
  const [apkUrl, setApkUrl] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string>()
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings/mobile-app", { cache: "no-store" })
      .then((response) => response.json())
      .then((config) => {
        setApkUrl(config.apkUrl || "")
        setUpdatedAt(config.updatedAt)
      })
      .catch(() => setStatus("โหลดการตั้งค่าไม่สำเร็จ"))
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setStatus("")
    try {
      const response = await fetch("/api/settings/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apkUrl }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ")
      setUpdatedAt(result.updatedAt)
      setStatus("บันทึกแล้ว QR Code เดิมจะใช้ลิงก์ใหม่นี้ทันที")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary"><Download className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-semibold">ตั้งค่า Mobile App</h1>
          <p className="text-sm text-muted-foreground">เปลี่ยนลิงก์ APK โดยไม่ต้องแก้ไข QR Code หรือโค้ด</p>
        </div>
      </div>
      <form onSubmit={save} className="rounded-2xl border bg-card p-6 shadow-sm">
        <Label htmlFor="apk-url">ลิงก์ดาวน์โหลด APK</Label>
        <Input id="apk-url" value={apkUrl} onChange={(event) => setApkUrl(event.target.value)} className="mt-2" placeholder="https://..." required />
        <p className="mt-2 text-xs text-muted-foreground">ต้องเป็นลิงก์ HTTPS เช่น SharePoint, OneDrive หรือ storage ของบริษัท</p>
        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
        {updatedAt && <p className="mt-4 text-xs text-muted-foreground">อัปเดตล่าสุด: {new Date(updatedAt).toLocaleString("th-TH")}</p>}
      </form>
    </main>
  )
}
