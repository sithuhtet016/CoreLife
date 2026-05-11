import { NextRequest, NextResponse } from "next/server";
import { addBookRequest } from "@/lib/store";

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.email || !body?.bookTitle) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await addBookRequest({
    id: randomId(),
    name: String(body.name),
    email: String(body.email),
    bookTitle: String(body.bookTitle),
    author: body.author ? String(body.author) : "",
    note: body.note ? String(body.note) : "",
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ ok: true });
}
