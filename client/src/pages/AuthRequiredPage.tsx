import { Navigate, Link, useLocation } from "react-router-dom";
import { getStoredToken } from "../api";
import BrandLogo from "../components/BrandLogo";
import "./AuthRequiredPage.css";

type AuthRequiredState = {
  from?: string;
  intent?: "save-assessment";
};

function AuthRequiredPage() {
  const location = useLocation();
  const state = location.state as AuthRequiredState | null;
  const from = state?.from ?? "/dashboard";
  const cleanTarget = from.split("?")[0].split("#")[0] || from;
  const isAssessmentSaveIntent = state?.intent === "save-assessment";
  const isAuthenticated = Boolean(getStoredToken());

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="auth-required-page">
      <header className="auth-required-header cl-navbar-surface">
        <div className="auth-required-header-inner">
          <BrandLogo to="/" />
        </div>
      </header>

      <main className="auth-required-main">
        <section
          className="auth-required-shell"
          aria-labelledby="auth-required-title"
        >
          <div className="auth-required-blob auth-required-blob-a" />
          <div className="auth-required-blob auth-required-blob-b" />

          <div className="auth-required-content">
            <p className="auth-required-chip">Account required</p>
            <h1 id="auth-required-title">
              {isAssessmentSaveIntent
                ? "Save your assessment progress"
                : "Please sign in to continue"}
            </h1>
            <p className="auth-required-copy">
              {isAssessmentSaveIntent ? (
                <>
                  You are taking the assessment as a guest. Log in or create an
                  account to save your progress and continue later without
                  losing your answers.
                </>
              ) : (
                <>
                  You need an account to open <strong>{cleanTarget}</strong>.
                </>
              )}
            </p>

            <div className="auth-required-actions">
              <Link
                to="/login"
                state={{ from, intent: state?.intent }}
                className="auth-required-login"
              >
                {isAssessmentSaveIntent ? "Log In to Save" : "Log In"}
              </Link>
              <Link
                to="/register"
                state={{ from, intent: state?.intent }}
                className="auth-required-register"
              >
                {isAssessmentSaveIntent ? "Sign Up to Save" : "Create Account"}
              </Link>
            </div>

            <Link to="/" className="auth-required-cancel">
              Not now
            </Link>
          </div>
        </section>
      </main>

      <footer className="auth-required-footer">
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

export default AuthRequiredPage;
