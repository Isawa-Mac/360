"use client"

import { Layout } from '@/components/layout'
import { motion, AnimatePresence } from 'motion/react'
import {
    Cpu,
    Search,
    ShieldCheck,
    Zap,
    Expand,
    X,
    Target,
    Rocket,
    ArrowRight
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'

export default function NexDocsLandingPage() {
    const [isOpen, setIsOpen] = useState(false)

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
            <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative">
                {/* Persistent background image - Fixed to create the "see-through" feel */}
                <div
                    className="fixed inset-0 z-0 opacity-30 bg-cover bg-center bg-fixed pointer-events-none"
                    style={{ backgroundImage: "url('/nexdocs-hero-bg.png')" }}
                />
                <div className="fixed inset-0 z-0 bg-gradient-to-b from-blue-950/10 via-slate-950/40 to-slate-950/90 pointer-events-none" />

                {/* Hero Section */}
                <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 z-10">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6 backdrop-blur-md"
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                DMS แห่งปี 2026
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
                                NexDocs 360: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">ปฏิวัติการจัดการเอกสาร</span> ด้วย AI อัจฉริยะ
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300/80 mb-10 leading-relaxed max-w-2xl mx-auto text-balance drop-shadow-sm">
                                ที่ผสานพลัง Multimodal AI (Gemini 2.5) เข้ากับระบบจัดเก็บข้อมูลแบบ Dual Storage เพื่อให้องค์กรสามารถวิเคราะห์ ค้นหา และเป็นเจ้าของข้อมูลได้ 100%
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Button
                                    size="lg"
                                    className="bg-blue-600/80 hover:bg-blue-500 text-white px-8 h-14 rounded-full text-lg font-semibold group shadow-lg shadow-blue-600/20 backdrop-blur-md border border-white/10 scale-100 active:scale-95 transition-all"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <Expand className="w-5 h-5 mr-2" />
                                    เปิด NexDocs 360
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <p className="text-sm text-slate-400 italic">พร้อมลดระยะเวลาการทำงานลงถึง 90%</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 relative z-10">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md text-white">กระบวนการจัดการเอกสารอัจฉริยะ</h2>
                            <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mb-4 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">The Smart Workflow</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all group overflow-hidden backdrop-blur-lg shadow-2xl relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                        <CardContent className="p-8 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                                <feature.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors uppercase tracking-wider">{feature.title}</h3>
                                            <p className="text-slate-300/70 line-clamp-3 leading-relaxed text-sm">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 relative z-10">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-white/5 border border-white/10 p-8 md:p-16 overflow-hidden relative backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />

                            <div className="text-center mb-16 relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">ประโยชน์หลักและความคุ้มค่า</h2>
                                <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm">Core Benefits & Values</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center relative z-10">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex flex-col items-center group">
                                        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                                            <benefit.icon className="w-10 h-10 text-blue-400" />
                                        </div>
                                        <h4 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">{benefit.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">{benefit.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Roadmap Section */}
                <section className="py-24 relative z-10">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20 text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">แผนการดำเนินงาน 6 เดือน</h2>
                            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-4 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                            <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Roadmap 2026</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="relative ml-4 md:ml-0 md:before:absolute md:before:left-1/2 md:before:-translate-x-1/2 md:before:h-full md:before:w-px md:before:bg-gradient-to-b md:before:from-transparent md:before:via-blue-500/50 md:before:to-transparent">
                                {roadmap.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className={`relative mb-16 flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        <div className="flex-1 md:px-12">
                                            <div className={`p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-md shadow-xl group hover:-translate-y-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                                <div className={`inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors`}>{item.month}</div>
                                                <p className="text-slate-200 font-medium leading-relaxed">{item.task}</p>
                                            </div>
                                        </div>
                                        <div className="absolute left-0 -translate-x-1/2 top-4 w-5 h-5 rounded-full bg-slate-950 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] md:left-1/2 z-20 group-hover:scale-125 transition-transform" />
                                        <div className="flex-1" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer info */}
                <footer className="py-16 relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                    <div className="container mx-auto px-6 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tighter text-white">NexDocs 360</span>
                        </div>
                        <p className="text-slate-500 text-sm tracking-widest uppercase">© 2026 Nexus 360. Empowering Enterprise with AI.</p>
                    </div>
                </footer>

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
                                        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100]"
                                    />
                                </Dialog.Overlay>
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                        className="fixed inset-4 md:inset-10 z-[101] outline-none flex items-center justify-center"
                                    >
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <motion.img
                                                src="/nexdocs-infographic.png"
                                                alt="NexDocs 360 Infographic"
                                                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                            <Dialog.Close asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="absolute top-2 right-2 md:top-4 md:right-4 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all shadow-xl hover:rotate-90"
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
