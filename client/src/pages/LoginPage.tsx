import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  clearTrustedRememberedLogin,
  getStoredToken,
  hasCompletedAssessment,
  hasTrustedRememberedLogin,
  login,
  requestPasswordReset,
  resendLoginOtpChallenge,
  saveTrustedRememberedLogin,
  startLoginOtpChallenge,
  verifyLoginOtpChallenge,
} from "../api";
import { getAssessmentDraft, syncGuestDraftToAccount } from "../assessmentDraft";
import {
  getRememberSessionPreference,
  setRememberSessionPreference,
} from "../supabase";
import BrandLogo from "../components/BrandLogo";
import "./LoginPage.css";

type AuthRedirectState = {
  from?: string;
};

const DASHBOARD_PATHS = [
  "/dashboard",
  "/habit-tracker",
  "/progress-analytics",
  "/results",
];

const ASSESSMENT_PATHS = [
  "/assessment",
  "/assessment/step-2",
  "/assessment/step-3",
];

function isDashboardTarget(path: string) {
  const cleanPath = path.split("?")[0].split("#")[0] || path;
  return DASHBOARD_PATHS.some(
    (target) => cleanPath === target || cleanPath.startsWith(`${target}/`),
  );
}

function isAssessmentTarget(path: string) {
  const cleanPath = path.split("?")[0].split("#")[0] || path;
  return ASSESSMENT_PATHS.some(
    (target) => cleanPath === target || cleanPath.startsWith(`${target}/`),
  );
}

function resolveAssessmentResumeRoute(route: string | undefined) {
  const normalized = (route || "").split("?")[0].split("#")[0] || "";
  if (
    normalized === "/assessment" ||
    normalized === "/assessment/step-2" ||
    normalized === "/assessment/step-3"
  ) {
    return normalized;
  }
  return "/assessment";
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() =>
    getRememberSessionPreference(),
  );
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [otpChallengeId, setOtpChallengeId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpDestination, setOtpDestination] = useState<string | null>(null);
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const redirectState = location.state as AuthRedirectState | null;
  const redirectTo = redirectState?.from ?? "/dashboard";
  const isAuthenticated = Boolean(getStoredToken());
  const isOtpStep = Boolean(otpChallengeId);
  const hasTrustedDeviceForEmail =
    rememberMe && Boolean(email.trim()) && hasTrustedRememberedLogin(email);

  const syncDraftAfterAuth = async () => {
    try {
      await syncGuestDraftToAccount({ completeAssessment: true });
    } catch (error) {
      console.error(
        "Signed in but failed to sync guest assessment draft:",
        error,
      );
    }
  };

  const resolvePostLoginDestination = async () => {
    const shouldCheckCompletion =
      isDashboardTarget(redirectTo) || isAssessmentTarget(redirectTo);

    if (!shouldCheckCompletion) return redirectTo;

    try {
      const completed = await hasCompletedAssessment();
      if (completed) {
        return isAssessmentTarget(redirectTo) ? "/dashboard" : redirectTo;
      }
      if (isAssessmentTarget(redirectTo)) {
        const draft = await getAssessmentDraft();
        return resolveAssessmentResumeRoute(draft?.route);
      }
      return "/assessment";
    } catch {
      return "/assessment";
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleVerifyOtp = async () => {
    if (isVerifyingOtp || !otpChallengeId) return;

    const normalizedCode = otpCode.trim();
    if (!normalizedCode) {
      setErrorMessage("Enter the verification code sent to your email.");
      return;
    }

    setErrorMessage(null);
    setOtpInfoMessage(null);
    setIsVerifyingOtp(true);

    try {
      await verifyLoginOtpChallenge(otpChallengeId, normalizedCode);
      await syncDraftAfterAuth();

      if (rememberMe) {
        saveTrustedRememberedLogin(email);
      } else {
        clearTrustedRememberedLogin(email);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OTP verification failed";
      setErrorMessage(message);
      setIsVerifyingOtp(false);
      return;
    }

    setIsVerifyingOtp(false);
    const destination = await resolvePostLoginDestination();
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isOtpStep) {
      await handleVerifyOtp();
      return;
    }

    if (isSubmitting) return;

    setErrorMessage(null);
    setOtpInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (rememberMe && hasTrustedRememberedLogin(email)) {
        await login(email, password, { rememberMe: true });
        await syncDraftAfterAuth();
        saveTrustedRememberedLogin(email);

        const destination = await resolvePostLoginDestination();
        navigate(destination, { replace: true });
        setIsSubmitting(false);
        return;
      }

      if (!rememberMe) {
        clearTrustedRememberedLogin(email);
      }

      const challenge = await startLoginOtpChallenge(email, password, {
        rememberMe,
      });

      setOtpChallengeId(challenge.challengeId);
      setOtpDestination(challenge.destination);
      setOtpCode("");
      setOtpInfoMessage(
        `We sent a one-time login code to ${challenge.destination}.`,
      );
      setShowResetForm(false);
      setResetMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setErrorMessage(message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const handleResendOtp = async () => {
    if (!otpChallengeId || isResendingOtp) return;

    setErrorMessage(null);
    setOtpInfoMessage(null);
    setIsResendingOtp(true);

    try {
      const response = await resendLoginOtpChallenge(otpChallengeId);
      setOtpDestination(response.destination);
      setOtpInfoMessage(
        `A new code was sent to ${response.destination}. It will expire in ${Math.ceil(response.expiresInSeconds / 60)} minutes.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend code";
      setErrorMessage(message);
    }

    setIsResendingOtp(false);
  };

  const handleUseDifferentAccount = () => {
    setOtpChallengeId(null);
    setOtpCode("");
    setOtpDestination(null);
    setOtpInfoMessage(null);
    setErrorMessage(null);
  };

  const handleRequestPasswordReset = async () => {
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setResetMessage("Enter your email address to reset your password.");
      return;
    }

    setResetMessage(null);
    setIsRequestingReset(true);

    try {
      await requestPasswordReset(targetEmail);
      setResetMessage(
        "If an account exists for that email, a password reset link has been sent.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to request password reset";
      setResetMessage(message);
    }

    setIsRequestingReset(false);
  };

  return (
    <div className="login-page">
      <header className="auth-header cl-navbar-surface">
        <div className="auth-header-inner">
          <BrandLogo to="/" />
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-shell">
          <aside className="auth-showcase" aria-hidden="true">
            <div className="showcase-blob blob-a" />
            <div className="showcase-blob blob-b" />

            <div className="showcase-content">
              <div className="showcase-chip">
                <span className="chip-icon" aria-hidden="true">
                  <svg viewBox="0 0 512 512" fill="currentColor">
                    <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" />
                  </svg>
                </span>
                <span>Your personal dashboard</span>
              </div>

              <h2 className="showcase-title">
                Welcome back to
                <br />
                <span>your journey.</span>
              </h2>

              <p className="showcase-copy">
                Log in to access your self-assessment data, update your habit
                tracker, and view your long-term progress analytics.
              </p>

              <div className="floating-cards">
                <article className="floating-card card-a glass-panel">
                  <div className="floating-head">
                    <span className="floating-icon" aria-hidden="true">
                      <svg viewBox="0 0 448 512" fill="currentColor">
                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                      </svg>
                    </span>
                    <div>
                      <h4>Morning Routine</h4>
                      <p>Completed today</p>
                    </div>
                  </div>
                  <div className="progress-line">
                    <span />
                  </div>
                </article>

                <article className="floating-card card-b glass-panel">
                  <div className="floating-head">
                    <span className="floating-icon chart" aria-hidden="true">
                      <svg viewBox="0 0 576 512" fill="currentColor">
                        <path d="M304 240V16.6c0-9 7-16.6 16-16.6C443.7 0 544 100.3 544 224c0 9-7.6 16-16.6 16H304zM32 272C32 150.7 122.1 50.3 239 34.3c9.2-1.3 17 6.1 17 15.4V288L412.5 444.5c6.7 6.7 6.2 17.7-1.5 23.1C371.8 495.6 323.8 512 272 512C139.5 512 32 404.6 32 272zm526.4 16c9.3 0 16.6 7.8 15.4 17c-7.7 55.9-34.6 105.6-73.9 142.3c-6 5.6-15.4 5.2-21.2-.7L320 288H558.4z" />
                      </svg>
                    </span>
                    <div>
                      <h4>Weekly Focus</h4>
                      <p>85% alignment</p>
                    </div>
                  </div>
                  <div className="bars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </article>
              </div>
            </div>
          </aside>

          <section className="auth-form-wrap">
            <div className="auth-form-inner">
              <div className="auth-title">
                <h1>
                  {isOtpStep ? "Verify your login" : "Sign in to CoreLife"}
                </h1>
                <p>
                  {isOtpStep
                    ? "Enter the one-time code sent to your email to complete sign in."
                    : "Enter your details to access your dashboard."}
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {!isOtpStep && (
                  <>
                    <label className="field-wrap">
                      <span className="sr-only">Email address</span>
                      <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </label>

                    <label className="field-wrap">
                      <span className="sr-only">Password</span>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        <svg
                          viewBox={showPassword ? "0 0 576 512" : "0 0 640 512"}
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          {showPassword ? (
                            <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156.6 17.3 208.7 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 303.3 48.6 355.4 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-44 78.1-96.1 92.9-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.8-35-46.1-87.1-92.9-131.1C433.5 68.8 368.8 32 288 32zM288 432c-65.2 0-118.8-29.6-159.9-67.7C89.6 328.5 63 286 49.4 256c13.6-30 40.2-72.5 78.7-108.3C169.2 109.6 222.8 80 288 80s118.8 29.6 159.9 67.7C486.4 183.5 513 226 526.6 256c-13.6 30-40.2 72.5-78.7 108.3C406.8 402.4 353.2 432 288 432zM288 160a96 96 0 1 0 0 192 96 96 0 1 0 0-192zM288 304a48 48 0 1 1 0-96 48 48 0 1 1 0 96z" />
                          ) : (
                            <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z" />
                          )}
                        </svg>
                      </button>
                    </label>

                    <div className="options-row">
                      <label className="remember-wrap">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(event) => {
                            const next = event.target.checked;
                            setRememberMe(next);
                            setRememberSessionPreference(next);
                          }}
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="forgot-link"
                        onClick={() => {
                          setShowResetForm((value) => !value);
                          setResetMessage(null);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <p className="auth-info remember-note">
                      {rememberMe
                        ? hasTrustedDeviceForEmail
                          ? "This device is trusted for this email, so sign in may skip the one-time code."
                          : "Keep me signed in on this device. After email verification, this device will be trusted for faster sign-in."
                        : "Use this for shared devices. You may need to verify with a one-time code next time."}
                    </p>

                    {showResetForm && (
                      <div className="reset-panel">
                        <p>
                          Enter your email and we&apos;ll send a reset link.
                        </p>
                        <label className="field-wrap">
                          <span className="sr-only">
                            Email for password reset
                          </span>
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(event) =>
                              setResetEmail(event.target.value)
                            }
                            placeholder="Email for password reset"
                            autoComplete="email"
                          />
                        </label>
                        <button
                          type="button"
                          className="reset-btn"
                          onClick={handleRequestPasswordReset}
                          disabled={isRequestingReset}
                        >
                          {isRequestingReset ? "Sending..." : "Send reset link"}
                        </button>
                        {resetMessage && (
                          <p className="auth-info">{resetMessage}</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {isOtpStep && (
                  <div className="login-otp-panel">
                    <p className="auth-info login-otp-meta">
                      Code sent to {otpDestination ?? email}
                    </p>
                    <label className="field-wrap">
                      <span className="sr-only">
                        One-time verification code
                      </span>
                      <input
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="one-time-code"
                        placeholder="Enter 6-digit code"
                        value={otpCode}
                        onChange={(event) =>
                          setOtpCode(event.target.value.replace(/\s+/g, ""))
                        }
                      />
                    </label>
                    <div className="login-otp-actions">
                      <button
                        type="button"
                        className="otp-link-btn"
                        onClick={handleResendOtp}
                        disabled={isResendingOtp || isVerifyingOtp}
                      >
                        {isResendingOtp ? "Resending..." : "Resend code"}
                      </button>
                      <button
                        type="button"
                        className="otp-link-btn"
                        onClick={handleUseDifferentAccount}
                        disabled={isResendingOtp || isVerifyingOtp}
                      >
                        Use different account
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="signin-btn"
                  disabled={isSubmitting || isVerifyingOtp || isResendingOtp}
                >
                  {isOtpStep
                    ? isVerifyingOtp
                      ? "Verifying..."
                      : "Verify code"
                    : isSubmitting
                      ? "Sending code..."
                      : "Continue"}
                </button>

                {otpInfoMessage && (
                  <p className="auth-info auth-info-center">{otpInfoMessage}</p>
                )}

                {errorMessage && <p className="auth-error">{errorMessage}</p>}
              </form>

              <p className="signup-copy">
                Don&apos;t have an account?
                <Link to="/register">Sign Up now</Link>
              </p>
            </div>
          </section>
        </section>
      </main>

      <footer className="auth-footer">
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

export default LoginPage;
