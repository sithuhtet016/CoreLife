import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import HeaderUserMenu from "../components/HeaderUserMenu";
import { ensurePlotlyLoaded } from "../utils/loadPlotly";
import "./ProgressAnalyticsPage.css";

declare global {
  interface Window {
    Plotly: {
      newPlot: (
        element: string,
        data: unknown[],
        layout: Record<string, unknown>,
        config?: Record<string, unknown>,
      ) => void;
      relayout: (element: Element, layout: Record<string, unknown>) => void;
    };
  }
}

function ProgressAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "month",
  );
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    document.title = "CoreLife - Progress & Analytics";

    const initializeCharts = () => {
      try {
        if (!window.Plotly) return;

        const trendSeries = {
          week: {
            x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            y: [74, 73, 76, 78, 77, 81, 82],
          },
          month: {
            x: ["Week 1", "Week 2", "Week 3", "Week 4"],
            y: [65, 72, 78, 84],
          },
          quarter: {
            x: ["Jan", "Feb", "Mar"],
            y: [62, 71, 84],
          },
        };

        const areaSeries = {
          week: [78, 58, 84, 73, 76],
          month: [85, 60, 90, 75, 80],
          quarter: [88, 64, 92, 79, 83],
        };

        const trendData = [
          {
            x: trendSeries[timeRange].x,
            y: trendSeries[timeRange].y,
            type: "scatter",
            mode: "lines+markers",
            name: "Overall Score",
            line: {
              color: "#3B82F6",
              width: 3,
              shape: "spline",
              smoothing: 1.3,
            },
            marker: {
              size: 8,
              color: "#3B82F6",
              border: { color: "#fff", width: 2 },
            },
            fill: "tozeroy",
            fillcolor: "rgba(59, 130, 246, 0.1)",
          },
        ];

        const trendLayout = {
          margin: { t: 10, r: 10, b: 30, l: 30 },
          xaxis: { showgrid: false, color: "#9CA3AF", tickfont: { size: 12 } },
          yaxis: {
            showgrid: true,
            gridcolor: "#F3F4F6",
            color: "#9CA3AF",
            tickfont: { size: 12 },
            range: [0, 100],
          },
          plot_bgcolor: "transparent",
          paper_bgcolor: "transparent",
          showlegend: false,
          hovermode: "x unified",
        };

        window.Plotly.newPlot("chart-overall-trend", trendData, trendLayout, {
          responsive: true,
          displayModeBar: false,
        });

        const areaData = [
          {
            x: ["Health", "Mindset", "Finance", "Career", "Social"],
            y: areaSeries[timeRange],
            type: "bar",
            marker: {
              color: ["#10B981", "#8B5CF6", "#F59E0B", "#3B82F6", "#EC4899"],
              border: { radius: 4 },
            },
          },
        ];

        const areaLayout = {
          margin: { t: 10, r: 10, b: 30, l: 30 },
          xaxis: { showgrid: false, color: "#9CA3AF", tickfont: { size: 12 } },
          yaxis: {
            showgrid: true,
            gridcolor: "#F3F4F6",
            color: "#9CA3AF",
            tickfont: { size: 12 },
            range: [0, 100],
          },
          plot_bgcolor: "transparent",
          paper_bgcolor: "transparent",
          showlegend: false,
        };

        window.Plotly.newPlot("chart-area-radar", areaData, areaLayout, {
          responsive: true,
          displayModeBar: false,
        });
      } catch (error) {
        console.error("Error initializing charts:", error);
      }
    };

    const resizeCharts = () => {
      if (!window.Plotly) return;

      document.querySelectorAll(".plot-container.plotly").forEach((pc) => {
        const graph = pc.parentElement;
        if (!graph) return;

        const rect = graph.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        try {
          window.Plotly.relayout(graph, {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        } catch {
          return;
        }
      });
    };

    let isActive = true;
    let delayedInit = 0;
    let delayedResize = 0;

    let resizeTimer = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    const observer = new ResizeObserver(() => {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      if (width === lastWidth && height === lastHeight) return;

      lastWidth = width;
      lastHeight = height;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCharts, 150);
    });

    observer.observe(document.documentElement);

    const bootstrapCharts = async () => {
      try {
        await ensurePlotlyLoaded();
      } catch (error) {
        console.error("Failed to load Plotly:", error);
        return;
      }

      if (!isActive) return;

      initializeCharts();
      delayedInit = window.setTimeout(() => {
        if (isActive) initializeCharts();
      }, 1200);

      delayedResize = window.setTimeout(() => {
        if (!isActive) return;
        resizeCharts();
        window.setTimeout(() => {
          if (isActive) resizeCharts();
        }, 500);
      }, 300);
    };

    void bootstrapCharts();

    return () => {
      isActive = false;
      observer.disconnect();
      window.clearTimeout(delayedInit);
      window.clearTimeout(delayedResize);
      window.clearTimeout(resizeTimer);
    };
  }, [timeRange]);

  return (
    <div className="progress-analytics-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
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
                className="px-5 py-2 rounded-full text-sm font-bold text-white bg-dark shadow-md transition-colors"
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
        className="flex-1 w-full max-w-[1440px] mx-auto p-6 lg:p-8 flex flex-col gap-8"
      >
        <section
          id="analytics-header"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-dark tracking-tight">
              Progress &amp; Analytics
            </h1>
            <p className="text-sm text-bodyText mt-1">
              Track your long-term growth and habit consistency.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              role="tablist"
              aria-label="Analytics time range"
              className="flex items-center bg-white rounded-full border border-gray-200 p-1"
            >
              <button
                onClick={() => setTimeRange("week")}
                role="tab"
                aria-selected={timeRange === "week"}
                aria-controls="analytics-chart-panel"
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  timeRange === "week"
                    ? "font-bold text-dark bg-gray-100 shadow-sm"
                    : "font-medium text-bodyText hover:bg-gray-50"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                role="tab"
                aria-selected={timeRange === "month"}
                aria-controls="analytics-chart-panel"
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  timeRange === "month"
                    ? "font-bold text-dark bg-gray-100 shadow-sm"
                    : "font-medium text-bodyText hover:bg-gray-50"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("quarter")}
                role="tab"
                aria-selected={timeRange === "quarter"}
                aria-controls="analytics-chart-panel"
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  timeRange === "quarter"
                    ? "font-bold text-dark bg-gray-100 shadow-sm"
                    : "font-medium text-bodyText hover:bg-gray-50"
                }`}
              >
                Quarter
              </button>
            </div>
            <button
              onClick={() => showToast("Export started for current report")}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-bodyText hover:text-dark hover:bg-gray-50 transition-colors"
              title="Export Report"
            >
              <i className="fas fa-download"></i>
            </button>
            <button
              onClick={() => showToast("Share link copied to clipboard")}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-bodyText hover:text-dark hover:bg-gray-50 transition-colors"
              title="Share"
            >
              <i className="fas fa-share-nodes"></i>
            </button>
          </div>
        </section>

        <section
          id="kpi-metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="dash-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-bodyText">
                Overall Score
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                <i className="fas fa-chart-line text-xs"></i>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-dark">84</h3>
              <span className="text-sm font-medium text-green-500 mb-1 flex items-center gap-1">
                <i className="fas fa-arrow-up text-[10px]"></i> 12%
              </span>
            </div>
          </div>

          <div className="dash-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-bodyText">
                Habit Completion
              </span>
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                <i className="fas fa-check-double text-xs"></i>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-dark">92%</h3>
              <span className="text-sm font-medium text-green-500 mb-1 flex items-center gap-1">
                <i className="fas fa-arrow-up text-[10px]"></i> 5%
              </span>
            </div>
          </div>

          <div className="dash-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-bodyText">
                Current Streak
              </span>
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <i className="fas fa-fire text-xs"></i>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-dark">14</h3>
              <span className="text-sm font-medium text-bodyText mb-1">
                Days
              </span>
            </div>
          </div>

          <div className="dash-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-bodyText">
                Best Streak
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <i className="fas fa-trophy text-xs"></i>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-dark">28</h3>
              <span className="text-sm font-medium text-bodyText mb-1">
                Days
              </span>
            </div>
          </div>
        </section>

        <section
          id="charts-area"
          aria-live="polite"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div
            id="analytics-chart-panel"
            className="dash-card lg:col-span-2 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark">
                Overall Score Trend
              </h3>
              <button
                onClick={() => navigate("/results")}
                className="text-sm text-bodyText hover:text-primary transition-colors flex items-center gap-1"
              >
                Details <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
            <div id="chart-overall-trend" className="w-full h-[300px]"></div>
          </div>

          <div className="dash-card flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark">Area Balance</h3>
            </div>
            <div id="chart-area-radar" className="w-full h-[300px]"></div>
          </div>
        </section>

        <section
          id="insights-recommendations"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="dash-card flex flex-col gap-6">
            <h3 className="text-lg font-bold text-dark">Summary Insights</h3>

            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <i className="fas fa-arrow-trend-up"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">
                    Improved: Physical Activity
                  </h4>
                  <p className="text-sm text-bodyText mt-1">
                    Your daily step count and workout consistency have increased
                    by 20% this month.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <i className="fas fa-arrow-trend-down"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">
                    Declined: Sleep Quality
                  </h4>
                  <p className="text-sm text-bodyText mt-1">
                    Average sleep duration dropped below 7 hours in the last
                    week. Focus on evening routines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card-dark flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white">
              Data-Driven Recommendations
            </h3>

            <div className="flex flex-col gap-4">
              <div
                onClick={() => navigate("/habit-tracker")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate("/habit-tracker");
                  }
                }}
                role="button"
                tabIndex={0}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary bg-primary/20 px-2.5 py-1 rounded-md">
                    High Priority
                  </span>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Adjust Evening Habit Timing
                </h4>
                <p className="text-sm text-gray-400">
                  Moving your "Evening Journaling" 30 minutes earlier correlates
                  with better sleep scores.
                </p>
              </div>

              <div
                onClick={() => navigate("/habit-tracker")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate("/habit-tracker");
                  }
                }}
                role="button"
                tabIndex={0}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 bg-purple-400/20 px-2.5 py-1 rounded-md">
                    Suggestion
                  </span>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Add a Hydration Milestone
                </h4>
                <p className="text-sm text-gray-400">
                  You often miss the 2L water goal. Adding a midday check-in
                  habit might help.
                </p>
              </div>
            </div>
          </div>
        </section>
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

export default ProgressAnalyticsPage;
