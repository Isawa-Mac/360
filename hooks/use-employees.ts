import { useState, useEffect } from 'react';

interface Employee {
  รหัสกลุ่ม: string;
  ชื่อกลุ่ม: string;
  รหัสพนักงานขาย: string;
  ชื่อพนักงานขาย: string;
}

export function useEmployees(selectedDepartment: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedDepartment) {
        setEmployees([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/salespersons', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูลพนักงานได้');
        }
        const data = (await res.json()) as any[];
        
        // แปลงข้อมูล: แต่ละพนักงานอาจมีหลายแผนก (แผนกเป็น array)
        const formattedData: Employee[] = [];
        for (const sp of data) {
          const แผนก = sp['แผนก'] || [];
          if (!Array.isArray(แผนก) || แผนก.length === 0) {
            // ถ้าไม่มีแผนก ให้ข้าม
            continue;
          }
          
          // ถ้าเลือก 'all' ให้เพิ่มทุกแผนกของพนักงานนี้
          // ถ้าเลือกแผนกเฉพาะ ให้กรองเฉพาะแผนกที่ตรง
          for (const dept of แผนก) {
            if (selectedDepartment === 'all' || dept['รหัสกลุ่ม'] === selectedDepartment) {
              formattedData.push({
                รหัสกลุ่ม: dept['รหัสกลุ่ม'] || '',
                ชื่อกลุ่ม: dept['ชื่อกลุ่ม'] || '',
                รหัสพนักงานขาย: sp['รหัสพนักงานขาย'] || sp.id || '',
                ชื่อพนักงานขาย: sp['ชื่อพนักงานขาย'] || '',
              });
            }
          }
        }

        setEmployees(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [selectedDepartment]);

  // สร้าง format ชื่อ (รหัส) สำหรับแสดงใน combobox
  const getFormattedEmployees = () => {
    return employees.map(emp => ({
      value: emp.รหัสพนักงานขาย,
      label: selectedDepartment === 'all' 
        ? `${emp.ชื่อพนักงานขาย} (${emp.รหัสพนักงานขาย}) - ${emp.ชื่อกลุ่ม}`
        : `${emp.ชื่อพนักงานขาย} (${emp.รหัสพนักงานขาย})`
    }));
  };

  return {
    employees,
    formattedEmployees: getFormattedEmployees(),
    loading,
    error
  };
}
