import { NextRequest, NextResponse } from "next/server";
import { getPublishedBooks } from "@/lib/store";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const books = await getPublishedBooks();

  const filtered = q
    ? books.filter((book) => {
        const hay = `${book.title} ${book.author} ${book.category} ${book.summary.overview}`.toLowerCase();
        return hay.includes(q);
      })
    : books;

  return NextResponse.json({ books: filtered });
}
