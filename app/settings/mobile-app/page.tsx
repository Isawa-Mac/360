"use client"

import { FormEvent, useEffect, useState } from "react"
import { Download, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MobileAppSettingsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string>()
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings/mobile-app", { cache: "no-store" })
      .then((response) => response.json())
      .then((config) => {
        setFileName(config.fileName || "ยังไม่ได้อัปโหลด APK")
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
        method: "POST",
        body: (() => { const data = new FormData(); if (file) data.append("file", file); return data })(),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ")
      setUpdatedAt(result.updatedAt)
      setFileName(result.fileName || "มีไฟล์ APK บนเซิร์ฟเวอร์แล้ว")
      setStatus("บันทึกแล้ว ไฟล์ถูกเก็บไว้บนเซิร์ฟเวอร์และ QR Code เดิมใช้ได้ทันที")
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
        <Input id="apk-file" type="file" accept=".apk,application/vnd.android.package-archive" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-2" required />
        <p className="mt-2 text-xs text-muted-foreground">เลือกไฟล์ APK เพื่ออัปโหลดและเก็บไว้บนเซิร์ฟเวอร์ของระบบ</p>
        {fileName && <p className="mt-2 text-xs text-muted-foreground">ไฟล์ปัจจุบัน: {fileName}</p>}
        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
        {updatedAt && <p className="mt-4 text-xs text-muted-foreground">อัปเดตล่าสุด: {new Date(updatedAt).toLocaleString("th-TH")}</p>}
      </form>
    </main>
  )
}
