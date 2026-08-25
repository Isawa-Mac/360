import { NextRequest, NextResponse } from "next/server"
import { getMobileAppConfig, MOBILE_APP_FILE, saveMobileAppConfig } from "@/lib/mobile-app-config"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await getMobileAppConfig())
}

export async function POST(request: NextRequest) {
  try {
    const file = (await request.formData()).get("file")
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".apk")) return NextResponse.json({ error: "กรุณาเลือกไฟล์ APK" }, { status: 400 })
    await fs.mkdir(path.dirname(MOBILE_APP_FILE), { recursive: true })
    await fs.writeFile(MOBILE_APP_FILE, Buffer.from(await file.arrayBuffer()))
    const config = {
      apkUrl: "/download/mobile-app",
      fileName: file.name,
      updatedAt: new Date().toISOString(),
    }
    await saveMobileAppConfig(config)
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: "ไม่สามารถบันทึกไฟล์ APK บนเซิร์ฟเวอร์ได้" }, { status: 500 })
  }
}
