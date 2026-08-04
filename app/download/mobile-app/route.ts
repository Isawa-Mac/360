import { NextResponse } from "next/server"

const CURRENT_APK_URL = "https://trirexinter-my.sharepoint.com/:u:/g/personal/isara-it_trirex_co_th/IQACLEnaHwX1RK-iE-GFwJCFAQCJEZu3pQoffO6eMC0lO5A?e=TJ7R8M"

export function GET() {
  return NextResponse.redirect(CURRENT_APK_URL, 302)
}
