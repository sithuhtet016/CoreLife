import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import "./SettingsPage.css";
import "./LegalPage.css";

function LegalPage() {
  const { hash } = useLocation();
  const supportEmail = "support@corelife.app";

  useEffect(() => {
    document.title = "CoreLife - Privacy, Terms & Support";
  }, []);

  useEffect(() => {
    if (!hash) {
      return;
    }

    const element = document.getElementById(hash.slice(1));
    if (element) {
      window.requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, [hash]);

  return (
    <div className="legal-page settings-page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="cl-navbar-surface legal-header">
        <div className="legal-header-inner">
          <BrandLogo to="/" />

          <div className="legal-header-actions">
            <Link to="/login" className="legal-link-btn">
              Log in
            </Link>
            <Link to="/register" className="legal-primary-btn">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="legal-main">
        <section className="dash-card legal-hero">
          <div className="legal-hero-chip">
            <span className="legal-hero-chip-dot" aria-hidden="true"></span>
            Public information
          </div>
          <div className="legal-hero-copy">
            <h1>Privacy, Terms, and Support for CoreLife</h1>
            <p>
              This page is available to everyone, including first-time visitors
              and guests who have not signed in. It explains how CoreLife
              handles information, the rules for using the service, and how to
              contact support.
            </p>
          </div>

          <div className="legal-quick-links">
            <a href="#privacy" className="legal-pill-link">
              Privacy Policy
            </a>
            <a href="#terms" className="legal-pill-link">
              Terms of Service
            </a>
            <a href="#support" className="legal-pill-link">
              Contact Support
            </a>
          </div>
        </section>

        <section id="privacy" className="dash-card legal-card">
          <div className="legal-card-head">
            <h2>Privacy Policy</h2>
            <p className="legal-meta">Last updated: April 10, 2026.</p>
          </div>

          <div className="legal-copy">
            <p>
              CoreLife is committed to handling personal data responsibly. This
              policy explains what information we collect, how we use it, and
              your choices when using assessments, habit tracking, analytics,
              and account features.
            </p>

            <div className="legal-subsection">
              <h3>1. Information We Collect</h3>
              <p>
                We collect account information you provide, profile preferences,
                assessment responses and scores, habits and activity logs, and
                technical session data needed to authenticate your account and
                operate the product securely.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>2. How We Use Information</h3>
              <p>We use collected information to:</p>
              <ul className="legal-list">
                <li>Create and secure your account.</li>
                <li>Save and restore assessment progress.</li>
                <li>Generate scores, trends, and progress analytics.</li>
                <li>Provide reminders, settings, and support responses.</li>
                <li>Improve product quality, reliability, and security.</li>
              </ul>
            </div>

            <div className="legal-subsection">
              <h3>3. Data Security</h3>
              <p>
                Passwords are stored as one-way hashes and account access is
                protected using token-based authentication. We maintain
                reasonable administrative and technical safeguards, but no
                system can guarantee absolute security.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>4. Third-Party Services</h3>
              <p>
                CoreLife may rely on trusted infrastructure and analytics
                providers to host and operate core features. These providers
                process data only as necessary to deliver and secure the
                service.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>5. Data Retention and Controls</h3>
              <p>
                Data is retained while your account is active or as needed to
                provide services, resolve disputes, and meet legal obligations.
                You may request account data export, update profile details, and
                request account deletion.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>6. Policy Updates</h3>
              <p>
                We may revise this policy over time. Material updates are
                reflected by the "Last updated" date and may be communicated
                in-app when appropriate.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>7. Contact for Privacy Requests</h3>
              <p>
                For privacy questions, data requests, or account-related
                concerns, contact us at {supportEmail}.
              </p>
            </div>
          </div>
        </section>

        <section id="terms" className="dash-card legal-card">
          <div className="legal-card-head">
            <h2>Terms of Service</h2>
            <p className="legal-meta">Last updated: April 10, 2026.</p>
          </div>

          <div className="legal-copy">
            <p>
              By accessing or using CoreLife, you agree to these Terms of
              Service. If you do not agree, discontinue use of the platform.
            </p>

            <div className="legal-subsection">
              <h3>1. Eligibility and Accounts</h3>
              <p>
                You are responsible for maintaining account credential
                confidentiality and for activity under your account.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>2. Acceptable Use</h3>
              <p>
                You agree not to misuse the service, attempt unauthorized
                access, interfere with operations, or use CoreLife in violation
                of applicable laws.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>3. Service Scope</h3>
              <p>
                CoreLife provides self-improvement tracking and analytics for
                informational and personal development purposes. It is not
                medical, legal, financial, or emergency advice.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>4. Intellectual Property</h3>
              <p>
                CoreLife branding, software, and content remain the property of
                CoreLife and licensors. You may not copy, reverse engineer, or
                redistribute service components except as permitted by law.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>5. Availability and Changes</h3>
              <p>
                We may update, suspend, or discontinue features at any time,
                including for maintenance, security, and product improvements.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>6. Termination</h3>
              <p>
                We may suspend or terminate accounts that violate these terms or
                compromise security. You may stop using the service at any time.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>7. Limitation of Liability</h3>
              <p>
                To the maximum extent allowed by law, CoreLife is provided "as
                is" without guarantees of uninterrupted availability or fitness
                for a specific purpose.
              </p>
            </div>

            <div className="legal-subsection">
              <h3>8. Contact</h3>
              <p>Questions about these terms can be sent to {supportEmail}.</p>
            </div>
          </div>
        </section>

        <section id="support" className="dash-card legal-card">
          <div className="legal-card-head">
            <h2>Contact Support</h2>
            <p className="legal-meta">
              Reach out for account, privacy, and technical assistance.
            </p>
          </div>

          <div className="legal-copy">
            <p>
              Our support team can assist with sign-in issues, data export
              requests, account deletion, and troubleshooting assessment,
              habits, or analytics behavior.
            </p>

            <div className="legal-support-box">
              <p>
                <span className="legal-label">Email:</span> {supportEmail}
              </p>
              <p>
                <span className="legal-label">Response time:</span> Usually
                within 1-2 business days.
              </p>
              <p>
                <span className="legal-label">Include:</span> account email,
                short issue summary, and screenshots when possible.
              </p>
            </div>

            <div className="legal-support-actions">
              <a
                href={`mailto:${supportEmail}`}
                className="legal-support-primary"
              >
                Email Support
              </a>
              <Link to="/login" className="legal-support-secondary">
                Sign in for account help
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <nav className="legal-footer-links">
            <a href="#privacy" className="legal-footer-link">
              Privacy Policy
            </a>
            <a href="#terms" className="legal-footer-link">
              Terms of Service
            </a>
            <a href="#support" className="legal-footer-link">
              Contact Support
            </a>
          </nav>
          <p className="legal-footer-copy">
            © 2026 CoreLife. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LegalPage;
