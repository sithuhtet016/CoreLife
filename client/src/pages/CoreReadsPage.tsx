import { useMemo, useState, useState as useLocalState } from "react";
import {
  BookOpen,
  Library,
  ClipboardList,
  BookMarked,
  Sparkles,
  Send,
  Clock3,
  TrendingUp,
} from "lucide-react";
import AppHeader from "../components/AppHeader";

type CoreReadsTabId = "discover" | "library" | "requests";

type CoreReadsTab = {
  id: CoreReadsTabId;
  label: string;
  icon: typeof BookOpen;
};

type CoreReadsHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  chips: readonly string[];
  mascot: string;
  mascotLabel: string;
};

type Book = {
  title: string;
  author: string;
  category: string;
  readTime: string;
  progress: number;
  coverUrl?: string;
};

type RequestItem = {
  title: string;
  requestedOn: string;
  status: "Queued" | "In Review" | "Ready";
};

const CORE_READS_TABS: readonly CoreReadsTab[] = [
  { id: "discover", label: "Discover", icon: BookOpen },
  { id: "library", label: "My Library", icon: Library },
  { id: "requests", label: "Requests", icon: ClipboardList },
];

const CORE_READS_HERO_CONTENT: Record<CoreReadsTabId, CoreReadsHeroContent> = {
  discover: {
    eyebrow: "CoreReads",
    title: "Read Less. Apply More.",
    description:
      "Practical, high-signal book summaries built for your goals. Capture key ideas in minutes, then turn them into habits, decisions, and measurable progress.",
    chips: ["5-10 min summaries", "Action-first insights", "Personalized reading path"],
    mascot: "Owlie",
    mascotLabel: "🦉",
  },
  library: {
    eyebrow: "My Library",
    title: "Keep Your Momentum.",
    description:
      "Jump back into your saved summaries, pick up where you left off, and compound what you've already learned.",
    chips: ["Continue in one click", "Track reading progress", "Revisit key takeaways"],
    mascot: "Book Buddy",
    mascotLabel: "🐻",
  },
  requests: {
    eyebrow: "Requests",
    title: "Ask. We'll Distill.",
    description:
      "Request any title and get a focused summary tailored to what matters most for your current goals.",
    chips: ["Custom summary queue", "24-48 hour turnaround", "Goal-aligned highlights"],
    mascot: "Idea Fox",
    mascotLabel: "🦊",
  },
};

const LIBRARY_BOOKS: readonly Book[] = [
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    readTime: "6 min",
    progress: 100,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1595859060i/41881472.jpg",
  },
  {
    title: "Essentialism",
    author: "Greg McKeown",
    category: "Productivity",
    readTime: "7 min",
    progress: 64,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405868167i/18077875.jpg",
  },
  {
    title: "The Mountain Is You",
    author: "Brianna Wiest",
    category: "Self Awareness",
    readTime: "10 min",
    progress: 25,
  },
];

const RECENTLY_VIEWED: readonly Book[] = [
  {
    title: "Start With Why",
    author: "Simon Sinek",
    category: "Leadership",
    readTime: "6 min",
    progress: 0,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360936411i/7108725.jpg",
  },
  {
    title: "Ego Is the Enemy",
    author: "Ryan Holiday",
    category: "Mindset",
    readTime: "8 min",
    progress: 0,
  },
  {
    title: "The Courage to Be Disliked",
    author: "Ichiro Kishimi & Fumitake Koga",
    category: "Psychology",
    readTime: "9 min",
    progress: 0,
  },
  {
    title: "Grit",
    author: "Angela Duckworth",
    category: "Performance",
    readTime: "7 min",
    progress: 0,
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    category: "Mindfulness",
    readTime: "8 min",
    progress: 0,
  },
  {
    title: "Think Again",
    author: "Adam Grant",
    category: "Critical Thinking",
    readTime: "7 min",
    progress: 0,
  },
];

const RECOMMENDED_BOOKS: readonly Book[] = [
  {
    title: "The One Thing",
    author: "Gary Keller",
    category: "Focus",
    readTime: "7 min",
    progress: 0,
    coverUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1372672341i/16256798.jpg",
  },
  {
    title: "Make Time",
    author: "Jake Knapp & John Zeratsky",
    category: "Productivity",
    readTime: "7 min",
    progress: 0,
  },
  {
    title: "The Slight Edge",
    author: "Jeff Olson",
    category: "Habits",
    readTime: "6 min",
    progress: 0,
  },
  {
    title: "Mastery",
    author: "Robert Greene",
    category: "Skill Building",
    readTime: "9 min",
    progress: 0,
  },
  {
    title: "The Art of Learning",
    author: "Josh Waitzkin",
    category: "Learning",
    readTime: "8 min",
    progress: 0,
  },
  {
    title: "4000 Weeks",
    author: "Oliver Burkeman",
    category: "Time",
    readTime: "8 min",
    progress: 0,
  },
  {
    title: "Drive",
    author: "Daniel H. Pink",
    category: "Motivation",
    readTime: "7 min",
    progress: 0,
  },
];

const TRENDING_TOPICS: readonly string[] = [
  "Dopamine Discipline",
  "Identity-Based Habits",
  "High-Agency Thinking",
  "Energy Management",
  "Focus Rituals",
  "Emotional Resilience",
];

const REQUESTS: readonly RequestItem[] = [
  { title: "The 7 Habits of Highly Effective People", requestedOn: "May 6", status: "Ready" },
  { title: "Can't Hurt Me", requestedOn: "May 8", status: "In Review" },
  { title: "The Almanack of Naval Ravikant", requestedOn: "May 9", status: "Queued" },
];

function statusClass(status: RequestItem["status"]) {
  if (status === "Ready") {
    return "border-[var(--cl-success-border)] bg-[var(--cl-success-tint)] text-[var(--cl-success-text)]";
  }

  if (status === "In Review") {
    return "border-[var(--cl-primary-border)] bg-[var(--cl-primary-tint)] text-[var(--cl-primary-deep)]";
  }

  return "border-[var(--cl-border)] bg-[var(--cl-surface-alt)] text-[var(--cl-text-muted)]";
}

function CoverPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-[var(--cl-primary-border)] bg-[var(--cl-primary-tint)]">
      <div className="text-center">
        <BookOpen className="mx-auto h-7 w-7 text-[var(--cl-primary)]" aria-hidden="true" />
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cl-primary-deep)]">
          CoreReads
        </p>
      </div>
    </div>
  );
}

function BookCover({ book }: { book: Book }) {
  const [hasError, setHasError] = useLocalState(false);

  if (!book.coverUrl || hasError) {
    return <CoverPlaceholder />;
  }

  return (
    <img
      src={book.coverUrl}
      alt={`${book.title} cover`}
      className="h-full w-full rounded-xl object-cover"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

function BookCard({
  book,
  ctaLabel,
  highlight,
}: {
  book: Book;
  ctaLabel: string;
  highlight: "discover" | "library";
}) {
  const hasProgress = highlight === "library";

  return (
    <article className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3.5 shadow-[var(--cl-shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--cl-shadow-md)]">
      <div className="flex gap-3.5">
        <div className="aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-lg bg-[var(--cl-surface-alt)] shadow-[var(--cl-shadow-sm)]">
          <BookCover book={book} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="rounded-full border border-[var(--cl-primary-border)] bg-[var(--cl-primary-tint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--cl-primary-deep)]">
              {book.category}
            </p>
            <p className="text-[11px] text-[var(--cl-text-subtle)]">{book.readTime}</p>
          </div>

          <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-5 text-[var(--cl-text)]">
            {book.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--cl-text-muted)]">{book.author}</p>

          {hasProgress ? (
            <>
              <div className="mt-2.5 flex items-center justify-between text-xs text-[var(--cl-text-muted)]">
                <span>Progress</span>
                <span className="font-semibold text-[var(--cl-text)]">{book.progress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--cl-border-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--cl-primary)] transition-all"
                  style={{ width: `${book.progress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--cl-text-muted)]">
              Distilled into practical insights you can apply today.
            </p>
          )}

          <button
            type="button"
            className="mt-3 rounded-full bg-[var(--cl-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[var(--cl-shadow-primary-sm)] hover:bg-[var(--cl-primary-hover)]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

function CoreReadsPage() {
  const [activeTab, setActiveTab] = useState<CoreReadsTabId>("discover");

  const activeTabMeta = useMemo(
    () => CORE_READS_TABS.find((tab) => tab.id === activeTab) ?? CORE_READS_TABS[0],
    [activeTab],
  );
  const activeHero = CORE_READS_HERO_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-[var(--cl-bg-app)] text-[var(--cl-text)]">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow-sm)] sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cl-text-subtle)]">
                {activeHero.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                {activeHero.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--cl-text-muted)]">
                {activeHero.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {activeHero.chips.map((chip) => (
                  <p
                    key={chip}
                    className="rounded-full border border-[var(--cl-primary-border)] bg-[var(--cl-primary-tint)] px-3 py-1 text-xs font-semibold text-[var(--cl-primary-deep)]"
                  >
                    {chip}
                  </p>
                ))}
              </div>
            </div>
            <aside className="relative overflow-hidden rounded-2xl border border-[var(--cl-primary-border)] bg-[var(--cl-primary-tint)] p-5">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--cl-primary-alpha-10)]" />
              <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-[var(--cl-primary-alpha-10)]" />
              <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cl-primary-deep)]">
                Reading Companion
              </p>
              <div className="relative z-10 mt-3 flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--cl-primary-border)] bg-[var(--cl-surface)] text-3xl shadow-[var(--cl-shadow-sm)]">
                  <span role="img" aria-label={activeHero.mascot}>
                    {activeHero.mascotLabel}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--cl-text)]">{activeHero.mascot}</p>
                  <p className="text-sm text-[var(--cl-text-muted)]">
                    Tiny guide for your next big idea.
                  </p>
                </div>
              </div>
              <p className="relative z-10 mt-4 text-sm text-[var(--cl-text-muted)]">
                "{activeTab === "discover"
                  ? "Let’s find one useful idea for today."
                  : activeTab === "library"
                    ? "Small progress counts. Let’s keep going."
                    : "Tell me what you need. I’ll queue it up."}"
              </p>
            </aside>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-alt)] p-2.5 shadow-[var(--cl-shadow-sm)]">
          <div role="tablist" aria-label="CoreReads sections" className="grid gap-2.5 sm:grid-cols-3">
            {CORE_READS_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  id={`core-reads-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`core-reads-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    isActive
                      ? "inline-flex min-h-[2.75rem] items-center justify-center gap-2.5 rounded-full border border-[var(--cl-primary)] bg-[var(--cl-primary)] px-5 py-2.5 text-base font-semibold text-white shadow-[var(--cl-shadow-primary-sm)]"
                      : "inline-flex min-h-[2.75rem] items-center justify-center gap-2.5 rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface)] px-5 py-2.5 text-base font-medium text-[var(--cl-text-muted)] hover:border-[var(--cl-primary-soft)] hover:text-[var(--cl-text)]"
                  }
                >
                  <Icon className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          id={`core-reads-panel-${activeTabMeta.id}`}
          role="tabpanel"
          aria-labelledby={`core-reads-tab-${activeTabMeta.id}`}
          className="mt-6 rounded-3xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow-sm)] sm:p-8"
        >
          {activeTab === "discover" ? (
            <>
              <div className="rounded-2xl border border-[var(--cl-primary-border)] bg-[var(--cl-primary-tint)] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cl-primary-deep)]">
                      Continue Reading
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--cl-text)]">
                      {LIBRARY_BOOKS[1]?.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
                      {LIBRARY_BOOKS[1]?.author} • You were at {LIBRARY_BOOKS[1]?.progress}% last session.
                    </p>
                    <div className="mt-3 h-2 w-full max-w-xl overflow-hidden rounded-full bg-[var(--cl-primary-alpha-10)]">
                      <div
                        className="h-full rounded-full bg-[var(--cl-primary)]"
                        style={{ width: `${LIBRARY_BOOKS[1]?.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--cl-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--cl-shadow-primary-sm)] hover:bg-[var(--cl-primary-hover)]"
                  >
                    <BookMarked className="h-4 w-4" aria-hidden="true" />
                    Resume Summary
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  className="group flex min-h-[7.5rem] w-full items-center justify-between rounded-2xl border border-[var(--cl-primary-border)] bg-[var(--cl-surface)] px-6 py-5 text-left shadow-[var(--cl-shadow-sm)] hover:-translate-y-0.5 hover:border-[var(--cl-primary-soft-strong)] hover:shadow-[var(--cl-shadow-md)]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cl-text-subtle)]">
                      Recommended
                    </p>
                    <p className="mt-1 text-xl font-bold text-[var(--cl-text)]">Daily Pick</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-[var(--cl-primary)]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="group flex min-h-[7.5rem] w-full items-center justify-between rounded-2xl border border-[var(--cl-primary-border)] bg-[var(--cl-surface)] px-6 py-5 text-left shadow-[var(--cl-shadow-sm)] hover:-translate-y-0.5 hover:border-[var(--cl-primary-soft-strong)] hover:shadow-[var(--cl-shadow-md)]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--cl-text-subtle)]">
                      Need A Summary?
                    </p>
                    <p className="mt-1 text-xl font-bold text-[var(--cl-text)]">Request Book</p>
                  </div>
                  <Send className="h-6 w-6 text-[var(--cl-primary)]" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold">Recently Viewed</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cl-text-subtle)]">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    Last 7 days
                  </span>
                </div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {RECENTLY_VIEWED.map((book) => (
                    <div key={book.title} className="w-[21rem] shrink-0">
                      <BookCard book={book} ctaLabel="Open Summary" highlight="discover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-xl font-bold">Recommended For You</h3>
                <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
                  Based on your recent reading patterns.
                </p>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {RECOMMENDED_BOOKS.map((book) => (
                    <div key={book.title} className="w-[21rem] shrink-0">
                      <BookCard book={book} ctaLabel="Read Summary" highlight="discover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-alt)] p-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--cl-primary)]" aria-hidden="true" />
                  <h3 className="text-xl font-bold">Trending Topics</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {TRENDING_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--cl-text-muted)] hover:border-[var(--cl-primary-soft)] hover:text-[var(--cl-text)]"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "library" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">My Library</h2>
                  <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
                    Continue where you left off and keep your momentum.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-alt)] px-3 py-2 text-sm text-[var(--cl-text-muted)]">
                  3 summaries in progress
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {LIBRARY_BOOKS.map((book) => (
                  <BookCard
                    key={book.title}
                    book={book}
                    ctaLabel="Continue Reading"
                    highlight="library"
                  />
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "requests" ? (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-2xl font-bold">Book Requests</h2>
                <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
                  Ask for any title and we will summarize it for your CoreReads library.
                </p>

                <form className="mt-6 grid gap-4 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-alt)] p-5">
                  <label className="grid gap-2 text-sm font-medium text-[var(--cl-text)]">
                    Book title
                    <input
                      type="text"
                      placeholder="Example: The 7 Habits of Highly Effective People"
                      className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2 text-sm text-[var(--cl-text)] outline-none focus:border-[var(--cl-primary)]"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[var(--cl-text)]">
                    Why this book?
                    <textarea
                      rows={4}
                      placeholder="Share your goal so the summary can prioritize what matters most to you."
                      className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2 text-sm text-[var(--cl-text)] outline-none focus:border-[var(--cl-primary)]"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[var(--cl-text-muted)]">
                      Typical turnaround: 24 to 48 hours
                    </p>
                    <button
                      type="button"
                      className="rounded-full bg-[var(--cl-primary)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--cl-shadow-primary-sm)] hover:bg-[var(--cl-primary-hover)]"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>

              <aside className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-alt)] p-5">
                <h3 className="text-base font-semibold text-[var(--cl-text)]">Recent Requests</h3>
                <div className="mt-4 grid gap-3">
                  {REQUESTS.map((request) => (
                    <article
                      key={request.title}
                      className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3"
                    >
                      <p className="text-sm font-semibold text-[var(--cl-text)]">{request.title}</p>
                      <p className="mt-1 text-xs text-[var(--cl-text-subtle)]">
                        Requested {request.requestedOn}
                      </p>
                      <p
                        className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(request.status)}`}
                      >
                        {request.status}
                      </p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default CoreReadsPage;
