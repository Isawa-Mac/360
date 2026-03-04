import { NextRequest, NextResponse } from "next/server";

type ValidateTokenResponse = {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    tenantId?: string;
    companyName?: string;
    avatarUrl?: string;
  };
  permissions?: string[];
};

const SSO_BASE_URL =
  process.env.NEXT_PUBLIC_SSO_BASE_URL ||
  process.env.SSO_SERVER_URL ||
  "https://sso360.trirex.cloud";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get("token");
    const authHeader = request.headers.get("authorization") || "";
    const bearer =
      authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;

    const token = tokenFromQuery || bearer;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const base = SSO_BASE_URL.replace(/\/$/, "");
    const validateUrl = `${base}/api/sso/validate-token`;

    const res = await fetch(validateUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const data = (await res.json()) as ValidateTokenResponse;

    if (!data.valid || !data.user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const permissions = Array.isArray(data.permissions)
      ? data.permissions
      : [];

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: data.user.id,
          username: data.user.username || data.user.email,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          tenantId: data.user.tenantId,
          companyName: data.user.companyName,
          avatarUrl: data.user.avatarUrl,
          permissions,
          isSuperAdmin: permissions.includes("*"),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/sso/session:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
