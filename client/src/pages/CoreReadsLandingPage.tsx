import { Link } from "react-router-dom";
import "./CoreReadsLandingPage.css";

function CoreReadsLandingPage() {
  return (
    <div className="corereads-landing-page">
      <header className="corereads-header">
        <div className="corereads-container corereads-header-inner">
          <Link to="/" className="corereads-back-link" aria-label="Back to CoreLife">
            <span aria-hidden="true">←</span>
            <span>CoreLife</span>
          </Link>

          <div className="corereads-lang-toggle" aria-label="Language toggle">
            <button type="button" className="is-active" aria-pressed="true">
              EN
            </button>
            <button type="button" aria-pressed="false">
              MM
            </button>
          </div>
        </div>
      </header>

      <main className="corereads-main">
        <section className="corereads-hero corereads-container">
          <div className="corereads-badge">CoreReads</div>
          <h1>Unlock book ideas in minutes</h1>
          <p>
            Read clear, practical, bilingual insights from curated legal uploads.
            Switch between English and Burmese anytime.
          </p>

          <div className="corereads-hero-actions">
            <button type="button" className="btn btn--primary">
              Get Started
            </button>
            <Link to="/login" className="btn btn--secondary corereads-login-link">
              Log in
            </Link>
          </div>
        </section>

        <section className="corereads-features corereads-container">
          <article className="corereads-feature-card">
            <h2>Main Ideas</h2>
            <p>Understand the core concept of each book without reading the full text.</p>
          </article>
          <article className="corereads-feature-card">
            <h2>Practical Lessons</h2>
            <p>Get simple, actionable lessons you can apply right away.</p>
          </article>
          <article className="corereads-feature-card">
            <h2>Bilingual Reading</h2>
            <p>Read in English or Burmese with one tap and consistent structure.</p>
          </article>
        </section>

        <section className="corereads-request-note corereads-container">
          <p>
            Can&apos;t find a book? Request it and we aim to upload it within 3 days.
          </p>
        </section>
      </main>
    </div>
  );
}

export default CoreReadsLandingPage;
