import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import PageSkeleton from "../components/PageSkeleton";
import {
  getComparison,
  getHabits,
  getProgressHistory,
  getQuestions,
  getRecommendations,
} from "../api";
import { ensurePlotlyLoaded } from "../utils/loadPlotly";
import { getLifeAreaAccent } from "../utils/lifeAreaTheme";
import type {
  AssessmentSession,
  ComparisonRow,
  Habit,
  HabitSummary,
  LifeArea,
  Recommendation,
} from "../types";
import {
  buildAreaScoreSummaries,
  computeOverallScore,
  formatShortDate,
  getLatestSession,
} from "../utils/assessmentSummary";
import { getHabitSummaryOrDefault } from "../utils/habitSummary";
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
  const [isLoading, setIsLoading] = useState(true);
  const [latestSession, setLatestSession] = useState<AssessmentSession | null>(
    null,
  );
  const [history, setHistory] = useState<AssessmentSession[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitSummary, setHabitSummary] = useState<HabitSummary>(
    getHabitSummaryOrDefault(null),
  );
  const [comparison, setComparison] = useState<ComparisonRow[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    let active = true;

    const loadAssessmentData = async () => {
      setIsLoading(true);
      try {
        const [
          historyResponse,
          questionsResponse,
          habitsResponse,
          comparisonResponse,
          recommendationsResponse,
        ] = await Promise.all([
          getProgressHistory(),
          getQuestions(),
          getHabits(),
          getComparison(),
          getRecommendations(),
        ]);

        if (!active) return;

        const sessions = historyResponse.sessions ?? [];
        setHistory(sessions);
        setLatestSession(getLatestSession(sessions));
        setLifeAreas(questionsResponse.lifeAreas ?? []);
        setHabits(habitsResponse.habits ?? []);
        setHabitSummary(getHabitSummaryOrDefault(habitsResponse.summary));
        setComparison(comparisonResponse.comparison ?? []);
        setRecommendations(recommendationsResponse.recommendations ?? []);
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

  const sessionsForRange = useMemo(() => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    const now = Date.now();
    const windowStart = now - days * 24 * 60 * 60 * 1000;

    return history.filter((session) => {
      const sourceDate = session.completed_at ?? session.started_at;
      const timestamp = sourceDate ? Date.parse(sourceDate) : Number.NaN;

      if (Number.isNaN(timestamp)) {
        return false;
      }

      return timestamp >= windowStart && timestamp <= now;
    });
  }, [history, timeRange]);

  const habitCompletionPercent = useMemo(() => {
    if (!habitSummary.totalHabits) return 0;
    return Math.round(
      (habitSummary.completedTodayCount / habitSummary.totalHabits) * 100,
    );
  }, [habitSummary.completedTodayCount, habitSummary.totalHabits]);

  const habitStreaks = useMemo(
    () => habits.map((habit) => Number(habit.streak ?? 0)),
    [habits],
  );

  const currentHabitStreak = useMemo(() => {
    if (typeof habitSummary.currentStreak === "number") {
      return habitSummary.currentStreak;
    }
    return habitStreaks.length ? Math.max(...habitStreaks) : 0;
  }, [habitStreaks, habitSummary.currentStreak]);

  const bestHabitStreak = useMemo(() => {
    if (typeof habitSummary.bestStreak === "number") {
      return habitSummary.bestStreak;
    }
    return habitStreaks.length ? Math.max(...habitStreaks) : 0;
  }, [habitStreaks, habitSummary.bestStreak]);

  const habitCompletionChange = useMemo(() => {
    if (habitSummary.totalHabits === 0) return null;
    const weeklyCompletionDays =
      habitSummary.weeklyActivity.filter(Boolean).length;
    return Math.round(
      (weeklyCompletionDays / habitSummary.weeklyActivity.length) * 100,
    );
  }, [habitSummary.totalHabits, habitSummary.weeklyActivity]);

  const overallChangePercent = useMemo(() => {
    if (history.length < 2) return null;
    const last = history[history.length - 1];
    const previous = history[history.length - 2];
    const lastScore = computeOverallScore(last);
    const previousScore = computeOverallScore(previous);
    if (!previousScore || lastScore == null) return null;
    return Math.round(((lastScore - previousScore) / previousScore) * 100);
  }, [history]);

  const topGains = useMemo(
    () => [...comparison].sort((a, b) => b.change - a.change).slice(0, 1),
    [comparison],
  );

  const topDrops = useMemo(
    () => [...comparison].sort((a, b) => a.change - b.change).slice(0, 1),
    [comparison],
  );

  const recommendationCards = useMemo(
    () => recommendations.slice(0, 2),
    [recommendations],
  );

  const areaBalanceRows = useMemo(() => {
    const summaryById = new Map(
      areaSummaries.map((area) => [area.id, area.score]),
    );

    const baseAreas = lifeAreas.length
      ? lifeAreas
      : areaSummaries.map((area) => ({ id: area.id, name: area.name }));

    return baseAreas
      .slice()
      .sort((a, b) => a.id - b.id)
      .map((area) => ({
        ...area,
        score: Number(summaryById.get(area.id) ?? 0),
      }));
  }, [areaSummaries, lifeAreas]);

  useEffect(() => {
    document.title = "CoreLife - Progress & Analytics";

    const initializeCharts = () => {
      try {
        if (!window.Plotly || !hasAssessment) return;
        if (sessionsForRange.length > 0) {
          const trendData = [
            {
              x: sessionsForRange.map((session) =>
                formatShortDate(session.completed_at ?? session.started_at),
              ),
              y: sessionsForRange.map(
                (session) => computeOverallScore(session) ?? 0,
              ),
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
            xaxis: {
              showgrid: false,
              color: "#9CA3AF",
              tickfont: { size: 12 },
            },
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
        }

        if (areaBalanceRows.length === 0) {
          return;
        }

        const areaColors = areaBalanceRows.map((area) =>
          getLifeAreaAccent({ id: area.id, name: area.name }).hex,
        );

        const chartLabels = areaBalanceRows.map((area) => area.name);
        const chartScores = areaBalanceRows.map((area) => Math.round(area.score));

        const areaData = [
          {
            x: chartLabels,
            y: new Array(chartLabels.length).fill(100),
            type: "bar",
            marker: {
              color: "#EEF2F7",
              cornerradius: 18,
            },
            hoverinfo: "skip",
            width: 0.64,
          },
          {
            x: chartLabels,
            y: chartScores,
            type: "bar",
            marker: {
              color: areaColors.slice(0, chartLabels.length),
              cornerradius: 18,
              line: {
                color: "rgba(255,255,255,0.65)",
                width: 1,
              },
            },
            width: 0.52,
            text: chartScores.map((value) => `${value}`),
            textposition: "outside",
            textfont: {
              color: "#475569",
              size: 11,
            },
            hovertemplate: "%{x}<br>Score: <b>%{y}</b>/100<extra></extra>",
          },
        ];

        const areaLayout = {
          margin: { t: 20, r: 10, b: 52, l: 32 },
          barmode: "overlay",
          bargap: 0.35,
          xaxis: {
            showgrid: false,
            color: "#9CA3AF",
            tickfont: { size: 11 },
            tickangle: -25,
            automargin: true,
          },
          yaxis: {
            showgrid: true,
            gridcolor: "#E8EDF3",
            gridwidth: 1,
            zeroline: false,
            color: "#9CA3AF",
            tickfont: { size: 12 },
            range: [0, 100],
            tickmode: "array",
            tickvals: [0, 25, 50, 75, 100],
            ticksuffix: "%",
          },
          plot_bgcolor: "transparent",
          paper_bgcolor: "transparent",
          showlegend: false,
          uniformtext: {
            mode: "hide",
            minsize: 9,
          },
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
  }, [areaBalanceRows, hasAssessment, sessionsForRange, timeRange]);

  return (
    <div className="progress-analytics-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8"
      >
        {isLoading ? (
          <PageSkeleton />
        ) : !hasAssessment ? (
          <section className="flex flex-col items-center gap-4 rounded-[24px] border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-2xl">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h1 className="text-xl font-bold text-dark sm:text-2xl">
              Complete your assessment to unlock analytics
            </h1>
            <p className="text-bodyText max-w-md">
              Once you finish your first assessment, we will chart your score
              trends, balance by area, and progress insights.
            </p>
            <button
              onClick={() => navigate("/assessment")}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primaryHover sm:px-6 sm:py-3"
            >
              Start Assessment
            </button>
          </section>
        ) : (
          <>
            <section
              id="analytics-header"
              className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
                  Progress &amp; Analytics
                </h1>
                <p className="text-sm text-bodyText mt-1">
                  Track your long-term growth and habit consistency.
                </p>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <div
                  aria-label="Analytics time range"
                  className="flex w-full items-center rounded-full border border-gray-100 bg-gray-100 p-1 sm:w-auto"
                >
                  <button
                    onClick={() => setTimeRange("week")}
                    aria-pressed={timeRange === "week"}
                    className={`flex-1 rounded-full px-3 py-1.5 text-sm transition-colors sm:flex-none sm:px-4 ${
                      timeRange === "week"
                        ? "font-semibold text-dark bg-white shadow-sm"
                        : "font-medium text-bodyText hover:bg-white/70"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeRange("month")}
                    aria-pressed={timeRange === "month"}
                    className={`flex-1 rounded-full px-3 py-1.5 text-sm transition-colors sm:flex-none sm:px-4 ${
                      timeRange === "month"
                        ? "font-semibold text-dark bg-white shadow-sm"
                        : "font-medium text-bodyText hover:bg-white/70"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeRange("quarter")}
                    aria-pressed={timeRange === "quarter"}
                    className={`flex-1 rounded-full px-3 py-1.5 text-sm transition-colors sm:flex-none sm:px-4 ${
                      timeRange === "quarter"
                        ? "font-semibold text-dark bg-white shadow-sm"
                        : "font-medium text-bodyText hover:bg-white/70"
                    }`}
                  >
                    Quarter
                  </button>
                </div>
              </div>
            </section>

            <section
              id="kpi-metrics"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="dash-card kpi-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-bodyText">
                    Overall Score
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                    <i className="fas fa-chart-line text-base"></i>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-dark leading-none whitespace-nowrap sm:text-3xl">
                    {Math.round(overallScore ?? 0)}
                  </h3>
                  <span
                    className={`text-sm font-medium flex items-center gap-1 leading-none whitespace-nowrap ${
                      overallChangePercent != null
                        ? overallChangePercent >= 0
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-bodyText"
                    }`}
                  >
                    <i
                      className={`fas ${
                        overallChangePercent != null && overallChangePercent < 0
                          ? "fa-arrow-down"
                          : "fa-arrow-up"
                      } text-[10px]`}
                    ></i>
                    {overallChangePercent != null
                      ? `${overallChangePercent >= 0 ? "+" : ""}${overallChangePercent}%`
                      : "--"}
                  </span>
                </div>
              </div>

              <div className="dash-card kpi-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-bodyText">
                    Habit Completion
                  </span>
                  <div className="w-9 h-9 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                    <i className="fas fa-check-double text-base"></i>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-dark leading-none whitespace-nowrap sm:text-3xl">
                    {habitSummary.totalHabits > 0
                      ? `${habitCompletionPercent}%`
                      : "0%"}
                  </h3>
                  <span
                    className={`text-sm font-medium flex items-center gap-1 leading-none whitespace-nowrap ${
                      habitCompletionChange != null
                        ? habitCompletionChange >= 0
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-bodyText"
                    }`}
                  >
                    <i
                      className={`fas ${
                        habitCompletionChange != null &&
                        habitCompletionChange < 0
                          ? "fa-arrow-down"
                          : "fa-arrow-up"
                      } text-[10px]`}
                    ></i>
                    {habitSummary.totalHabits > 0
                      ? habitCompletionChange != null
                        ? `${habitCompletionChange >= 0 ? "+" : ""}${Math.round(habitCompletionChange)}%`
                        : "--"
                      : "--"}
                  </span>
                </div>
              </div>

              <div className="dash-card kpi-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-bodyText">
                    Current Streak
                  </span>
                  <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                    <i className="fas fa-fire text-base"></i>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-dark leading-none whitespace-nowrap sm:text-3xl">
                    {currentHabitStreak}
                  </h3>
                  <span className="text-sm font-medium text-bodyText leading-none whitespace-nowrap">
                    Days
                  </span>
                </div>
              </div>

              <div className="dash-card kpi-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-bodyText">
                    Best Streak
                  </span>
                  <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                    <i className="fas fa-trophy text-base"></i>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-dark leading-none whitespace-nowrap sm:text-3xl">
                    {bestHabitStreak}
                  </h3>
                  <span className="text-sm font-medium text-bodyText leading-none whitespace-nowrap">
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
                    className="text-sm font-medium text-bodyText bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full hover:text-dark hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    Details <i className="fas fa-chevron-right text-[10px]"></i>
                  </button>
                </div>
                <div
                  id="chart-overall-trend"
                  className="w-full h-[300px]"
                ></div>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark">
                    Summary Insights
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {topGains[0] && topGains[0].change > 0 ? (
                    <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <i className="fas fa-arrow-trend-up"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-dark">
                          Improved: {topGains[0].life_area_name}
                        </h4>
                        <p className="text-sm text-bodyText mt-1">
                          Up {Math.round(topGains[0].change)} points since your
                          last assessment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <i className="fas fa-arrow-trend-up"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-dark">
                          Keep going
                        </h4>
                        <p className="text-sm text-bodyText mt-1">
                          Complete another assessment to unlock trend insights.
                        </p>
                      </div>
                    </div>
                  )}

                  {topDrops[0] && topDrops[0].change < 0 ? (
                    <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                        <i className="fas fa-arrow-trend-down"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-dark">
                          Declined: {topDrops[0].life_area_name}
                        </h4>
                        <p className="text-sm text-bodyText mt-1">
                          Down {Math.round(Math.abs(topDrops[0].change))} points
                          since your last assessment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <i className="fas fa-arrow-trend-down"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-dark">
                          Declined: Sleep Quality
                        </h4>
                        <p className="text-sm text-bodyText mt-1">
                          Average sleep duration dropped below 7 hours in the
                          last week. Focus on evening routines.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="dash-card-dark flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    Data-Driven Recommendations
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {recommendationCards.length ? (
                    recommendationCards.map((card) => {
                      const isHighPriority = card.priority === "high";
                      const label = isHighPriority
                        ? "High Priority"
                        : "Suggestion";
                      const badgeClass = isHighPriority
                        ? "text-primary bg-primary/20"
                        : "text-purple-400 bg-purple-400/20";

                      return (
                        <button
                          key={card.id}
                          onClick={() => navigate("/habit-tracker")}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-md ${badgeClass}`}
                            >
                              {label}
                            </span>
                            <i className="fas fa-arrow-right text-gray-400 group-hover:text-white transition-colors"></i>
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">
                            {card.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {card.description}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                      <h4 className="text-base font-bold text-white mb-1">
                        No recommendations yet
                      </h4>
                      <p className="text-sm text-gray-400">
                        Complete another assessment to unlock personalized
                        recommendations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
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

export default ProgressAnalyticsPage;
