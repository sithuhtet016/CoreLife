import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { generateEnglishSummary } from "@/lib/openai";
import { addBook } from "@/lib/store";
import type { SummarySection } from "@/lib/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const fallbackSummary: SummarySection = {
  overview: "Summary is being prepared.",
  mainIdea: "Main insight will be published soon.",
  keyIdeas: ["Coming soon", "Coming soon", "Coming soon"],
  actionSteps: ["Coming soon", "Coming soon", "Coming soon"],
  whoShouldRead: "Readers interested in this topic.",
  commentary: "Commentary will be added.",
  finalTakeaway: "Stay tuned for the takeaway.",
  readingTime: "5 min"
};

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.author || !body?.category || !body?.coverUrl) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let summary = fallbackSummary;
  if (body.generateWithAI) {
    try {
      summary = await generateEnglishSummary({
        title: String(body.title),
        author: String(body.author),
        notes: body.notes ? String(body.notes) : undefined
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `OpenAI summary failed: ${error.message}`
              : "OpenAI summary failed."
        },
        { status: 500 }
      );
    }
  }

  const id = slugify(String(body.title));

  await addBook({
    id,
    title: String(body.title),
    author: String(body.author),
    category: String(body.category),
    coverUrl: String(body.coverUrl),
    status: "published",
    createdAt: new Date().toISOString(),
    summary
  });

  return NextResponse.json({ ok: true, id });
}
