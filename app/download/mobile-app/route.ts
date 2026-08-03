import { NextResponse } from "next/server"

const CURRENT_APK_URL = "https://trirexinter-my.sharepoint.com/:u:/g/personal/isara-it_trirex_co_th/IQAxMBs-h9-uRb-n5vYwDEjJAayJhhzmKF6YQkgNd5-oSGg?e=K3gq4I"

export function GET() {
  return NextResponse.redirect(CURRENT_APK_URL, 302)
}
