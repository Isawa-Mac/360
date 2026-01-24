"use client"

import React, { createContext, useContext, useState } from "react"

interface HeaderControlContextType {
    isGlobalHeaderHidden: boolean
    setGlobalHeaderHidden: (hidden: boolean) => void
    showFilters: boolean
    setShowFilters: (show: boolean) => void
    disableDepartment: boolean
    setDisableDepartment: (disable: boolean) => void
    disableEmployee: boolean
    setDisableEmployee: (disable: boolean) => void
    hideYear: boolean
    setHideYear: (hide: boolean) => void
    hideMonth: boolean
    setHideMonth: (hide: boolean) => void
    hideQuarter: boolean
    setHideQuarter: (hide: boolean) => void
    hideYtd: boolean
    setHideYtd: (hide: boolean) => void
    customYears: number[] | undefined
    setCustomYears: (years: number[] | undefined) => void
    pageTitle: string
    setPageTitle: (title: string) => void
    pageSubtitle: string
    setPageSubtitle: (subtitle: string) => void
    resetHeaderControls: () => void
}

const HeaderControlContext = createContext<HeaderControlContextType | undefined>(undefined)

export function HeaderControlProvider({ children }: { children: React.ReactNode }) {
    const [isGlobalHeaderHidden, setGlobalHeaderHidden] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [disableDepartment, setDisableDepartment] = useState(false)
    const [disableEmployee, setDisableEmployee] = useState(false)
    const [hideYear, setHideYear] = useState(false)
    const [hideMonth, setHideMonth] = useState(false)
    const [hideQuarter, setHideQuarter] = useState(false)
    const [hideYtd, setHideYtd] = useState(false)
    const [customYears, setCustomYears] = useState<number[] | undefined>(undefined)
    const [pageTitle, setPageTitle] = useState("")
    const [pageSubtitle, setPageSubtitle] = useState("")

    // Function to reset all filters to default state
    const resetHeaderControls = () => {
        setGlobalHeaderHidden(false)
        setShowFilters(false)
        setDisableDepartment(false)
        setDisableEmployee(false)
        setHideYear(false)
        setHideMonth(false)
        setHideQuarter(false)
        setHideYtd(false)
        setCustomYears(undefined)
        setPageTitle("")
        setPageSubtitle("")
    }

    return (
        <HeaderControlContext.Provider value={{
            isGlobalHeaderHidden,
            setGlobalHeaderHidden,
            showFilters,
            setShowFilters,
            disableDepartment,
            setDisableDepartment,
            disableEmployee,
            setDisableEmployee,
            hideYear,
            setHideYear,
            hideMonth,
            setHideMonth,
            hideQuarter,
            setHideQuarter,
            hideYtd,
            setHideYtd,
            customYears,
            setCustomYears,
            pageTitle,
            setPageTitle,
            pageSubtitle,
            setPageSubtitle,
            resetHeaderControls
        }}>
            {children}
        </HeaderControlContext.Provider>
    )
}

export function useHeaderControl() {
    const context = useContext(HeaderControlContext)
    if (context === undefined) {
        throw new Error("useHeaderControl must be used within a HeaderControlProvider")
    }
    return context
}
