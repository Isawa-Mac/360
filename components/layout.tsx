"use client"

import React, { useEffect } from "react"
import { useHeaderControl } from "@/contexts/header-control-context"

interface LayoutProps {
    children: React.ReactNode
    pageTitle?: string
    pageSubtitle?: string
    showFilters?: boolean
    hideYear?: boolean
    hideMonth?: boolean
    hideQuarter?: boolean
    hideYtd?: boolean
    disableDepartment?: boolean
    disableEmployee?: boolean
    customYears?: number[]
    hideHeader?: boolean
}

export function Layout({
    children,
    pageTitle,
    pageSubtitle,
    showFilters = false,
    hideYear = false,
    hideMonth = false,
    hideQuarter = false,
    hideYtd = false,
    disableDepartment = false,
    disableEmployee = false,
    customYears,
    hideHeader = false,
}: LayoutProps) {
    const {
        setPageTitle,
        setPageSubtitle,
        setShowFilters,
        setHideYear,
        setHideMonth,
        setHideQuarter,
        setHideYtd,
        setDisableDepartment,
        setDisableEmployee,
        setCustomYears,
        setGlobalHeaderHidden,
    } = useHeaderControl()

    useEffect(() => {
        // Apply settings
        setPageTitle(pageTitle || "")
        setPageSubtitle(pageSubtitle || "")
        setShowFilters(showFilters)
        setHideYear(hideYear)
        setHideMonth(hideMonth)
        setHideQuarter(hideQuarter)
        setHideYtd(hideYtd)
        setDisableDepartment(disableDepartment)
        setDisableEmployee(disableEmployee)
        setCustomYears(customYears)
        setGlobalHeaderHidden(hideHeader)

        // We don't reset on unmount here to avoid flicker during transitions
        // if the next page also uses Layout
    }, [
        pageTitle,
        pageSubtitle,
        showFilters,
        hideYear,
        hideMonth,
        hideQuarter,
        hideYtd,
        disableDepartment,
        disableEmployee,
        customYears,
        hideHeader,
        setPageTitle,
        setPageSubtitle,
        setShowFilters,
        setHideYear,
        setHideMonth,
        setHideQuarter,
        setHideYtd,
        setDisableDepartment,
        setDisableEmployee,
        setCustomYears,
        setGlobalHeaderHidden
    ])

    return <>{children}</>
}
