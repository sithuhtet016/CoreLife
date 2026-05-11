import Link from "next/link";
import { getPublishedBooks } from "@/lib/store";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const books = await getPublishedBooks();
  const filtered = q
    ? books.filter((book) => {
        const hay = `${book.title} ${book.author} ${book.category} ${book.summary.overview}`.toLowerCase();
        return hay.includes(q);
      })
    : books;

  return (
    <section className="page">
      <div className="hero">
        <h1>Practical Book Insights, Ready in Minutes</h1>
        <p className="muted">
          Browse clear, original summaries focused on action and understanding.
        </p>
        <form action="/" method="get">
          <input
            className="search"
            name="q"
            placeholder="Search by title, author, topic"
            defaultValue={params.q ?? ""}
          />
        </form>
      </div>
      <div className="grid">
        {filtered.map((book) => (
          <article key={book.id} className="card">
            <img className="cover" src={book.coverUrl} alt={book.title} />
            <p className="kicker">{book.category}</p>
            <h3>{book.title}</h3>
            <p className="muted">by {book.author}</p>
            <p>{book.summary.overview}</p>
            <Link className="button" href={`/books/${book.id}`}>
              Read Summary
            </Link>
          </article>
        ))}
      </div>
      {filtered.length === 0 ? <p>No books found. Try another keyword.</p> : null}
    </section>
  );
}
