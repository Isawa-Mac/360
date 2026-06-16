/** แปลง avatarUrl จาก SSO ให้เป็น URL ที่ใช้แสดงรูปได้ */
export function normalizeProfileImageSrc(src?: string | null): string {
  const rawSrc = typeof src === "string" ? src.trim() : ""
  if (!rawSrc) return ""
  if (
    rawSrc.startsWith("/") ||
    rawSrc.startsWith("blob:") ||
    rawSrc.startsWith("http://") ||
    rawSrc.startsWith("https://") ||
    rawSrc.startsWith("data:image/")
  ) {
    return rawSrc
  }
  return ""
}
