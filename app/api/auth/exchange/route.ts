import { NextResponse } from "next/server";

const SSO_BASE_URL =
  process.env.SSO_SERVER_URL ||
  process.env.NEXT_PUBLIC_SSO_API_URL ||
  process.env.NEXT_PUBLIC_SSO_URL ||
  "https://sso360.trirex.cloud";

export async function POST(request: Request) {
  try {
    const { code, clientId: requestedClientId } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const clientId = requestedClientId || process.env.NEXT_PUBLIC_CLIENT_ID;
    const response = await fetch(`${SSO_BASE_URL.replace(/\/$/, "")}/api/auth/code/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, clientId }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Code expired or invalid" },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Auth Exchange Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
