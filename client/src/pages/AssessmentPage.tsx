import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  Briefcase,
  Compass,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Leaf,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredToken } from "../api";
import { getAssessmentDraft, saveAssessmentDraft } from "../assessmentDraft";
import BrandLogo from "../components/BrandLogo";
import "./AssessmentPage.css";

type LifeAreaOption = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultChecked?: boolean;
};

const LIFE_AREA_OPTIONS: LifeAreaOption[] = [
  {
    value: "health",
    label: "Health",
    description: "Energy, sleep, nutrition, movement",
    icon: Activity,
    defaultChecked: true,
  },
  {
    value: "appearance",
    label: "Appearance",
    description: "Style, grooming, confidence in self-image",
    icon: Sparkles,
  },
  {
    value: "love",
    label: "Love",
    description: "Romantic connection and emotional intimacy",
    icon: Heart,
  },
  {
    value: "family",
    label: "Family",
    description: "Support, communication, and healthy boundaries",
    icon: Home,
  },
  {
    value: "friends",
    label: "Friends",
    description: "Trust, connection, and social support",
    icon: Users,
  },
  {
    value: "career",
    label: "Career",
    description: "Purpose, growth, and work satisfaction",
    icon: Briefcase,
    defaultChecked: true,
  },
  {
    value: "money",
    label: "Money",
    description: "Income, budgeting, and financial stability",
    icon: Wallet,
  },
  {
    value: "self-growth",
    label: "Self-Growth",
    description: "Learning, habits, and personal progress",
    icon: TrendingUp,
    defaultChecked: true,
  },
  {
    value: "spirituality",
    label: "Spirituality",
    description: "Meaning, values, and inner peace",
    icon: Compass,
  },
  {
    value: "recreation",
    label: "Recreation",
    description: "Hobbies, joy, rest, and recovery",
    icon: Gamepad2,
  },
  {
    value: "environment",
    label: "Environment",
    description: "Home and workspace quality",
    icon: Leaf,
  },
  {
    value: "community",
    label: "Community",
    description: "Belonging, contribution, and social impact",
    icon: Globe,
  },
];

function AssessmentPage() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getAssessmentDraft().then((draft) => {
      if (!active || !draft?.step1 || !formRef.current) return;

      const form = formRef.current;
      const ageInput = form.elements.namedItem(
        "age",
      ) as HTMLInputElement | null;
      const primaryGoalSelect = form.elements.namedItem(
        "primary-goal",
      ) as HTMLSelectElement | null;

      if (ageInput && typeof draft.step1.age === "string") {
        ageInput.value = draft.step1.age;
      }

      if (
        primaryGoalSelect &&
        typeof draft.step1.primaryGoal === "string" &&
        draft.step1.primaryGoal
      ) {
        primaryGoalSelect.value = draft.step1.primaryGoal;
      }

      if (Array.isArray(draft.step1.selectedAreas)) {
        const selectedAreaSet = new Set(draft.step1.selectedAreas);
        form
          .querySelectorAll<HTMLInputElement>('input[name="life-areas"]')
          .forEach((input) => {
            input.checked = selectedAreaSet.has(input.value);
          });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const readStepOneDraft = () => {
    const formData = formRef.current ? new FormData(formRef.current) : null;

    return {
      age: String(formData?.get("age") ?? "").trim(),
      primaryGoal: String(formData?.get("primary-goal") ?? "").trim(),
      selectedAreas: formData
        ? formData.getAll("life-areas").map((value) => String(value))
        : [],
    };
  };

  const handleNextStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const stepOneDraft = readStepOneDraft();
    const ageNumber = Number(stepOneDraft.age);

    if (!stepOneDraft.age || Number.isNaN(ageNumber) || ageNumber <= 0) {
      setValidationError("Please enter a valid age.");
      return;
    }

    if (!stepOneDraft.primaryGoal) {
      setValidationError("Please select your primary goal.");
      return;
    }

    if (stepOneDraft.selectedAreas.length < 3) {
      setValidationError("Please select at least 3 life areas to continue.");
      return;
    }

    setValidationError(null);
    await saveAssessmentDraft({
      step: 1,
      route: "/assessment",
      savedAt: new Date().toISOString(),
      step1: stepOneDraft,
    });

    navigate("/assessment/step-2");
  };

  const handleSaveAndExit = async () => {
    setValidationError(null);
    const stepOneDraft = readStepOneDraft();

    await saveAssessmentDraft({
      step: 1,
      route: "/assessment",
      savedAt: new Date().toISOString(),
      step1: stepOneDraft,
    });

    const isAuthenticated = Boolean(getStoredToken());
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    navigate("/auth-required", {
      state: { from: "/assessment", intent: "save-assessment" as const },
    });
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
                <Compass strokeWidth={2} />
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
              onSubmit={handleNextStep}
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
                    min={1}
                    required
                    placeholder="e.g. 28"
                  />
                </div>

                <div className="assessment-field">
                  <label htmlFor="primary-goal">Primary Goal</label>
                  <div className="assessment-select-wrap">
                    <select
                      id="primary-goal"
                      name="primary-goal"
                      required
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
                  {LIFE_AREA_OPTIONS.map((area) => {
                    const AreaIcon = area.icon;

                    return (
                      <label key={area.value} className="life-area-card">
                        <input
                          type="checkbox"
                          name="life-areas"
                          value={area.value}
                          defaultChecked={area.defaultChecked}
                        />
                        <div className="area-card-ui">
                          <span className="area-icon" aria-hidden="true">
                            <AreaIcon strokeWidth={2} />
                          </span>
                          <div>
                            <h4>{area.label}</h4>
                            <p>{area.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {validationError && (
                <p className="assessment-validation-error" role="alert">
                  {validationError}
                </p>
              )}

              <div className="assessment-action-bar">
                <button
                  type="button"
                  className="assessment-btn-light"
                  onClick={handleSaveAndExit}
                >
                  Save &amp; Exit
                </button>

                <div className="assessment-action-group">
                  <button
                    type="button"
                    className="assessment-btn-muted"
                    onClick={() => {
                      const isAuthenticated = Boolean(getStoredToken());
                      navigate(isAuthenticated ? "/dashboard" : "/register");
                    }}
                  >
                    Back
                  </button>
                  <button type="submit" className="assessment-btn-primary">
                    Next Step
                  </button>
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
