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
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <label className="reset-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
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
