"use client";

import { FormEvent, useEffect, useState } from "react";

export default function NewBookPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/login", { method: "GET" })
      .then((r) => r.json())
      .then((data) => setAuthed(Boolean(data.authed)))
      .catch(() => setAuthed(false));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      author: String(formData.get("author") ?? ""),
      category: String(formData.get("category") ?? "General"),
      coverUrl: String(formData.get("coverUrl") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      generateWithAI: formData.get("generateWithAI") === "on"
    };

    const response = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setPending(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Failed." }));
      setMessage(data.error ?? "Failed to create book.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Book created and published.");
  }

  if (authed === null) return <section className="page">Checking access...</section>;
  if (!authed) return <section className="page">Please sign in at /admin first.</section>;

  return (
    <section className="page">
      <h1>Add New Book</h1>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Author
          <input name="author" required />
        </label>
        <label>
          Category
          <input name="category" defaultValue="Self Improvement" required />
        </label>
        <label>
          Cover URL
          <input name="coverUrl" type="url" required />
        </label>
        <label>
          Notes / Source context
          <textarea name="notes" placeholder="Paste your source highlights for better summary quality." />
        </label>
        <label>
          <input name="generateWithAI" type="checkbox" defaultChecked /> Generate summary with OpenAI
        </label>
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Book"}
        </button>
      </form>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
