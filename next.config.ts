import type { NextConfig } from "next";

// ใช้ default config ของ Next โดยไม่เปิดใช้ Turbopack
// เพื่อหลีกเลี่ยง panic error ที่เกิดจากการทำงานร่วมกับ Tailwind v4
const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
};

export default nextConfig;
