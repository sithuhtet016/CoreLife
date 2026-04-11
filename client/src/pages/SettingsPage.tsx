import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import HeaderUserMenu from "../components/HeaderUserMenu";
import "./SettingsPage.css";

function SettingsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();
  const supportEmail = "support@corelife.app";

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleCopySupportEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      showToast("Support email copied");
    } catch {
      showToast("Unable to copy automatically. Use support@corelife.app");
    }
  };

  useEffect(() => {
    document.title = "CoreLife - Settings";
  }, []);

  return (
    <div className="settings-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header
        id="app-header"
        className="cl-navbar-surface w-full z-50 sticky top-0"
      >
        <div className="max-w-[1440px] mx-auto px-6 h-[4.5rem] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BrandLogo to="/dashboard" />

            <nav className="hidden md:flex items-center gap-2 p-1.5 bg-gray-50 rounded-full border border-gray-100">
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-full text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/habit-tracker"
                className="px-5 py-2 rounded-full text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-100 transition-colors"
              >
                Habit Tracker
              </Link>
              <Link
                to="/progress-analytics"
                className="px-5 py-2 rounded-full text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-100 transition-colors"
              >
                Progress &amp; Analytics
              </Link>
              <Link
                to="/results"
                className="px-5 py-2 rounded-full text-sm font-medium text-bodyText hover:text-dark hover:bg-gray-100 transition-colors"
              >
                Results
              </Link>
              <Link
                to="/settings"
                className="px-5 py-2 rounded-full text-sm font-bold text-white bg-dark shadow-md transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/settings#notifications")}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-bodyText hover:text-dark hover:bg-gray-100 transition-colors relative"
            >
              <i className="far fa-bell"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <HeaderUserMenu />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-[1440px] mx-auto p-6 lg:p-8 flex flex-col lg:flex-row gap-8"
      >
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-dark mb-4 px-4">Settings</h2>
          <nav className="flex flex-col gap-1">
            <a
              href="#profile"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-primary font-semibold shadow-sm border border-gray-100 transition-colors"
            >
              <i className="far fa-user w-5 text-center"></i>
              Profile &amp; Account
            </a>
            <a
              href="#notifications"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-bodyText hover:bg-white hover:text-dark hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <i className="far fa-bell w-5 text-center"></i>
              Notifications
            </a>
            <a
              href="#preferences"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-bodyText hover:bg-white hover:text-dark hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <i className="fas fa-sliders w-5 text-center"></i>
              Preferences
            </a>
            <a
              href="#privacy"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-bodyText hover:bg-white hover:text-dark hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <i className="fas fa-shield-halved w-5 text-center"></i>
              Data &amp; Privacy
            </a>
            <a
              href="#terms"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-bodyText hover:bg-white hover:text-dark hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <i className="fas fa-file-contract w-5 text-center"></i>
              Terms of Service
            </a>
            <a
              href="#support"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-bodyText hover:bg-white hover:text-dark hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <i className="fas fa-headset w-5 text-center"></i>
              Contact Support
            </a>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col gap-8 max-w-4xl">
          <section id="profile" className="dash-card flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-bold text-dark">
                Profile Information
              </h3>
              <p className="text-sm text-bodyText mt-1">
                Update your photo and personal details.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100">
              <div className="relative group">
                <img
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                  alt="Profile Photo"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <button
                  onClick={() => showToast("Profile photo picker opened")}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primaryHover transition-colors border-2 border-white"
                >
                  <i className="fas fa-camera text-xs"></i>
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => showToast("Uploading a new profile photo")}
                    className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primaryHover transition-colors"
                  >
                    Upload new photo
                  </button>
                  <button
                    onClick={() => showToast("Profile photo removed")}
                    className="px-5 py-2 rounded-full bg-gray-50 text-bodyText text-sm font-medium border border-gray-200 hover:bg-gray-100 hover:text-dark transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-bodyText">
                  JPG, GIF or PNG. Max size of 800K
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-dark">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="Alex"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-dark font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-dark">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Morgan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-dark font-medium"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-dark">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="alex.morgan@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-dark font-medium"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-dark">
                  Timezone
                </label>
                <div className="relative">
                  <select
                    defaultValue="(GMT-08:00) Pacific Time (US & Canada)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-dark font-medium appearance-none cursor-pointer"
                  >
                    <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                    <option>(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                    <option>(GMT+00:00) London</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => showToast("Profile settings saved")}
                className="px-6 py-2.5 rounded-full bg-dark text-white text-sm font-bold shadow-md hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </section>

          <section id="notifications" className="dash-card flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-bold text-dark">
                Notification Reminders
              </h3>
              <p className="text-sm text-bodyText mt-1">
                Manage how and when you receive habit reminders.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-dark">
                    Daily Summary
                  </span>
                  <span className="text-sm text-bodyText">
                    Get a morning overview of your habits for the day.
                  </span>
                </div>
                <div className="relative inline-block w-11 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="toggle1"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 opacity-0"
                    defaultChecked
                  />
                  <label
                    htmlFor="toggle1"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-dark">
                    Habit Reminders
                  </span>
                  <span className="text-sm text-bodyText">
                    Push notifications when a habit is due.
                  </span>
                </div>
                <div className="relative inline-block w-11 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="toggle2"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 opacity-0"
                    defaultChecked
                  />
                  <label
                    htmlFor="toggle2"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-dark">
                    Weekly Progress Report
                  </span>
                  <span className="text-sm text-bodyText">
                    Receive an email with your weekly analytics.
                  </span>
                </div>
                <div className="relative inline-block w-11 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="toggle3"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 opacity-0"
                  />
                  <label
                    htmlFor="toggle3"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </section>

          <section id="preferences" className="dash-card flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-bold text-dark">
                Display &amp; Theme
              </h3>
              <p className="text-sm text-bodyText mt-1">
                Customize the interface appearance.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="relative flex flex-col gap-3 p-4 rounded-2xl border-2 border-primary bg-blue-50/30 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-dark">Light</span>
                    <input
                      type="radio"
                      name="theme"
                      className="custom-radio"
                      defaultChecked
                    />
                  </div>
                  <div className="w-full h-24 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-2 p-2">
                    <div className="w-full h-4 bg-gray-100 rounded-md"></div>
                    <div className="w-3/4 h-3 bg-gray-50 rounded-md"></div>
                    <div className="w-1/2 h-3 bg-blue-50 rounded-md mt-auto"></div>
                  </div>
                </label>

                <label className="relative flex flex-col gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 transition-colors cursor-pointer group bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-dark">Dark</span>
                    <input type="radio" name="theme" className="custom-radio" />
                  </div>
                  <div className="w-full h-24 rounded-xl bg-gray-900 border border-gray-800 shadow-sm flex flex-col gap-2 p-2">
                    <div className="w-full h-4 bg-gray-800 rounded-md"></div>
                    <div className="w-3/4 h-3 bg-gray-800 rounded-md"></div>
                    <div className="w-1/2 h-3 bg-blue-900/50 rounded-md mt-auto"></div>
                  </div>
                </label>

                <label className="relative flex flex-col gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 transition-colors cursor-pointer group bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-dark">System</span>
                    <input type="radio" name="theme" className="custom-radio" />
                  </div>
                  <div className="w-full h-24 rounded-xl flex overflow-hidden border border-gray-200 shadow-sm">
                    <div className="w-1/2 h-full bg-white flex flex-col gap-2 p-2 border-r border-gray-100">
                      <div className="w-full h-3 bg-gray-100 rounded-md"></div>
                    </div>
                    <div className="w-1/2 h-full bg-gray-900 flex flex-col gap-2 p-2">
                      <div className="w-full h-3 bg-gray-800 rounded-md"></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section id="privacy" className="dash-card flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-bold text-dark">Privacy Policy</h3>
              <p className="text-sm text-bodyText mt-1">
                Last updated: April 10, 2026.
              </p>
            </div>

            <div className="grid gap-6 text-sm text-bodyText leading-7">
              <p>
                CoreLife is committed to handling your personal data
                responsibly. This policy explains what information we collect,
                how we use it, and your choices when using assessments, habit
                tracking, analytics, and account features.
              </p>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  1. Information We Collect
                </h4>
                <p>
                  We collect account information you provide (such as email and
                  password), profile preferences, assessment responses and
                  scores, habits and activity logs, plus technical session data
                  required to authenticate your account and operate the product
                  securely.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  2. How We Use Information
                </h4>
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
                <h4 className="text-base font-bold text-dark">
                  3. Data Security
                </h4>
                <p>
                  Passwords are stored as one-way hashes and account access is
                  protected using token-based authentication. We maintain
                  reasonable administrative and technical safeguards, but no
                  system can guarantee absolute security.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  4. Third-Party Services
                </h4>
                <p>
                  CoreLife may rely on trusted infrastructure and analytics
                  providers to host and operate core features. These providers
                  process data only as necessary to deliver and secure the
                  service.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  5. Data Retention and Controls
                </h4>
                <p>
                  Data is retained while your account is active or as needed to
                  provide services, resolve disputes, and meet legal
                  obligations. You may request account data export, update
                  profile details, and request account deletion.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  6. Policy Updates
                </h4>
                <p>
                  We may revise this policy over time. Material updates are
                  reflected by the "Last updated" date and may be communicated
                  in-app when appropriate.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  7. Contact for Privacy Requests
                </h4>
                <p>
                  For privacy questions, data requests, or account-related
                  concerns, contact us at {supportEmail}.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
              <h4 className="text-base font-bold text-dark">Data Controls</h4>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-dark">
                    Export Account Data
                  </span>
                  <span className="text-xs text-bodyText">
                    Download a copy of your assessments, habits, and analytics.
                  </span>
                </div>
                <button
                  onClick={() => showToast("Preparing account data export")}
                  className="px-4 py-2 rounded-full border border-gray-200 text-bodyText text-sm font-medium hover:bg-gray-50 hover:text-dark transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-download text-xs"></i> Export
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-base font-bold text-red-600">Danger Zone</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-red-100 bg-red-50/30 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-dark">
                    Delete Account
                  </span>
                  <span className="text-xs text-bodyText">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </span>
                </div>
                <button
                  onClick={() => showToast("Delete flow requires confirmation")}
                  className="px-5 py-2.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-sm font-bold hover:bg-red-600 hover:text-white transition-colors whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          <section id="terms" className="dash-card flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-dark">Terms of Service</h3>
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
                <h4 className="text-base font-bold text-dark">
                  1. Eligibility and Accounts
                </h4>
                <p>
                  You are responsible for maintaining account credential
                  confidentiality and for activity under your account.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  2. Acceptable Use
                </h4>
                <p>
                  You agree not to misuse the service, attempt unauthorized
                  access, interfere with operations, or use CoreLife in
                  violation of applicable laws.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  3. Service Scope
                </h4>
                <p>
                  CoreLife provides self-improvement tracking and analytics for
                  informational and personal development purposes. It is not
                  medical, legal, financial, or emergency advice.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  4. Intellectual Property
                </h4>
                <p>
                  CoreLife branding, software, and content remain the property
                  of CoreLife and licensors. You may not copy, reverse engineer,
                  or redistribute service components except as permitted by law.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  5. Availability and Changes
                </h4>
                <p>
                  We may update, suspend, or discontinue features at any time,
                  including for maintenance, security, and product improvements.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  6. Termination
                </h4>
                <p>
                  We may suspend or terminate accounts that violate these terms
                  or compromise security. You may stop using the service at any
                  time.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">
                  7. Limitation of Liability
                </h4>
                <p>
                  To the maximum extent allowed by law, CoreLife is provided "as
                  is" without guarantees of uninterrupted availability or
                  fitness for a specific purpose.
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="text-base font-bold text-dark">8. Contact</h4>
                <p>
                  Questions about these terms can be sent to {supportEmail}.
                </p>
              </div>
            </div>
          </section>

          <section id="support" className="dash-card flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-dark">Contact Support</h3>
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
                  <span className="font-semibold text-dark">
                    Response time:
                  </span>{" "}
                  Usually within 1-2 business days.
                </p>
                <p>
                  <span className="font-semibold text-dark">Include:</span>{" "}
                  account email, short issue summary, and screenshots when
                  possible.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopySupportEmail}
                  className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primaryHover transition-colors"
                >
                  Copy Support Email
                </button>
                <button
                  onClick={() => showToast("Support ticket form coming soon")}
                  className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-bodyText text-sm font-semibold hover:text-dark hover:bg-gray-50 transition-colors"
                >
                  Open Support Ticket
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 bg-dark text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
