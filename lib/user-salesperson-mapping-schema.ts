import { z } from 'zod';

export const UserSalespersonMappingRecord = z.object({
    id: z.string().trim().min(1).optional(),
    username: z.coerce.string().trim().min(1),
    departmentCode: z.coerce.string().trim().min(1),
    departmentName: z.coerce.string().trim().min(1),
    employeeCode: z.coerce.string().trim().min(1),
    employeeName: z.coerce.string().trim().min(1),
    priority: z.coerce.number().int().min(1).max(3),
    note: z.preprocess((val) => {
        if (typeof val === 'string' && val.trim() === '') return undefined;
        return val;
    }, z.string().trim().optional()),
});

export const UserSalespersonMappingArray = z.array(UserSalespersonMappingRecord);

export type UserSalespersonMappingRecord = z.infer<typeof UserSalespersonMappingRecord>;
export type UserSalespersonMappingArray = z.infer<typeof UserSalespersonMappingArray>;
