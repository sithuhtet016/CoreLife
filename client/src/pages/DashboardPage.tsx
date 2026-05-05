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
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import PageSkeleton from "../components/PageSkeleton";
import { getHabits, getMe, getProgressHistory, getQuestions } from "../api";
import type {
  AssessmentSession,
  Habit,
  HabitSummary,
  LifeArea,
} from "../types";
import {
  buildAreaScoreSummaries,
  computeOverallScore,
  getLatestSession,
} from "../utils/assessmentSummary";
import {
  getMillisecondsUntilNextLocalMidnight,
  getMillisecondsUntilNextMinute,
  getRecentLocalWeekdayLabels,
  scheduleAlignedInterval,
} from "../utils/dateTime";
import { getHabitSummaryOrDefault } from "../utils/habitSummary";
import { getLifeAreaAccent, toRgba } from "../utils/lifeAreaTheme";

function getGreetingForHour(hour: number) {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

function getFirstName(fullName: string | null, email: string) {
  const rawName = fullName?.trim() || "";
  if (rawName) {
    return rawName.split(/\s+/).filter(Boolean)[0] || "";
  }

  const emailName = email.split("@")[0]?.trim() || "";
  if (!emailName) return "";

  return (
    emailName
      .replace(/[._-]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)[0]
      ?.replace(/^./, (char) => char.toUpperCase()) ?? ""
  );
}

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [firstName, setFirstName] = useState("there");
  const [latestSession, setLatestSession] = useState<AssessmentSession | null>(
    null,
  );
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitSummary, setHabitSummary] = useState<HabitSummary>(
    getHabitSummaryOrDefault(null),
  );

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

  useEffect(() => {
    const message =
      location.state &&
      typeof location.state === "object" &&
      "toast" in location.state &&
      typeof (location.state as { toast?: unknown }).toast === "string"
        ? ((location.state as { toast: string }).toast ?? "").trim()
        : "";

    if (!message) return;
    showToast(message);
    navigate("/dashboard", { replace: true });
  }, [location.state, navigate]);

  useEffect(() => {
    const updateHour = () => setCurrentHour(new Date().getHours());
    updateHour();
    return scheduleAlignedInterval(
      updateHour,
      () => getMillisecondsUntilNextMinute(),
      60_000,
    );
  }, []);

  useEffect(() => {
    let active = true;

    const refreshHabitSnapshot = async () => {
      try {
        const habitsResponse = await getHabits();
        if (!active) return;
        setHabits(habitsResponse.habits ?? []);
        setHabitSummary(getHabitSummaryOrDefault(habitsResponse.summary));
      } catch (error) {
        if (!active) return;
        console.error("Failed to refresh habit snapshot:", error);
      }
    };
    const cleanup = scheduleAlignedInterval(
      () => void refreshHabitSnapshot(),
      () => getMillisecondsUntilNextLocalMidnight(),
      24 * 60 * 60 * 1000,
    );

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadAssessmentData = async () => {
      setIsLoading(true);
      try {
        const [historyResponse, questionsResponse, habitsResponse, meResponse] =
          await Promise.all([
            getProgressHistory(),
            getQuestions(),
            getHabits(),
            getMe().catch(() => null),
          ]);

        if (!active) return;

        const sessions = historyResponse.sessions ?? [];
        setLatestSession(getLatestSession(sessions));
        setLifeAreas(questionsResponse.lifeAreas ?? []);
        setHabits(habitsResponse.habits ?? []);
        setHabitSummary(getHabitSummaryOrDefault(habitsResponse.summary));

        if (
          meResponse &&
          typeof meResponse === "object" &&
          "user" in meResponse
        ) {
          const meUser = (
            meResponse as {
              user: { full_name?: string | null; email: string };
            }
          ).user;

          setFirstName(
            getFirstName(meUser.full_name ?? null, meUser.email) || "there",
          );
        } else {
          setFirstName("there");
        }
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
  const greeting = getGreetingForHour(currentHour);
  const topHabits = useMemo(() => habits.slice(0, 2), [habits]);
  const completedRate = habitSummary.totalHabits
    ? Math.round(
        (habitSummary.completedTodayCount / habitSummary.totalHabits) * 100,
      )
    : 0;
  const weeklyLabels = useMemo(() => getRecentLocalWeekdayLabels(7), []);
  const areaSummaries = useMemo(
    () => buildAreaScoreSummaries(latestSession, lifeAreas),
    [latestSession, lifeAreas],
  );
  const focusAreas = useMemo(
    () => [...areaSummaries].sort((a, b) => a.score - b.score).slice(0, 2),
    [areaSummaries],
  );

  const iconByAreaName = useMemo<Record<string, LucideIcon>>(
    () => ({
      health: Activity,
      appearance: Sparkles,
      love: Heart,
      family: Home,
      friends: Users,
      career: Briefcase,
      money: Wallet,
      "self-growth": TrendingUp,
      spirituality: Compass,
      recreation: Gamepad2,
      environment: Leaf,
      community: Globe,
    }),
    [],
  );

  return (
    <div className="dashboard-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
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
              Complete your assessment to unlock your dashboard
            </h1>
            <p className="text-bodyText max-w-md">
              Once you finish your assessment, we will personalize your score,
              focus areas, and daily action plan.
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
                id="life-score-overview"
                className="flex flex-col items-center gap-6 rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:gap-10 sm:p-6"
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                    <i className="fas fa-bolt"></i> Daily Overview
                  </div>
                  <h1 className="mb-2 text-2xl font-bold tracking-tight text-dark sm:text-3xl lg:text-4xl">
                    {greeting}, {firstName}
                  </h1>
                  <p className="mb-6 max-w-md text-sm text-bodyText sm:mb-8 sm:text-base">
                    Your CoreLife Score is currently
                    {` ${Math.round(overallScore ?? 0)}`}. Focus next on
                    {` ${focusAreas[0]?.name ?? "your top growth areas"}`}.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => navigate("/habit-tracker")}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primaryHover sm:px-6 sm:py-3"
                    >
                      Start Daily Check-in{" "}
                      <i className="fas fa-arrow-right"></i>
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
                        Life Score
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="summary-metrics"
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
              >
                <div className="flex flex-col justify-between rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
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
                      <span className="block text-3xl font-bold text-dark sm:text-4xl">
                        {habitSummary.completedTodayCount}{" "}
                        <span className="text-lg text-bodyText font-medium">
                          / {habitSummary.totalHabits}
                        </span>
                      </span>
                      <p className="text-sm text-bodyText mt-1">
                        {completedRate}% completion rate
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 relative flex items-center justify-center">
                      <svg
                        className="absolute inset-0 w-full h-full transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="text-green-500"
                          strokeDasharray={`${completedRate}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
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
                    <span className="block text-3xl font-bold text-dark sm:text-4xl">
                      {habitSummary.currentStreak}{" "}
                      <span className="text-lg text-bodyText font-medium">
                        Days
                      </span>
                    </span>
                    <p className="text-sm text-bodyText mt-1">
                      Personal best: {habitSummary.bestStreak} days
                    </p>

                    <div className="flex gap-2 mt-4">
                      {weeklyLabels.map((label, index) => {
                        const active = habitSummary.weeklyActivity[index];

                        return (
                          <div
                            key={`${label}-${index}`}
                            className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${
                              active
                                ? "bg-orange-500 text-white"
                                : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="quick-actions"
                className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
              >
                <button
                  onClick={() => navigate("/habit-tracker")}
                  className="group flex flex-col items-center justify-center gap-2 rounded-[22px] border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all hover:border-primary hover:shadow-md sm:gap-3 sm:rounded-[24px] sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-lg text-primary transition-transform group-hover:scale-110 sm:h-12 sm:w-12 sm:text-xl">
                    <i className="fas fa-plus"></i>
                  </div>
                  <span className="text-xs font-semibold text-dark sm:text-sm">
                    Add Habit
                  </span>
                </button>
                <button
                  onClick={() => navigate("/progress-analytics")}
                  className="group flex flex-col items-center justify-center gap-2 rounded-[22px] border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all hover:border-primary hover:shadow-md sm:gap-3 sm:rounded-[24px] sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-lg text-purple-600 transition-transform group-hover:scale-110 sm:h-12 sm:w-12 sm:text-xl">
                    <i className="fas fa-chart-pie"></i>
                  </div>
                  <span className="text-xs font-semibold text-dark sm:text-sm">
                    Analytics
                  </span>
                </button>
                <button
                  onClick={() => navigate("/assessment")}
                  className="group col-span-2 flex flex-col items-center justify-center gap-2 rounded-[22px] border border-gray-100 bg-white px-3 py-4 text-center shadow-sm transition-all hover:border-primary hover:shadow-md md:col-span-1 sm:gap-3 sm:rounded-[24px] sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-lg text-green-600 transition-transform group-hover:scale-110 sm:h-12 sm:w-12 sm:text-xl">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <span className="text-xs font-semibold text-dark sm:text-sm">
                    Retake Assessment
                  </span>
                </button>
              </section>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4">
              <section
                id="weakest-areas"
                className="relative overflow-hidden rounded-[24px] bg-dark p-5 text-white shadow-lg sm:p-6"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none"></div>

                <h3 className="text-lg text-white font-bold mb-2">
                  Focus Areas
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Based on your recent assessment, here are suggested actions to
                  improve your lowest scores.
                </p>

                <div className="space-y-4 relative z-10">
                  {focusAreas.map((area, index) => (
                    <div
                      key={area.id}
                      className={
                        index === 0
                          ? "bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
                          : "bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
                      }
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: toRgba(
                                getLifeAreaAccent({ id: area.id, name: area.name }).hex,
                                0.2,
                              ),
                              color: getLifeAreaAccent({ id: area.id, name: area.name }).hex,
                            }}>
                            {(() => {
                              const iconKey = area.name
                                .toLowerCase()
                                .replace(/\s+/g, "-");
                              const Icon =
                                iconByAreaName[iconKey] ??
                                iconByAreaName[area.name.toLowerCase()] ??
                                Activity;
                              return <Icon className="h-4 w-4" />;
                            })()}
                          </div>
                          <div>
                            <span className="font-semibold text-sm block">
                              {area.name} ({Math.round(area.score)}/100)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-1 rounded text-white/80">
                          Priority {index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-4">
                        Your {area.name.toLowerCase()} score is lower than your
                        other areas. Add a habit to lift this score.
                      </p>
                      <button
                        onClick={() => {
                          showToast(`${area.name} habit suggestion added`);
                          navigate("/habit-tracker");
                        }}
                        className="w-full py-2.5 bg-white text-dark rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-plus"></i> Add {area.name} Habit
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="upcoming-habits"
                className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
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

                {topHabits.length > 0 ? (
                  <div className="space-y-3">
                    {topHabits.map((habit) => {
                      const frequencyLabel =
                        habit.frequency === "daily" ? "Daily" : "Weekly";

                      return (
                        <div
                          key={habit.id}
                          className="p-3 rounded-2xl bg-surfaceAlt border border-gray-100 flex items-center justify-between group transition-colors hover:border-gray-200"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">
                              <i className="fas fa-check"></i>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-dark truncate">
                                {habit.name}
                              </h4>
                              <p className="text-xs text-bodyText mt-0.5 truncate">
                                {habit.description || `${frequencyLabel} habit`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <span className="text-xs font-medium text-gray-400 block">
                              {frequencyLabel}
                            </span>
                            <span className="text-xs font-semibold text-dark">
                              {habit.streak > 0
                                ? `${habit.streak} day streak`
                                : "No streak yet"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-surfaceAlt p-6 text-center">
                    <p className="text-sm font-medium text-dark">
                      No habits yet
                    </p>
                    <p className="text-xs text-bodyText mt-1">
                      Create a habit to see it here.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl bg-dark px-4 py-3 text-sm text-white shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:translate-x-0"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
