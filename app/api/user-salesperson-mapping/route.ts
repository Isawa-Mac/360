import { NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/fs-json';
import {
    UserSalespersonMappingRecord,
    UserSalespersonMappingArray,
} from '@/lib/user-salesperson-mapping-schema';

const DATA_PATH = 'public/data/user-salesperson-mapping.json';

// generate id จาก username + department + employee + priority
function generateId(
    username: string,
    departmentCode: string,
    employeeCode: string,
    priority: number
): string {
    const base = `${username}-${departmentCode}-${employeeCode}-${priority}`;
    return base.replace(/\s+/g, '').replace(/:/g, '-').toUpperCase();
}

function normalizeRecord(item: any) {
    const username = String(item?.username ?? '').trim();
    const departmentCode = String(item?.departmentCode ?? '').trim();
    const departmentName = String(item?.departmentName ?? '').trim();
    const employeeCode = String(item?.employeeCode ?? '').trim();
    const employeeName = String(item?.employeeName ?? '').trim();
    const priority = Number(item?.priority ?? 3);

    const id =
        item?.id || generateId(username, departmentCode, employeeCode, priority);

    return {
        id,
        username,
        departmentCode,
        departmentName,
        employeeCode,
        employeeName,
        priority,
        note: item?.note ? String(item.note).trim() : undefined,
    };
}

// GET: คืน array ของ mapping (option: filter ตาม username)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username')?.trim();

        let data: any = [];
        try {
            data = await readJson<unknown>(DATA_PATH);
        } catch {
            data = [];
        }

        const baseArr = Array.isArray(data) ? data : [];
        const normalized = baseArr.map(normalizeRecord);
        const parsed = UserSalespersonMappingArray.safeParse(normalized);
        const list = parsed.success ? parsed.data : [];

        const filtered = username
            ? list.filter(
                (m) =>
                    m.username.toLowerCase() === username.toLowerCase() ||
                    m.username.toLowerCase().includes(username.toLowerCase())
            )
            : list;

        // เรียงตาม username, priority (1 ก่อน 2 ก่อน 3), employeeCode
        filtered.sort((a, b) => {
            const ua = a.username.toLowerCase();
            const ub = b.username.toLowerCase();
            if (ua !== ub) return ua.localeCompare(ub);
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.employeeCode.localeCompare(b.employeeCode);
        });

        return NextResponse.json(filtered);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}

// POST: เพิ่ม mapping ใหม่
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = UserSalespersonMappingRecord.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        const incoming = result.data;

        const idToUse =
            incoming.id ||
            generateId(
                incoming.username,
                incoming.departmentCode,
                incoming.employeeCode,
                incoming.priority
            );

        let list: any = [];
        try {
            list = await readJson<unknown>(DATA_PATH);
        } catch {
            list = [];
        }
        const baseArr = Array.isArray(list) ? list : [];

        // กันซ้ำ: username + department + employee + priority
        const exists = baseArr.some((d: any) => {
            const normalized = normalizeRecord(d);
            return (
                normalized.username.toLowerCase() === incoming.username.toLowerCase() &&
                normalized.departmentCode === incoming.departmentCode &&
                normalized.employeeCode === incoming.employeeCode &&
                normalized.priority === incoming.priority
            );
        });

        if (exists) {
            return NextResponse.json(
                {
                    error:
                        'มี mapping นี้อยู่แล้ว (username / หน่วยงาน / พนักงานขาย / priority ซ้ำ)',
                },
                { status: 409 }
            );
        }

        const newItem = normalizeRecord({ ...incoming, id: idToUse });
        const updated = [...baseArr, newItem];
        await writeJson(DATA_PATH, updated);

        return NextResponse.json(newItem, { status: 201 });
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Failed to create', detail: String(err?.message || err) },
            { status: 500 }
        );
    }
}

// PUT: แก้ไข mapping ตาม id
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const result = UserSalespersonMappingRecord.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        const incoming = result.data;

        let list: any = [];
        try {
            list = await readJson<unknown>(DATA_PATH);
        } catch {
            list = [];
        }
        const baseArr: any[] = Array.isArray(list) ? list : [];

        const targetId =
            incoming.id ||
            generateId(
                incoming.username,
                incoming.departmentCode,
                incoming.employeeCode,
                incoming.priority
            );

        const index = baseArr.findIndex((d) => {
            const normalized = normalizeRecord(d);
            return normalized.id === targetId;
        });

        if (index === -1) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const updatedItem = normalizeRecord({ ...incoming, id: targetId });
        const updated = [...baseArr];
        updated[index] = updatedItem;
        await writeJson(DATA_PATH, updated);

        return NextResponse.json(updatedItem);
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Failed to update', detail: String(err?.message || err) },
            { status: 500 }
        );
    }
}

// DELETE: ลบตาม id
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const id = body?.id as string | undefined;
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        let list: any = [];
        try {
            list = await readJson<unknown>(DATA_PATH);
        } catch {
            list = [];
        }
        const baseArr: any[] = Array.isArray(list) ? list : [];

        const updated = baseArr.filter((d) => {
            const normalized = normalizeRecord(d);
            return normalized.id !== id;
        });

        await writeJson(DATA_PATH, updated);
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Failed to delete', detail: String(err?.message || err) },
            { status: 500 }
        );
    }
}
