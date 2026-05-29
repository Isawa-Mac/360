"use client"

import { Layout } from '@/components/layout'
import { motion, AnimatePresence } from 'motion/react'
import {
    Users,
    X,
    ArrowRight,
    Play,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { useLanguage } from '@/contexts/language-context'

export default function CRMLandingPage() {
    const [isSlideshowOpen, setIsSlideshowOpen] = useState(false)
    const { t } = useLanguage()

    return (
        <Layout showFilters={false} pageTitle="360">
            <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-transparent text-slate-900 dark:text-white overflow-y-auto relative">

                {/* Hero Section - Centered and Scaling */}
                <section className="relative w-full flex-1 flex items-center justify-center">
                    <div
                        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                        style={{ backgroundImage: "url('/crm-hero-bg.png')" }}
                    />
                    {/* Updated gradients for maximum transparency - matching nexdocs */}
                    <div className="absolute inset-0 z-0 bg-slate-50/5 dark:bg-slate-900/5 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-50/10 dark:from-slate-900/10 via-transparent to-transparent" />

                    <div className="container mx-auto px-6 relative z-10">
                        {/* Wrapper for 20% zoom out (scale 0.8) and dynamic scaling */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.75 }}
                            animate={{ opacity: 1, scale: 0.8 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center origin-center"
                        >
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-tight text-slate-900 dark:text-white drop-shadow-sm">
                                {t("crm_hero_prefix")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{t("crm_hero_highlight")}</span> {t("crm_hero_suffix")}
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto text-balance">
                                {t("crm_hero_description")}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white px-10 h-16 rounded-full text-xl font-semibold group shadow-xl shadow-blue-600/20 scale-100 active:scale-95 transition-all"
                                    onClick={() => window.location.href = 'https://360.trirex.cloud'}
                                >
                                    <Users className="w-6 h-6 mr-3" />
                                    {t("open_crm")}
                                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-900 dark:text-white px-10 h-16 rounded-full text-xl font-semibold group transition-all"
                                    onClick={() => setIsSlideshowOpen(true)}
                                >
                                    <Play className="w-6 h-6 mr-3 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" />
                                    {t("show_slideshow")}
                                </Button>
                            </div>
                            <p className="mt-8 text-base text-slate-400 dark:text-slate-500 italic">{t("crm_hero_note")}</p>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section Removed as requested */}

                {/* Slide Show Modal - Glass Effect (Placeholder) */}
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
                                        <Dialog.Title className="sr-only">360 Slide Show</Dialog.Title>
                                        <Dialog.Description className="sr-only">
                                            {t("crm_slideshow_description")}
                                        </Dialog.Description>
                                        <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/80 flex items-center justify-center bg-slate-50">
                                            <div className="text-center">
                                                <Users className="w-20 h-20 text-blue-200 mx-auto mb-6" />
                                                <h2 className="text-2xl font-bold text-slate-800 mb-2">CRM 360 Presentation</h2>
                                                <p className="text-slate-500">{t("slideshow_coming_soon")}</p>
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
