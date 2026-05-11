import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreReads",
  description: "AI-powered practical book insights"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell nav-wrap">
            <Link className="brand" href="/">
              CoreReads
            </Link>
            <nav className="top-nav">
              <Link href="/">Library</Link>
              <Link href="/request">Request a Book</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
