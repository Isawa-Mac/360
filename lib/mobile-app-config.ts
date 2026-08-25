import { promises as fs } from "fs"
import path from "path"
export const DEFAULT_APK_URL = "https://trirexinter-my.sharepoint.com/:u:/g/personal/isara-it_trirex_co_th/IQD3LNRN9lK3T4Fjysj-KjSJAV_U_IkkY-NZqz2Y6VH428M?e=IpRb0j"

export const MOBILE_APP_STORAGE_DIR = process.env.MOBILE_APP_STORAGE_DIR || path.join(process.cwd(), "data", "mobile-app")
export const MOBILE_APP_CONFIG_FILE = path.join(MOBILE_APP_STORAGE_DIR, "config.json")
export const MOBILE_APP_FILE = path.join(MOBILE_APP_STORAGE_DIR, "mobile-app.apk")
export type MobileAppConfig = { apkUrl: string; updatedAt?: string; fileName?: string }

export async function getMobileAppConfig(): Promise<MobileAppConfig> {
  try {
    const config = JSON.parse(await fs.readFile(MOBILE_APP_CONFIG_FILE, "utf8")) as MobileAppConfig
    if (config.apkUrl) return config
  } catch {
    // Use the safe default when the JSON config is unavailable.
  }

  return { apkUrl: DEFAULT_APK_URL }
}

export async function saveMobileAppConfig(config: MobileAppConfig) {
  await fs.mkdir(MOBILE_APP_STORAGE_DIR, { recursive: true })
  await fs.writeFile(MOBILE_APP_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")
}
