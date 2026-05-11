"use client";

import { FormEvent, useState } from "react";

export default function RequestPage() {
  const [message, setMessage] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setPending(false);
    if (!response.ok) {
      setMessage("Could not submit request. Please try again.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Thanks, your request was submitted.");
  }

  return (
    <section className="page">
      <h1>Request a Book</h1>
      <p className="muted">
        Tell us what book you want next and we will prioritize it.
      </p>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Your Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Book Title
          <input name="bookTitle" required />
        </label>
        <label>
          Author (optional)
          <input name="author" />
        </label>
        <label>
          Notes (optional)
          <textarea name="note" />
        </label>
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit Request"}
        </button>
      </form>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
