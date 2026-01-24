import { useState, useEffect } from 'react';

export interface Department {
  รหัสกลุ่ม: string;
  ชื่อกลุ่ม: string;
  logoUrl?: string;
  [key: string]: any;
}

export interface FormattedDepartment {
  value: string;
  label: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formattedDepartments, setFormattedDepartments] = useState<FormattedDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/departments.json');
        if (res.ok) {
          const data = await res.json();
          const depts = Array.isArray(data) ? data : [];
          setDepartments(depts);
          setFormattedDepartments(depts.map((d: any) => ({
            value: d.รหัสกลุ่ม,
            label: d.ชื่อกลุ่ม
          })));
        } else {
          setError("Failed to fetch departments");
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return { departments, formattedDepartments, loading, error };
}
