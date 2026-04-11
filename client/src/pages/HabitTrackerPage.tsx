import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import HeaderUserMenu from "../components/HeaderUserMenu";
import "./HabitTrackerPage.css";

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

function HabitTrackerPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "health" | "finance" | "mindset"
  >("all");
  const [dailyNote, setDailyNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleQuickNote = (habitName: string) => {
    setDailyNote((current) => `${current}${current ? "\n" : ""}${habitName}: `);
    showToast(`Added ${habitName} to today's notes`);
  };

  useEffect(() => {
    document.title = "CoreLife - Habit Tracker";

    const initializeCharts = () => {
      const commonLayout = {
        margin: { t: 0, r: 0, b: 0, l: 0 },
        xaxis: { showgrid: false, zeroline: false, visible: false },
        yaxis: { showgrid: false, zeroline: false, visible: false },
        showlegend: false,
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        dragmode: false,
        hovermode: false,
      };

      const commonConfig = {
        responsive: true,
        displayModeBar: false,
        displaylogo: false,
      };

      try {
        if (!window.Plotly) return;

        window.Plotly.newPlot(
          "sparkline-1",
          [
            {
              x: [1, 2, 3, 4, 5, 6, 7],
              y: [0, 1, 0, 1, 1, 1, 1],
              type: "scatter",
              mode: "lines",
              line: {
                color: "#3B82F6",
                width: 2,
                shape: "spline",
                smoothing: 1.3,
              },
              fill: "tozeroy",
              fillcolor: "rgba(59, 130, 246, 0.1)",
            },
          ],
          commonLayout,
          commonConfig,
        );

        window.Plotly.newPlot(
          "sparkline-2",
          [
            {
              x: [1, 2, 3, 4, 5, 6, 7],
              y: [1, 1, 0, 1, 1, 0, 1],
              type: "scatter",
              mode: "lines",
              line: {
                color: "#10B981",
                width: 2,
                shape: "spline",
                smoothing: 1.3,
              },
              fill: "tozeroy",
              fillcolor: "rgba(16, 185, 129, 0.1)",
            },
          ],
          commonLayout,
          commonConfig,
        );

        window.Plotly.newPlot(
          "sparkline-3",
          [
            {
              x: [1, 2, 3, 4, 5, 6, 7],
              y: [1, 0, 0, 0, 1, 0, 0],
              type: "scatter",
              mode: "lines",
              line: {
                color: "#8B5CF6",
                width: 2,
                shape: "spline",
                smoothing: 1.3,
              },
              fill: "tozeroy",
              fillcolor: "rgba(139, 92, 246, 0.1)",
            },
          ],
          commonLayout,
          commonConfig,
        );
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
          window.Plotly?.relayout(graph, {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        } catch {
          return;
        }
      });
    };

    initializeCharts();
    const delayedInit = window.setTimeout(initializeCharts, 1200);

    const delayedResize = window.setTimeout(() => {
      resizeCharts();
      window.setTimeout(resizeCharts, 500);
    }, 300);

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

    return () => {
      observer.disconnect();
      window.clearTimeout(delayedInit);
      window.clearTimeout(delayedResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="habit-tracker-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
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
                className="px-5 py-2 rounded-full text-sm font-bold text-white bg-dark shadow-md transition-colors"
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
            id="habit-filters"
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div
              role="tablist"
              aria-label="Habit category filters"
              className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0"
            >
              <button
                onClick={() => setActiveFilter("all")}
                role="tab"
                aria-selected={activeFilter === "all"}
                aria-controls="habit-filter-panel"
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "all"
                    ? "bg-dark text-white font-bold shadow-md"
                    : "bg-white border border-gray-200 text-bodyText font-medium hover:bg-gray-50"
                }`}
              >
                All Habits
              </button>
              <button
                onClick={() => setActiveFilter("health")}
                role="tab"
                aria-selected={activeFilter === "health"}
                aria-controls="habit-filter-panel"
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "health"
                    ? "bg-dark text-white font-bold shadow-md"
                    : "bg-white border border-gray-200 text-bodyText font-medium hover:bg-gray-50"
                }`}
              >
                Health
              </button>
              <button
                onClick={() => setActiveFilter("finance")}
                role="tab"
                aria-selected={activeFilter === "finance"}
                aria-controls="habit-filter-panel"
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "finance"
                    ? "bg-dark text-white font-bold shadow-md"
                    : "bg-white border border-gray-200 text-bodyText font-medium hover:bg-gray-50"
                }`}
              >
                Finance
              </button>
              <button
                onClick={() => setActiveFilter("mindset")}
                role="tab"
                aria-selected={activeFilter === "mindset"}
                aria-controls="habit-filter-panel"
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "mindset"
                    ? "bg-dark text-white font-bold shadow-md"
                    : "bg-white border border-gray-200 text-bodyText font-medium hover:bg-gray-50"
                }`}
              >
                Mindset
              </button>
            </div>
            <button
              onClick={() => {
                setActiveFilter("all");
                showToast("Start by selecting a category to create a habit");
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primaryHover transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i> New Habit
            </button>
          </section>

          <div id="habit-filter-panel" role="tabpanel" aria-live="polite">
            {(activeFilter === "all" || activeFilter === "health") && (
              <section
                id="habit-list-health"
                aria-label="Health habits"
                className="dash-card flex flex-col gap-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-lg">
                      <i className="fas fa-heart-pulse"></i>
                    </div>
                    <h2 className="text-xl font-bold text-dark tracking-tight">
                      Health
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    Focus Area
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all gap-4 group">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="checkbox-wrapper-12">
                      <div className="cbx">
                        <input id="cbx-1" type="checkbox" />
                        <label htmlFor="cbx-1" />
                        <svg
                          width="15"
                          height="14"
                          viewBox="0 0 15 14"
                          fill="none"
                        >
                          <path d="M2 8.36364L6.23077 12L13 2"></path>
                        </svg>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                        <defs>
                          <filter id="goo-12">
                            <feGaussianBlur
                              in="SourceGraphic"
                              stdDeviation="4"
                              result="blur"
                            ></feGaussianBlur>
                            <feColorMatrix
                              in="blur"
                              mode="matrix"
                              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7"
                              result="goo-12"
                            ></feColorMatrix>
                            <feBlend in="SourceGraphic" in2="goo-12"></feBlend>
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-dark group-hover:text-primary transition-colors">
                        15-Minute Morning Walk
                      </h3>
                      <p className="text-xs text-bodyText mt-0.5">
                        Daily • 8:00 AM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <i className="text-[10px] fas fa-fire"></i> 12
                      </span>
                    </div>
                    <div className="w-24 h-8 js-plotly-plot" id="sparkline-1" />
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          handleQuickNote("15-Minute Morning Walk")
                        }
                        className="w-8 h-8 rounded-lg bg-gray-50 text-bodyText hover:text-dark hover:bg-gray-100 flex items-center justify-center transition-colors tooltip-trigger"
                        title="Quick Note"
                      >
                        <i className="far fa-note-sticky"></i>
                      </button>
                      <button
                        onClick={() =>
                          showToast("Edit opened for 15-Minute Morning Walk")
                        }
                        className="w-8 h-8 rounded-lg bg-gray-50 text-bodyText hover:text-dark hover:bg-gray-100 flex items-center justify-center transition-colors tooltip-trigger"
                        title="Edit Habit"
                      >
                        <i className="fas fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all gap-4 group bg-gray-50/50">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="checkbox-wrapper-12">
                      <div className="cbx">
                        <input id="cbx-2" type="checkbox" checked readOnly />
                        <label htmlFor="cbx-2" />
                        <svg
                          width="15"
                          height="14"
                          viewBox="0 0 15 14"
                          fill="none"
                        >
                          <path d="M2 8.36364L6.23077 12L13 2"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-500 line-through">
                        Drink 2L Water
                      </h3>
                      <p className="text-xs text-bodyText mt-0.5">
                        Daily • Ongoing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end opacity-75">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <i className="text-[10px] fas fa-fire"></i> 5
                      </span>
                    </div>
                    <div className="w-24 h-8 js-plotly-plot" id="sparkline-2" />
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleQuickNote("Drink 2L Water")}
                        className="w-8 h-8 rounded-lg bg-gray-50 text-bodyText hover:text-dark hover:bg-gray-100 flex items-center justify-center transition-colors tooltip-trigger"
                        title="Quick Note"
                      >
                        <i className="far fa-note-sticky"></i>
                      </button>
                      <button
                        onClick={() =>
                          showToast("Edit opened for Drink 2L Water")
                        }
                        className="w-8 h-8 rounded-lg bg-gray-50 text-bodyText hover:text-dark hover:bg-gray-100 flex items-center justify-center transition-colors tooltip-trigger"
                        title="Edit Habit"
                      >
                        <i className="fas fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(activeFilter === "all" || activeFilter === "mindset") && (
              <section
                id="habit-list-mindset"
                aria-label="Mindset habits"
                className="dash-card flex flex-col gap-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-lg">
                      <i className="fas fa-brain"></i>
                    </div>
                    <h2 className="text-xl font-bold text-dark tracking-tight">
                      Mindset
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all gap-4 group">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="checkbox-wrapper-12">
                      <div className="cbx">
                        <input id="cbx-3" type="checkbox" />
                        <label htmlFor="cbx-3" />
                        <svg
                          width="15"
                          height="14"
                          viewBox="0 0 15 14"
                          fill="none"
                        >
                          <path d="M2 8.36364L6.23077 12L13 2"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-dark group-hover:text-primary transition-colors">
                        Evening Journaling
                      </h3>
                      <p className="text-xs text-bodyText mt-0.5">
                        Daily • 9:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <i className="text-[10px] fas fa-fire"></i> 0
                      </span>
                    </div>
                    <div className="w-24 h-8 js-plotly-plot" id="sparkline-3" />
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleQuickNote("Evening Journaling")}
                        className="w-8 h-8 rounded-lg bg-gray-50 text-bodyText hover:text-dark hover:bg-gray-100 flex items-center justify-center transition-colors tooltip-trigger"
                        title="Quick Note"
                      >
                        <i className="far fa-note-sticky"></i>
                      </button>
                      <button
                        onClick={() =>
                          showToast("Edit opened for Evening Journaling")
                        }
                        className="w-8 h-8 rounded-lg bg-gray-50 text-bodyText hover:text-dark hover:bg-gray-100 flex items-center justify-center transition-colors tooltip-trigger"
                        title="Edit Habit"
                      >
                        <i className="fas fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeFilter === "finance" && (
              <section
                aria-label="Finance habits"
                className="dash-card flex flex-col items-center justify-center gap-3 text-center py-16"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-2xl">
                  <i className="fas fa-wallet"></i>
                </div>
                <h3 className="text-lg font-bold text-dark">
                  No Finance Habits Yet
                </h3>
                <p className="text-sm text-bodyText max-w-sm">
                  Add your first finance habit to start tracking progress in
                  this area.
                </p>
                <button
                  onClick={() => {
                    setActiveFilter("finance");
                    showToast("Finance habit creation started");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primaryHover transition-colors"
                >
                  Create Finance Habit
                </button>
              </section>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <section id="daily-notes" className="dash-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark">Today's Notes</h3>
              <span className="text-xs font-medium text-bodyText bg-gray-50 px-2 py-1 rounded-md">
                Aug 24
              </span>
            </div>
            <textarea
              value={dailyNote}
              onChange={(event) => setDailyNote(event.target.value)}
              className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm text-dark placeholder-gray-400"
              placeholder="Jot down quick reflections or blockers for today's habits..."
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() =>
                  showToast(
                    dailyNote.trim()
                      ? "Today's note saved"
                      : "Write a quick note before saving",
                  )
                }
                className="px-4 py-2 rounded-lg bg-gray-100 text-dark text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Save Note
              </button>
            </div>
          </section>

          <section id="weekly-progress" className="dash-card">
            <h3 className="text-lg font-bold text-dark mb-6">
              Weekly Completion
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-dark">Health</span>
                  <span className="font-bold text-primary">75%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-dark">Finance</span>
                  <span className="font-bold text-green-500">100%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-dark">Mindset</span>
                  <span className="font-bold text-purple-500">40%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "40%" }}
                  />
                </div>
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

export default HabitTrackerPage;
