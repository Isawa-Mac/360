"use client";

import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Filter, RotateCcw } from "lucide-react";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import { useFilter } from "@/contexts/filter-context";
import { useReload } from "@/contexts/reload-context";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface HeaderFiltersProps {
    className?: string;
    showFilters?: boolean; // เพิ่ม parameter สำหรับควบคุมการแสดง/ซ่อน filter
    disableDepartment?: boolean; // เพิ่ม parameter สำหรับ disable หน่วยงาน
    disableEmployee?: boolean; // เพิ่ม parameter สำหรับ disable พนักงานขาย
    customYears?: number[]; // เพิ่ม parameter สำหรับกำหนดรายการปีที่แสดง
    hideYear?: boolean; // เพิ่ม parameter สำหรับซ่อนปี
    hideMonth?: boolean; // เพิ่ม parameter สำหรับซ่อนเดือน
    hideQuarter?: boolean; // เพิ่ม parameter สำหรับซ่อนไตรมาส
    hideYtd?: boolean; // เพิ่ม parameter สำหรับซ่อนปุ่ม YTD
}

export function HeaderFilters({
    className,
    showFilters = true,
    disableDepartment = false,
    disableEmployee = false,
    customYears,
    hideYear = false,
    hideMonth = false,
    hideQuarter = false,
    hideYtd = false
}: HeaderFiltersProps) {

    const currentYear = new Date().getFullYear();
    // ใช้ customYears ถ้ามี หรือใช้ค่า default 4 ปี
    const years = customYears || Array.from({ length: 4 }, (_, i) => currentYear - i);

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [visibleFilters, setVisibleFilters] = useState({
        department: !disableDepartment,
        employee: !disableEmployee,
        year: !hideYear,
        month: !hideMonth,        // ใช้ props hideMonth
        quarter: !hideQuarter,    // ใช้ props hideQuarter
        ytd: !hideYtd,            // แสดง/ซ่อน YTD filter ตาม prop
        group: false,              // ซ่อน KPI Group filter
    });

    // อัปเดต visibleFilters เมื่อ props เปลี่ยน
    useEffect(() => {
        setVisibleFilters(prev => ({
            ...prev,
            year: !hideYear,
            month: !hideMonth,
            quarter: !hideQuarter,
            ytd: !hideYtd,
            group: false, // ไม่แสดง KPI Group เมื่อซ่อนเดือน/ไตรมาส
        }));
    }, [hideYear, hideMonth, hideQuarter, hideYtd]);

    // เพื่อให้มั่นใจว่า component ถูก mount บน client
    useEffect(() => {
        setMounted(true);
    }, []);

    // ใช้ FilterContext แทน local state
    const { filters, updateFilters } = useFilter();

    // ใช้ ReloadContext สำหรับส่ง event reload
    const { triggerReload } = useReload();



    // ดึง user จาก AuthContext (SSO)
    const { user } = useAuth();

    // state สำหรับเก็บข้อมูล lock filter จาก mapping
    const [lockInfo, setLockInfo] = useState<{
        priority: number;
        departmentCodes: string[]; // หลายกลุ่ม
        employeeCode: string | null;
    } | null>(null);

    // โหลด mapping จาก API ตาม username
    useEffect(() => {
        const loadMapping = async () => {
            if (!user?.username) {
                setLockInfo(null);
                return;
            }
            try {
                const res = await fetch(
                    `/api/user-salesperson-mapping?username=${encodeURIComponent(
                        user.username
                    )}`,
                    { cache: "no-store" }
                );
                if (!res.ok) {
                    setLockInfo(null);
                    return;
                }
                const data: any[] = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    setLockInfo(null);
                    return;
                }
                // เรียงตาม priority น้อยไปมาก
                const sorted = [...data].sort(
                    (a, b) => (a.priority ?? 99) - (b.priority ?? 99)
                );
                const topPriority = sorted[0]?.priority ?? 99;

                // priority = 1 → ไม่ lock filter
                if (topPriority === 1) {
                    setLockInfo(null);
                    return;
                }

                // ดึงทุก record ที่มี priority น้อยสุด (อาจมีหลายกลุ่ม)
                const topPriorityRecords = sorted.filter(
                    (m) => (m.priority ?? 99) === topPriority
                );

                // รวบรวม department codes ทั้งหมด (ไม่ซ้ำ)
                const departmentCodesSet = new Set<string>();
                let employeeCode: string | null = null;

                for (const record of topPriorityRecords) {
                    if (record.departmentCode) {
                        departmentCodesSet.add(record.departmentCode);
                    }
                    // สำหรับ priority 3: ใช้ employeeCode จาก record แรก (ถ้ามีหลายคนให้ใช้ตัวแรก)
                    if (topPriority === 3 && !employeeCode && record.employeeCode) {
                        employeeCode = record.employeeCode;
                    }
                }

                const departmentCodes = Array.from(departmentCodesSet);

                // priority 2 หรือ 3 → lock ตาม priority
                setLockInfo({
                    priority: topPriority,
                    departmentCodes: departmentCodes.length > 0 ? departmentCodes : [],
                    employeeCode,
                });
            } catch {
                setLockInfo(null);
            }
        };

        loadMapping();
    }, [user?.username]);

    // เมื่อมี lock ให้ sync ค่าเข้า FilterContext
    useEffect(() => {
        if (!lockInfo || lockInfo.departmentCodes.length === 0) return;

        const updates: Partial<typeof filters> = {};

        // priority 2 และ 3: lock หน่วยงาน
        // ถ้ามีหลายกลุ่ม → ใช้ "all" เป็น default (เพื่อให้เลือกได้ทั้ง "all" และแต่ละกลุ่ม)
        // ถ้ามีกลุ่มเดียว → lock เป็นกลุ่มนั้น
        if (lockInfo.departmentCodes.length === 1) {
            // มีกลุ่มเดียว → lock เป็นกลุ่มนั้น
            if (filters.selectedDepartment !== lockInfo.departmentCodes[0]) {
                updates.selectedDepartment = lockInfo.departmentCodes[0];
            }
        } else {
            // มีหลายกลุ่ม → ใช้กลุ่มแรกเป็น default (ไม่มี "all" เพราะ priority != 1)
            if (!lockInfo.departmentCodes.includes(filters.selectedDepartment)) {
                updates.selectedDepartment = lockInfo.departmentCodes[0];
            }
        }

        // priority 3 เท่านั้น: lock พนักงานขาย
        if (
            lockInfo.priority === 3 &&
            lockInfo.employeeCode &&
            filters.selectedEmployee !== lockInfo.employeeCode
        ) {
            updates.selectedEmployee = lockInfo.employeeCode;
        }

        if (Object.keys(updates).length > 0) {
            updateFilters(updates);
        }
    }, [lockInfo, filters.selectedDepartment, filters.selectedEmployee, updateFilters]);

    // ดึงข้อมูลกลุ่มจาก API
    const { formattedDepartments, loading: deptLoading, error: deptError } = useDepartments();

    // ดึงข้อมูลพนักงานขายตามหน่วยงานที่เลือก
    const { formattedEmployees, loading: empLoading, error: empError } = useEmployees(filters.selectedDepartment);

    // ฟังก์ชันจัดการการเลือกช่วงเวลา
    const handlePeriodChange = (period: string, value: string) => {
        // ถ้าเลือก "cancel" ให้ยกเลิกการเลือก
        if (value === 'cancel') {
            if (period === 'month') {
                updateFilters({
                    selectedPeriod: "",
                    selectedMonth: ""
                });
            } else if (period === 'quarter') {
                updateFilters({
                    selectedPeriod: "",
                    selectedQuarter: ""
                });
            }
            return;
        }

        // ถ้าเลือก YTD และตอนนี้เป็น YTD อยู่แล้ว ให้ยกเลิก YTD
        if (period === 'ytd' && filters.selectedPeriod === 'ytd') {
            updateFilters({
                selectedPeriod: "", // กลับไปเป็นค่าว่าง
                selectedMonth: "",
                selectedQuarter: ""
            });
        } else {
            // เลือกช่วงเวลาอื่นๆ
            updateFilters({ selectedPeriod: period });

            // Reset ค่าอื่นๆ
            if (period === 'month') {
                updateFilters({ selectedMonth: value, selectedQuarter: "" });
            } else if (period === 'quarter') {
                updateFilters({ selectedQuarter: value, selectedMonth: "" });
            } else if (period === 'ytd') {
                updateFilters({ selectedMonth: "", selectedQuarter: "" });
            }
        }
    };

    // ฟังก์ชันจัดการ reload พร้อม animation
    const handleReload = async () => {
        setIsReloading(true);
        try {
            triggerReload();
            // รอสักครู่เพื่อให้ animation ทำงาน
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {

        } finally {
            setIsReloading(false);
        }
    };

    // Dynamic classes based on theme
    const getSelectTriggerClass = (isYear = false, isSelected = false) => {
        const baseClass = "h-8 border focus:ring-2 rounded-md text-[11px] transition-all duration-200";
        if (isYear || isSelected) {
            return `${baseClass} ${isYear ? 'w-[100px]' : 'w-auto'} bg-primary border-primary hover:bg-primary/90 focus:ring-ring text-primary-foreground font-semibold shadow-md`;
        }
        return `${baseClass} w-auto bg-muted dark:bg-background border-border hover:bg-muted/80 dark:hover:bg-accent focus:ring-ring text-foreground`;
    };

    const getMobileSelectClass = (isYear = false) => {
        const baseClass = "h-8 border focus:ring-2 text-[11px] rounded-md";
        if (isYear) {
            return `${baseClass} w-[80px] bg-primary border-primary hover:bg-primary/90 focus:ring-ring text-primary-foreground font-semibold shadow-md`;
        }
        return `${baseClass} bg-muted dark:bg-background border-border hover:bg-muted/80 dark:hover:bg-accent text-foreground`;
    };

    const getDropdownClass = () => {
        return "bg-popover border-border shadow-lg text-[11px]";
    };

    const getOverlayClass = () => {
        return "lg:hidden fixed inset-0 bg-black/20 z-40";
    };

const getMobileDropdownClass = () => {
        return "lg:hidden absolute top-12 right-4 left-4 bg-popover border border-border rounded-lg p-4 shadow-lg z-50 text-foreground";
    };

    // สร้าง Department Select Content Component
    // ถ้ามี lock และมีหลายกลุ่ม → แสดงเฉพาะกลุ่มที่ lock ไว้
    // ถ้ามี lock และมีกลุ่มเดียว → lock (disabled)
    // priority 1 เท่านั้น → แสดง "หน่วยงานทั้งหมด" ให้เลือกได้
    const DepartmentSelectContent = () => {
        // ถ้ามี lock และมีหลายกลุ่ม → filter ให้แสดงเฉพาะกลุ่มที่ lock ไว้
        const allowedDepts = lockInfo && lockInfo.departmentCodes.length > 1
            ? formattedDepartments.filter((d: any) => lockInfo!.departmentCodes.includes(d.value))
            : formattedDepartments;

        // แสดง "หน่วยงานทั้งหมด" เฉพาะเมื่อ priority = 1 (ไม่มี lock) หรือไม่มี lockInfo
        const showAllOption = !lockInfo;

        return (
            <SelectContent className={getDropdownClass()}>
                {showAllOption ? (
                    <SelectItem value="all">หน่วยงานทั้งหมด</SelectItem>
                ) : null}
                {deptLoading ? (
                    <SelectItem value="loading" disabled>กำลังโหลดข้อมูล...</SelectItem>
                ) : deptError ? (
                    <SelectItem value="error" disabled>เกิดข้อผิดพลาดในการโหลดข้อมูล</SelectItem>
                ) : (
                    allowedDepts.map((dept: any) => (
                        <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        );
    };

    // สร้าง Employee Select Content Component
    const EmployeeSelectContent = () => (
        <SelectContent className={getDropdownClass()}>
            <SelectItem value="all">พนักงานขายทั้งหมด</SelectItem>
            {empLoading ? (
                <SelectItem value="loading" disabled>กำลังโหลดข้อมูลพนักงาน...</SelectItem>
            ) : empError ? (
                <SelectItem value="error" disabled>เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน</SelectItem>
            ) : formattedEmployees.length === 0 ? (
                <SelectItem value="no-data" disabled>ไม่พบข้อมูลพนักงาน</SelectItem>
            ) : (
                formattedEmployees.map((emp: any) => (
                    <SelectItem key={emp.value} value={emp.value}>
                        {emp.label}
                    </SelectItem>
                ))
            )}
        </SelectContent>
    );

    // Reset employee selection when department changes
    const handleDepartmentChange = (value: string) => {
        updateFilters({ selectedDepartment: value });
        // ไม่ reset การเลือกพนักงานเมื่อเปลี่ยนหน่วยงาน
    };

    // ถ้ายังไม่ mount ให้ return null เพื่อป้องกัน hydration mismatch
    if (!mounted) {
        return null;
    }

    // ถ้า showFilters เป็น false ให้ไม่แสดง filter ใดๆ
    if (!showFilters) {
        return null;
    }

    return (
        <>
            {/* Desktop View */}
            <div className={`hidden lg:flex items-center gap-3 ${className}`}>
                {/* เลือกหน่วยงาน */}
                {visibleFilters.department && !disableDepartment && (
                    <Select
                        value={filters.selectedDepartment}
                        onValueChange={(value) => {
                            // priority 2 หรือ 3: lock หน่วยงาน
                            // ถ้ามีหลายกลุ่ม → ให้เลือกได้เฉพาะกลุ่มที่ lock ไว้ (ไม่มี "all" เพราะ priority != 1)
                            // ถ้ามีกลุ่มเดียว → lock (disabled)
                            if (lockInfo && lockInfo.departmentCodes.length === 1) return;
                            // ถ้ามีหลายกลุ่ม → ตรวจสอบว่าเลือกได้เฉพาะกลุ่มที่ lock ไว้
                            if (lockInfo && lockInfo.departmentCodes.length > 1) {
                                if (!lockInfo.departmentCodes.includes(value)) {
                                    return; // ไม่ให้เลือกกลุ่มที่ไม่อยู่ใน lock
                                }
                            }
                            handleDepartmentChange(value);
                        }}
                    >
                        <SelectTrigger
                            className={cn("w-auto", getSelectTriggerClass(false, filters.selectedDepartment !== "all"))}
                            disabled={lockInfo?.departmentCodes.length === 1}
                        >
                            <SelectValue placeholder="เลือกหน่วยงาน" />
                        </SelectTrigger>
                        <DepartmentSelectContent />
                    </Select>
                )}

                {/* เลือกพนักงาน */}
                {visibleFilters.employee && !disableEmployee && (
                    <Select
                        value={filters.selectedEmployee}
                        onValueChange={(value) => {
                            // priority 3 เท่านั้น: lock พนักงานขาย
                            if (lockInfo?.priority === 3) return;
                            updateFilters({ selectedEmployee: value });
                        }}
                    >
                        <SelectTrigger
                            className={cn("w-auto", getSelectTriggerClass(false, filters.selectedEmployee !== "all"))}
                            disabled={lockInfo?.priority === 3}
                        >
                            <SelectValue placeholder="เลือกพนักงานขาย" />
                        </SelectTrigger>
                        <EmployeeSelectContent />
                    </Select>
                )}

                {/* เลือกปี */}
                {visibleFilters.year && (
                    <Select value={filters.selectedYear} onValueChange={(value) => {
                        updateFilters({ selectedYear: value });
                    }}>
                        <SelectTrigger className={getSelectTriggerClass(true)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={getDropdownClass()}>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* เลือกเดือน */}
                {visibleFilters.month && (
                    <Select
                        value={filters.selectedMonth}
                        onValueChange={(value) => {
                            handlePeriodChange('month', value);
                        }}
                    >
                        <SelectTrigger
                            className={cn("w-auto", getSelectTriggerClass(false, filters.selectedPeriod === 'month'))}
                        >
                            <SelectValue placeholder="เดือน" />
                        </SelectTrigger>
                        <SelectContent className={getDropdownClass()}>
                            <SelectItem value="cancel">ยกเลิก</SelectItem>
                            <SelectItem value="01">มกราคม</SelectItem>
                            <SelectItem value="02">กุมภาพันธ์</SelectItem>
                            <SelectItem value="03">มีนาคม</SelectItem>
                            <SelectItem value="04">เมษายน</SelectItem>
                            <SelectItem value="05">พฤษภาคม</SelectItem>
                            <SelectItem value="06">มิถุนายน</SelectItem>
                            <SelectItem value="07">กรกฎาคม</SelectItem>
                            <SelectItem value="08">สิงหาคม</SelectItem>
                            <SelectItem value="09">กันยายน</SelectItem>
                            <SelectItem value="10">ตุลาคม</SelectItem>
                            <SelectItem value="11">พฤศจิกายน</SelectItem>
                            <SelectItem value="12">ธันวาคม</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {/* เลือกไตรมาส */}
                {visibleFilters.quarter && (
                    <Select
                        value={filters.selectedQuarter}
                        onValueChange={(value) => {
                            handlePeriodChange('quarter', value);
                        }}
                    >
                        <SelectTrigger
                            className={cn("w-auto", getSelectTriggerClass(false, filters.selectedPeriod === 'quarter'))}
                        >
                            <SelectValue placeholder="ไตรมาส" />
                        </SelectTrigger>
                        <SelectContent className={getDropdownClass()}>
                            <SelectItem value="cancel">ยกเลิก</SelectItem>
                            <SelectItem value="q1">ไตรมาส 1</SelectItem>
                            <SelectItem value="q2">ไตรมาส 2</SelectItem>
                            <SelectItem value="q3">ไตรมาส 3</SelectItem>
                            <SelectItem value="q4">ไตรมาส 4</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {/* ปุ่ม YTD */}
                {visibleFilters.ytd && (
                    <Button
                        variant="default"
                        onClick={() => {
                            handlePeriodChange('ytd', '');
                        }}
                        className={`h-8 px-6 text-[11px] font-semibold shadow-md rounded-md ${filters.selectedPeriod === 'ytd'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'bg-muted dark:bg-background hover:bg-muted/80 dark:hover:bg-accent text-foreground border'
                            }`}
                    >
                        YTD
                    </Button>
                )}


            </div>

            {/* Mobile View */}
            <div className={`lg:hidden flex items-center gap-2 ${className}`}>
                {/* ปุ่มแสดงปี และ YTD */}
                <div className="flex items-center gap-2">
                    {visibleFilters.year && (
                        <Select value={filters.selectedYear} onValueChange={(value) => updateFilters({ selectedYear: value })}>
                            <SelectTrigger className={getMobileSelectClass(true)}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={getDropdownClass()}>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {visibleFilters.ytd && (
                        <Button
                            variant="default"
                            onClick={() => handlePeriodChange('ytd', '')}
                            className={`h-8 px-4 text-[11px] font-semibold shadow-md rounded-md ${filters.selectedPeriod === 'ytd'
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                : 'bg-muted dark:bg-background hover:bg-muted/80 dark:hover:bg-accent text-foreground border'
                                }`}
                        >
                            YTD
                        </Button>
                    )}
                </div>



                {/* ปุ่มแสดง/ซ่อน filters */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="h-8 rounded-md border-border hover:bg-muted dark:hover:bg-accent"
                >
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Mobile Filters Dropdown */}
            {showMobileFilters && (
                <>
                    <div
                        className={getOverlayClass()}
                        onClick={() => setShowMobileFilters(false)}
                    />

                    {/* Dropdown */}
                    <div className={getMobileDropdownClass()}>
                        <div className="grid grid-cols-1 gap-3">
                            {/* เลือกหน่วยงาน */}
                            {visibleFilters.department && !disableDepartment && (
                                <Select
                                    value={filters.selectedDepartment}
                                    onValueChange={(value) => {
                                        // priority 2 หรือ 3: lock หน่วยงาน
                                        // ถ้ามีหลายกลุ่ม → ให้เลือกได้เฉพาะกลุ่มที่ lock ไว้ (ไม่มี "all" เพราะ priority != 1)
                                        // ถ้ามีกลุ่มเดียว → lock (disabled)
                                        if (lockInfo && lockInfo.departmentCodes.length === 1) return;
                                        // ถ้ามีหลายกลุ่ม → ตรวจสอบว่าเลือกได้เฉพาะกลุ่มที่ lock ไว้
                                        if (lockInfo && lockInfo.departmentCodes.length > 1) {
                                            if (!lockInfo.departmentCodes.includes(value)) {
                                                return; // ไม่ให้เลือกกลุ่มที่ไม่อยู่ใน lock
                                            }
                                        }
                                        handleDepartmentChange(value);
                                    }}
                                >
                                    <SelectTrigger
                                        className={`w-full ${getSelectTriggerClass()}`}
                                        disabled={lockInfo?.departmentCodes.length === 1}
                                    >
                                        <SelectValue placeholder="เลือกหน่วยงาน" />
                                    </SelectTrigger>
                                    <DepartmentSelectContent />
                                </Select>
                            )}

                            {/* เลือก KPI Group */}
                            {visibleFilters.group && (
                                <Select value={filters.selectedGroup} onValueChange={(value) => updateFilters({ selectedGroup: value })}>
                                    <SelectTrigger className={`w-full ${getSelectTriggerClass()}`}>
                                        <SelectValue placeholder="เลือก KPI Group" />
                                    </SelectTrigger>
                                    <SelectContent className={getDropdownClass()}>
                                        <SelectItem value="all">KPI Group ทั้งหมด</SelectItem>
                                        <SelectItem value="GROUP">KPI Group</SelectItem>
                                        <SelectItem value="INDIVIDUAL">KPI Individual</SelectItem>
                                        <SelectItem value="TEAM">KPI Team</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {/* เลือกพนักงาน */}
                            {visibleFilters.employee && !disableEmployee && (
                                <Select
                                    value={filters.selectedEmployee}
                                    onValueChange={(value) => {
                                        // priority 3 เท่านั้น: lock พนักงานขาย
                                        if (lockInfo?.priority === 3) return;
                                        updateFilters({ selectedEmployee: value })
                                    }}
                                >
                                    <SelectTrigger
                                        className={`w-full ${getSelectTriggerClass()}`}
                                        disabled={lockInfo?.priority === 3}
                                    >
                                        <SelectValue placeholder="เลือกพนักงานขาย" />
                                    </SelectTrigger>
                                    <EmployeeSelectContent />
                                </Select>
                            )}

                            {/* เลือกเดือนและไตรมาส */}
                            {(visibleFilters.month || visibleFilters.quarter) && (
                                <div className="grid grid-cols-2 gap-2">
                                    {visibleFilters.month && (
                                        <Select
                                            value={filters.selectedMonth}
                                            onValueChange={(value) => handlePeriodChange('month', value)}
                                        >
                                            <SelectTrigger
                                                className={`w-auto ${getSelectTriggerClass()} ${filters.selectedPeriod === 'month'
                                                    ? 'bg-primary border-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md'
                                                    : ''
                                                    }`}
                                            >
                                                <SelectValue placeholder="เดือน" />
                                            </SelectTrigger>
                                            <SelectContent className={getDropdownClass()}>
                                                <SelectItem value="cancel">ยกเลิก</SelectItem>
                                                <SelectItem value="01">มกราคม</SelectItem>
                                                <SelectItem value="02">กุมภาพันธ์</SelectItem>
                                                <SelectItem value="03">มีนาคม</SelectItem>
                                                <SelectItem value="04">เมษายน</SelectItem>
                                                <SelectItem value="05">พฤษภาคม</SelectItem>
                                                <SelectItem value="06">มิถุนายน</SelectItem>
                                                <SelectItem value="07">กรกฎาคม</SelectItem>
                                                <SelectItem value="08">สิงหาคม</SelectItem>
                                                <SelectItem value="09">กันยายน</SelectItem>
                                                <SelectItem value="10">ตุลาคม</SelectItem>
                                                <SelectItem value="11">พฤศจิกายน</SelectItem>
                                                <SelectItem value="12">ธันวาคม</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {visibleFilters.quarter && (
                                        <Select
                                            value={filters.selectedQuarter}
                                            onValueChange={(value) => handlePeriodChange('quarter', value)}
                                        >
                                            <SelectTrigger
                                                className={`w-auto ${getSelectTriggerClass()} ${filters.selectedPeriod === 'quarter'
                                                    ? 'bg-primary border-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md'
                                                    : ''
                                                    }`}
                                            >
                                                <SelectValue placeholder="ไตรมาส" />
                                            </SelectTrigger>
                                            <SelectContent className={getDropdownClass()}>
                                                <SelectItem value="cancel">ยกเลิก</SelectItem>
                                                <SelectItem value="q1">ไตรมาส 1</SelectItem>
                                                <SelectItem value="q2">ไตรมาส 2</SelectItem>
                                                <SelectItem value="q3">ไตรมาส 3</SelectItem>
                                                <SelectItem value="q4">ไตรมาส 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}

                            {visibleFilters.ytd && (
                                <Button
                                    variant="default"
                                    onClick={() => handlePeriodChange('ytd', '')}
                                    className={`h-8 px-6 text-[11px] font-semibold shadow-md rounded-md ${filters.selectedPeriod === 'ytd'
                                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                        : 'bg-muted dark:bg-background hover:bg-muted/80 dark:hover:bg-accent text-foreground border'
                                        }`}
                                >
                                    YTD
                                </Button>
                            )}



                        </div>
                    </div>
                </>
            )}
        </>
    );
}
