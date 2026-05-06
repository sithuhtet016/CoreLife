import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Briefcase,
  Compass,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Layers3,
  Leaf,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  createHabit,
  getHabits,
  logHabit,
  getProgressHistory,
  getRecommendations,
  updateHabit,
  deleteHabit,
} from "../api";
import AppHeader from "../components/AppHeader";
import { ensurePlotlyLoaded } from "../utils/loadPlotly";
import type { Recommendation, Habit, HabitSummary } from "../types";
import {
  getLocalDateKey,
  getMillisecondsUntilNextLocalMidnight,
  getRecentLocalWeekdayLabels,
  scheduleAlignedInterval,
} from "../utils/dateTime";
import { getHabitSummaryOrDefault } from "../utils/habitSummary";
import "./HabitTrackerPage.css";
import { getLifeAreaAccent } from "../utils/lifeAreaTheme";

const MOTIVATION_QUOTES = [
  {
    quote:
      "Small habits, repeated daily, become the architecture of a better life.",
    author: "James Clear",
  },
  {
    quote:
      "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
  },
  {
    quote:
      "Consistency is more powerful than intensity when you want lasting change.",
    author: "CoreLife",
  },
  {
    quote: "A few focused minutes today can change how tomorrow feels.",
    author: "CoreLife",
  },
  {
    quote:
      "Make it so easy to start that your future self has no excuse to stop.",
    author: "CoreLife",
  },
  {
    quote:
      "Progress in one life area creates momentum in the rest. Start with one win.",
    author: "CoreLife",
  },
  {
    quote:
      "A habit tracked is a promise remembered. Keep the streak honest and simple.",
    author: "CoreLife",
  },
  {
    quote:
      "You do not need a perfect day. You only need to keep your direction.",
    author: "CoreLife",
  },
  {
    quote:
      "Tiny actions compound quietly until your routine becomes your identity.",
    author: "CoreLife",
  },
  {
    quote:
      "Show up for two minutes today. Consistency grows from easy starts.",
    author: "CoreLife",
  },
  {
    quote:
      "Discipline is self-respect in motion. Keep one promise to yourself today.",
    author: "CoreLife",
  },
  {
    quote:
      "Health, work, money, and relationships all improve when your daily rhythm is steady.",
    author: "CoreLife",
  },
  {
    quote:
      "Motivation starts the journey. Systems carry it through busy days.",
    author: "CoreLife",
  },
  {
    quote:
      "Each check-in is a vote for the person you are becoming.",
    author: "CoreLife",
  },
  {
    quote:
      "When energy is low, lower the barrier, not the standard of showing up.",
    author: "CoreLife",
  },
  {
    quote:
      "A calm routine beats random effort. Repeat what works and refine what does not.",
    author: "CoreLife",
  },
  {
    quote:
      "Build habits that survive real life, not just ideal days.",
    author: "CoreLife",
  },
  {
    quote:
      "Long-term change looks ordinary in the moment and extraordinary over time.",
    author: "CoreLife",
  },
  {
    quote:
      "Your future is shaped more by daily defaults than occasional motivation.",
    author: "CoreLife",
  },
  {
    quote:
      "One completed habit can reset your entire day. Start there.",
    author: "CoreLife",
  },
  {
    quote:
      "Clarity comes from action. Log today first, optimize later.",
    author: "CoreLife",
  },
  {
    quote:
      "A better week is built one honest day at a time.",
    author: "CoreLife",
  },
  {
    quote:
      "The goal is not intensity every day. The goal is return every day.",
    author: "CoreLife",
  },
  {
    quote:
      "Track what matters, then let that data guide your next small step.",
    author: "CoreLife",
  },
  {
    quote:
      "Consistency feels slow until one day it looks like transformation.",
    author: "CoreLife",
  },
  {
    quote:
      "If it is worth becoming, it is worth repeating.",
    author: "CoreLife",
  },
  {
    quote:
      "Keep your routine visible, simple, and hard to ignore.",
    author: "CoreLife",
  },
  {
    quote:
      "Daily discipline reduces daily decision fatigue.",
    author: "CoreLife",
  },
  {
    quote:
      "Your streak is not pressure. It is proof that you can continue.",
    author: "CoreLife",
  },
  {
    quote:
      "Win the morning with one habit, then build from that momentum.",
    author: "CoreLife",
  },
  {
    quote:
      "You are one repeated action away from a different identity.",
    author: "CoreLife",
  },
  {
    quote:
      "Momentum loves completion. Finish one small habit now.",
    author: "CoreLife",
  },
  {
    quote:
      "Habits are how plans survive unpredictable days.",
    author: "CoreLife",
  },
  {
    quote:
      "It counts even when it is imperfect. Especially then.",
    author: "CoreLife",
  },
  {
    quote:
      "Your calendar reflects your priorities. Your habits shape your results.",
    author: "CoreLife",
  },
  {
    quote:
      "Small daily courage beats occasional big ambition.",
    author: "CoreLife",
  },
  {
    quote:
      "Set a tiny baseline, then protect it every day.",
    author: "CoreLife",
  },
  {
    quote:
      "You cannot control every outcome, but you can control today’s reps.",
    author: "CoreLife",
  },
  {
    quote:
      "A sustainable pace is a superpower in long-term growth.",
    author: "CoreLife",
  },
  {
    quote:
      "Repeat the basics long enough and they become your edge.",
    author: "CoreLife",
  },
  {
    quote:
      "The hard part is starting. The smart part is making starts easy.",
    author: "CoreLife",
  },
  {
    quote:
      "Habits turn hope into schedule and schedule into progress.",
    author: "CoreLife",
  },
  {
    quote:
      "Treat today like a checkpoint, not a final exam.",
    author: "CoreLife",
  },
  {
    quote:
      "Reduce friction for good habits and increase friction for distractions.",
    author: "CoreLife",
  },
  {
    quote:
      "Routine is not restriction. It is freedom from constant negotiation.",
    author: "CoreLife",
  },
  {
    quote:
      "When you miss once, recover fast. Recovery speed builds resilience.",
    author: "CoreLife",
  },
  {
    quote:
      "A focused 10 minutes can outperform an unfocused hour.",
    author: "CoreLife",
  },
  {
    quote:
      "You are not behind. You are one completed action from moving forward.",
    author: "CoreLife",
  },
  {
    quote:
      "Let your habits be so clear that starting feels automatic.",
    author: "CoreLife",
  },
  {
    quote:
      "Build a life you do not need to escape from, one routine at a time.",
    author: "CoreLife",
  },
];

type HabitFrequency = "daily" | "weekly";

const HABIT_AREA_BASE_OPTIONS = [
  {
    value: "health",
    label: "Health",
    icon: Activity,
    lifeAreaId: 1,
    defaultFrequency: "daily" as HabitFrequency,
  },
  {
    value: "appearance",
    label: "Appearance",
    icon: Sparkles,
    lifeAreaId: 2,
    defaultFrequency: "daily" as HabitFrequency,
  },
  {
    value: "love",
    label: "Love",
    icon: Heart,
    lifeAreaId: 3,
    defaultFrequency: "weekly" as HabitFrequency,
  },
  {
    value: "family",
    label: "Family",
    icon: Home,
    lifeAreaId: 4,
    defaultFrequency: "weekly" as HabitFrequency,
  },
  {
    value: "friends",
    label: "Friends",
    icon: Users,
    lifeAreaId: 5,
    defaultFrequency: "weekly" as HabitFrequency,
  },
  {
    value: "career",
    label: "Career",
    icon: Briefcase,
    lifeAreaId: 6,
    defaultFrequency: "daily" as HabitFrequency,
  },
  {
    value: "money",
    label: "Money",
    icon: Wallet,
    lifeAreaId: 7,
    defaultFrequency: "weekly" as HabitFrequency,
  },
  {
    value: "self-growth",
    label: "Self-Growth",
    icon: TrendingUp,
    lifeAreaId: 8,
    defaultFrequency: "weekly" as HabitFrequency,
  },
  {
    value: "spirituality",
    label: "Spirituality",
    icon: Compass,
    lifeAreaId: 9,
    defaultFrequency: "daily" as HabitFrequency,
  },
  {
    value: "recreation",
    label: "Recreation",
    icon: Gamepad2,
    lifeAreaId: 10,
    defaultFrequency: "weekly" as HabitFrequency,
  },
  {
    value: "environment",
    label: "Environment",
    icon: Leaf,
    lifeAreaId: 11,
    defaultFrequency: "daily" as HabitFrequency,
  },
  {
    value: "community",
    label: "Community",
    icon: Globe,
    lifeAreaId: 12,
    defaultFrequency: "weekly" as HabitFrequency,
  },
];

const HABIT_AREA_OPTIONS = HABIT_AREA_BASE_OPTIONS.map((option) => {
  const accent = getLifeAreaAccent({ value: option.value });
  return {
    ...option,
    chip: accent.chip,
    chipActive: accent.chipActive,
    iconBg: accent.iconBg,
    iconActiveBg: "bg-white/15 text-white",
  };
});

const LIFE_AREA_FILTERS = [
  {
    value: "all",
    label: "All Habits",
    icon: Layers3,
    chip: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
    chipActive: "bg-slate-900 text-white shadow-slate-900/20",
    iconBg: "bg-slate-100 text-slate-700",
    iconActiveBg: "bg-white/15 text-white",
  },
  ...HABIT_AREA_OPTIONS,
] as const;

type HabitAreaValue = (typeof HABIT_AREA_OPTIONS)[number]["value"];
type HabitFilter = HabitAreaValue | "all";

type HabitDraftState = {
  name: string;
  description: string;
  areaValue: HabitAreaValue;
  frequency: HabitFrequency;
};

type HabitEditorState = {
  id: string;
  originalName: string;
  name: string;
  description: string;
};

const HABIT_AREA_BY_VALUE = new Map(
  HABIT_AREA_OPTIONS.map((option) => [option.value, option] as const),
);

const HABIT_AREA_BY_ID = new Map<number, (typeof HABIT_AREA_OPTIONS)[number]>(
  HABIT_AREA_OPTIONS.map((option) => [option.lifeAreaId, option] as const),
);

function getHabitAreaOption(value: HabitAreaValue) {
  return HABIT_AREA_BY_VALUE.get(value) ?? HABIT_AREA_OPTIONS[0];
}

function getHabitAreaOptionById(lifeAreaId: number | null | undefined) {
  if (typeof lifeAreaId !== "number") return null;
  return HABIT_AREA_BY_ID.get(Number(lifeAreaId)) ?? null;
}

function getHabitDraftSeed(value: HabitAreaValue): HabitDraftState {
  const option = getHabitAreaOption(value);
  return {
    name: "",
    description: "",
    areaValue: option.value,
    frequency: option.defaultFrequency,
  };
}

function getProgressTone(progress: number) {
  if (progress >= 80) {
    return {
      textClass: "text-green-500",
      barClass: "bg-green-500",
    };
  }

  if (progress >= 55) {
    return {
      textClass: "text-primary",
      barClass: "bg-primary",
    };
  }

  return {
    textClass: "text-red-500",
    barClass: "bg-red-500",
  };
}

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
  const [activeFilter, setActiveFilter] = useState<HabitFilter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * MOTIVATION_QUOTES.length),
  );
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitModalTab, setHabitModalTab] = useState<"suggested" | "manual">(
    "suggested",
  );
  const [habitModalLoading, setHabitModalLoading] = useState(false);
  const [habitModalError, setHabitModalError] = useState<string | null>(null);
  const [habitSuggestions, setHabitSuggestions] = useState<Recommendation[]>(
    [],
  );
  const [habitLibrary, setHabitLibrary] = useState<Recommendation[]>([]);
  const [habitAreaScores, setHabitAreaScores] = useState<
    Record<number, number>
  >({});
  const [habitPriorityAreas, setHabitPriorityAreas] = useState<
    HabitAreaValue[]
  >([]);
  const [habitDraft, setHabitDraft] = useState<HabitDraftState>(() =>
    getHabitDraftSeed("health"),
  );
  const [habitSubmitLoading, setHabitSubmitLoading] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitSummary, setHabitSummary] = useState<HabitSummary>(
    getHabitSummaryOrDefault(null),
  );
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [habitToggleFx, setHabitToggleFx] = useState<
    Record<string, "checked" | "unchecked" | null>
  >({});
  const habitToggleFxTimersRef = useRef<Record<string, number>>({});
  const [habitEditor, setHabitEditor] = useState<HabitEditorState | null>(null);
  const [habitEditorSaving, setHabitEditorSaving] = useState(false);
  const [habitEditorError, setHabitEditorError] = useState<string | null>(null);
  const [habitDeleteTarget, setHabitDeleteTarget] = useState<Habit | null>(
    null,
  );
  const [habitDeleteLoading, setHabitDeleteLoading] = useState(false);

  const currentQuote = MOTIVATION_QUOTES[quoteIndex] ?? MOTIVATION_QUOTES[0];
  const activeFilterLabel =
    LIFE_AREA_FILTERS.find((filter) => filter.value === activeFilter)?.label ??
    "selected";
  const activeAreaOption =
    activeFilter === "all" ? null : getHabitAreaOption(activeFilter);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const refreshHabits = async () => {
    const res = await getHabits();
    setHabits(res.habits ?? []);
    setHabitSummary(getHabitSummaryOrDefault(res.summary));
  };

  const triggerHabitToggleFx = (
    habitId: string,
    effect: "checked" | "unchecked",
  ) => {
    const existingTimer = habitToggleFxTimersRef.current[habitId];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }
    setHabitToggleFx((current) => ({ ...current, [habitId]: effect }));
    habitToggleFxTimersRef.current[habitId] = window.setTimeout(() => {
      setHabitToggleFx((current) => ({ ...current, [habitId]: null }));
      delete habitToggleFxTimersRef.current[habitId];
    }, 520);
  };

  useEffect(
    () => () => {
      Object.values(habitToggleFxTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      habitToggleFxTimersRef.current = {};
    },
    [],
  );

  const openHabitCreator = (seedFilter: HabitFilter = activeFilter) => {
    const seededArea =
      seedFilter === "all"
        ? (habitPriorityAreas[0] ?? activeAreaOption?.value ?? "health")
        : seedFilter;

    setHabitDraft(getHabitDraftSeed(seededArea as HabitAreaValue));
    setHabitModalTab("suggested");
    setHabitModalError(null);
    setHabitModalOpen(true);
  };

  const closeHabitCreator = () => {
    setHabitModalOpen(false);
    setHabitModalError(null);
    setHabitSubmitLoading(false);
  };

  const openHabitEditor = (habit: Habit) => {
    setHabitEditor({
      id: habit.id,
      originalName: habit.name ?? "",
      name: habit.name ?? "",
      description: habit.description ?? "",
    });
    setHabitEditorError(null);
  };

  const closeHabitEditor = () => {
    if (habitEditorSaving) return;
    setHabitEditor(null);
    setHabitEditorError(null);
  };

  const submitHabitEditor = async () => {
    if (!habitEditor) return;

    const trimmedName = habitEditor.name.trim();
    if (!trimmedName) {
      setHabitEditorError("Please enter a habit name.");
      return;
    }

    setHabitEditorSaving(true);
    setHabitEditorError(null);

    try {
      await updateHabit(habitEditor.id, {
        name: trimmedName,
        description: habitEditor.description.trim(),
      });
      await refreshHabits();
      setHabitEditor(null);
      showToast("Habit updated");
    } catch (err) {
      console.error("Failed to update habit:", err);
      setHabitEditorError("Failed to update habit.");
    } finally {
      setHabitEditorSaving(false);
    }
  };

  const closeHabitDeleteDialog = () => {
    if (habitDeleteLoading) return;
    setHabitDeleteTarget(null);
  };

  const confirmHabitDelete = async () => {
    if (!habitDeleteTarget) return;

    setHabitDeleteLoading(true);

    try {
      await deleteHabit(habitDeleteTarget.id);
      await refreshHabits();
      setHabitDeleteTarget(null);
      showToast("Habit deleted");
    } catch (err) {
      console.error("Failed to delete habit:", err);
      showToast("Failed to delete habit.");
    } finally {
      setHabitDeleteLoading(false);
    }
  };

  const populateDraftFromTemplate = (template: Recommendation) => {
    const templateArea = getHabitAreaOptionById(template.life_area_id);
    const fallbackArea =
      habitPriorityAreas[0] ?? activeAreaOption?.value ?? "health";
    const nextArea = templateArea?.value ?? fallbackArea;

    setHabitDraft({
      name: template.title,
      description: template.description,
      areaValue: nextArea,
      frequency: getHabitAreaOption(nextArea).defaultFrequency,
    });
    setHabitModalTab("manual");
    setHabitModalError(null);
  };

  const createHabitFromDraft = async (draft: HabitDraftState) => {
    setHabitSubmitLoading(true);
    setHabitModalError(null);

    try {
      const areaOption = getHabitAreaOption(draft.areaValue);
      const habitName = draft.name.trim();
      const habitDescription = draft.description.trim();

      if (!habitName) {
        throw new Error("Please enter a habit name.");
      }

      await createHabit({
        name: habitName,
        description: habitDescription,
        life_area_id: areaOption.lifeAreaId,
        frequency: draft.frequency,
      });

      showToast(`Added ${habitName} to ${areaOption.label}`);
      closeHabitCreator();
      setHabitDraft(getHabitDraftSeed(areaOption.value));
      // refresh habits after creating a new one
      try {
        await refreshHabits();
      } catch (err) {
        console.error("Failed to refresh habits:", err);
      }
    } catch (error) {
      setHabitModalError(
        error instanceof Error ? error.message : "Failed to create habit.",
      );
    } finally {
      setHabitSubmitLoading(false);
    }
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

        const plots: Array<{
          id: string;
          data: unknown[];
        }> = [
          {
            id: "sparkline-1",
            data: [
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
          },
          {
            id: "sparkline-2",
            data: [
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
          },
          {
            id: "sparkline-3",
            data: [
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
          },
        ];

        for (const plot of plots) {
          const el = document.getElementById(plot.id);
          if (!el) continue;
          window.Plotly.newPlot(
            el as unknown as string,
            plot.data,
            commonLayout,
            commonConfig,
          );
        }
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
  }, []);

  useEffect(() => {
    let active = true;

    const loadHabits = async () => {
      try {
        const res = await getHabits();
        if (!active) return;
        setHabits(res.habits ?? []);
        setHabitSummary(getHabitSummaryOrDefault(res.summary));
      } catch (error) {
        console.error("Failed to load habits:", error);
        if (!active) return;
        showToast("Unable to load habits right now.");
      }
    };

    void loadHabits();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const refreshAtDayBoundary = async () => {
      try {
        await refreshHabits();
      } catch (error) {
        if (!active) return;
        console.error("Failed to refresh habits at local midnight:", error);
      }
    };
    const cleanup = scheduleAlignedInterval(
      () => void refreshAtDayBoundary(),
      () => getMillisecondsUntilNextLocalMidnight(),
      24 * 60 * 60 * 1000,
    );

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  const toggleHabitCompletion = async (habit: Habit) => {
    if (togglingIds[habit.id]) return;
    const today = getLocalDateKey();
    const nextCompleted = !habit.completed_today;
    triggerHabitToggleFx(habit.id, nextCompleted ? "checked" : "unchecked");

    // Optimistically update UI
    setTogglingIds((s) => ({ ...s, [habit.id]: true }));
    setHabits((current) =>
      current.map((h) => {
        if (h.id !== habit.id) return h;
        const prevStreak = Number(h.streak ?? 0);
        const nextStreak = nextCompleted
          ? prevStreak + 1
          : Math.max(0, prevStreak - 1);
        return { ...h, completed_today: nextCompleted, streak: nextStreak };
      }),
    );

    try {
      await logHabit(habit.id, today, nextCompleted);
      // Success — refresh habits to get updated streaks and summary.
      try {
        await refreshHabits();
      } catch (err) {
        // non-fatal: keep optimistic state if refresh fails
        console.error("Failed to refresh habits after toggle:", err);
      }
    } catch (err) {
      console.error("Failed to toggle habit completion:", err);
      // Revert optimistic change
      setHabits((current) =>
        current.map((h) =>
          h.id === habit.id
            ? {
                ...h,
                completed_today: habit.completed_today,
                streak: habit.streak,
              }
            : h,
        ),
      );
      showToast("Failed to update habit.");
      // Try to resync full list (non-blocking)
      try {
        await refreshHabits();
      } catch (fetchErr) {
        console.error("Failed to refresh habits after toggle error:", fetchErr);
      }
    } finally {
      setTogglingIds((s) => ({ ...s, [habit.id]: false }));
    }
  };

  useEffect(() => {
    if (!habitModalOpen) return;

    let active = true;
    setHabitModalLoading(true);
    setHabitModalError(null);

    void Promise.all([getProgressHistory(), getRecommendations()])
      .then(([historyResponse, recommendationResponse]) => {
        if (!active) return;

        const latestSession = historyResponse.sessions.at(-1) ?? null;
        const latestScores = latestSession?.area_scores ?? {};
        const selectedAreaIds = latestSession?.selected_area_ids ?? [];
        const scoreByArea: Record<number, number> = {};

        HABIT_AREA_OPTIONS.forEach((option) => {
          scoreByArea[option.lifeAreaId] = Number(
            latestScores[option.lifeAreaId] ?? 0,
          );
        });

        const rankedAreas = [...HABIT_AREA_OPTIONS]
          .filter((option) =>
            selectedAreaIds.length
              ? selectedAreaIds.includes(option.lifeAreaId)
              : true,
          )
          .sort((left, right) => {
            const leftScore = scoreByArea[left.lifeAreaId];
            const rightScore = scoreByArea[right.lifeAreaId];

            if (leftScore === rightScore) {
              return left.lifeAreaId - right.lifeAreaId;
            }

            return leftScore - rightScore;
          });

        setHabitAreaScores(scoreByArea);
        setHabitPriorityAreas(rankedAreas.map((option) => option.value));
        setHabitSuggestions(recommendationResponse.recommendations);
        setHabitLibrary(recommendationResponse.library);
      })
      .catch((error) => {
        if (!active) return;
        setHabitModalError(
          error instanceof Error
            ? error.message
            : "Failed to load habit suggestions.",
        );
      })
      .finally(() => {
        if (active) setHabitModalLoading(false);
      });

    return () => {
      active = false;
    };
  }, [habitModalOpen]);

  useEffect(() => {
    if (!habitModalOpen && !habitEditor && !habitDeleteTarget) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [habitModalOpen, habitEditor, habitDeleteTarget]);

  const orderedHabitAreaOptions = (
    habitPriorityAreas.length > 0
      ? habitPriorityAreas
      : HABIT_AREA_OPTIONS.map((option) => option.value)
  ).map((value) => getHabitAreaOption(value));

  const recommendedTemplatesByArea = new Map<number, Recommendation[]>();
  for (const template of habitLibrary) {
    const areaId = template.life_area_id ?? 0;
    const existingTemplates = recommendedTemplatesByArea.get(areaId) ?? [];
    recommendedTemplatesByArea.set(areaId, [...existingTemplates, template]);
  }

  const prioritizedTemplateAreas = orderedHabitAreaOptions.filter(
    (option) =>
      (recommendedTemplatesByArea.get(option.lifeAreaId)?.length ?? 0) > 0,
  );

  const topHabitTemplates =
    habitSuggestions.length > 0
      ? habitSuggestions.slice(0, 3)
      : habitLibrary.slice(0, 3);

  const visibleHabits = habits.filter((h) => {
    if (activeFilter === "all") return true;
    const area = getHabitAreaOptionById(h.life_area_id);
    return area?.value === activeFilter;
  });

  const weeklyProgressByArea = useMemo(() => {
    const groupedProgress = new Map<
      number,
      {
        areaId: number;
        label: string;
        totalProgress: number;
        habitCount: number;
      }
    >();

    for (const habit of habits) {
      const area = getHabitAreaOptionById(habit.life_area_id);
      if (!area) continue;

      const current = groupedProgress.get(area.lifeAreaId) ?? {
        areaId: area.lifeAreaId,
        label: area.label,
        totalProgress: 0,
        habitCount: 0,
      };

      current.totalProgress += Number(habit.weekly_consistency ?? 0);
      current.habitCount += 1;
      groupedProgress.set(area.lifeAreaId, current);
    }

    return [...groupedProgress.values()]
      .map((entry) => {
        const progress = entry.habitCount
          ? Math.round(entry.totalProgress / entry.habitCount)
          : 0;

        return {
          areaId: entry.areaId,
          label: entry.label,
          progress,
          tone: getProgressTone(progress),
        };
      })
      .sort((left, right) => {
        if (right.progress === left.progress) {
          return left.label.localeCompare(right.label);
        }
        return right.progress - left.progress;
      })
      .slice(0, 4);
  }, [habits]);

  const weeklyActivityLabels = useMemo(
    () => getRecentLocalWeekdayLabels(7),
    [],
  );

  return (
    <div className="habit-tracker-page text-dark antialiased selection:bg-primary selection:text-white m-0 p-0 min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid max-w-[1440px] flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:gap-8 lg:p-8"
      >
        <div className="flex flex-col gap-6 lg:col-span-8 lg:gap-8">
          <section
            id="habit-filters"
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div
              aria-label="Habit category filters"
              className="w-full overflow-x-auto pb-2 sm:pb-0"
            >
              <div className="flex items-center gap-2 min-w-max pr-2">
                {LIFE_AREA_FILTERS.map((filter) => {
                  const isActive = activeFilter === filter.value;
                  const FilterIcon = filter.icon;

                  return (
                    <button
                      key={filter.value}
                      onClick={() => setActiveFilter(filter.value)}
                      aria-pressed={isActive}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 sm:px-4 sm:py-2.5 ${
                        isActive ? filter.chipActive : filter.chip
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                          isActive ? filter.iconActiveBg : filter.iconBg
                        }`}
                      >
                        <FilterIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </span>
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => openHabitCreator(activeFilter)}
              className="flex h-10 w-full min-w-[148px] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primaryHover sm:h-11 sm:w-auto sm:min-w-[168px] sm:px-6"
            >
              <i className="fas fa-plus"></i> Create Habits
            </button>
          </section>

          <div
            id="habit-filter-panel"
            aria-live="polite"
            className="flex flex-col gap-6 lg:gap-8"
          >
            {visibleHabits.length === 0 ? (
              <section className="dash-card flex flex-col items-center justify-center gap-4 text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 text-bodyText flex items-center justify-center text-2xl">
                  <i className="fas fa-layer-group"></i>
                </div>
                <h3 className="text-lg font-bold text-dark">
                  No{" "}
                  {activeFilter === "all"
                    ? "habits"
                    : `${activeFilterLabel} habits`}{" "}
                  Yet
                </h3>
                <p className="text-sm text-bodyText max-w-sm">
                  {activeFilter === "all"
                    ? "Add habits from any life area to start tracking them here."
                    : `Add your first ${activeFilterLabel.toLowerCase()} habit to start tracking progress in this area.`}
                </p>
                <button
                  onClick={() => openHabitCreator(activeFilter)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primaryHover transition-colors"
                >
                  New Habit
                </button>
              </section>
            ) : (
              <section className="dash-card">
                <h3 className="text-lg font-bold text-dark">My Habits</h3>
                <div className="mt-4 grid gap-3">
                  {visibleHabits.map((h) => {
                    const areaOption = getHabitAreaOptionById(h.life_area_id);
                    return (
                      <div
                        key={h.id}
                        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => void toggleHabitCompletion(h)}
                            aria-pressed={Boolean(h.completed_today)}
                            aria-label={
                              h.completed_today
                                ? "Mark as not done"
                                : "Mark as done"
                            }
                            disabled={Boolean(togglingIds[h.id])}
                            className={`habit-toggle flex h-6 w-6 items-center justify-center rounded-full transition-colors transform-gpu focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed ${
                              h.completed_today
                                ? "completed bg-primary text-white"
                                : "border border-gray-200 text-bodyText"
                            } ${
                              habitToggleFx[h.id] === "checked"
                                ? "fx-checked"
                                : ""
                            } ${
                              habitToggleFx[h.id] === "unchecked"
                                ? "fx-unchecked"
                                : ""
                            }`}
                          >
                            {h.completed_today ? (
                              <span className="check-icon inline-flex items-center justify-center">
                                <svg
                                  className="check-svg h-5 w-5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              </span>
                            ) : (
                              <span className="dot inline-block h-2.5 w-2.5 rounded-full border-2 border-gray-200" />
                            )}
                            <span aria-hidden className="sparkles" />
                          </button>

                          <div>
                            <div
                              title={h.name}
                              className={`max-w-[20rem] text-sm font-bold truncate ${
                                h.completed_today
                                  ? "line-through text-bodyText/60"
                                  : "text-dark"
                              }`}
                            >
                              {h.name}
                            </div>
                            <div className="max-w-[18rem] text-xs text-bodyText truncate">
                              {areaOption?.label ?? h.life_area_id ?? "General"}{" "}
                              • {h.frequency}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                            <i
                              className="fas fa-fire text-xs"
                              aria-hidden="true"
                            />
                            <span>{h.streak ?? 0}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => openHabitEditor(h)}
                            className="ml-0 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-bodyText transition-colors hover:bg-gray-50 sm:ml-2"
                          >
                            <i className="fas fa-pen" aria-hidden="true" />
                            <span className="sr-only">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setHabitDeleteTarget(h)}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-100 px-3 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <i className="fas fa-trash" aria-hidden="true" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <section
            id="daily-notes"
            className="dash-card relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark">Daily Motivation</h3>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-6 shadow-[0_18px_45px_-25px_rgba(59,130,246,0.4)] relative overflow-hidden">
              <div className="absolute top-4 right-5 text-6xl text-primary/10 leading-none pointer-events-none">
                “
              </div>
              <div className="relative z-10 flex flex-col gap-5">
                <p className="max-w-[28ch] text-lg font-semibold leading-relaxed tracking-tight text-dark sm:text-xl lg:text-2xl">
                  {currentQuote.quote}
                </p>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary/70 mb-1">
                      Inspiration
                    </p>
                    <p className="text-sm font-medium text-bodyText">
                      {currentQuote.author}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQuoteIndex(
                        (current) => (current + 1) % MOTIVATION_QUOTES.length,
                      )
                    }
                    className="px-4 py-2 rounded-full bg-white text-dark text-sm font-bold shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    New Quote
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center gap-3 flex-wrap">
              <p className="text-xs text-bodyText">
                Use the quote as a cue to start your next habit.
              </p>
            </div>
          </section>

          <section id="weekly-progress" className="dash-card">
            <div className="flex items-start justify-between gap-3 mb-4 sm:gap-4 sm:mb-6">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-dark sm:text-lg">
                  Weekly Progress
                </h3>
                <p className="mt-1 max-w-[22ch] text-xs leading-snug text-bodyText sm:max-w-none sm:text-sm">
                  Real completion trends from your habit history this week.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bodyText sm:text-xs sm:tracking-[0.18em]">
                  Best streak
                </p>
                <p className="text-lg font-bold text-dark sm:text-2xl">
                  {habitSummary.bestStreak}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-gray-100 bg-slate-50 px-3 py-2.5 sm:mb-5 sm:px-4 sm:py-3">
              <div className="mb-2 flex items-center justify-between gap-4 sm:mb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bodyText sm:text-xs sm:tracking-[0.18em]">
                    This week
                  </p>
                  <p className="text-xs font-semibold leading-snug text-dark sm:text-sm">
                    {habitSummary.completedTodayCount} completed today,{" "}
                    {habitSummary.currentStreak} streak max across active habits
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {habitSummary.weeklyActivity.map((wasActive, index) => (
                  <div
                    key={weeklyActivityLabels[index] ?? index}
                    className={`rounded-xl border px-1.5 py-1.5 text-center transition-colors sm:rounded-2xl sm:px-2 sm:py-2 ${
                      wasActive
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-gray-200 bg-white text-bodyText"
                    }`}
                  >
                    <span className="block text-[9px] font-bold uppercase tracking-[0.1em] leading-none sm:text-[11px] sm:tracking-[0.16em]">
                      {weeklyActivityLabels[index]}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold leading-none sm:mt-1 sm:text-xs">
                      {wasActive ? "Done" : "Rest"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {weeklyProgressByArea.length > 0 ? (
              <div className="space-y-4">
                {weeklyProgressByArea.map((entry) => (
                  <div key={entry.areaId}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-dark">
                        {entry.label}
                      </span>
                      <span className={`font-bold ${entry.tone.textClass}`}>
                        {entry.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${entry.tone.barClass} h-2 rounded-full transition-[width] duration-300`}
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center">
                <p className="text-sm font-semibold text-dark">
                  No weekly habit data yet
                </p>
                <p className="text-xs text-bodyText mt-1">
                  Create and complete a few habits to see weekly progress by
                  life area.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {habitModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <button
            type="button"
            aria-label="Close habit creator"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={closeHabitCreator}
          />
          <div className="relative flex min-h-full items-start justify-center p-0 sm:items-center sm:p-4 md:p-5 lg:p-6">
            <div className="relative flex w-full min-h-[100dvh] max-w-6xl flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 sm:min-h-0 sm:max-h-[95dvh] sm:rounded-[30px] md:max-h-[92dvh] md:max-w-5xl lg:max-h-[90dvh] lg:max-w-6xl">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-white via-slate-50 to-white px-4 pb-4 pt-5 sm:gap-4 sm:px-6 sm:pb-5 sm:pt-8 lg:px-8">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Habit Creator
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {orderedHabitAreaOptions[0]?.label ?? "Health"} first
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-dark sm:text-2xl lg:text-3xl">
                    Build a habit your future self can keep
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs text-bodyText sm:text-sm lg:text-base">
                    Suggested and curated habits stay inside this modal until
                    you choose a template or create a custom habit.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeHabitCreator}
                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 sm:h-10 sm:w-10"
                aria-label="Close"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <div className="grid w-full max-w-xs grid-cols-2 rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm sm:inline-flex sm:w-auto sm:max-w-none">
                <button
                  type="button"
                  onClick={() => setHabitModalTab("suggested")}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    habitModalTab === "suggested"
                      ? "bg-dark text-white shadow-md"
                      : "text-bodyText hover:text-dark"
                  }`}
                >
                  Suggested
                </button>
                <button
                  type="button"
                  onClick={() => setHabitModalTab("manual")}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    habitModalTab === "manual"
                      ? "bg-dark text-white shadow-md"
                      : "text-bodyText hover:text-dark"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/70">
              {habitModalLoading && (
                <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="rounded-3xl border border-gray-100 bg-white p-5 animate-pulse"
                      >
                        <div className="h-4 w-24 rounded-full bg-gray-100 mb-4" />
                        <div className="h-6 w-3/4 rounded-full bg-gray-100 mb-3" />
                        <div className="h-4 w-full rounded-full bg-gray-100 mb-2" />
                        <div className="h-4 w-2/3 rounded-full bg-gray-100" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!habitModalLoading && habitModalError && (
                <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                  <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-rose-700">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rose-600">
                        <i className="fas fa-triangle-exclamation"></i>
                      </div>
                      <div>
                        <h3 className="font-bold">
                          Could not load habit ideas
                        </h3>
                        <p className="mt-1 text-sm text-rose-700/90">
                          {habitModalError}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!habitModalLoading &&
                !habitModalError &&
                habitModalTab === "suggested" && (
                  <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <section className="rounded-[24px] bg-gradient-to-r from-dark via-slate-800 to-dark px-4 py-4 text-white shadow-xl shadow-slate-950/10 sm:rounded-[28px] sm:px-6 sm:py-5 md:px-7 md:py-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                            Weakest areas first
                          </p>
                          <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                            Suggested habits ranked by your current focus.
                          </h3>
                        </div>
                        <div className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur sm:w-auto md:max-w-[18rem]">
                          <div className="font-bold text-white">
                            {orderedHabitAreaOptions[0]?.label ?? "Health"}
                          </div>
                          <div>Priority area with the lowest recent score.</div>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {topHabitTemplates.map((template) => {
                          const templateArea = getHabitAreaOptionById(
                            template.life_area_id,
                          );
                          const templateLabel =
                            templateArea?.label ??
                            template.life_area_name ??
                            "General";

                          return (
                            <div
                              key={template.id}
                              className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm md:p-5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">
                                    {templateLabel}
                                  </p>
                                  <h4 className="mt-2 text-base font-bold text-white">
                                    {template.title}
                                  </h4>
                                </div>
                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                                  {template.priority}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-white/75">
                                {template.description}
                              </p>
                              <div className="mt-4 flex flex-1 items-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    populateDraftFromTemplate(template)
                                  }
                                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-dark transition-colors hover:bg-gray-100"
                                >
                                  Customize
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <div className="grid gap-5">
                      {prioritizedTemplateAreas.map((area) => {
                        const templates =
                          recommendedTemplatesByArea.get(area.lifeAreaId) ?? [];
                        const score = habitAreaScores[area.lifeAreaId];
                        const scoreLabel =
                          typeof score === "number" && score > 0
                            ? `${score}%`
                            : "No recent score";

                        return (
                          <section
                            key={area.value}
                            className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-11 w-11 items-center justify-center self-start rounded-lg border ${area.iconBg}`}
                                >
                                  <area.icon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="m-0 text-lg font-bold text-dark">
                                      {area.label}
                                    </h4>
                                    {orderedHabitAreaOptions[0]?.value ===
                                      area.value && (
                                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                                        Top priority
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-bodyText">
                                    {scoreLabel} • {templates.length} curated
                                    habit
                                    {templates.length === 1 ? "" : "s"}
                                  </p>
                                </div>
                              </div>
                              {/* 'Use area' button removed per request */}
                            </div>

                            <div className="mt-4 grid gap-3">
                              {(templates.length > 0
                                ? templates
                                : habitLibrary
                                    .filter(
                                      (item) => item.life_area_id === null,
                                    )
                                    .slice(0, 1)
                              ).map((template) => (
                                <div
                                  key={template.id}
                                  className="rounded-2xl border border-gray-100 bg-slate-50 p-4 transition-colors hover:border-primary/30 hover:bg-white"
                                >
                                  <div className="flex flex-col gap-4 md:gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1.5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="text-base font-bold text-dark">
                                          {template.title}
                                        </h5>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-bodyText">
                                          {template.priority}
                                        </span>
                                      </div>
                                      <p className="text-sm leading-6 text-bodyText">
                                        {template.description}
                                      </p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const areaOption = getHabitAreaOption(
                                            area.value,
                                          );
                                          await createHabitFromDraft({
                                            name: template.title,
                                            description: template.description,
                                            areaValue: areaOption.value,
                                            frequency:
                                              areaOption.defaultFrequency,
                                          });
                                        }}
                                        className="w-full rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primaryHover sm:w-auto"
                                        disabled={habitSubmitLoading}
                                      >
                                        Add habit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          populateDraftFromTemplate(template)
                                        }
                                        className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-dark transition-colors hover:bg-white sm:w-auto"
                                      >
                                        Customize
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                )}

              {!habitModalLoading &&
                !habitModalError &&
                habitModalTab === "manual" && (
                  <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <form
                      className="rounded-[28px] border border-gray-100 bg-white p-5 sm:p-6 shadow-sm"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void createHabitFromDraft(habitDraft);
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                            Custom habit
                          </p>
                          <h3 className="mt-2 text-xl font-bold tracking-tight text-dark sm:text-2xl">
                            Build your own habit
                          </h3>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-bodyText">
                          {activeFilter === "all"
                            ? "Area required"
                            : `${activeFilterLabel} selected`}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4">
                        <label className="grid gap-2">
                          <span className="text-sm font-bold text-dark">
                            Habit name
                          </span>
                          <input
                            value={habitDraft.name}
                            onChange={(event) =>
                              setHabitDraft((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            placeholder="Example: 10-minute walk after lunch"
                            className="rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-dark outline-none transition-colors placeholder:text-bodyText/60 focus:bg-white resize-none"
                          />
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-bold text-dark">
                            Short description
                          </span>
                          <textarea
                            value={habitDraft.description}
                            onChange={(event) =>
                              setHabitDraft((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            placeholder="Describe the smallest repeatable version of this habit."
                            rows={4}
                            className="rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-dark outline-none transition-colors placeholder:text-bodyText/60 focus:bg-white resize-none"
                          />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-dark">
                              Life area
                            </span>
                            <div className="relative">
                              <select
                                value={habitDraft.areaValue}
                                onChange={(event) => {
                                  const nextArea = event.target
                                    .value as HabitAreaValue;
                                  const areaOption =
                                    getHabitAreaOption(nextArea);

                                  setHabitDraft((current) => ({
                                    ...current,
                                    areaValue: nextArea,
                                    frequency: areaOption.defaultFrequency,
                                  }));
                                }}
                                className="w-full appearance-none rounded-3xl border border-gray-100 bg-white px-5 py-4 pr-12 text-sm font-medium text-dark shadow-[0_10px_30px_-24px_rgba(15,23,42,0.32)] outline-none transition-all hover:border-gray-200 hover:shadow-[0_14px_34px_-26px_rgba(15,23,42,0.38)] focus:border-primary focus:shadow-[0_18px_38px_-28px_rgba(59,130,246,0.45)]"
                              >
                                {HABIT_AREA_OPTIONS.map((area) => (
                                  <option key={area.value} value={area.value}>
                                    {area.label}
                                  </option>
                                ))}
                              </select>
                              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-bodyText/70">
                                <i className="fas fa-chevron-down text-xs"></i>
                              </span>
                            </div>
                          </label>

                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-dark">
                              Frequency
                            </span>
                            <div className="relative">
                              <select
                                value={habitDraft.frequency}
                                onChange={(event) =>
                                  setHabitDraft((current) => ({
                                    ...current,
                                    frequency: event.target
                                      .value as HabitFrequency,
                                  }))
                                }
                                className="w-full appearance-none rounded-3xl border border-gray-100 bg-white px-5 py-4 pr-12 text-sm font-medium text-dark shadow-[0_10px_30px_-24px_rgba(15,23,42,0.32)] outline-none transition-all hover:border-gray-200 hover:shadow-[0_14px_34px_-26px_rgba(15,23,42,0.38)] focus:border-primary focus:shadow-[0_18px_38px_-28px_rgba(59,130,246,0.45)]"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                              </select>
                              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-bodyText/70">
                                <i className="fas fa-chevron-down text-xs"></i>
                              </span>
                            </div>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={habitSubmitLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {habitSubmitLoading
                            ? "Saving habit..."
                            : "Add to my habits"}
                        </button>

                        {habitModalError && (
                          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                            {habitModalError}
                          </p>
                        )}
                      </div>
                    </form>

                    <aside className="space-y-4">
                      <div className="rounded-[28px] border border-gray-100 bg-gradient-to-br from-dark to-slate-900 p-5 text-white shadow-xl shadow-slate-950/10">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">
                          Priority guidance
                        </p>
                        <h4 className="mt-2 text-xl font-bold text-white tracking-tight">
                          {orderedHabitAreaOptions[0]?.label ?? "Health"} is the
                          recommended starting point.
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-white/75">
                          We rank habit ideas from your weakest life area first,
                          so your manual habit can still stay aligned with what
                          will move the needle fastest.
                        </p>
                      </div>

                      <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-bold text-dark">
                              Quick suggestions
                            </h4>
                            <p className="text-sm text-bodyText">
                              Jump back to the suggested list anytime.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setHabitModalTab("suggested")}
                            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-dark transition-colors hover:bg-gray-50"
                          >
                            View suggestions
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {topHabitTemplates.map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() =>
                                populateDraftFromTemplate(template)
                              }
                              className="w-full rounded-2xl border border-gray-100 bg-slate-50 p-4 text-left transition-colors hover:border-primary/30 hover:bg-white"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/70">
                                    {template.life_area_name ?? "General"}
                                  </p>
                                  <h5 className="mt-2 text-sm font-bold text-dark">
                                    {template.title}
                                  </h5>
                                </div>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-bodyText">
                                  {template.priority}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </aside>
                  </div>
                )}
            </div>
          </div>
          </div>
        </div>
      )}

      {habitEditor && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close habit editor"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={closeHabitEditor}
          />
          <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                  Edit Habit
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-dark sm:text-2xl">
                  Update your habit details
                </h2>
                <p className="mt-1 text-sm text-bodyText">
                  Editing {habitEditor.originalName || "your habit"}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeHabitEditor}
                disabled={habitEditorSaving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">
                  Habit name
                </span>
                <input
                  type="text"
                  value={habitEditor.name}
                  onChange={(event) =>
                    setHabitEditor((current) =>
                      current
                        ? { ...current, name: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Drink water"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-dark">
                  Description
                </span>
                <textarea
                  value={habitEditor.description}
                  onChange={(event) =>
                    setHabitEditor((current) =>
                      current
                        ? { ...current, description: event.target.value }
                        : current,
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Add a quick note to make the habit easier to follow."
                />
              </label>

              {habitEditorError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {habitEditorError}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeHabitEditor}
                disabled={habitEditorSaving}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-bodyText transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitHabitEditor()}
                disabled={habitEditorSaving}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {habitEditorSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {habitDeleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={closeHabitDeleteDialog}
          />
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <i className="fas fa-trash" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-dark sm:text-2xl">
              Delete habit?
            </h2>
            <p className="mt-2 text-sm leading-6 text-bodyText">
              <span className="font-semibold text-dark">
                {habitDeleteTarget.name}
              </span>{" "}
              will be removed permanently. This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeHabitDeleteDialog}
                disabled={habitDeleteLoading}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-bodyText transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmHabitDelete()}
                disabled={habitDeleteLoading}
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {habitDeleteLoading ? "Deleting..." : "Delete Habit"}
              </button>
            </div>
          </div>
        </div>
      )}

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
