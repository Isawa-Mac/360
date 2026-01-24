"use client"

import React, { createContext, useContext, useState } from 'react'
import { BarChart3, type LucideIcon } from 'lucide-react'

interface ModuleData {
    name: string
    logo: LucideIcon
    plan: string
    description: string
}

interface ModuleContextType {
    activeModule: ModuleData
    setActiveModule: (module: ModuleData) => void
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined)

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    // Default to Business Intelligence
    const [activeModule, setActiveModule] = useState<ModuleData>({
        name: "Business Intelligence",
        logo: BarChart3,
        plan: "Analytics",
        description: "Analytics & Reports"
    })

    return (
        <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
            {children}
        </ModuleContext.Provider>
    )
}

export function useModule() {
    const context = useContext(ModuleContext)
    if (context === undefined) {
        throw new Error('useModule must be used within a ModuleProvider')
    }
    return context
}
