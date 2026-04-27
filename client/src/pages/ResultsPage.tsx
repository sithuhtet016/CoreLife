import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Briefcase,
  Compass,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Leaf,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getComparison, getProgressHistory, getQuestions } from "../api";
import AppHeader from "../components/AppHeader";
import PageSkeleton from "../components/PageSkeleton";
import { ensurePlotlyLoaded } from "../utils/loadPlotly";
import type { AssessmentSession, ComparisonRow, LifeArea } from "../types";
import {
  buildAreaScoreSummaries,
  computeOverallScore,
  formatShortDate,
  getLatestSession,
} from "../utils/assessmentSummary";

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
  const [isLoading, setIsLoading] = useState(true);
  const [latestSession, setLatestSession] = useState<AssessmentSession | null>(
    null,
  );
  const [history, setHistory] = useState<AssessmentSession[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [comparison, setComparison] = useState<ComparisonRow[]>([]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    let active = true;

    const loadAssessmentData = async () => {
      setIsLoading(true);

      try {
        const [historyResponse, questionsResponse, comparisonResponse] =
          await Promise.all([
            getProgressHistory(),
            getQuestions(),
            getComparison(),
          ]);

        if (!active) return;

        const sessions = historyResponse.sessions ?? [];
        setHistory(sessions);
        setLatestSession(getLatestSession(sessions));
        setLifeAreas(questionsResponse.lifeAreas ?? []);
        setComparison(comparisonResponse.comparison ?? []);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load assessment data:", error);
        showToast("Unable to load assessment data yet.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadAssessmentData();

    return () => {
      active = false;
    };
  }, []);

  const hasAssessment = Boolean(latestSession);
  const overallScore = computeOverallScore(latestSession);

  const areaSummaries = useMemo(
    () => buildAreaScoreSummaries(latestSession, lifeAreas),
    [latestSession, lifeAreas],
  );

  const rankedAreas = useMemo(
    () => [...areaSummaries].sort((a, b) => b.score - a.score),
    [areaSummaries],
  );

  const focusAreas = useMemo(
    () => [...areaSummaries].sort((a, b) => a.score - b.score).slice(0, 2),
    [areaSummaries],
  );

  const comparisonById = useMemo(() => {
    return new Map(comparison.map((row) => [row.life_area_id, row.change]));
  }, [comparison]);

  const trendSessions = useMemo(() => history.slice(-6), [history]);

  const overallChange = useMemo(() => {
    if (history.length < 2) return null;
    const last = history[history.length - 1];
    const previous = history[history.length - 2];
    const lastScore = computeOverallScore(last);
    const previousScore = computeOverallScore(previous);
    if (lastScore == null || previousScore == null) return null;
    return lastScore - previousScore;
  }, [history]);

  const iconByAreaName = useMemo<Record<string, LucideIcon>>(
    () => ({
      health: Activity,
      appearance: Sparkles,
      love: Heart,
      family: Home,
      friends: Users,
      relationships: Users,
      career: Briefcase,
      money: Wallet,
      finance: Wallet,
      "self-growth": TrendingUp,
      growth: TrendingUp,
      spirituality: Compass,
      recreation: Gamepad2,
      environment: Leaf,
      community: Globe,
      social: Users,
      mindset: Compass,
    }),
    [],
  );

  useEffect(() => {
    if (
      !hasAssessment ||
      areaSummaries.length === 0 ||
      trendSessions.length === 0
    ) {
      return;
    }

    function initializeCharts() {
      const labels = areaSummaries.map((area) => area.name);
      const scores = areaSummaries.map((area) => Math.round(area.score));

      const radarData = [
        {
          type: "scatterpolar",
          r: scores,
          theta: labels,
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

      const trendScores = trendSessions.map(
        (session) => computeOverallScore(session) ?? 0,
      );
      const trendLabels = trendSessions.map((session) =>
        formatShortDate(session.completed_at ?? session.started_at),
      );

      const trendData = [
        {
          x: trendLabels,
          y: trendScores,
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
          range: [0, 100],
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
  }, [areaSummaries, hasAssessment, trendSessions]);

  return (
    <div className="results-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex-1 w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"
      >
        {isLoading ? (
          <PageSkeleton />
        ) : !hasAssessment ? (
          <section className="flex flex-col items-center gap-4 rounded-[24px] border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-2xl">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h1 className="text-xl font-bold text-dark sm:text-2xl">
              Complete your assessment to see results
            </h1>
            <p className="text-bodyText max-w-md">
              We will show your CoreLife score, area breakdown, and insights
              after your first assessment.
            </p>
            <button
              onClick={() => navigate("/assessment")}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primaryHover sm:px-6 sm:py-3"
            >
              Start Assessment
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-8">
              <section
                id="overall-score"
                className="flex flex-col items-center gap-6 rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:gap-10 sm:p-6 lg:p-8"
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                    <i className="fas fa-sparkles"></i> Assessment Complete
                  </div>
                  <h1 className="mb-4 text-2xl font-bold tracking-tight text-dark sm:text-3xl lg:text-4xl">
                    Your CoreLife Score is {Math.round(overallScore ?? 0)}
                  </h1>
                  <p className="mb-6 max-w-md text-sm text-bodyText sm:mb-8 sm:text-base">
                    You&apos;re doing great in{" "}
                    {rankedAreas[0]?.name ?? "your top areas"}
                    {rankedAreas[1] ? ` and ${rankedAreas[1].name}` : ""}, and
                    there&apos;s room to grow in{" "}
                    {focusAreas[0]?.name ?? "a few areas"}.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => navigate("/habit-tracker")}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primaryHover sm:px-6 sm:py-3"
                    >
                      Create Habit Plan <i className="fas fa-arrow-right"></i>
                    </button>
                    <button
                      onClick={() => navigate("/assessment")}
                      className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50 sm:px-6 sm:py-3"
                    >
                      Retake Assessment
                    </button>
                  </div>
                </div>

                <div className="relative flex-shrink-0">
                  <div className="score-circle shadow-lg shadow-blue-500/10">
                    <div className="relative z-10 text-center">
                      <span className="block text-4xl font-bold tracking-tighter text-dark sm:text-5xl">
                        {Math.round(overallScore ?? 0)}
                      </span>
                      <span className="block text-sm font-medium text-bodyText mt-1">
                        out of 100
                      </span>
                    </div>
                  </div>
                  {overallChange != null && (
                    <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-md border border-gray-100 flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                          overallChange >= 0
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <i
                          className={`fas ${
                            overallChange >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                          }`}
                        ></i>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          overallChange >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {`${overallChange >= 0 ? "+" : ""}${Math.round(overallChange)} from last`}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              <section
                id="analytics-charts"
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <div className="flex h-[320px] flex-col rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:h-[400px] sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-dark">
                      Life Balance Matrix
                    </h3>
                  </div>
                  <div
                    id="radar-chart"
                    className="flex-1 w-full relative -mt-4"
                  ></div>
                </div>

                <div className="flex h-[320px] flex-col rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:h-[400px] sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-dark">
                        Overall Trend
                      </h3>
                      <p className="text-xs text-bodyText mt-1">
                        Past {trendSessions.length} assessments
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        overallChange == null
                          ? "bg-gray-50 text-gray-400"
                          : overallChange >= 0
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {overallChange != null
                        ? `${overallChange >= 0 ? "+" : ""}${Math.round(overallChange)}`
                        : "--"}
                    </div>
                  </div>
                  <div
                    id="trend-chart"
                    className="flex-1 w-full relative"
                  ></div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4">
              <section
                id="area-scores"
                className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-dark">
                    Area Breakdown
                  </h3>
                  <Link
                    to="/progress-analytics"
                    className="text-sm font-medium text-primary hover:text-primaryHover"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-3">
                  {rankedAreas.slice(0, 5).map((area) => {
                    const change = comparisonById.get(area.id);
                    const changeLabel =
                      typeof change === "number"
                        ? `${change >= 0 ? "+" : ""}${Math.round(change)}`
                        : "--";

                    return (
                      <div
                        key={area.id}
                        className="p-4 rounded-2xl bg-surfaceAlt border border-gray-100 flex items-center justify-between group hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                            {(() => {
                              const iconKey = area.name
                                .toLowerCase()
                                .replace(/\s+/g, "-");
                              const Icon =
                                iconByAreaName[iconKey] ??
                                iconByAreaName[area.name.toLowerCase()] ??
                                Activity;
                              return <Icon className="w-5 h-5" />;
                            })()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-dark">
                              {area.name}
                            </h4>
                            <p className="text-xs text-bodyText mt-0.5">
                              Score update
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-dark block">
                            {Math.round(area.score)}
                          </span>
                          <span
                            className={`text-[10px] font-medium flex items-center justify-end gap-1 ${
                              typeof change === "number"
                                ? change >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            {typeof change === "number" && (
                              <i
                                className={`fas ${
                                  change >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                                }`}
                              ></i>
                            )}
                            {changeLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section
                id="weakest-areas"
                className="relative overflow-hidden rounded-[24px] bg-dark p-5 text-white shadow-lg sm:p-6"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none"></div>

                <h3 className="text-lg text-white font-bold mb-2">
                  Focus Areas
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Start with your lowest scores and build momentum.
                </p>

                <div className="space-y-4 relative z-10">
                  {focusAreas.map((area, index) => (
                    <div
                      key={area.id}
                      className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const iconKey = area.name
                              .toLowerCase()
                              .replace(/\s+/g, "-");
                            const Icon =
                              iconByAreaName[iconKey] ??
                              iconByAreaName[area.name.toLowerCase()] ??
                              Activity;
                            return <Icon className="w-4 h-4 text-red-400" />;
                          })()}
                          <span className="font-semibold text-sm">
                            {area.name}
                          </span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80">
                          Priority {index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-4">
                        Your score is {Math.round(area.score)}/100. Let&apos;s
                        build a habit plan to lift this area.
                      </p>
                      <button
                        onClick={() => navigate("/habit-tracker")}
                        className="w-full py-2 bg-white text-dark rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                      >
                        Setup {area.name} Habits
                      </button>
                    </div>
                  ))}
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
          </div>
        )}
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
