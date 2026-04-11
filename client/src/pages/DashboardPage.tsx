import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BrandLogo from "../components/BrandLogo";
import HeaderUserMenu from "../components/HeaderUserMenu";

function DashboardPage() {
  const navigate = useNavigate();
  const [meditationDone, setMeditationDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    document.title = "CoreLife - Dashboard";

    const initializeCharts = () => {
      // The reference dashboard is CSS-only on this screen.
    };

    initializeCharts();
    const delayedInit = window.setTimeout(initializeCharts, 1200);

    return () => {
      window.clearTimeout(delayedInit);
    };
  }, []);

  return (
    <div className="dashboard-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
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
                className="px-5 py-2 rounded-full text-sm font-bold text-white bg-dark shadow-md transition-colors"
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
        className="flex-1 w-full max-w-[1440px] mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-8 flex flex-col gap-8">
          <section
            id="life-score-overview"
            className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                <i className="fas fa-bolt"></i> Daily Overview
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-dark mb-2 tracking-tight">
                Good Morning, Alex
              </h1>
              <p className="text-bodyText text-base mb-8 max-w-md">
                Your CoreLife Score is currently 72. You have 4 habits scheduled
                for today to help boost your Health score.
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/habit-tracker")}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primaryHover transition-colors flex items-center gap-2"
                >
                  Start Daily Check-in <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <div className="score-circle shadow-lg shadow-blue-500/10">
                <div className="relative z-10 text-center">
                  <span className="block text-5xl font-bold text-dark tracking-tighter">
                    72
                  </span>
                  <span className="block text-sm font-medium text-bodyText mt-1">
                    Life Score
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section
            id="summary-metrics"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg">
                    <i className="fas fa-circle-check"></i>
                  </div>
                  <h3 className="text-lg font-bold text-dark">
                    Habits Completed
                  </h3>
                </div>
                <span className="text-xs font-medium text-bodyText bg-gray-50 px-2 py-1 rounded-md">
                  Today
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold text-dark block">
                    3{" "}
                    <span className="text-lg text-bodyText font-medium">
                      / 5
                    </span>
                  </span>
                  <p className="text-sm text-bodyText mt-1">
                    60% completion rate
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-gray-100 relative flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-green-500"
                      strokeDasharray="60, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg">
                    <i className="fas fa-fire"></i>
                  </div>
                  <h3 className="text-lg font-bold text-dark">
                    Current Streak
                  </h3>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-dark block">
                  12{" "}
                  <span className="text-lg text-bodyText font-medium">
                    Days
                  </span>
                </span>
                <p className="text-sm text-bodyText mt-1">
                  Personal best: 24 days
                </p>

                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-8 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                  <div className="flex-1 h-8 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <div className="flex-1 h-8 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    W
                  </div>
                  <div className="flex-1 h-8 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <div className="flex-1 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-bold">
                    F
                  </div>
                  <div className="flex-1 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-bold">
                    S
                  </div>
                  <div className="flex-1 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-bold">
                    S
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="quick-actions"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <button
              onClick={() => navigate("/habit-tracker")}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all group text-center py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <i className="fas fa-plus"></i>
              </div>
              <span className="text-sm font-semibold text-dark">Add Habit</span>
            </button>
            <button
              onClick={() => navigate("/progress-analytics")}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all group text-center py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-pie"></i>
              </div>
              <span className="text-sm font-semibold text-dark">Analytics</span>
            </button>
            <button
              onClick={() => navigate("/assessment")}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all group text-center py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <span className="text-sm font-semibold text-dark">
                Retake Assessment
              </span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all group text-center py-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-bodyText flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <i className="fas fa-gear"></i>
              </div>
              <span className="text-sm font-semibold text-dark">Settings</span>
            </button>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <section
            id="weakest-areas"
            className="bg-dark rounded-[24px] p-6 shadow-lg relative overflow-hidden text-white"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-lg font-bold mb-2">Focus Areas</h3>
            <p className="text-sm text-gray-400 mb-6">
              Based on your recent assessment, here are suggested actions to
              improve your lowest scores.
            </p>

            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <i className="fas fa-heart-pulse"></i>
                    </div>
                    <div>
                      <span className="font-semibold text-sm block">
                        Health (45/100)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-1 rounded text-white/80">
                    Priority
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-4">
                  Your physical activity score is low. Suggested: Add a
                  15-minute daily walk habit.
                </p>
                <button
                  onClick={() => {
                    showToast("Added health habit suggestion");
                    navigate("/habit-tracker");
                  }}
                  className="w-full py-2.5 bg-white text-dark rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus"></i> Add Walking Habit
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <i className="fas fa-wallet"></i>
                    </div>
                    <div>
                      <span className="font-semibold text-sm block">
                        Finance (60/100)
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Savings rate is below target. Suggested: Review monthly
                  budget.
                </p>
                <button
                  onClick={() => navigate("/progress-analytics")}
                  className="w-full py-2.5 bg-transparent border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Schedule Review
                </button>
              </div>
            </div>
          </section>

          <section
            id="upcoming-habits"
            className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark">
                Today&apos;s Habits
              </h3>
              <Link
                to="/habit-tracker"
                className="text-sm font-medium text-primary hover:text-primaryHover"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between group transition-colors ${
                  meditationDone
                    ? "bg-green-50 border-green-100"
                    : "bg-surfaceAlt border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const next = !meditationDone;
                      setMeditationDone(next);
                      showToast(
                        next
                          ? "Morning Meditation marked complete"
                          : "Morning Meditation marked incomplete",
                      );
                    }}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      meditationDone
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-primary hover:bg-blue-50"
                    }`}
                    aria-label="Toggle morning meditation completion"
                  >
                    {meditationDone && <i className="fas fa-check text-xs"></i>}
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        meditationDone
                          ? "text-gray-500 line-through"
                          : "text-dark"
                      }`}
                    >
                      Morning Meditation
                    </h4>
                    <p className="text-xs text-bodyText mt-0.5">10 minutes</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-400">
                  8:00 AM
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-between opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-green-500 text-white flex items-center justify-center text-xs">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-dark line-through text-gray-500">
                      Drink Water
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">500ml</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-400">
                  7:00 AM
                </span>
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

export default DashboardPage;
