import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, assertAdminKey, getAdminPanelKey } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!getAdminPanelKey()) {
    return NextResponse.json(
      { error: "ADMIN_PANEL_KEY is not configured" },
      { status: 503 },
    );
  }

  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!assertAdminKey(body.key)) {
    return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, body.key!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
