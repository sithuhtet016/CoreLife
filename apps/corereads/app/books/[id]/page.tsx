import { notFound } from "next/navigation";
import { getBookById } from "@/lib/store";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book || book.status !== "published") return notFound();

  return (
    <article className="page">
      <p className="kicker">{book.category}</p>
      <h1>{book.title}</h1>
      <p className="muted">by {book.author}</p>
      <p><strong>Reading time:</strong> {book.summary.readingTime}</p>

      <h2>Overview</h2>
      <p>{book.summary.overview}</p>

      <h2>Main Idea</h2>
      <p>{book.summary.mainIdea}</p>

      <h2>Key Ideas</h2>
      <ul>
        {book.summary.keyIdeas.map((idea) => (
          <li key={idea}>{idea}</li>
        ))}
      </ul>

      <h2>Action Steps</h2>
      <ul>
        {book.summary.actionSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>

      <h2>Who Should Read</h2>
      <p>{book.summary.whoShouldRead}</p>

      <h2>Commentary</h2>
      <p>{book.summary.commentary}</p>

      <h2>Final Takeaway</h2>
      <p>{book.summary.finalTakeaway}</p>
    </article>
  );
}
