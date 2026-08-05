import { readJson } from "@/lib/fs-json"

export const MOBILE_APP_CONFIG_PATH = "public/data/mobile-app-config.json"
export const DEFAULT_APK_URL = "https://trirexinter-my.sharepoint.com/:u:/g/personal/isara-it_trirex_co_th/IQD3LNRN9lK3T4Fjysj-KjSJAV_U_IkkY-NZqz2Y6VH428M?e=IpRb0j"

export type MobileAppConfig = {
  apkUrl: string
  updatedAt?: string
}

export async function getMobileAppConfig(): Promise<MobileAppConfig> {
  try {
    const config = await readJson<Partial<MobileAppConfig>>(MOBILE_APP_CONFIG_PATH)
    if (typeof config.apkUrl === "string" && /^https:\/\//i.test(config.apkUrl)) {
      return { apkUrl: config.apkUrl, updatedAt: config.updatedAt }
    }
  } catch {
    // Use the safe default when the JSON config is unavailable.
  }

  return { apkUrl: DEFAULT_APK_URL }
}
