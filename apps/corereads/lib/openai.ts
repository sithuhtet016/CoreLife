import OpenAI from "openai";
import { z } from "zod";

const summarySchema = z.object({
  overview: z.string(),
  mainIdea: z.string(),
  keyIdeas: z.array(z.string()).min(3).max(7),
  actionSteps: z.array(z.string()).min(3).max(7),
  whoShouldRead: z.string(),
  commentary: z.string(),
  finalTakeaway: z.string(),
  readingTime: z.string()
});

export async function generateEnglishSummary(input: {
  title: string;
  author: string;
  notes?: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "You write clear, practical, original English book insights. Keep language simple and concrete for learners."
      },
      {
        role: "user",
        content: `Create a structured summary for:\nTitle: ${input.title}\nAuthor: ${input.author}\nNotes: ${input.notes ?? "N/A"}\n\nReturn valid JSON with fields: overview, mainIdea, keyIdeas(string[]), actionSteps(string[]), whoShouldRead, commentary, finalTakeaway, readingTime.`
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "book_summary",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "overview",
            "mainIdea",
            "keyIdeas",
            "actionSteps",
            "whoShouldRead",
            "commentary",
            "finalTakeaway",
            "readingTime"
          ],
          properties: {
            overview: { type: "string" },
            mainIdea: { type: "string" },
            keyIdeas: {
              type: "array",
              minItems: 3,
              maxItems: 7,
              items: { type: "string" }
            },
            actionSteps: {
              type: "array",
              minItems: 3,
              maxItems: 7,
              items: { type: "string" }
            },
            whoShouldRead: { type: "string" },
            commentary: { type: "string" },
            finalTakeaway: { type: "string" },
            readingTime: { type: "string" }
          }
        }
      }
    }
  });

  const text = response.output_text;
  const parsed = summarySchema.parse(JSON.parse(text));
  return parsed;
}
