import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import "./LandingPage.css";

const TESTIMONIALS_PER_PAGE = 2;

const testimonials = [
  {
    quote:
      "The self-assessment totally changed my perspective. I realized I was focusing on the wrong habits. Six months in, and the analytics show a clear upward trend in my overall wellbeing.",
    name: "Sarah Jenkins",
    role: "Product Manager",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
  },
  {
    quote:
      "I've tried dozens of habit trackers, but CoreLife's clean interface and deep analytics make it stick. It's not just about ticking boxes; it's about understanding why I succeed or fail.",
    name: "Marcus Thompson",
    role: "Freelance Designer",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
  },
  {
    quote:
      "I started with tiny goals because I felt overwhelmed. The guided flow helped me build consistency, and now I finally trust my own routine.",
    name: "Nina Alvarez",
    role: "Marketing Lead",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
  },
  {
    quote:
      "What I love most is seeing progress over time. Even when I have rough weeks, I can zoom out and see that I'm still moving forward.",
    name: "Daniel Park",
    role: "Software Engineer",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
  },
  {
    quote:
      "The app gave me structure without pressure. I can track habits, reflect honestly, and adjust my goals in a way that feels human.",
    name: "Amelia Clarke",
    role: "HR Specialist",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
  },
  {
    quote:
      "My favorite part is the clarity. I used to guess what was working; now I can see patterns and focus my effort where it matters most.",
    name: "Ravi Menon",
    role: "Operations Analyst",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
  },
];

function LandingPage() {
  const [testimonialPage, setTestimonialPage] = useState(0);

  const totalTestimonialPages = Math.ceil(
    testimonials.length / TESTIMONIALS_PER_PAGE,
  );

  const visibleTestimonials = useMemo(() => {
    const startIndex = testimonialPage * TESTIMONIALS_PER_PAGE;
    return testimonials.slice(startIndex, startIndex + TESTIMONIALS_PER_PAGE);
  }, [testimonialPage]);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".features-section, .testimonials-section, .landing-cta-section, .section-intro, .feature-card, .testimonials-head, .testimonial-card, .cta-inner",
      ),
    );

    if (!revealTargets.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    revealTargets.forEach((element) => {
      if (element.classList.contains("is-visible")) {
        return;
      }
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [testimonialPage]);

  const handleHomeClick = () => {
    // Give immediate feedback when already on the home route.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousTestimonials = () => {
    setTestimonialPage((currentPage) => {
      if (currentPage === 0) {
        return totalTestimonialPages - 1;
      }
      return currentPage - 1;
    });
  };

  const handleNextTestimonials = () => {
    setTestimonialPage((currentPage) => {
      if (currentPage >= totalTestimonialPages - 1) {
        return 0;
      }
      return currentPage + 1;
    });
  };

  return (
    <div className="landing-root">
      <header className="landing-header cl-navbar-surface">
        <div className="landing-container landing-header-inner">
          <BrandLogo to="/" onClick={handleHomeClick} />

          <nav className="landing-header-actions">
            <Link to="/login" className="header-login">
              Log In
            </Link>
            <Link to="/assessment" className="header-cta">
              Start Assessment
            </Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-bg-orb hero-bg-orb-a" />
          <div className="hero-bg-orb hero-bg-orb-b" />

          <div className="landing-container hero-content-wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="hero-badge">
                  <span className="hero-badge-icon" aria-hidden="true">
                    <svg viewBox="0 0 512 512" fill="currentColor">
                      <g>
                        <path d="M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z" />
                        <circle cx="256" cy="364" r="28">
                          <animate
                            attributeType="XML"
                            repeatCount="indefinite"
                            dur="2s"
                            attributeName="r"
                            values="28;14;28;28;14;28"
                          />
                          <animate
                            attributeType="XML"
                            repeatCount="indefinite"
                            dur="2s"
                            attributeName="opacity"
                            values="1;0;1;1;0;1"
                          />
                        </circle>
                        <path
                          d="M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"
                          opacity="1"
                        >
                          <animate
                            attributeType="XML"
                            repeatCount="indefinite"
                            dur="2s"
                            attributeName="opacity"
                            values="1;0;0;0;0;1"
                          />
                        </path>
                        <path
                          d="M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"
                          opacity="0"
                        >
                          <animate
                            attributeType="XML"
                            repeatCount="indefinite"
                            dur="2s"
                            attributeName="opacity"
                            values="0;0;1;1;0;0"
                          />
                        </path>
                      </g>
                    </svg>
                  </span>
                  <span>Your journey starts here</span>
                </div>

                <h1>
                  Track and <br />
                  <span>Improve Your Life</span>
                </h1>

                <p>
                  CoreLife is your personal dashboard for self-assessment, habit
                  tracking, and long-term progress visualization. Build a better
                  you, one day at a time.
                </p>

                <div className="hero-actions">
                  <Link to="/assessment" className="hero-primary-btn">
                    Start Assessment
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link to="/login" className="hero-secondary-btn">
                    Log In
                  </Link>
                </div>

                <div className="hero-users">
                  <div className="hero-user-list" aria-hidden="true">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                      alt="User"
                    />
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                      alt="User"
                    />
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"
                      alt="User"
                    />
                  </div>
                  <p>Joined by 10,000+ mindful individuals</p>
                </div>
              </div>

              <div className="hero-visuals" aria-hidden="true">
                <div className="hero-ambient-shape hero-ambient-shape-a" />
                <div className="hero-ambient-shape hero-ambient-shape-b" />

                <div className="hero-main-image">
                  <img
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Mindfulness"
                  />

                  <div className="hero-glass-card">
                    <div className="hero-glass-status">
                      <span className="hero-dot" />
                      <span>Daily Goal Met</span>
                    </div>
                    <h3>Morning Routine</h3>
                    <p>Consistency is key to growth.</p>
                  </div>
                </div>

                <div className="hero-side-stack">
                  <div className="hero-side-image">
                    <img
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Habit Tracking"
                    />
                  </div>
                  <div className="hero-side-image">
                    <img
                      src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Analytics"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="landing-container">
            <div className="section-intro">
              <h2>Everything you need to grow</h2>
              <h1>
                A comprehensive toolkit designed to help you understand
                yourself, build positive routines, and track your evolution.
              </h1>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div
                  className="feature-icon feature-icon-blue"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 384 512" fill="currentColor">
                    <path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM72 272a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm104-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zM72 368a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm88 0c0-8.8 7.2-16 16-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16z" />
                  </svg>
                </div>
                <h3>Self-Assessment</h3>
                <p>
                  Take comprehensive baseline tests to understand your current
                  physical, mental, and emotional state before setting goals.
                </p>
              </article>

              <article className="feature-card">
                <div
                  className="feature-icon feature-icon-purple"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 448 512" fill="currentColor">
                    <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z" />
                  </svg>
                </div>
                <h3>Habit Tracker</h3>
                <p>
                  Build lasting routines with our intuitive daily tracker. Set
                  reminders, view streaks, and adjust your habits as you evolve.
                </p>
              </article>

              <article className="feature-card">
                <div
                  className="feature-icon feature-icon-green"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 512 512" fill="currentColor">
                    <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" />
                  </svg>
                </div>
                <h3>Deep Analytics</h3>
                <p>
                  Visualize your progress over weeks, months, and years.
                  Identify patterns and correlations in your mood, habits, and
                  overall life satisfaction.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <div className="landing-container">
            <div className="testimonials-head">
              <div>
                <h2>Real stories of change</h2>
                <p>
                  See how CoreLife has helped others build structure and find
                  clarity in their daily lives.
                </p>
              </div>
              <div className="carousel-buttons">
                <button
                  type="button"
                  onClick={handlePreviousTestimonials}
                  aria-label="Show previous testimonials"
                  className={testimonialPage > 0 ? "active" : undefined}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNextTestimonials}
                  aria-label="Show next testimonials"
                  className={
                    testimonialPage < totalTestimonialPages - 1
                      ? "active"
                      : undefined
                  }
                >
                  →
                </button>
              </div>
            </div>

            <div className="testimonial-grid" key={testimonialPage}>
              {visibleTestimonials.map((testimonial) => (
                <article className="testimonial-card" key={testimonial.name}>
                  <p className="stars">★★★★★</p>
                  <blockquote>"{testimonial.quote}"</blockquote>
                  <div className="testimonial-user">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div>
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta-section">
          <div className="cta-glow" aria-hidden="true" />
          <div className="landing-container cta-inner">
            <h2>Ready to take control?</h2>
            <p>
              Start your initial self-assessment today and get a personalized
              roadmap for your habits.
            </p>
            <Link to="/assessment" className="cta-button">
              Start Your Assessment Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <Link
            to="/"
            className="landing-footer-brand"
            onClick={handleHomeClick}
          >
            <span className="landing-footer-icon" aria-hidden="true">
              <svg viewBox="0 0 512 512" fill="currentColor">
                <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z" />
              </svg>
            </span>
            <span>CoreLife</span>
          </Link>

          <nav className="landing-footer-links">
            <Link to="/legal#privacy">Privacy Policy</Link>
            <Link to="/legal#terms">Terms of Service</Link>
            <Link to="/legal#support">Contact Support</Link>
          </nav>

          <p>© 2026 CoreLife. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
