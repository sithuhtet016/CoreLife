import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredToken } from "../api";
import {
  saveGuestAssessmentDraft,
  syncGuestDraftToAccount,
} from "../assessmentDraft";
import BrandLogo from "../components/BrandLogo";
import "./AssessmentStep3Page.css";

function AssessmentStep3Page() {
  const navigate = useNavigate();
  const [confidence, setConfidence] = useState(7);
  const [priorities, setPriorities] = useState<string[]>([
    "improve-fitness",
    "reduce-stress",
  ]);
  const [timeCommitment, setTimeCommitment] = useState("30");

  const togglePriority = (value: string, checked: boolean) => {
    setPriorities((current) => {
      if (checked) {
        return current.includes(value) ? current : [...current, value];
      }
      return current.filter((item) => item !== value);
    });
  };

  const handleSaveAndExit = async () => {
    saveGuestAssessmentDraft({
      step: 3,
      route: "/assessment/step-3",
      savedAt: new Date().toISOString(),
      step3: {
        confidence,
        priorities,
        timeCommitment,
      },
    });

    const isAuthenticated = Boolean(getStoredToken());
    if (!isAuthenticated) {
      navigate("/auth-required", {
        state: {
          from: "/assessment/step-3",
          intent: "save-assessment" as const,
        },
      });
      return;
    }

    await syncGuestDraftToAccount();

    navigate("/");
  };

  return (
    <div className="assessment3-page">
      <header className="assessment3-header cl-navbar-surface">
        <div className="assessment3-header-wrap">
          <BrandLogo to="/" />

          <div className="assessment3-progress">
            <span>Step 3 of 3</span>
            <div className="assessment3-progress-track" aria-hidden="true">
              <div className="assessment3-progress-fill" />
            </div>
          </div>
        </div>
      </header>

      <main className="assessment3-main">
        <section className="assessment-shell assessment3-shell">
          <div className="assessment3-blob assessment3-blob-a" />
          <div className="assessment3-blob assessment3-blob-b" />

          <aside className="assessment3-sidebar">
            <div className="assessment3-side-brand">
              <span className="assessment3-side-brand-box" aria-hidden="true">
                <svg viewBox="0 0 512 512" fill="currentColor">
                  <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                </svg>
              </span>
              <span>Assessment</span>
            </div>

            <div className="assessment3-step completed">
              <span className="assessment3-step-dot" aria-hidden="true">
                <svg viewBox="0 0 448 512" fill="currentColor">
                  <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                </svg>
              </span>
              <div>
                <h3>Baseline &amp; Areas</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="assessment3-step completed has-line line-green">
              <span className="assessment3-step-dot" aria-hidden="true">
                <svg viewBox="0 0 448 512" fill="currentColor">
                  <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                </svg>
              </span>
              <div>
                <h3>Deep Dive Rating</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="assessment3-step active has-line line-gray">
              <span className="assessment3-step-dot">3</span>
              <div>
                <h3>Goals &amp; Habits</h3>
                <p>Set targets for improvement</p>
              </div>
            </div>

            <div className="assessment3-aside-card">
              <div className="assessment3-aside-row">
                <span className="assessment3-aside-icon" aria-hidden="true">
                  <svg viewBox="0 0 512 512" fill="currentColor">
                    <path d="M156.6 384.9L125.7 354c-8.5-8.5-11.5-20.8-7.7-32.2c3-8.9 7-20.5 11.8-33.8L24 288c-8.6 0-16.6-4.6-20.9-12.1s-4.2-16.7 .2-24.1l52.5-88.5c13-21.9 36.5-35.3 61.9-35.3l82.3 0c2.4-4 4.8-7.7 7.2-11.3C289.1-4.1 411.1-8.1 483.9 5.3c11.6 2.1 20.6 11.2 22.8 22.8c13.4 72.9 9.3 194.8-111.4 276.7c-3.5 2.4-7.3 4.8-11.3 7.2v82.3c0 25.4-13.4 49-35.3 61.9l-88.5 52.5c-7.4 4.4-16.6 4.5-24.1 .2s-12.1-12.2-12.1-20.9V380.8c-14.1 4.9-26.4 8.9-35.7 11.9c-11.2 3.6-23.4 .5-31.8-7.8zM384 168a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
                  </svg>
                </span>
                <span>Almost There</span>
              </div>
              <p>
                This is the final step. Based on this, we&apos;ll create your
                personalized dashboard.
              </p>
            </div>
          </aside>

          <section className="assessment3-content">
            <div className="assessment3-mobile-progress">
              <span>Step 3 of 3</span>
              <div className="assessment3-mobile-bars" aria-hidden="true">
                <span className="done" />
                <span className="done" />
                <span className="active" />
              </div>
            </div>

            <div className="assessment3-title-wrap">
              <span className="assessment3-title-icon" aria-hidden="true">
                <svg viewBox="0 0 512 512" fill="currentColor">
                  <path d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              </span>
              <h1>Finalize your plan</h1>
              <p>
                Let&apos;s set your priorities and understand your capacity to
                ensure your goals are realistic.
              </p>
            </div>

            <form className="assessment3-form" action="#" method="post">
              <article className="assessment3-card">
                <div className="assessment3-card-head">
                  <h3>How confident are you in making a change?</h3>
                  <p>This helps us tailor the pace of your program.</p>
                </div>

                <div className="assessment3-range-wrap">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={confidence}
                    onChange={(event) =>
                      setConfidence(Number(event.target.value))
                    }
                  />
                  <div className="assessment3-range-labels">
                    <span>Not confident</span>
                    <span>Somewhat</span>
                    <span>Very confident</span>
                  </div>
                </div>
              </article>

              <article className="assessment3-card">
                <div className="assessment3-card-head">
                  <h3>Select your top 3 priorities</h3>
                  <p>What do you want to focus on first?</p>
                </div>

                <div className="assessment3-priority-grid">
                  <label className="priority-checkbox">
                    <input
                      type="checkbox"
                      checked={priorities.includes("improve-fitness")}
                      onChange={(event) =>
                        togglePriority("improve-fitness", event.target.checked)
                      }
                    />
                    <div>
                      <div className="priority-left">
                        <span className="priority-icon red" aria-hidden="true">
                          <svg viewBox="0 0 512 512" fill="currentColor">
                            <path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4h87c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31H476.3c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240h-132c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9H16c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9v-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1v5.8c0 16.9-2.8 33.5-8.3 49.1z" />
                          </svg>
                        </span>
                        <span>Improve Fitness</span>
                      </div>
                      <span className="priority-check" aria-hidden="true">
                        <svg viewBox="0 0 448 512" fill="currentColor">
                          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="priority-checkbox">
                    <input
                      type="checkbox"
                      checked={priorities.includes("reduce-stress")}
                      onChange={(event) =>
                        togglePriority("reduce-stress", event.target.checked)
                      }
                    />
                    <div>
                      <div className="priority-left">
                        <span
                          className="priority-icon purple"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 512 512" fill="currentColor">
                            <path d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z" />
                          </svg>
                        </span>
                        <span>Reduce Stress</span>
                      </div>
                      <span className="priority-check" aria-hidden="true">
                        <svg viewBox="0 0 448 512" fill="currentColor">
                          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="priority-checkbox">
                    <input
                      type="checkbox"
                      checked={priorities.includes("career-growth")}
                      onChange={(event) =>
                        togglePriority("career-growth", event.target.checked)
                      }
                    />
                    <div>
                      <div className="priority-left">
                        <span className="priority-icon blue" aria-hidden="true">
                          <svg viewBox="0 0 512 512" fill="currentColor">
                            <path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 320 512V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM512 288H320v32c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V288z" />
                          </svg>
                        </span>
                        <span>Career Growth</span>
                      </div>
                      <span className="priority-check" aria-hidden="true">
                        <svg viewBox="0 0 448 512" fill="currentColor">
                          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="priority-checkbox">
                    <input
                      type="checkbox"
                      checked={priorities.includes("better-sleep")}
                      onChange={(event) =>
                        togglePriority("better-sleep", event.target.checked)
                      }
                    />
                    <div>
                      <div className="priority-left">
                        <span
                          className="priority-icon indigo"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 384 512" fill="currentColor">
                            <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                          </svg>
                        </span>
                        <span>Better Sleep</span>
                      </div>
                      <span className="priority-check" aria-hidden="true">
                        <svg viewBox="0 0 448 512" fill="currentColor">
                          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                        </svg>
                      </span>
                    </div>
                  </label>
                </div>
              </article>

              <article className="assessment3-card">
                <div className="assessment3-card-head">
                  <h3>Daily Time Commitment</h3>
                  <p>
                    How much time can you realistically dedicate to your habits?
                  </p>
                </div>

                <div className="assessment3-time-grid">
                  <label className="time-option">
                    <input
                      type="radio"
                      name="time-commitment"
                      value="15"
                      checked={timeCommitment === "15"}
                      onChange={(event) =>
                        setTimeCommitment(event.target.value)
                      }
                    />
                    <span>15 min</span>
                  </label>

                  <label className="time-option">
                    <input
                      type="radio"
                      name="time-commitment"
                      value="30"
                      checked={timeCommitment === "30"}
                      onChange={(event) =>
                        setTimeCommitment(event.target.value)
                      }
                    />
                    <span>30 min</span>
                  </label>

                  <label className="time-option">
                    <input
                      type="radio"
                      name="time-commitment"
                      value="60"
                      checked={timeCommitment === "60"}
                      onChange={(event) =>
                        setTimeCommitment(event.target.value)
                      }
                    />
                    <span>1 hour+</span>
                  </label>
                </div>
              </article>

              <div className="assessment3-actions">
                <button
                  type="button"
                  className="assessment3-btn-ghost"
                  onClick={handleSaveAndExit}
                >
                  Save &amp; Exit
                </button>

                <div className="assessment3-actions-right">
                  <Link
                    to="/assessment/step-2"
                    className="assessment3-btn-muted"
                  >
                    Back
                  </Link>
                  <Link to="/results" className="assessment3-btn-primary">
                    <span>Finish Assessment</span>
                    <svg
                      viewBox="0 0 448 512"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </form>
          </section>
        </section>
      </main>

      <footer className="assessment3-footer">
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

export default AssessmentStep3Page;
