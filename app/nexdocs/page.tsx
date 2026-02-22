"use client"

import { Layout } from '@/components/layout'
import { motion, AnimatePresence } from 'motion/react'
import {
    FileText,
    Cpu,
    Search,
    ShieldCheck,
    Zap,
    ChevronRight,
    Expand,
    X,
    Target,
    Rocket,
    ArrowRight,
    Play
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'

export default function NexDocsLandingPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSlideshowOpen, setIsSlideshowOpen] = useState(false)

    const features = [
        {
            title: "Smart Input & Dual Storage",
            description: "อัปโหลดไฟล์ได้ทุกรูปแบบหรือถ่ายภาพบิล แล้วจัดเก็บคู่ขนานทั้งบน Cloud และ QNAP Storage ภายในบริษัท",
            icon: ShieldCheck,
            color: "from-blue-500 to-cyan-400"
        },
        {
            title: "AI Multimodal Analysis",
            description: "ใช้ Gemini 2.5 แกะเลย์เอาต์ อ่านตาราง และสรุปข้อมูลเป็นรูปแบบ JSON โดยอัตโนมัติ",
            icon: Cpu,
            color: "from-indigo-500 to-purple-500"
        },
        {
            title: "Intelligent Vector Search",
            description: "แปลงข้อมูลเป็น Vector เพื่อให้ค้นหาด้วยภาษาธรรมชาติผ่านระบบ RAG บน PostgreSQL 15",
            icon: Search,
            color: "from-violet-500 to-fuchsia-500"
        }
    ]

    const benefits = [
        {
            title: "Data Sovereignty 100%",
            description: "องค์กรเป็นเจ้าของข้อมูลทั้งหมด ด้วยการจัดเก็บภายใน (On-Premise)",
            icon: ShieldCheck
        },
        {
            title: "Ask Me Anything & Insights",
            description: "ผู้บริหารสามารถถามคำถามด้วยภาษาคนเพื่อสรุปข้อมูลและดู Dashboard ได้ทันที",
            icon: Target
        },
        {
            title: "ลดเวลาทำงานได้กว่า 90%",
            description: "เปลี่ยนการคีย์ข้อมูลและการค้นหาเอกสารแบบเดิมให้เป็นระบบอัตโนมัติ",
            icon: Zap
        }
    ]

    const roadmap = [
        { month: "เดือนที่ 1-2", task: "ติดตั้งโครงสร้างพื้นฐาน Network และระบบ Dual Storage" },
        { month: "เดือนที่ 3-4", task: "พัฒนา AI Extraction (Gemini 2.5) และระบบค้นหา RAG" },
        { month: "เดือนที่ 5-6", task: "ทดสอบความแม่นยำ (UAT) และเปิดใช้งานจริงพร้อมอบรมพนักงาน" }
    ]

    return (
        <Layout showFilters={false} pageTitle="NexDocs 360">
            <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-transparent text-slate-900 overflow-y-auto relative">

                {/* Hero Section - Centered and Scaling */}
                <section className="relative w-full flex-1 flex items-center justify-center">
                    <div
                        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                        style={{ backgroundImage: "url('/nexdocs-hero-bg.png')" }}
                    />
                    {/* Updated gradients for maximum transparency */}
                    <div className="absolute inset-0 z-0 bg-slate-50/5 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-50/10 via-transparent to-transparent" />

                    <div className="container mx-auto px-6 relative z-10">
                        {/* Wrapper for 20% zoom out (scale 0.8) and dynamic scaling */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 0.8 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center origin-center"
                        >
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-tight text-slate-900 drop-shadow-sm">
                                NexDocs 360: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ปฏิวัติการจัดการเอกสาร</span> ด้วย AI อัจฉริยะ
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto text-balance">
                                ที่ผสานพลัง Multimodal AI (Gemini 2.5) เข้ากับระบบจัดเก็บข้อมูลแบบ Dual Storage เพื่อให้องค์กรสามารถวิเคราะห์ ค้นหา และเป็นเจ้าของข้อมูลได้ 100%
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-16 rounded-full text-xl font-semibold group shadow-xl shadow-blue-600/20 scale-100 active:scale-95 transition-all"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <Expand className="w-6 h-6 mr-3" />
                                    เปิด NexDocs 360
                                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-200 bg-white/50 backdrop-blur-md hover:bg-white/80 text-slate-900 px-10 h-16 rounded-full text-xl font-semibold group transition-all"
                                    onClick={() => setIsSlideshowOpen(true)}
                                >
                                    <Play className="w-6 h-6 mr-3 fill-blue-600 text-blue-600" />
                                    แสดง Slide Show
                                </Button>
                            </div>
                            <p className="mt-8 text-base text-slate-400 italic">พร้อมลดระยะเวลาการทำงานลงถึง 90%</p>
                        </motion.div>
                    </div>
                </section>



                {/* Infographic Modal */}
                <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                    <AnimatePresence>
                        {isOpen && (
                            <Dialog.Portal forceMount>
                                <Dialog.Overlay asChild>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-white/80 backdrop-blur-lg z-[100]"
                                    />
                                </Dialog.Overlay>
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="fixed inset-4 md:inset-10 z-[101] outline-none flex items-center justify-center"
                                    >
                                        <Dialog.Title className="sr-only">NexDocs 360 Infographic</Dialog.Title>
                                        <Dialog.Description className="sr-only">
                                            รายละเอียดโครงสร้างและการทำงานของระบบ NexDocs 360
                                        </Dialog.Description>
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <motion.img
                                                src="/nexdocs-infographic.png"
                                                alt="NexDocs 360 Infographic"
                                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/40"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                            <Dialog.Close asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="absolute top-2 right-2 md:top-4 md:right-4 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xl"
                                                >
                                                    <X className="w-6 h-6" />
                                                </Button>
                                            </Dialog.Close>
                                        </div>
                                    </motion.div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        )}
                    </AnimatePresence>
                </Dialog.Root>

                {/* Slide Show Modal - Glass Effect */}
                <Dialog.Root open={isSlideshowOpen} onOpenChange={setIsSlideshowOpen}>
                    <AnimatePresence>
                        {isSlideshowOpen && (
                            <Dialog.Portal forceMount>
                                <Dialog.Overlay asChild>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-white/90 z-[100] backdrop-blur-md"
                                    />
                                </Dialog.Overlay>
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="fixed inset-0 z-[101] outline-none flex items-center justify-center p-4"
                                    >
                                        <Dialog.Title className="sr-only">NexDocs 360 Slide Show</Dialog.Title>
                                        <Dialog.Description className="sr-only">
                                            การนำเสนอภาพรวมของ NexDocs 360 ในรูปแบบสไลด์
                                        </Dialog.Description>
                                        <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/80">
                                            {/* PDF Slide Show View */}
                                            <div className="w-full h-full">
                                                <iframe
                                                    src="/NEXDOCS_360.pdf#view=FitH"
                                                    className="w-full h-full border-none"
                                                    title="NexDocs 360 Slide Show"
                                                />
                                            </div>

                                            <Dialog.Close asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-4 right-4 rounded-full bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 transition-colors z-50 shadow-sm"
                                                >
                                                    <X className="w-6 h-6" />
                                                </Button>
                                            </Dialog.Close>
                                        </div>
                                    </motion.div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        )}
                    </AnimatePresence>
                </Dialog.Root>

            </div>
        </Layout>
    )
}
