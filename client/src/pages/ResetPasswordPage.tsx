import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession, resetPassword, signOutUser } from "../api";
import BrandLogo from "../components/BrandLogo";
import "./ResetPasswordPage.css";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyRecoverySession = async () => {
      setErrorMessage(null);
      setCanSubmit(true);
      try {
        const session = await getSession();
        const hasRecoveryToken =
          typeof window !== "undefined" &&
          window.location.hash.includes("access_token");

        if (!session && !hasRecoveryToken) {
          setErrorMessage("This reset link is invalid or has expired.");
          setCanSubmit(false);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to verify reset session";
        setErrorMessage(message);
        setCanSubmit(false);
      }
      setIsReady(true);
    };

    void verifyRecoverySession();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(password);
      await signOutUser();
      setSuccessMessage("Password updated successfully. Please sign in.");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => navigate("/login", { replace: true }), 1100);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      setErrorMessage(message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className="reset-page">
      <header className="reset-header cl-navbar-surface">
        <div className="reset-header-inner">
          <BrandLogo to="/" />
        </div>
      </header>

      <main className="reset-main">
        <section className="reset-card">
          <h1>Reset your password</h1>
          <p>Choose a new password to secure your account.</p>

          {!isReady && (
            <p className="reset-info">Checking your reset link...</p>
          )}

          {isReady && (
            <form className="reset-form" onSubmit={handleSubmit}>
              <label className="reset-field">
                <span>New password</span>
                <div className="reset-password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="reset-eye-btn"
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
                </div>
              </label>

              <label className="reset-field">
                <span>Confirm password</span>
                <div className="reset-password-input-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="reset-eye-btn"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((value) => !value)}
                  >
                    <svg
                      viewBox={
                        showConfirmPassword ? "0 0 576 512" : "0 0 640 512"
                      }
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {showConfirmPassword ? (
                        <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156.6 17.3 208.7 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 303.3 48.6 355.4 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-44 78.1-96.1 92.9-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.8-35-46.1-87.1-92.9-131.1C433.5 68.8 368.8 32 288 32zM288 432c-65.2 0-118.8-29.6-159.9-67.7C89.6 328.5 63 286 49.4 256c13.6-30 40.2-72.5 78.7-108.3C169.2 109.6 222.8 80 288 80s118.8 29.6 159.9 67.7C486.4 183.5 513 226 526.6 256c-13.6 30-40.2 72.5-78.7 108.3C406.8 402.4 353.2 432 288 432zM288 160a96 96 0 1 0 0 192 96 96 0 1 0 0-192zM288 304a48 48 0 1 1 0-96 48 48 0 1 1 0 96z" />
                      ) : (
                        <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z" />
                      )}
                    </svg>
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="reset-submit-btn"
                disabled={!isReady || !canSubmit || isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          )}

          {errorMessage && <p className="reset-error">{errorMessage}</p>}
          {successMessage && <p className="reset-success">{successMessage}</p>}

          <p className="reset-login-copy">
            Back to
            <Link to="/login">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default ResetPasswordPage;
