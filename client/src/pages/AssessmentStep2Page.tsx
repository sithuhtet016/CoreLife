import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredToken } from "../api";
import {
  saveGuestAssessmentDraft,
  syncGuestDraftToAccount,
} from "../assessmentDraft";
import BrandLogo from "../components/BrandLogo";
import "./AssessmentStep2Page.css";

function AssessmentStep2Page() {
  const navigate = useNavigate();
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [mindsetScore, setMindsetScore] = useState<number | null>(null);
  const [careerScore, setCareerScore] = useState<number | null>(null);

  const handleSaveAndExit = async () => {
    saveGuestAssessmentDraft({
      step: 2,
      route: "/assessment/step-2",
      savedAt: new Date().toISOString(),
      step2: {
        health: healthScore ?? undefined,
        mindset: mindsetScore ?? undefined,
        career: careerScore ?? undefined,
      },
    });

    const isAuthenticated = Boolean(getStoredToken());
    if (!isAuthenticated) {
      navigate("/auth-required", {
        state: {
          from: "/assessment/step-2",
          intent: "save-assessment" as const,
        },
      });
      return;
    }

    await syncGuestDraftToAccount();

    navigate("/");
  };

  return (
    <div className="assessment2-page">
      <header className="assessment2-header cl-navbar-surface">
        <div className="assessment2-header-wrap">
          <BrandLogo to="/" />

          <div className="assessment2-progress">
            <span>Step 2 of 3</span>
            <div className="assessment2-progress-track" aria-hidden="true">
              <div className="assessment2-progress-fill" />
            </div>
          </div>
        </div>
      </header>

      <main className="assessment2-main">
        <section className="assessment-shell assessment2-shell">
          <div className="assessment2-blob assessment2-blob-a" />
          <div className="assessment2-blob assessment2-blob-b" />

          <aside className="assessment2-sidebar">
            <div className="assessment2-side-brand">
              <span className="assessment2-side-brand-box" aria-hidden="true">
                <svg viewBox="0 0 512 512" fill="currentColor">
                  <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                </svg>
              </span>
              <span>Assessment</span>
            </div>

            <div className="assessment2-step completed">
              <span className="assessment2-step-badge" aria-hidden="true">
                <svg viewBox="0 0 448 512" fill="currentColor">
                  <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                </svg>
              </span>
              <div>
                <h3>Baseline &amp; Areas</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="assessment2-step active">
              <span>2</span>
              <div>
                <h3>Deep Dive Rating</h3>
                <p>Rate your selected areas</p>
              </div>
            </div>

            <div className="assessment2-step pending">
              <span>3</span>
              <div>
                <h3>Goals &amp; Habits</h3>
                <p>Set targets for improvement</p>
              </div>
            </div>

            <div className="assessment2-tip">
              <div className="tip-head">
                <span className="tip-icon" aria-hidden="true">
                  <svg viewBox="0 0 384 512" fill="currentColor">
                    <path d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H109c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H226.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H272v16c0 44.2-35.8 80-80 80z" />
                  </svg>
                </span>
                <span>Be Honest</span>
              </div>
              <p>
                Your ratings are private. Honest baseline scores help create
                better, more achievable goals.
              </p>
            </div>
          </aside>

          <section className="assessment2-content">
            <div className="assessment2-mobile-progress">
              <span>Step 2 of 3</span>
              <div className="assessment2-mobile-bars" aria-hidden="true">
                <span className="done" />
                <span className="active" />
                <span />
              </div>
            </div>

            <div className="assessment2-title-wrap">
              <span className="assessment2-title-icon" aria-hidden="true">
                <svg viewBox="0 0 448 512" fill="currentColor">
                  <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z" />
                </svg>
              </span>
              <h1>Rate your current state</h1>
              <p>
                Based on the areas you selected, rate how satisfied you are with
                each aspect of your life right now on a scale of 1 to 5.
              </p>
            </div>

            <form className="assessment2-form" action="#" method="post">
              <article className="rating-card">
                <div className="rating-head">
                  <div>
                    <h4>Health &amp; Fitness</h4>
                    <p>Physical wellbeing, diet, exercise, energy levels</p>
                  </div>
                </div>
                <div className="rating-row">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={`health-${n}`}>
                      <input
                        type="radio"
                        name="rating-health"
                        value={n}
                        checked={healthScore === n}
                        onChange={() => setHealthScore(n)}
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </article>

              <article className="rating-card">
                <div className="rating-head">
                  <div>
                    <h4>Mindset &amp; Mental Health</h4>
                    <p>Stress management, learning, emotional stability</p>
                  </div>
                </div>
                <div className="rating-row">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={`mindset-${n}`}>
                      <input
                        type="radio"
                        name="rating-mindset"
                        value={n}
                        checked={mindsetScore === n}
                        onChange={() => setMindsetScore(n)}
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </article>

              <article className="rating-card">
                <div className="rating-head">
                  <div>
                    <h4>Career &amp; Work</h4>
                    <p>Professional growth, satisfaction, impact</p>
                  </div>
                </div>
                <div className="rating-row">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={`career-${n}`}>
                      <input
                        type="radio"
                        name="rating-career"
                        value={n}
                        checked={careerScore === n}
                        onChange={() => setCareerScore(n)}
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </article>

              <div className="assessment2-actions">
                <button
                  type="button"
                  className="assessment2-btn-secondary"
                  onClick={handleSaveAndExit}
                >
                  Save &amp; Exit
                </button>

                <div className="assessment2-actions-right">
                  <Link to="/assessment" className="assessment2-btn-muted">
                    Back
                  </Link>
                  <Link
                    to="/assessment/step-3"
                    className="assessment2-btn-primary"
                  >
                    Next Step
                  </Link>
                </div>
              </div>
            </form>
          </section>
        </section>
      </main>

      <footer className="assessment2-footer">
        <nav>
          <Link to="/legal#privacy">Privacy Policy</Link>
          <Link to="/legal#terms">Terms of Service</Link>
          <Link to="/legal#support">Help Center</Link>
        </nav>
        <p>© 2026 CoreLife. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AssessmentStep2Page;
