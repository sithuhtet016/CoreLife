"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
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

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: formData.get("password") })
    });

    setPending(false);
    if (!response.ok) {
      setMessage("Incorrect password.");
      return;
    }
    setAuthed(true);
  }

  if (authed) {
    return (
      <section className="page">
        <h1>Admin</h1>
        <p className="muted">You are signed in.</p>
        <Link className="button" href="/admin/new-book">
          Add New Book
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Admin Login</h1>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Password
          <input name="password" type="password" required />
        </label>
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Checking..." : "Sign In"}
        </button>
      </form>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
