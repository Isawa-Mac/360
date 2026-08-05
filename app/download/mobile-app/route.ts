import { NextResponse } from "next/server"
import { getMobileAppConfig } from "@/lib/mobile-app-config"

export const dynamic = "force-dynamic"

export async function GET() {
  const { apkUrl } = await getMobileAppConfig()
  return NextResponse.redirect(apkUrl, 302)
}
