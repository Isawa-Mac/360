import { NextResponse } from "next/server"
import { getMobileAppConfig, MOBILE_APP_FILE } from "@/lib/mobile-app-config"
import { promises as fs } from "fs"

export const dynamic = "force-dynamic"

export async function GET() {
  const { apkUrl } = await getMobileAppConfig()
  if (apkUrl === "/download/mobile-app") {
    const config = await getMobileAppConfig()
    const file = await fs.readFile(MOBILE_APP_FILE)
    return new NextResponse(file, { headers: { "Content-Type": "application/vnd.android.package-archive", "Content-Disposition": `attachment; filename="${config.fileName || "mobile-app.apk"}"` } })
  }
  return NextResponse.redirect(apkUrl, 302)
}
