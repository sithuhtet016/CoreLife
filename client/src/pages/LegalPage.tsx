import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import "./SettingsPage.css";

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
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hash]);

  return (
    <div className="legal-page settings-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="cl-navbar-surface fixed inset-x-0 top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-[4.5rem] flex items-center justify-between gap-4">
          <BrandLogo to="/" />

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full text-sm font-semibold bg-dark text-white shadow-md hover:bg-gray-800 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-[1120px] mx-auto p-6 pt-[5.5rem] lg:p-8 lg:pt-[5.75rem] flex flex-col gap-8"
      >
        <section className="dash-card bg-gradient-to-br from-white via-white to-blue-50/40 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-semibold w-fit">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Public information
          </div>
          <div className="grid gap-4 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-dark">
              Privacy, Terms, and Support for CoreLife
            </h1>
            <p className="text-base text-bodyText leading-7">
              This page is available to everyone, including first-time visitors
              and guests who have not signed in. It explains how CoreLife
              handles information, the rules for using the service, and how to
              contact support.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#privacy"
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-50 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-50 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#support"
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>

        <section id="privacy" className="dash-card flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Privacy Policy</h2>
            <p className="text-sm text-bodyText mt-1">
              Last updated: April 10, 2026.
            </p>
          </div>

          <div className="grid gap-5 text-sm text-bodyText leading-7">
            <p>
              CoreLife is committed to handling personal data responsibly. This
              policy explains what information we collect, how we use it, and
              your choices when using assessments, habit tracking, analytics,
              and account features.
            </p>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                1. Information We Collect
              </h3>
              <p>
                We collect account information you provide, profile preferences,
                assessment responses and scores, habits and activity logs, and
                technical session data needed to authenticate your account and
                operate the product securely.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                2. How We Use Information
              </h3>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create and secure your account.</li>
                <li>Save and restore assessment progress.</li>
                <li>Generate scores, trends, and progress analytics.</li>
                <li>Provide reminders, settings, and support responses.</li>
                <li>Improve product quality, reliability, and security.</li>
              </ul>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                3. Data Security
              </h3>
              <p>
                Passwords are stored as one-way hashes and account access is
                protected using token-based authentication. We maintain
                reasonable administrative and technical safeguards, but no
                system can guarantee absolute security.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                4. Third-Party Services
              </h3>
              <p>
                CoreLife may rely on trusted infrastructure and analytics
                providers to host and operate core features. These providers
                process data only as necessary to deliver and secure the
                service.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                5. Data Retention and Controls
              </h3>
              <p>
                Data is retained while your account is active or as needed to
                provide services, resolve disputes, and meet legal obligations.
                You may request account data export, update profile details, and
                request account deletion.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                6. Policy Updates
              </h3>
              <p>
                We may revise this policy over time. Material updates are
                reflected by the "Last updated" date and may be communicated
                in-app when appropriate.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                7. Contact for Privacy Requests
              </h3>
              <p>
                For privacy questions, data requests, or account-related
                concerns, contact us at {supportEmail}.
              </p>
            </div>
          </div>
        </section>

        <section id="terms" className="dash-card flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Terms of Service</h2>
            <p className="text-sm text-bodyText mt-1">
              Last updated: April 10, 2026.
            </p>
          </div>

          <div className="grid gap-5 text-sm text-bodyText leading-7">
            <p>
              By accessing or using CoreLife, you agree to these Terms of
              Service. If you do not agree, discontinue use of the platform.
            </p>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                1. Eligibility and Accounts
              </h3>
              <p>
                You are responsible for maintaining account credential
                confidentiality and for activity under your account.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                2. Acceptable Use
              </h3>
              <p>
                You agree not to misuse the service, attempt unauthorized
                access, interfere with operations, or use CoreLife in violation
                of applicable laws.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                3. Service Scope
              </h3>
              <p>
                CoreLife provides self-improvement tracking and analytics for
                informational and personal development purposes. It is not
                medical, legal, financial, or emergency advice.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                4. Intellectual Property
              </h3>
              <p>
                CoreLife branding, software, and content remain the property of
                CoreLife and licensors. You may not copy, reverse engineer, or
                redistribute service components except as permitted by law.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                5. Availability and Changes
              </h3>
              <p>
                We may update, suspend, or discontinue features at any time,
                including for maintenance, security, and product improvements.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">6. Termination</h3>
              <p>
                We may suspend or terminate accounts that violate these terms or
                compromise security. You may stop using the service at any time.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">
                7. Limitation of Liability
              </h3>
              <p>
                To the maximum extent allowed by law, CoreLife is provided "as
                is" without guarantees of uninterrupted availability or fitness
                for a specific purpose.
              </p>
            </div>

            <div className="grid gap-2">
              <h3 className="text-base font-bold text-dark">8. Contact</h3>
              <p>Questions about these terms can be sent to {supportEmail}.</p>
            </div>
          </div>
        </section>

        <section id="support" className="dash-card flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">Contact Support</h2>
            <p className="text-sm text-bodyText mt-1">
              Reach out for account, privacy, and technical assistance.
            </p>
          </div>

          <div className="grid gap-4 text-sm text-bodyText leading-7">
            <p>
              Our support team can assist with sign-in issues, data export
              requests, account deletion, and troubleshooting assessment,
              habits, or analytics behavior.
            </p>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 grid gap-2">
              <p>
                <span className="font-semibold text-dark">Email:</span>{" "}
                {supportEmail}
              </p>
              <p>
                <span className="font-semibold text-dark">Response time:</span>{" "}
                Usually within 1-2 business days.
              </p>
              <p>
                <span className="font-semibold text-dark">Include:</span>{" "}
                account email, short issue summary, and screenshots when
                possible.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${supportEmail}`}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primaryHover transition-colors"
              >
                Email Support
              </a>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-bodyText text-sm font-semibold hover:text-dark hover:bg-gray-50 transition-colors"
              >
                Sign in for account help
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="max-w-[1120px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-bodyText">
          <nav className="flex flex-wrap gap-4">
            <a href="#privacy" className="hover:text-dark transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-dark transition-colors">
              Terms of Service
            </a>
            <a href="#support" className="hover:text-dark transition-colors">
              Contact Support
            </a>
          </nav>
          <p>© 2026 CoreLife. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LegalPage;
