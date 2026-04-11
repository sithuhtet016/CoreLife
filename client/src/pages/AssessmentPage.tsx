import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredToken } from "../api";
import {
  saveGuestAssessmentDraft,
  syncGuestDraftToAccount,
} from "../assessmentDraft";
import BrandLogo from "../components/BrandLogo";
import "./AssessmentPage.css";

function AssessmentPage() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSaveAndExit = async () => {
    const formData = formRef.current ? new FormData(formRef.current) : null;
    saveGuestAssessmentDraft({
      step: 1,
      route: "/assessment",
      savedAt: new Date().toISOString(),
      step1: {
        age: String(formData?.get("age") ?? "").trim(),
        primaryGoal: String(formData?.get("primary-goal") ?? "").trim(),
        selectedAreas: formData
          ? formData.getAll("life-areas").map((value) => String(value))
          : [],
      },
    });

    const isAuthenticated = Boolean(getStoredToken());
    if (!isAuthenticated) {
      navigate("/auth-required", {
        state: { from: "/assessment", intent: "save-assessment" as const },
      });
      return;
    }

    await syncGuestDraftToAccount();

    navigate("/");
  };

  return (
    <div className="assessment-page">
      <header className="assessment-header cl-navbar-surface">
        <div className="assessment-header-inner">
          <BrandLogo to="/" />

          <div className="assessment-progress">
            <span>Step 1 of 3</span>
            <div className="assessment-progress-track" aria-hidden="true">
              <div className="assessment-progress-fill" />
            </div>
          </div>
        </div>
      </header>

      <main className="assessment-main">
        <section className="assessment-shell">
          <div className="assessment-blob assessment-blob-a" />
          <div className="assessment-blob assessment-blob-b" />

          <aside className="assessment-sidebar">
            <div className="assessment-sidebar-brand">
              <span className="mini-brand-box" aria-hidden="true">
                <svg viewBox="0 0 512 512" fill="currentColor">
                  <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
                </svg>
              </span>
              <span>Assessment</span>
            </div>

            <div className="assessment-steps">
              <article className="assessment-step active">
                <span className="step-dot">1</span>
                <div>
                  <h3>Baseline &amp; Areas</h3>
                  <p>Select focus areas &amp; basic info</p>
                </div>
              </article>

              <article className="assessment-step pending">
                <span className="step-dot">2</span>
                <div>
                  <h3>Deep Dive Rating</h3>
                  <p>Rate your selected areas</p>
                </div>
              </article>

              <article className="assessment-step pending">
                <span className="step-dot">3</span>
                <div>
                  <h3>Goals &amp; Habits</h3>
                  <p>Set targets for improvement</p>
                </div>
              </article>
            </div>

            <div className="assessment-time-card">
              <div className="time-head">
                <span className="time-icon" aria-hidden="true">
                  <svg viewBox="0 0 512 512" fill="currentColor">
                    <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                  </svg>
                </span>
                <span>Time to complete</span>
              </div>
              <p>
                This assessment takes about 5-7 minutes. You can save and exit
                at any time.
              </p>
            </div>
          </aside>

          <section className="assessment-content">
            <div className="assessment-mobile-progress">
              <span>Step 1 of 3</span>
              <div className="mobile-progress-bars" aria-hidden="true">
                <span className="active" />
                <span />
                <span />
              </div>
            </div>

            <div className="assessment-title-wrap">
              <div className="assessment-title-icon" aria-hidden="true">
                <svg viewBox="0 0 512 512" fill="currentColor">
                  <path d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              </div>
              <h1>Let&apos;s set your baseline</h1>
              <p>
                Tell us a bit about yourself and select the life areas you want
                to focus on. We&apos;ll use a 1-5 scale in the next step to rate
                them.
              </p>
            </div>

            <form
              ref={formRef}
              className="assessment-form"
              action="#"
              method="post"
            >
              <div className="assessment-row">
                <div className="assessment-field">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="e.g. 28"
                  />
                </div>

                <div className="assessment-field">
                  <label htmlFor="primary-goal">Primary Goal</label>
                  <div className="assessment-select-wrap">
                    <select
                      id="primary-goal"
                      name="primary-goal"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a main focus...
                      </option>
                      <option value="balance">Better Work-Life Balance</option>
                      <option value="health">Improve Physical Health</option>
                      <option value="career">Career Growth</option>
                      <option value="relationships">
                        Stronger Relationships
                      </option>
                      <option value="general">General Self-Improvement</option>
                    </select>
                    <span className="select-arrow" aria-hidden="true">
                      <svg viewBox="0 0 512 512" fill="currentColor">
                        <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <hr />

              <div>
                <div className="assessment-areas-head">
                  <h2>Select areas to assess</h2>
                  <p>Choose at least 3 areas you want to track and improve.</p>
                </div>

                <div className="assessment-area-grid">
                  <label className="life-area-card">
                    <input
                      type="checkbox"
                      name="life-areas"
                      value="health-fitness"
                      defaultChecked
                    />
                    <div className="area-card-ui">
                      <span className="area-icon" aria-hidden="true">
                        <svg viewBox="0 0 512 512" fill="currentColor">
                          <path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4h87c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31H476.3c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240h-132c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9H16c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9v-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1v5.8c0 16.9-2.8 33.5-8.3 49.1z" />
                        </svg>
                      </span>
                      <div>
                        <h4>Health &amp; Fitness</h4>
                        <p>Physical wellbeing, diet, exercise</p>
                      </div>
                    </div>
                  </label>

                  <label className="life-area-card">
                    <input
                      type="checkbox"
                      name="life-areas"
                      value="mindset"
                      defaultChecked
                    />
                    <div className="area-card-ui">
                      <span className="area-icon" aria-hidden="true">
                        <svg viewBox="0 0 512 512" fill="currentColor">
                          <path d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z" />
                        </svg>
                      </span>
                      <div>
                        <h4>Mindset</h4>
                        <p>Mental health, learning, peace</p>
                      </div>
                    </div>
                  </label>

                  <label className="life-area-card">
                    <input
                      type="checkbox"
                      name="life-areas"
                      value="career-work"
                      defaultChecked
                    />
                    <div className="area-card-ui">
                      <span className="area-icon" aria-hidden="true">
                        <svg viewBox="0 0 512 512" fill="currentColor">
                          <path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 320 512V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM512 288H320v32c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V288z" />
                        </svg>
                      </span>
                      <div>
                        <h4>Career &amp; Work</h4>
                        <p>Professional growth, satisfaction</p>
                      </div>
                    </div>
                  </label>

                  <label className="life-area-card">
                    <input
                      type="checkbox"
                      name="life-areas"
                      value="relationships"
                    />
                    <div className="area-card-ui">
                      <span className="area-icon" aria-hidden="true">
                        <svg viewBox="0 0 640 512" fill="currentColor">
                          <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0H21.3C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z" />
                        </svg>
                      </span>
                      <div>
                        <h4>Relationships</h4>
                        <p>Family, friends, partner</p>
                      </div>
                    </div>
                  </label>

                  <label className="life-area-card">
                    <input type="checkbox" name="life-areas" value="finance" />
                    <div className="area-card-ui">
                      <span className="area-icon" aria-hidden="true">
                        <svg viewBox="0 0 512 512" fill="currentColor">
                          <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64H80c-8.8 0-16-7.2-16-16s7.2-16 16-16H448c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zM416 272a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                        </svg>
                      </span>
                      <div>
                        <h4>Finance</h4>
                        <p>Wealth, savings, budget</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="assessment-action-bar">
                <button
                  type="button"
                  className="assessment-btn-light"
                  onClick={handleSaveAndExit}
                >
                  Save &amp; Exit
                </button>

                <div className="assessment-action-group">
                  <Link to="/register" className="assessment-btn-muted">
                    Back
                  </Link>
                  <Link
                    to="/assessment/step-2"
                    className="assessment-btn-primary"
                  >
                    Next Step
                  </Link>
                </div>
              </div>
            </form>
          </section>
        </section>
      </main>

      <footer className="assessment-footer">
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

export default AssessmentPage;
