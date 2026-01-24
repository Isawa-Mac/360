"use client"

import { Button } from "@/components/ui/button"
import { LogOut, LogIn, CheckCircle2 } from "lucide-react"
import { motion } from "motion/react"

export default function LogoutPage() {
    const redirectToSSO = () => {
        const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud";
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";
        const redirectUri = typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.host}/auth/sso-callback`
            : "https://360.trirex.cloud/auth/sso-callback";
        // ใส่ prompt=login เพื่อบังคับให้ SSO หน้า Login แสดงทุกครั้งแม้เคยล็อกอินแล้ว
        window.location.href = `${ssoUrl}/#/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&prompt=login`;
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#000] relative overflow-hidden font-sarabun text-slate-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.2]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #ffffff11 1px, transparent 1px),
                            linear-gradient(to bottom, #ffffff11 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-8 z-10 px-6 text-center"
            >
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                        className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                    >
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 h-24 w-24 rounded-full bg-green-500/20 -z-10 blur-xl"
                    />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        ออกจากระบบสำเร็จ
                    </h1>
                    <p className="text-slate-400 max-w-[320px] mx-auto text-lg">
                        คุณได้ทำการออกจากระบบ Nexus ERP 360 เรียบร้อยแล้ว ขอบคุณที่ใช้งาน
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-[300px] mt-4">
                    <Button
                        onClick={redirectToSSO}
                        size="lg"
                        className="w-full bg-white text-black hover:bg-slate-200 font-semibold flex items-center justify-center gap-3 h-14 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5 group"
                    >
                        <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        เข้าสู่ระบบอีกครั้ง
                    </Button>
                </div>
            </motion.div>

            {/* Glassy logo/text at bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-30 select-none">
                <div className="h-px w-8 bg-slate-500" />
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-slate-300">
                    Nexus ERP 360 Enterprise System
                </span>
                <div className="h-px w-8 bg-slate-500" />
            </div>
        </div>
    )
}
