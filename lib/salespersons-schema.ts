import { z } from 'zod';

// Schema สำหรับแผนกเดียว
const DepartmentSchema = z.object({
    'รหัสกลุ่ม': z.coerce.string().trim().min(1),
    'ชื่อกลุ่ม': z.coerce.string().trim().min(1),
});

export const Salesperson = z.preprocess((val: any) => {
    // รองรับ backward compatibility: ถ้ามี 'รหัสกลุ่ม' และ 'ชื่อกลุ่ม' แบบเดิม ให้แปลงเป็น array
    if (val && typeof val === 'object') {
        if (val['รหัสกลุ่ม'] && val['ชื่อกลุ่ม'] && !val['แผนก']) {
            // แปลงจากรูปแบบเก่า (string) เป็นรูปแบบใหม่ (array)
            return {
                ...val,
                'แผนก': [{
                    'รหัสกลุ่ม': val['รหัสกลุ่ม'],
                    'ชื่อกลุ่ม': val['ชื่อกลุ่ม']
                }]
            };
        }
    }
    return val;
}, z.object({
    id: z.coerce.string().trim().min(1),
    'รหัสพนักงานขาย': z.coerce.string().trim().min(1),
    'ชื่อพนักงานขาย': z.coerce.string().trim().min(1),
    'แผนก': z.array(DepartmentSchema).min(1), // ต้องมีอย่างน้อย 1 แผนก
    // ใช้ string().datetime() แทน coerce เพื่อลดปัญหาเมธอดไม่รองรับ
    updatedAt: z.string().datetime().optional(),
    // อนุญาตให้เป็น path แบบ relative (เช่น /uploads/...) ไม่บังคับเป็น URL เต็ม
    // รองรับ empty string หรือ undefined (ถ้า empty string ให้เก็บเป็น undefined)
    รูปภาพ: z.preprocess((val) => {
        if (typeof val === 'string' && val.trim() === '') return undefined;
        return val;
    }, z.string().trim().min(1).optional()),
}));

export const SalespersonArray = z.array(Salesperson);

export type Salesperson = z.infer<typeof Salesperson>;
export type SalespersonArray = z.infer<typeof SalespersonArray>;
