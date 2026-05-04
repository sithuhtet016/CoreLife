import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const dbPath = path.join(dataDir, "db.json");

const initialState = {
  users: [],
  sessions: [],
  answersBySession: {},
  habits: [],
  habitLogs: [],
};

function loadState() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialState, null, 2));
    return initialState;
  }

  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      habitLogs: Array.isArray(parsed.habitLogs) ? parsed.habitLogs : [],
      answersBySession:
        parsed.answersBySession && typeof parsed.answersBySession === "object"
          ? parsed.answersBySession
          : {},
    };
  } catch {
    fs.writeFileSync(dbPath, JSON.stringify(initialState, null, 2));
    return initialState;
  }
}

const loaded = loadState();

export const db = {
  users: new Map(loaded.users.map((u) => [u.id, u])),
  sessions: new Map(loaded.sessions.map((s) => [s.id, s])),
  answersBySession: new Map(Object.entries(loaded.answersBySession)),
  habits: new Map(loaded.habits.map((h) => [h.id, h])),
  habitLogs: new Map(loaded.habitLogs.map((l) => [l.id, l])),
};

export function persistDb() {
  const snapshot = {
    users: [...db.users.values()],
    sessions: [...db.sessions.values()],
    answersBySession: Object.fromEntries(db.answersBySession.entries()),
    habits: [...db.habits.values()],
    habitLogs: [...db.habitLogs.values()],
  };
  fs.writeFileSync(dbPath, JSON.stringify(snapshot, null, 2));
}

export function randomId(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return (
    [...db.users.values()].find((u) => u.email.toLowerCase() === normalized) ??
    null
  );
}

export function getLatestCompletedSessions(userId) {
  return [...db.sessions.values()]
    .filter((s) => s.user_id === userId && s.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
    );
}

export function computeHabitMetrics(habitId) {
  const logs = [...db.habitLogs.values()]
    .filter((l) => l.habit_id === habitId)
    .sort((a, b) => a.date.localeCompare(b.date));

  let streak = 0;
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    if (!logs[i].completed) break;
    streak += 1;
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousCompletedDate = null;
  for (const log of logs) {
    if (!log.completed) {
      runningStreak = 0;
      previousCompletedDate = null;
      continue;
    }

    if (previousCompletedDate) {
      const previous = new Date(previousCompletedDate);
      previous.setDate(previous.getDate() + 1);
      const expectedNext = previous.toISOString().slice(0, 10);
      runningStreak = expectedNext === log.date ? runningStreak + 1 : 1;
    } else {
      runningStreak = 1;
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    previousCompletedDate = log.date;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const recent = logs.filter((log) => new Date(log.date) >= sevenDaysAgo);
  const completedRecent = recent.filter((log) => log.completed).length;
  const weeklyConsistency = recent.length
    ? (completedRecent / recent.length) * 100
    : 0;

  return { streak, longestStreak, weeklyConsistency };
}
