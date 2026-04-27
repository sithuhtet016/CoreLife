import type { HabitSummary } from "../types";

export const EMPTY_HABIT_SUMMARY: HabitSummary = {
  totalHabits: 0,
  completedTodayCount: 0,
  currentStreak: 0,
  bestStreak: 0,
  weeklyActivity: [false, false, false, false, false, false, false],
};

export function getHabitSummaryOrDefault(
  summary: HabitSummary | null | undefined,
): HabitSummary {
  if (!summary) {
    return {
      ...EMPTY_HABIT_SUMMARY,
      weeklyActivity: [...EMPTY_HABIT_SUMMARY.weeklyActivity],
    };
  }

  const weeklyActivity = Array.isArray(summary.weeklyActivity)
    ? summary.weeklyActivity.slice(0, 7).map(Boolean)
    : [...EMPTY_HABIT_SUMMARY.weeklyActivity];

  while (weeklyActivity.length < 7) {
    weeklyActivity.push(false);
  }

  return {
    totalHabits: Number(summary.totalHabits ?? 0),
    completedTodayCount: Number(summary.completedTodayCount ?? 0),
    currentStreak: Number(summary.currentStreak ?? 0),
    bestStreak: Number(summary.bestStreak ?? 0),
    weeklyActivity,
  };
}
