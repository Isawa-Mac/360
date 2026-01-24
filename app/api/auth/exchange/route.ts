import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code, clientId } = await request.json();

        // 1. ตรวจสอบเบื้องต้น
        if (!code || clientId !== process.env.NEXT_PUBLIC_CLIENT_ID) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        const sqlApiUrl = process.env.SQL_API_URL!;
        const sqlApiKey = process.env.SQL_API_KEY!;

        // 2. ดึงข้อมูลจากฐานข้อมูล (รันที่ Server เท่านั้น รหัสจึงไม่หลุด)
        const fetchSql = `SELECT data FROM "nexussso"."auth_codes" WHERE code = '${code}' AND "expiresAt" > NOW()`;

        const response = await fetch(sqlApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": sqlApiKey
            },
            body: JSON.stringify({ sqlQuery: fetchSql }),
        });

        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            return NextResponse.json({ success: false, error: 'Code expired or invalid' }, { status: 401 });
        }

        const sessionData = typeof result.data[0].data === "string"
            ? JSON.parse(result.data[0].data)
            : result.data[0].data;

        // 3. ลบ Code ทิ้งทันที (Security Best Practice)
        const deleteSql = `DELETE FROM "nexussso"."auth_codes" WHERE code = '${code}'`;
        fetch(sqlApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-API-KEY": sqlApiKey },
            body: JSON.stringify({ sqlQuery: deleteSql }),
        }).catch(() => { });

        // ส่งข้อมูลกลับไปให้หน้าบ้าน
        return NextResponse.json({ success: true, data: sessionData });

    } catch (error) {
        console.error('API Exchange Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
