import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/fs-json';
import { Salesperson, SalespersonArray } from '@/lib/salespersons-schema';

const DATA_PATH = 'public/data/salespersons.json';

export async function GET(_: NextRequest) {
    try {
        // อ่านข้อมูลจาก JSON file โดยตรง
        const data = await readJson<unknown>(DATA_PATH);
        // Be permissive: if it's already an array, return as-is after light normalization
        if (Array.isArray(data)) {
            const now = new Date().toISOString();
            const normalized = (data as any[]).map((it) => {
                // รองรับ backward compatibility: ถ้ามี 'รหัสกลุ่ม' และ 'ชื่อกลุ่ม' แบบเดิม ให้แปลงเป็น array
                let แผนก = it?.['แผนก'];
                if (!แผนก && it?.['รหัสกลุ่ม'] && it?.['ชื่อกลุ่ม']) {
                    แผนก = [{
                        'รหัสกลุ่ม': String(it['รหัสกลุ่ม']),
                        'ชื่อกลุ่ม': String(it['ชื่อกลุ่ม'])
                    }];
                }
                return {
                    id: String(it?.id ?? it?.['รหัสพนักงานขาย'] ?? ''),
                    'รหัสพนักงานขาย': String(it?.['รหัสพนักงานขาย'] ?? it?.id ?? ''),
                    'ชื่อพนักงานขาย': String(it?.['ชื่อพนักงานขาย'] ?? ''),
                    'แผนก': Array.isArray(แผนก) && แผนก.length > 0 ? แผนก.map((d: any) => ({
                        'รหัสกลุ่ม': String(d?.['รหัสกลุ่ม'] ?? ''),
                        'ชื่อกลุ่ม': String(d?.['ชื่อกลุ่ม'] ?? '')
                    })) : [],
                    updatedAt: typeof it?.updatedAt === 'string' ? it.updatedAt : now,
                    รูปภาพ: typeof it?.รูปภาพ === 'string' && it.รูปภาพ.trim() !== '' ? it.รูปภาพ : undefined,
                };
            });
            // Return only valid rows (ต้องมี id, รหัสพนักงานขาย, ชื่อพนักงานขาย และมีแผนกอย่างน้อย 1 แผนก)
            const filtered = normalized.filter((d) =>
                d.id &&
                d['รหัสพนักงานขาย'] &&
                d['ชื่อพนักงานขาย'] &&
                Array.isArray(d['แผนก']) &&
                d['แผนก'].length > 0
            );
            return NextResponse.json(filtered);
        }
        // Fall back to strict validation if not array
        const parsed = SalespersonArray.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json([], { status: 200 });
        }
        return NextResponse.json(parsed.data);
    } catch {
        // Return empty list instead of 500 to avoid breaking UI
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = Salesperson.safeParse(body);
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
        const baseArr = Array.isArray(list) ? list : [];
        const exists = baseArr.some((d: any) => d?.id === incoming.id);
        if (exists) {
            return NextResponse.json({ error: 'Duplicate id' }, { status: 409 });
        }
        const now = new Date().toISOString();
        const newItem = { ...incoming, updatedAt: now } as Salesperson;
        const updated = [...baseArr, newItem];
        await writeJson(DATA_PATH, updated);
        return NextResponse.json(newItem, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create', detail: String((err as any)?.message || err) }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const result = Salesperson.safeParse(body);
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
        const targetId = String(incoming.id).trim();
        const index = baseArr.findIndex((d) => String(d?.id).trim() === targetId);
        if (index === -1) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const now = new Date().toISOString();
        // Preserve รูปภาพ from existing data if not provided or if empty
        const existingItem = baseArr[index];
        const รูปภาพ = incoming.รูปภาพ ?? existingItem?.รูปภาพ;
        const updatedItem = {
            ...incoming,
            id: targetId,
            updatedAt: now,
            รูปภาพ: typeof รูปภาพ === 'string' && รูปภาพ.trim() === '' ? undefined : รูปภาพ
        } as Salesperson;
        const updated = [...baseArr];
        updated[index] = updatedItem;
        await writeJson(DATA_PATH, updated);
        return NextResponse.json(updatedItem);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update', detail: String((err as any)?.message || err) }, { status: 500 });
    }
}

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
        const exists = baseArr.some((d) => d?.id === id);
        if (!exists) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const updated = baseArr.filter((d) => d?.id !== id);
        await writeJson(DATA_PATH, updated);
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete', detail: String((err as any)?.message || err) }, { status: 500 });
    }
}
