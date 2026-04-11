import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import HeaderUserMenu from "../components/HeaderUserMenu";
import { ensurePlotlyLoaded } from "../utils/loadPlotly";

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
    ApexCharts?: unknown;
    Apex?: {
      _chartInstances?: Array<{
        chart?: { updateOptions: (...args: unknown[]) => void };
        updateOptions?: (...args: unknown[]) => void;
      }>;
    };
    Chart?: {
      instances?: Record<string, { resize: () => void }>;
    };
  }
}

function ResultsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    function initializeCharts() {
      const radarData = [
        {
          type: "scatterpolar",
          r: [88, 75, 45, 60, 80, 70],
          theta: [
            "Career",
            "Relationships",
            "Health",
            "Finance",
            "Growth",
            "Environment",
          ],
          fill: "toself",
          fillcolor: "rgba(59, 130, 246, 0.2)",
          line: {
            color: "#3B82F6",
            width: 2,
          },
          marker: {
            color: "#3B82F6",
            size: 6,
          },
        },
      ];

      const radarLayout = {
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 100],
            showticklabels: false,
            gridcolor: "#E5E7EB",
            linecolor: "transparent",
          },
          angularaxis: {
            gridcolor: "#E5E7EB",
            linecolor: "#E5E7EB",
            tickfont: {
              family: "Inter, sans-serif",
              size: 11,
              color: "#4B5563",
            },
          },
          bgcolor: "transparent",
        },
        showlegend: false,
        margin: { t: 40, r: 40, b: 40, l: 40 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        dragmode: false,
      };

      const trendData = [
        {
          x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          y: [55, 58, 62, 60, 68, 72],
          type: "scatter",
          mode: "lines+markers",
          line: {
            shape: "spline",
            smoothing: 1.3,
            color: "#3B82F6",
            width: 3,
          },
          marker: {
            size: 8,
            color: "#FFFFFF",
            line: {
              color: "#3B82F6",
              width: 2,
            },
          },
          fill: "tozeroy",
          fillcolor: "rgba(59, 130, 246, 0.1)",
        },
      ];

      const trendLayout = {
        xaxis: {
          showgrid: false,
          zeroline: false,
          showline: false,
          tickfont: { family: "Inter, sans-serif", size: 11, color: "#9CA3AF" },
        },
        yaxis: {
          showgrid: true,
          gridcolor: "#F3F4F6",
          zeroline: false,
          showline: false,
          range: [40, 100],
          tickfont: { family: "Inter, sans-serif", size: 11, color: "#9CA3AF" },
        },
        margin: { t: 10, r: 10, b: 30, l: 30 },
        showlegend: false,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        hovermode: "x unified",
      };

      const config = {
        responsive: true,
        displayModeBar: false,
        displaylogo: false,
      };

      try {
        if (window.Plotly) {
          window.Plotly.newPlot("radar-chart", radarData, radarLayout, config);
          window.Plotly.newPlot("trend-chart", trendData, trendLayout, config);
        }
      } catch (e) {
        console.error("Chart initialization failed:", e);
      }
    }

    function resizeCharts() {
      if (window.Plotly) {
        document.querySelectorAll(".plot-container.plotly").forEach((pc) => {
          const gd = pc.parentElement;
          if (!gd) return;
          const rect = gd.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          try {
            window.Plotly.relayout(gd, {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          } catch {
            return;
          }
        });
      }

      if (window.ApexCharts && window.Apex && window.Apex._chartInstances) {
        window.Apex._chartInstances.forEach((inst) => {
          try {
            if (inst.chart) {
              inst.chart.updateOptions({}, false, false);
            } else if (inst.updateOptions) {
              inst.updateOptions({}, false, false);
            }
          } catch {
            return;
          }
        });
      }

      if (window.Chart) {
        try {
          Object.values(window.Chart.instances || {}).forEach((c) =>
            c.resize(),
          );
        } catch {
          return;
        }
      }
    }

    let isActive = true;
    let delayedInit = 0;
    let delayedResize = 0;

    let resizeTimer = 0;
    let lastW = 0;
    let lastH = 0;

    const observer = new ResizeObserver(() => {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
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
  }, []);

  return (
    <div className="results-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
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
                className="px-5 py-2 rounded-full text-sm font-bold text-white bg-dark shadow-md transition-colors"
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
            id="overall-score"
            className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                <i className="fas fa-sparkles"></i> Assessment Complete
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-dark mb-4 tracking-tight">
                Your CoreLife Score is 72
              </h1>
              <p className="text-bodyText text-base mb-8 max-w-md">
                You&apos;re doing great in Career and Finances, but there&apos;s
                significant room for improvement in Health and Personal Growth.
                Let&apos;s build a plan to balance things out.
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/habit-tracker")}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primaryHover transition-colors flex items-center gap-2"
                >
                  Create Habit Plan <i className="fas fa-arrow-right"></i>
                </button>
                <button
                  onClick={() => navigate("/assessment")}
                  className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-dark font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Retake Assessment
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
                    out of 100
                  </span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-md border border-gray-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">
                  <i className="fas fa-arrow-up"></i>
                </div>
                <span className="text-xs font-bold">+5 from last</span>
              </div>
            </div>
          </section>

          <section
            id="analytics-charts"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-dark">
                  Life Balance Matrix
                </h3>
                <button
                  onClick={() =>
                    showToast("Additional chart controls coming soon")
                  }
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-dark transition-colors"
                >
                  <i className="fas fa-ellipsis"></i>
                </button>
              </div>
              <div
                id="radar-chart"
                className="flex-1 w-full relative -mt-4"
              ></div>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-dark">Overall Trend</h3>
                  <p className="text-xs text-bodyText mt-1">
                    Past 6 assessments
                  </p>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                  +12%
                </div>
              </div>
              <div id="trend-chart" className="flex-1 w-full relative"></div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <section
            id="area-scores"
            className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark">Area Breakdown</h3>
              <Link
                to="/progress-analytics"
                className="text-sm font-medium text-primary hover:text-primaryHover"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-surfaceAlt border border-gray-100 flex items-center justify-between group hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark">Career</h4>
                    <p className="text-xs text-bodyText mt-0.5">
                      Strong alignment
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-dark block">88</span>
                  <span className="text-[10px] text-green-500 font-medium">
                    +2
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surfaceAlt border border-gray-100 flex items-center justify-between group hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
                    <i className="fas fa-users"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark">
                      Relationships
                    </h4>
                    <p className="text-xs text-bodyText mt-0.5">Stable</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-dark block">75</span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    --
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between group hover:border-red-200 transition-colors relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-lg">
                    <i className="fas fa-heart-pulse"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark">Health</h4>
                    <p className="text-xs text-red-500/80 font-medium mt-0.5">
                      Requires attention
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-dark block">45</span>
                  <span className="text-[10px] text-red-500 font-medium">
                    -5
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section
            id="weakest-areas"
            className="bg-dark rounded-[24px] p-6 shadow-lg relative overflow-hidden text-white"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-lg font-bold mb-2 text-white">Focus Areas</h3>
            <p className="text-sm text-gray-400 mb-6">
              Based on your priorities from Step 3, here is where we should
              start.
            </p>

            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-heart-pulse text-red-400"></i>
                    <span className="font-semibold text-sm">
                      Improve Fitness
                    </span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80">
                    Priority 1
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-4">
                  Your score is 45/100. Let&apos;s build a 30-min daily routine.
                </p>
                <button
                  onClick={() => navigate("/habit-tracker")}
                  className="w-full py-2 bg-white text-dark rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Setup Health Habits
                </button>
              </div>
            </div>
          </section>

          <div className="mt-auto">
            <button
              onClick={() => navigate("/progress-analytics")}
              className="w-full p-4 rounded-2xl bg-white border border-gray-200 text-dark font-semibold text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                  <i className="fas fa-chart-line"></i>
                </div>
                <span>View Detailed Analytics</span>
              </div>
              <i className="fas fa-chevron-right text-gray-300 group-hover:text-primary transition-colors"></i>
            </button>
          </div>
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

export default ResultsPage;
