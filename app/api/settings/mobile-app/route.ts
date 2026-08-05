import { NextRequest, NextResponse } from "next/server"
import { getMobileAppConfig, MOBILE_APP_CONFIG_PATH, MobileAppConfig } from "@/lib/mobile-app-config"
import { writeJson } from "@/lib/fs-json"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await getMobileAppConfig())
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<MobileAppConfig>
    const apkUrl = typeof body.apkUrl === "string" ? body.apkUrl.trim() : ""

    if (!/^https:\/\/[^\s]+$/i.test(apkUrl)) {
      return NextResponse.json({ error: "กรุณาระบุ URL HTTPS ที่ถูกต้อง" }, { status: 400 })
    }

    const config: MobileAppConfig = {
      apkUrl,
      updatedAt: new Date().toISOString(),
    }
    await writeJson(MOBILE_APP_CONFIG_PATH, config)
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: "ไม่สามารถบันทึกการตั้งค่าได้" }, { status: 500 })
  }
}
