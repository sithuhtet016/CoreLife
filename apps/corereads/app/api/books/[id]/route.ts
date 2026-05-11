import { NextResponse } from "next/server";
import { getBookById } from "@/lib/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book || book.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ book });
}
