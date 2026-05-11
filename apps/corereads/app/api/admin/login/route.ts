import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminAuthed } from "@/lib/auth";

export async function GET() {
  const authed = await isAdminAuthed();
  return NextResponse.json({ authed });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = body?.password;
  const expected = process.env.COREREADS_ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return response;
}
