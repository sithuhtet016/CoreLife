import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import {
  getStoredToken,
  hasCompletedAssessment,
  syncStoredTokenFromSession,
} from "./api";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CoreReadsLandingPage from "./pages/CoreReadsLandingPage";

const AssessmentPage = lazy(() => import("./pages/AssessmentPage"));
const AssessmentStep2Page = lazy(
  () => import("./pages/AssessmentStep2Page.tsx"),
);
const AssessmentStep3Page = lazy(
  () => import("./pages/AssessmentStep3Page.tsx"),
);
const HabitTrackerPage = lazy(() => import("./pages/HabitTrackerPage"));
const ProgressAnalyticsPage = lazy(
  () => import("./pages/ProgressAnalyticsPage"),
);
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const AuthRequiredPage = lazy(() => import("./pages/AuthRequiredPage"));

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const isAuthenticated = Boolean(getStoredToken());

  if (isAuthenticated) {
    return children;
  }

  const from = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to="/auth-required" replace state={{ from }} />;
}

function RequireCompletedAssessment({ children }: { children: ReactElement }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "ready" | "blocked">(
    "checking",
  );

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        // Ensure any stored session/token is synchronized before checking history
        // so the server call is authenticated and returns correct results.
        await syncStoredTokenFromSession().catch(() => {
          // ignore sync errors; hasCompletedAssessment will handle auth fallback
        });

        const hasCompleted = await hasCompletedAssessment();
        if (!active) return;
        setStatus(hasCompleted ? "ready" : "blocked");
      } catch {
        if (!active) return;
        setStatus("blocked");
      }
    };

    void check();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background:
            "linear-gradient(180deg, var(--cl-bg-gradient-start), var(--cl-bg-app))",
        }}
      >
        <div
          role="status"
          aria-live="polite"
          style={{
            width: "min(100%, 28rem)",
            padding: "1.5rem",
            borderRadius: "1.5rem",
            background: "var(--cl-surface)",
            border: "1px solid var(--cl-border)",
            boxShadow: "var(--cl-shadow-lg)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--cl-text)",
            }}
          >
            Loading your dashboard access...
          </p>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.9375rem",
              color: "var(--cl-text-muted)",
            }}
          >
            We&apos;re checking your latest assessment so we can send you to the
            right screen.
          </p>
        </div>
      </div>
    );
  }

  if (status === "blocked") {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/assessment" replace state={{ from }} />;
  }

  return children;
}

function RequireDashboardAccess({ children }: { children: ReactElement }) {
  return (
    <RequireAuth>
      <RequireCompletedAssessment>{children}</RequireCompletedAssessment>
    </RequireAuth>
  );
}

function App() {
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    void syncStoredTokenFromSession().catch(() => {
      // Route guards fall back to local token state when session sync fails.
    });
  }, []);

  useEffect(() => {
    const pageTitles: Record<string, string> = {
      "/": "CoreLife - Track and Improve Your Life",
      "/login": "CoreLife - Sign in to CoreLife",
      "/register": "CoreLife - Create your account",
      "/reset-password": "CoreLife - Reset your password",
      "/assessment": "CoreLife - Let's set your baseline",
      "/assessment/step-2": "CoreLife - Rate your current state",
      "/assessment/step-3": "CoreLife - Finalize your plan",
      "/dashboard": "CoreLife - Dashboard",
      "/habit-tracker": "CoreLife - Habit Tracker",
      "/progress-analytics": "CoreLife - Progress & Analytics",
      "/results": "CoreLife - Your CoreLife Score",
      "/legal": "CoreLife - Privacy, Terms & Support",
      "/core-reads": "CoreReads - Bilingual Book Insights",
    };

    document.title = pageTitles[pathname] ?? "CoreLife";
  }, [pathname]);

  return (
    <Suspense
      fallback={
        <div className="page-loading-screen min-h-screen grid place-items-center p-6 text-center">
          <p className="text-base font-medium text-gray-700">Loading page…</p>
        </div>
      }
    >
      <div key={pathname} className="cl-route-shell">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth-required" element={<AuthRequiredPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/step-2" element={<AssessmentStep2Page />} />
          <Route path="/assessment/step-3" element={<AssessmentStep3Page />} />
          <Route
            path="/habit-tracker"
            element={
              <RequireDashboardAccess>
                <HabitTrackerPage />
              </RequireDashboardAccess>
            }
          />
          <Route
            path="/progress-analytics"
            element={
              <RequireDashboardAccess>
                <ProgressAnalyticsPage />
              </RequireDashboardAccess>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireDashboardAccess>
                <DashboardPage />
              </RequireDashboardAccess>
            }
          />
          <Route
            path="/results"
            element={
              <RequireDashboardAccess>
                <ResultsPage />
              </RequireDashboardAccess>
            }
          />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/core-reads" element={<CoreReadsLandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
