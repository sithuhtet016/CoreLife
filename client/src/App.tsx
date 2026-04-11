import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import type { ReactElement } from "react";
import { getStoredToken, syncStoredTokenFromSession } from "./api";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentStep2Page from "./pages/AssessmentStep2Page.tsx";
import AssessmentStep3Page from "./pages/AssessmentStep3Page.tsx";
import HabitTrackerPage from "./pages/HabitTrackerPage";
import ProgressAnalyticsPage from "./pages/ProgressAnalyticsPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import LegalPage from "./pages/LegalPage";
import AuthRequiredPage from "./pages/AuthRequiredPage";

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const isAuthenticated = Boolean(getStoredToken());

  if (isAuthenticated) {
    return children;
  }

  const from = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to="/auth-required" replace state={{ from }} />;
}

function App() {
  const { pathname } = useLocation();

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
      "/settings": "CoreLife - Settings",
    };

    document.title = pageTitles[pathname] ?? "CoreLife";
  }, [pathname]);

  return (
    <Routes>
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
          <RequireAuth>
            <HabitTrackerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/progress-analytics"
        element={
          <RequireAuth>
            <ProgressAnalyticsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/results"
        element={
          <RequireAuth>
            <ResultsPage />
          </RequireAuth>
        }
      />
      <Route path="/legal" element={<LegalPage />} />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
