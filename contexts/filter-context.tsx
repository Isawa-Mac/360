"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface FilterState {
    selectedDepartment: string
    selectedEmployee: string
    selectedYear: string
    selectedMonth: string
    selectedQuarter: string
    selectedPeriod: string // ytd, month, quarter
    selectedGroup: string // เพิ่ม filter สำหรับ KPI Group
}

interface FilterContextType {
    filters: FilterState
    updateFilters: (newFilters: Partial<FilterState>) => void
    resetFilters: () => void
    getFilterParams: () => URLSearchParams
    getFilterHeaders: () => Record<string, string>
    buildWhereClause: () => string
    isFilterChanging: boolean
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

// ฟังก์ชันสำหรับสร้าง default filters
const getDefaultFilters = (): FilterState => ({
    selectedDepartment: "all",
    selectedEmployee: "all",
    selectedYear: new Date().getFullYear().toString(), // ใช้ปีปัจจุบัน
    selectedMonth: "",
    selectedQuarter: "",
    selectedPeriod: "ytd", // ตั้งค่า YTD เป็น default
    selectedGroup: "all" // เพิ่ม default value สำหรับ Group
})

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<FilterState>(getDefaultFilters())
    const [isFilterChanging, setIsFilterChanging] = useState(false)

    // อัพเดท filters
    const updateFilters = (newFilters: Partial<FilterState>) => {
        console.log('🔄 updateFilters called, setting loading to true')
        setIsFilterChanging(true)
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            return updated;
        });

        // Reset loading state หลังจาก delay
        setTimeout(() => {
            console.log('✅ Loading timeout completed, setting loading to false')
            setIsFilterChanging(false)
        }, 2000) // เพิ่มเวลาเป็น 2 วินาทีเพื่อทดสอบ
    }

    // รีเซ็ต filters
    const resetFilters = () => {
        setIsFilterChanging(true)
        setFilters(getDefaultFilters());

        // Reset loading state หลังจาก delay
        setTimeout(() => {
            setIsFilterChanging(false)
        }, 2000) // เพิ่มเวลาเป็น 2 วินาทีเพื่อทดสอบ
    }

    // สร้าง URL parameters สำหรับส่งไป API
    const getFilterParams = () => {
        const params = new URLSearchParams()

        if (filters.selectedDepartment !== "all") {
            params.append("department", filters.selectedDepartment)
        }

        if (filters.selectedEmployee !== "all") {
            params.append("employee", filters.selectedEmployee)
        }

        if (filters.selectedYear) {
            params.append("year", filters.selectedYear)
        }

        if (filters.selectedGroup !== "all") {
            params.append("group", filters.selectedGroup)
        }

        if (filters.selectedPeriod === "month" && filters.selectedMonth) {
            params.append("month", filters.selectedMonth)
        }

        if (filters.selectedPeriod === "quarter" && filters.selectedQuarter) {
            params.append("quarter", filters.selectedQuarter)
        }

        // ส่ง period parameter เฉพาะเมื่อมีค่า period ที่เลือก (ไม่ใช่ค่าว่าง)
        if (filters.selectedPeriod && filters.selectedPeriod !== "") {
            params.append("period", filters.selectedPeriod)
        }

        return params
    }

    // สร้าง WHERE clause สำหรับ SQL
    const buildWhereClause = () => {
        const conditions: string[] = []

        // Filter by department
        if (filters.selectedDepartment !== "all") {
            conditions.push(`รหัสกลุ่ม = '${filters.selectedDepartment}'`)
        }

        // Filter by employee
        if (filters.selectedEmployee !== "all") {
            conditions.push(`รหัสพนักงานขาย = '${filters.selectedEmployee}'`)
        }

        // Filter by year
        if (filters.selectedYear) {
            conditions.push(`YEAR(วันที่) = ${filters.selectedYear}`)
        }

        // Filter by period
        if (filters.selectedPeriod === "month" && filters.selectedMonth) {
            conditions.push(`MONTH(วันที่) = ${filters.selectedMonth}`)
        } else if (filters.selectedPeriod === "quarter" && filters.selectedQuarter) {
            const quarter = filters.selectedQuarter
            if (quarter === "q1") {
                conditions.push(`MONTH(วันที่) IN (1, 2, 3)`)
            } else if (quarter === "q2") {
                conditions.push(`MONTH(วันที่) IN (4, 5, 6)`)
            } else if (quarter === "q3") {
                conditions.push(`MONTH(วันที่) IN (7, 8, 9)`)
            } else if (quarter === "q4") {
                conditions.push(`MONTH(วันที่) IN (10, 11, 12)`)
            }
        }
        // YTD ไม่ต้องเพิ่ม condition เพราะมี year filter แล้ว

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

        return whereClause
    }

    // สร้าง filter headers สำหรับส่งไป API
    const getFilterHeaders = () => {
        const headers: Record<string, string> = {}

        if (filters.selectedDepartment !== "all") {
            headers['X-Filter-Department'] = filters.selectedDepartment
        }

        if (filters.selectedEmployee !== "all") {
            headers['X-Filter-Employee'] = filters.selectedEmployee
        }

        if (filters.selectedYear) {
            headers['X-Filter-Year'] = filters.selectedYear
        }

        if (filters.selectedGroup !== "all") {
            headers['X-Filter-Group'] = filters.selectedGroup
        }

        if (filters.selectedPeriod === "month" && filters.selectedMonth) {
            headers['X-Filter-Month'] = filters.selectedMonth
        }

        if (filters.selectedPeriod === "quarter" && filters.selectedQuarter) {
            headers['X-Filter-Quarter'] = filters.selectedQuarter
        }

        if (filters.selectedPeriod && filters.selectedPeriod !== "") {
            headers['X-Filter-Period'] = filters.selectedPeriod
        }

        return headers
    }

    const value = {
        filters,
        updateFilters,
        resetFilters,
        getFilterParams,
        getFilterHeaders,
        buildWhereClause,
        isFilterChanging
    }

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilter() {
    const context = useContext(FilterContext)
    if (context === undefined) {
        throw new Error("useFilter must be used within a FilterProvider")
    }
    return context
}
