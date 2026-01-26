import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || 'https://sso360.trirex.cloud';

        // Validate token with SSO
        console.log(`Checking permissions with SSO at ${ssoUrl} for token: ${token.substring(0, 10)}...`);

        const ssoResponse = await fetch(`${ssoUrl}/api/sso/validate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!ssoResponse.ok) {
            console.error('SSO validation failed:', ssoResponse.status, ssoResponse.statusText);
            return NextResponse.json({ success: false, error: 'Failed to validate token with SSO' }, { status: 401 });
        }

        const ssoResult = await ssoResponse.json();

        if (!ssoResult.valid) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Check if user is super admin
        const isSuperAdmin = ssoResult.user?.username === 'admin' || ssoResult.permissions?.includes('*');

        const data = {
            permissions: ssoResult.permissions || [],
            isSuperAdmin: isSuperAdmin
        };

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('API Permissions Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
