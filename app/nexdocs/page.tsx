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
            <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">

                {/* Hero Section */}
                <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
                    <div
                        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
                        style={{ backgroundImage: "url('/nexdocs-hero-bg.png')" }}
                    />
                    {/* Updated gradients to be fully opaque at the top/bottom to hide the background grid */}
                    <div className="absolute inset-0 z-0 bg-slate-950/40" />
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />

                    <div className="container mx-auto px-6 relative z-10">
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
                                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6"
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                DMS แห่งปี 2026
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
                                NexDocs 360: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">ปฏิวัติการจัดการเอกสาร</span> ด้วย AI อัจฉริยะ
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto text-balance">
                                ที่ผสานพลัง Multimodal AI (Gemini 2.5) เข้ากับระบบจัดเก็บข้อมูลแบบ Dual Storage เพื่อให้องค์กรสามารถวิเคราะห์ ค้นหา และเป็นเจ้าของข้อมูลได้ 100%
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 rounded-full text-lg font-semibold group shadow-lg shadow-blue-600/20 scale-100 active:scale-95 transition-all"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <Expand className="w-5 h-5 mr-2" />
                                    เปิด NexDocs 360
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <p className="text-sm text-slate-500 italic">พร้อมลดระยะเวลาการทำงานลงถึง 90%</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section - Solid Background */}
                <section className="py-20 bg-slate-900 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">กระบวนการจัดการเอกสารอัจฉริยะ</h2>
                            <p className="text-slate-400">The Smart Workflow</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    <Card className="bg-slate-950 border-slate-800 hover:border-blue-500/50 transition-all group overflow-hidden">
                                        <CardContent className="p-8">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
                                                <feature.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors uppercase tracking-wider">{feature.title}</h3>
                                            <p className="text-slate-400 line-clamp-3 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section - Solid Container */}
                <section className="py-20 relative bg-slate-950">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 overflow-hidden relative shadow-2xl">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />

                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">ประโยชน์หลักและความคุ้มค่า</h2>
                                <p className="text-blue-400 font-medium">Core Benefits & Values</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-inner">
                                            <benefit.icon className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h4 className="text-xl font-bold mb-3">{benefit.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Roadmap Section - Solid Background */}
                <section className="py-20 bg-slate-950">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">แผนการดำเนินงาน 6 เดือน</h2>
                            <p className="text-slate-400">Roadmap 2026</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="relative border-l-2 border-blue-500/30 ml-4 md:ml-0 md:before:absolute md:before:left-1/2 md:before:h-full md:before:w-0.5 md:before:bg-blue-500/30 md:border-l-0">
                                {roadmap.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className={`relative mb-12 flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        <div className="flex-1 md:px-8">
                                            <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-colors shadow-xl ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                                <span className="text-blue-400 font-bold mb-2 block">{item.month}</span>
                                                <p className="text-slate-300 font-medium">{item.task}</p>
                                            </div>
                                        </div>
                                        <div className="absolute left-0 -translate-x-1/2 top-4 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] md:left-1/2" />
                                        <div className="flex-1" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer info - Solid Background */}
                <footer className="py-12 border-t border-slate-900 bg-slate-950">
                    <div className="container mx-auto px-6 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <FileText className="w-6 h-6 text-blue-500" />
                            <span className="text-xl font-bold tracking-tighter">NexDocs 360</span>
                        </div>
                        <p className="text-slate-500 text-sm">© 2026 Nexus 360. All rights reserved.</p>
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
                                        className="fixed inset-0 bg-black/90 z-[100]"
                                    />
                                </Dialog.Overlay>
                                <Dialog.Content asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="fixed inset-4 md:inset-10 z-[101] outline-none flex items-center justify-center"
                                    >
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <motion.img
                                                src="/nexdocs-infographic.png"
                                                alt="NexDocs 360 Infographic"
                                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                            <Dialog.Close asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="absolute top-2 right-2 md:top-4 md:right-4 rounded-full bg-white text-black hover:bg-slate-200 transition-colors"
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
