import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  lifeAreas as seedLifeAreas,
  questions as seedQuestions,
} from "./data/lifeAreas.js";
import {
  isMailtrapConfigured,
  sendMailtrapEmail,
  sendWelcomeEmail,
} from "./mailer.js";
import { calculateAreaScores, calculateOverallScore } from "./scoring.js";
import {
  isServiceRoleConfigured,
  supabaseAdmin,
  supabaseAuth,
} from "./supabase.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const LOGIN_OTP_TTL_MINUTES = Math.max(
  3,
  Number(process.env.LOGIN_OTP_TTL_MINUTES ?? 10),
);
const LOGIN_OTP_MAX_ATTEMPTS = Math.max(
  1,
  Number(process.env.LOGIN_OTP_MAX_ATTEMPTS ?? 5),
);
const LOGIN_OTP_SECRET =
  process.env.LOGIN_OTP_SECRET?.trim() || "corelife-login-otp-secret";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

const supabaseOrigin = (() => {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
})();

const defaultDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
const connectSrc = new Set(defaultDirectives.connectSrc ?? ["'self'"]);
const imgSrc = new Set(defaultDirectives.imgSrc ?? ["'self'", "data:"]);
const scriptSrc = new Set(defaultDirectives.scriptSrc ?? ["'self'"]);

connectSrc.add("https://*.supabase.co");
connectSrc.add("wss://*.supabase.co");
if (supabaseOrigin) {
  connectSrc.add(supabaseOrigin);
}

imgSrc.add("https://images.unsplash.com");
imgSrc.add("https://storage.googleapis.com");

// Plotly is loaded from CDN for chart rendering.
scriptSrc.add("https://cdn.plot.ly");

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        connectSrc: [...connectSrc],
        imgSrc: [...imgSrc],
        scriptSrc: [...scriptSrc],
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

function formatSupabaseError(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string" && error.trim()) return error;
  if (typeof error === "object") {
    const message =
      (typeof error.message === "string" && error.message) ||
      (typeof error.error_description === "string" &&
        error.error_description) ||
      (typeof error.msg === "string" && error.msg) ||
      null;
    if (message) return message;
  }
  return fallback;
}

function maskEmail(value) {
  const normalizedEmail = String(value ?? "")
    .trim()
    .toLowerCase();
  const atIndex = normalizedEmail.indexOf("@");
  if (atIndex <= 1) return normalizedEmail;

  const local = normalizedEmail.slice(0, atIndex);
  const domain = normalizedEmail.slice(atIndex + 1);
  const maskedLocal = `${local[0]}${"*".repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

function generateLoginOtpCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashLoginOtp(challengeId, code) {
  return crypto
    .createHmac("sha256", LOGIN_OTP_SECRET)
    .update(`${challengeId}:${String(code).trim()}`)
    .digest("hex");
}

function getLoginOtpExpiryTimestamp() {
  return new Date(Date.now() + LOGIN_OTP_TTL_MINUTES * 60_000).toISOString();
}

async function sendLoginOtpEmail({ toEmail, code }) {
  const safeCode = String(code).trim();
  const expiresInMinutes = LOGIN_OTP_TTL_MINUTES;

  await sendMailtrapEmail({
    to: toEmail,
    subject: "Your CoreLife login verification code",
    text: [
      "Use this one-time code to complete your CoreLife login:",
      "",
      safeCode,
      "",
      `This code expires in ${expiresInMinutes} minutes.`,
      "If you did not attempt to sign in, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin-bottom: 10px;">CoreLife verification code</h2>
        <p>Use this code to complete your sign in:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 12px 0;">${safeCode}</p>
        <p>This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
        <p style="color: #64748b;">If you did not attempt to sign in, you can ignore this email.</p>
      </div>
    `,
    category: "login-otp",
  });
}

function isNoRowsError(error) {
  return Boolean(
    error && typeof error === "object" && error.code === "PGRST116",
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name ?? null,
    promo_email_opt_in: Boolean(user.promo_email_opt_in),
    promo_email_opt_in_at: user.promo_email_opt_in_at ?? null,
    created_at: user.created_at,
  };
}

function normalizeAreaScores(areaScores) {
  if (!areaScores || typeof areaScores !== "object") return {};
  const normalized = {};
  for (const [key, value] of Object.entries(areaScores)) {
    const numericKey = Number(key);
    const numericValue = Number(value);
    if (!Number.isInteger(numericKey) || Number.isNaN(numericValue)) continue;
    normalized[numericKey] = numericValue;
  }
  return normalized;
}

function normalizeIntegerList(values, options = {}) {
  if (!Array.isArray(values)) return [];

  const min =
    Number.isFinite(Number(options.min)) &&
    Number.isInteger(Number(options.min))
      ? Number(options.min)
      : null;
  const max =
    Number.isFinite(Number(options.max)) &&
    Number.isInteger(Number(options.max))
      ? Number(options.max)
      : null;

  const uniqueValues = new Set();

  for (const value of values) {
    const numeric = Number(value);
    if (!Number.isInteger(numeric)) continue;
    if (min !== null && numeric < min) continue;
    if (max !== null && numeric > max) continue;
    uniqueValues.add(numeric);
  }

  return [...uniqueValues];
}

function normalizeStringList(values) {
  if (!Array.isArray(values)) return [];

  const uniqueValues = new Set();

  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (!normalized) continue;
    uniqueValues.add(normalized);
  }

  return [...uniqueValues];
}

function isValidIsoDateOnly(value) {
  const raw = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return false;
  }

  const parsed = new Date(`${raw}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === raw;
}

function getDateKeyForTimezoneOffset(offsetMinutes, date = new Date()) {
  const numericOffset = Number(offsetMinutes);
  const safeOffset = Number.isFinite(numericOffset) ? numericOffset : 0;
  const shifted = new Date(date.getTime() - safeOffset * 60_000);
  return shifted.toISOString().slice(0, 10);
}

function getRecentDateKeysForTimezoneOffset(offsetMinutes, days = 7) {
  const keys = [];
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    keys.push(
      getDateKeyForTimezoneOffset(
        offsetMinutes,
        new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
      ),
    );
  }

  return keys;
}

function shiftDateKey(dateKey, deltaDays) {
  const base = new Date(`${String(dateKey).trim()}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) {
    return String(dateKey).trim();
  }

  base.setUTCDate(base.getUTCDate() + deltaDays);
  return base.toISOString().slice(0, 10);
}

const recommendationLibrary = [
  {
    id: "health-sleep",
    life_area_id: 1,
    priority: "high",
    title: "Adjust evening habit timing",
    description:
      "Moving your routine 30 minutes earlier correlates with better sleep scores.",
  },
  {
    id: "health-hydration",
    life_area_id: 1,
    priority: "suggestion",
    title: "Add a hydration milestone",
    description:
      "You often miss the 2L water goal. Add a midday check-in to stay on track.",
  },
  {
    id: "health-movement",
    life_area_id: 1,
    priority: "suggestion",
    title: "Schedule a short movement break",
    description:
      "A 10-minute walk or stretch break can make your day feel lighter.",
  },
  {
    id: "appearance-grooming",
    life_area_id: 2,
    priority: "suggestion",
    title: "Refresh a daily grooming habit",
    description:
      "Pick one small routine each morning to build confidence all week.",
  },
  {
    id: "appearance-style",
    life_area_id: 2,
    priority: "suggestion",
    title: "Plan one polished outfit ahead",
    description:
      "Choose tomorrow's outfit tonight so getting ready feels effortless.",
  },
  {
    id: "love-checkin",
    life_area_id: 3,
    priority: "high",
    title: "Plan a weekly relationship check-in",
    description:
      "Short, honest check-ins can strengthen connection and reduce tension.",
  },
  {
    id: "love-appreciation",
    life_area_id: 3,
    priority: "suggestion",
    title: "Share one appreciation message",
    description:
      "A small note of gratitude can keep the relationship feeling warm.",
  },
  {
    id: "family-boundaries",
    life_area_id: 4,
    priority: "suggestion",
    title: "Set one clear family boundary",
    description:
      "Choose a boundary that protects your time and keeps communication clear.",
  },
  {
    id: "family-dinner",
    life_area_id: 4,
    priority: "suggestion",
    title: "Add one family connection moment",
    description:
      "A shared meal or quick call can make family time more intentional.",
  },
  {
    id: "friends-reachout",
    life_area_id: 5,
    priority: "suggestion",
    title: "Schedule a friend reach-out",
    description: "Add a quick message or call to keep friendships consistent.",
  },
  {
    id: "friends-plan",
    life_area_id: 5,
    priority: "suggestion",
    title: "Plan one simple hangout",
    description:
      "Lock in a coffee, walk, or call so friendship stays on the calendar.",
  },
  {
    id: "career-focus",
    life_area_id: 6,
    priority: "high",
    title: "Block a focus session",
    description:
      "Protect 60-90 minutes for deep work on your top career priority.",
  },
  {
    id: "career-review",
    life_area_id: 6,
    priority: "suggestion",
    title: "Review your top work priority",
    description:
      "A quick end-of-day review helps you start tomorrow with clarity.",
  },
  {
    id: "money-review",
    life_area_id: 7,
    priority: "high",
    title: "Run a weekly money review",
    description:
      "A 10-minute budget check keeps goals visible and reduces surprises.",
  },
  {
    id: "money-save",
    life_area_id: 7,
    priority: "suggestion",
    title: "Automate one small transfer",
    description:
      "Move a little money into savings before you have a chance to spend it.",
  },
  {
    id: "growth-learning",
    life_area_id: 8,
    priority: "suggestion",
    title: "Pick a weekly learning goal",
    description: "Choose one skill to practice for 20 minutes this week.",
  },
  {
    id: "growth-reflect",
    life_area_id: 8,
    priority: "suggestion",
    title: "Write a one-line reflection",
    description:
      "A quick note on what you learned helps progress feel visible.",
  },
  {
    id: "spiritual-reflect",
    life_area_id: 9,
    priority: "suggestion",
    title: "Start a short reflection ritual",
    description: "Five minutes of gratitude or mindfulness can reset your day.",
  },
  {
    id: "spiritual-breath",
    life_area_id: 9,
    priority: "suggestion",
    title: "Add a quiet morning pause",
    description:
      "A short pause before the day begins can create a calmer rhythm.",
  },
  {
    id: "recreation-breaks",
    life_area_id: 10,
    priority: "suggestion",
    title: "Add a midweek recharge",
    description:
      "Plan one activity that gives you energy instead of draining it.",
  },
  {
    id: "recreation-hobby",
    life_area_id: 10,
    priority: "suggestion",
    title: "Reserve time for a hobby",
    description:
      "Block a little time for something fun so your week feels more balanced.",
  },
  {
    id: "environment-reset",
    life_area_id: 11,
    priority: "suggestion",
    title: "Do a 15-minute environment reset",
    description: "Clear one space to reduce friction and keep routines easier.",
  },
  {
    id: "environment-desk",
    life_area_id: 11,
    priority: "suggestion",
    title: "Reset your desk at day end",
    description: "A tidy workspace makes it easier to start strong tomorrow.",
  },
  {
    id: "community-contribute",
    life_area_id: 12,
    priority: "suggestion",
    title: "Make one community contribution",
    description: "Choose a small way to connect or help someone this week.",
  },
  {
    id: "community-checkin",
    life_area_id: 12,
    priority: "suggestion",
    title: "Reach out to someone locally",
    description:
      "A small conversation or favor can strengthen your sense of belonging.",
  },
  {
    id: "general-habit",
    life_area_id: null,
    priority: "suggestion",
    title: "Build a simple daily habit",
    description: "Start with a 5-minute habit you can repeat every day.",
  },
];

function normalizeSessionMetadataInput(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const metadata = {};

  if (Object.hasOwn(payload, "age")) {
    const age = Number(payload.age);
    metadata.age = Number.isInteger(age) && age > 0 ? age : null;
  }

  if (
    Object.hasOwn(payload, "primaryGoal") ||
    Object.hasOwn(payload, "primary_goal")
  ) {
    const rawPrimaryGoal = payload.primaryGoal ?? payload.primary_goal;
    const normalizedPrimaryGoal =
      typeof rawPrimaryGoal === "string" ? rawPrimaryGoal.trim() : "";
    metadata.primary_goal = normalizedPrimaryGoal || null;
  }

  if (
    Object.hasOwn(payload, "selectedAreaIds") ||
    Object.hasOwn(payload, "selected_area_ids")
  ) {
    metadata.selected_area_ids = normalizeIntegerList(
      payload.selectedAreaIds ?? payload.selected_area_ids,
      { min: 1 },
    );
  }

  if (Object.hasOwn(payload, "confidence")) {
    const confidence = Number(payload.confidence);
    metadata.confidence =
      Number.isInteger(confidence) && confidence >= 1 && confidence <= 10
        ? confidence
        : null;
  }

  if (Object.hasOwn(payload, "priorities")) {
    metadata.priorities = normalizeStringList(payload.priorities);
  }

  if (
    Object.hasOwn(payload, "timeCommitmentMinutes") ||
    Object.hasOwn(payload, "time_commitment_minutes")
  ) {
    const minutes = Number(
      payload.timeCommitmentMinutes ?? payload.time_commitment_minutes,
    );
    metadata.time_commitment_minutes =
      Number.isInteger(minutes) && minutes > 0 ? minutes : null;
  }

  return Object.keys(metadata).length > 0 ? metadata : null;
}

function toSession(session) {
  return {
    ...session,
    area_scores: normalizeAreaScores(session.area_scores),
    age:
      Number.isInteger(Number(session.age)) && Number(session.age) > 0
        ? Number(session.age)
        : null,
    primary_goal:
      typeof session.primary_goal === "string" && session.primary_goal.trim()
        ? session.primary_goal
        : null,
    selected_area_ids: normalizeIntegerList(session.selected_area_ids, {
      min: 1,
    }),
    confidence:
      Number.isInteger(Number(session.confidence)) &&
      Number(session.confidence) >= 1 &&
      Number(session.confidence) <= 10
        ? Number(session.confidence)
        : null,
    priorities: normalizeStringList(session.priorities),
    time_commitment_minutes:
      Number.isInteger(Number(session.time_commitment_minutes)) &&
      Number(session.time_commitment_minutes) > 0
        ? Number(session.time_commitment_minutes)
        : null,
  };
}

async function upsertPromotionalSubscriber({
  email,
  fullName,
  userId = null,
  source = "register",
}) {
  const normalizedEmail = String(email ?? "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("valid email is required for promotional subscription");
  }

  const normalizedFullName =
    typeof fullName === "string" ? fullName.trim() : "";
  const normalizedSource =
    typeof source === "string" && source.trim() ? source.trim() : "register";
  const now = new Date().toISOString();

  const payload = {
    email: normalizedEmail,
    full_name: normalizedFullName || null,
    user_id: userId || null,
    source: normalizedSource,
    subscribed_at: now,
    updated_at: now,
  };

  const { error } = await supabaseAdmin
    .from("promotional_subscribers")
    .upsert(payload, { onConflict: "email" });

  if (error) {
    throw new Error(
      formatSupabaseError(error, "failed to save promotional subscription"),
    );
  }
}

async function ensureAppUser(authUser) {
  const email =
    typeof authUser.email === "string" && authUser.email.trim()
      ? authUser.email.trim().toLowerCase()
      : `${authUser.id}@users.corelife.local`;

  const metadata =
    authUser && typeof authUser.user_metadata === "object"
      ? authUser.user_metadata
      : {};

  const userPayload = {
    id: authUser.id,
    email,
  };

  if (Object.hasOwn(metadata, "full_name")) {
    const fullName =
      typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
    userPayload.full_name = fullName || null;
  }

  if (Object.hasOwn(metadata, "promo_email_opt_in")) {
    const optedIn = Boolean(metadata.promo_email_opt_in);
    userPayload.promo_email_opt_in = optedIn;
    userPayload.promo_email_opt_in_at = optedIn
      ? typeof metadata.promo_email_opt_in_at === "string"
        ? metadata.promo_email_opt_in_at
        : new Date().toISOString()
      : null;
  }

  const { error: upsertError } = await supabaseAdmin
    .from("users")
    .upsert(userPayload, { onConflict: "id" });

  if (upsertError) {
    throw new Error(
      formatSupabaseError(upsertError, "failed to create user profile"),
    );
  }

  const { data: userRow, error: selectError } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, promo_email_opt_in, promo_email_opt_in_at, created_at",
    )
    .eq("id", authUser.id)
    .single();

  if (selectError || !userRow) {
    throw new Error(
      formatSupabaseError(selectError, "failed to read user profile"),
    );
  }

  return toPublicUser(userRow);
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  if (!token) return res.status(401).json({ error: "missing bearer token" });

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "invalid or expired token" });
    }

    req.user = await ensureAppUser(data.user);
    return next();
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to authenticate user"),
    });
  }
}

async function ensureReferenceData() {
  const { error: lifeAreasError } = await supabaseAdmin
    .from("life_areas")
    .upsert(seedLifeAreas, { onConflict: "id" });

  if (lifeAreasError) {
    throw new Error(
      formatSupabaseError(lifeAreasError, "failed to seed life areas"),
    );
  }

  const { error: questionsError } = await supabaseAdmin
    .from("questions")
    .upsert(seedQuestions, { onConflict: "id" });

  if (questionsError) {
    throw new Error(
      formatSupabaseError(questionsError, "failed to seed questions"),
    );
  }
}

async function getQuestionsPayload() {
  const [
    { data: lifeAreas, error: lifeAreasError },
    { data: questions, error: questionsError },
  ] = await Promise.all([
    supabaseAdmin.from("life_areas").select("id, name").order("id"),
    supabaseAdmin
      .from("questions")
      .select("id, life_area_id, text, order_index")
      .order("id"),
  ]);

  if (lifeAreasError || questionsError) {
    throw new Error(
      formatSupabaseError(
        lifeAreasError ?? questionsError,
        "failed to fetch questions",
      ),
    );
  }

  return {
    lifeAreas: lifeAreas?.length ? lifeAreas : seedLifeAreas,
    questions: questions?.length ? questions : seedQuestions,
  };
}

async function getSessionById(sessionId) {
  const { data, error } = await supabaseAdmin
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (isNoRowsError(error)) return null;
  if (error) {
    throw new Error(formatSupabaseError(error, "failed to fetch session"));
  }
  return data;
}

async function getAnswersBySession(sessionId) {
  const { data, error } = await supabaseAdmin
    .from("answers")
    .select("question_id, score")
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(formatSupabaseError(error, "failed to fetch answers"));
  }

  return data ?? [];
}

function computeHabitMetrics(logs, options = {}) {
  const sorted = [...logs].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  const todayKey =
    typeof options.todayKey === "string" && options.todayKey.trim()
      ? options.todayKey.trim()
      : getDateKeyForTimezoneOffset(0);
  const recentDateKeys = Array.isArray(options.recentDateKeys)
    ? options.recentDateKeys.map((value) => String(value).trim()).filter(Boolean)
    : getRecentDateKeysForTimezoneOffset(0, 7);

  const completionByDate = new Map();
  for (const log of sorted) {
    completionByDate.set(String(log.date), Boolean(log.completed));
  }

  const yesterdayKey = shiftDateKey(todayKey, -1);
  let streakAnchor = todayKey;

  if (!completionByDate.get(streakAnchor)) {
    streakAnchor = yesterdayKey;
  }

  let streak = 0;
  while (completionByDate.get(streakAnchor)) {
    streak += 1;
    streakAnchor = shiftDateKey(streakAnchor, -1);
  }

  const completedRecent = recentDateKeys.filter((dateKey) =>
    completionByDate.get(dateKey),
  ).length;
  const weeklyConsistency = recentDateKeys.length
    ? (completedRecent / recentDateKeys.length) * 100
    : 0;

  return {
    streak,
    weeklyConsistency,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "corelife-api",
    storage: "supabase",
    serviceRoleConfigured: isServiceRoleConfigured,
    mailtrapConfigured: isMailtrapConfigured,
  });
});

app.post("/api/email/test", requireAuth, async (req, res) => {
  if (!isMailtrapConfigured) {
    return res.status(503).json({
      error:
        "Mailtrap is not configured. Set MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL.",
    });
  }

  const { to, subject } = req.body ?? {};

  const recipientEmail =
    typeof to === "string" && to.trim()
      ? to.trim().toLowerCase()
      : req.user.email;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return res
      .status(400)
      .json({ error: "A valid recipient email is required" });
  }

  const mailSubject =
    typeof subject === "string" && subject.trim()
      ? subject.trim()
      : "CoreLife Mailtrap integration test";

  try {
    const sentAt = new Date().toISOString();

    await sendMailtrapEmail({
      to: recipientEmail,
      subject: mailSubject,
      text: [
        "CoreLife Mailtrap integration is working.",
        "",
        `Sent at: ${sentAt}`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
          <h2 style="margin-bottom: 8px;">CoreLife Mailtrap integration is working</h2>
          <p>Sent at: <strong>${sentAt}</strong></p>
        </div>
      `,
      category: "integration-test",
    });

    return res.json({ ok: true, recipient: recipientEmail });
  } catch (error) {
    return res.status(502).json({
      error: formatSupabaseError(error, "failed to send test email"),
    });
  }
});

app.post("/api/promotions/subscribe", async (req, res) => {
  const { email, fullName, userId, source } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  try {
    await upsertPromotionalSubscriber({
      email,
      fullName,
      userId:
        typeof userId === "string" && userId.trim() ? userId.trim() : null,
      source,
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(
        error,
        "failed to subscribe promotional messages",
      ),
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, fullName, promoEmailOptIn } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail.includes("@")) {
    return res.status(400).json({ error: "invalid email format" });
  }

  if (String(password).length < 6) {
    return res
      .status(400)
      .json({ error: "password must be at least 6 characters" });
  }

  const normalizedFullName =
    typeof fullName === "string" ? fullName.trim() : "";
  const wantsPromoEmail = Boolean(promoEmailOptIn);

  const { data, error } = await supabaseAuth.auth.signUp({
    email: normalizedEmail,
    password: String(password),
    options: {
      data: {
        full_name: normalizedFullName || null,
        promo_email_opt_in: wantsPromoEmail,
        promo_email_opt_in_at: wantsPromoEmail
          ? new Date().toISOString()
          : null,
      },
    },
  });

  if (error || !data.user) {
    const message = formatSupabaseError(error, "registration failed");
    const lowered = message.toLowerCase();
    const status =
      lowered.includes("already") || lowered.includes("exists") ? 409 : 400;
    return res.status(status).json({ error: message });
  }

  if (!data.session) {
    return res.status(200).json({
      requiresEmailVerification: true,
      email: normalizedEmail,
      message:
        "Account created. Check your email for the verification code, then verify your account to continue.",
    });
  }

  try {
    const user = await ensureAppUser(data.user);

    if (wantsPromoEmail) {
      await upsertPromotionalSubscriber({
        email: user.email,
        fullName: user.full_name ?? normalizedFullName,
        userId: user.id,
        source: "register",
      }).catch((subscriptionError) => {
        console.error(
          "Promotional subscription sync failed:",
          formatSupabaseError(subscriptionError, "unknown error"),
        );
      });
    }

    if (isMailtrapConfigured) {
      void sendWelcomeEmail({
        toEmail: user.email,
        fullName: user.full_name ?? undefined,
      }).catch((emailError) => {
        console.error(
          "Welcome email failed:",
          formatSupabaseError(emailError, "unknown error"),
        );
      });
    }

    return res.status(201).json({ token: data.session.access_token, user });
  } catch (profileError) {
    return res.status(500).json({
      error: formatSupabaseError(profileError, "failed to create user profile"),
    });
  }
});

app.post("/api/auth/login/2fa/start", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  if (!isMailtrapConfigured) {
    return res.status(503).json({
      error:
        "Two-step login email delivery is unavailable. Configure MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL.",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: normalizedEmail,
    password: String(password),
  });

  if (error || !data.user || !data.session) {
    return res.status(401).json({
      error: formatSupabaseError(error, "invalid credentials"),
    });
  }

  if (!data.session.access_token || !data.session.refresh_token) {
    return res
      .status(500)
      .json({ error: "failed to initialize two-step login session" });
  }

  try {
    const user = await ensureAppUser(data.user);
    const challengeId = crypto.randomUUID();
    const otpCode = generateLoginOtpCode();
    const otpHash = hashLoginOtp(challengeId, otpCode);
    const expiresAt = getLoginOtpExpiryTimestamp();
    const now = new Date().toISOString();

    await supabaseAdmin
      .from("login_otp_challenges")
      .delete()
      .eq("user_id", user.id)
      .is("consumed_at", null);

    const { error: challengeError } = await supabaseAdmin
      .from("login_otp_challenges")
      .insert({
        id: challengeId,
        user_id: user.id,
        email: user.email,
        otp_hash: otpHash,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        attempt_count: 0,
        expires_at: expiresAt,
        updated_at: now,
      });

    if (challengeError) {
      return res.status(500).json({
        error: formatSupabaseError(
          challengeError,
          "failed to start login verification",
        ),
      });
    }

    try {
      await sendLoginOtpEmail({ toEmail: user.email, code: otpCode });
    } catch (sendError) {
      await supabaseAdmin
        .from("login_otp_challenges")
        .delete()
        .eq("id", challengeId);

      return res.status(502).json({
        error: formatSupabaseError(
          sendError,
          "failed to deliver login verification code",
        ),
      });
    }

    return res.status(201).json({
      challengeId,
      destination: maskEmail(user.email),
      expiresInSeconds: LOGIN_OTP_TTL_MINUTES * 60,
    });
  } catch (startError) {
    return res.status(500).json({
      error: formatSupabaseError(startError, "failed to start login 2FA"),
    });
  }
});

app.post("/api/auth/login/2fa/resend", async (req, res) => {
  const { challengeId } = req.body ?? {};
  const normalizedChallengeId = String(challengeId ?? "").trim();

  if (!normalizedChallengeId) {
    return res.status(400).json({ error: "challengeId is required" });
  }

  if (!isMailtrapConfigured) {
    return res.status(503).json({
      error:
        "Two-step login email delivery is unavailable. Configure MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL.",
    });
  }

  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from("login_otp_challenges")
    .select("id, email, otp_hash, attempt_count, expires_at, consumed_at")
    .eq("id", normalizedChallengeId)
    .single();

  if (challengeError || !challenge) {
    return res
      .status(404)
      .json({ error: "login verification challenge not found" });
  }

  if (challenge.consumed_at) {
    return res
      .status(400)
      .json({ error: "login verification challenge already used" });
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return res
      .status(400)
      .json({ error: "login verification challenge expired" });
  }

  const otpCode = generateLoginOtpCode();
  const otpHash = hashLoginOtp(normalizedChallengeId, otpCode);
  const expiresAt = getLoginOtpExpiryTimestamp();
  const previousOtpHash = challenge.otp_hash ?? null;
  const previousExpiresAt = challenge.expires_at;
  const previousAttemptCount = Number(challenge.attempt_count ?? 0);

  const { error: updateError } = await supabaseAdmin
    .from("login_otp_challenges")
    .update({
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempt_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalizedChallengeId)
    .is("consumed_at", null);

  if (updateError) {
    return res.status(500).json({
      error: formatSupabaseError(
        updateError,
        "failed to refresh login verification",
      ),
    });
  }

  try {
    await sendLoginOtpEmail({ toEmail: challenge.email, code: otpCode });
  } catch (sendError) {
    await supabaseAdmin
      .from("login_otp_challenges")
      .update({
        ...(previousOtpHash ? { otp_hash: previousOtpHash } : {}),
        expires_at: previousExpiresAt,
        attempt_count: previousAttemptCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", normalizedChallengeId)
      .is("consumed_at", null);

    return res.status(502).json({
      error: formatSupabaseError(
        sendError,
        "failed to resend verification code",
      ),
    });
  }

  return res.json({
    ok: true,
    destination: maskEmail(challenge.email),
    expiresInSeconds: LOGIN_OTP_TTL_MINUTES * 60,
  });
});

app.post("/api/auth/login/2fa/verify", async (req, res) => {
  const { challengeId, code } = req.body ?? {};
  const normalizedChallengeId = String(challengeId ?? "").trim();
  const normalizedCode = String(code ?? "").trim();

  if (!normalizedChallengeId || !normalizedCode) {
    return res.status(400).json({ error: "challengeId and code are required" });
  }

  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from("login_otp_challenges")
    .select(
      "id, user_id, email, otp_hash, access_token, refresh_token, attempt_count, expires_at, consumed_at",
    )
    .eq("id", normalizedChallengeId)
    .single();

  if (challengeError || !challenge) {
    return res
      .status(404)
      .json({ error: "login verification challenge not found" });
  }

  if (challenge.consumed_at) {
    return res
      .status(400)
      .json({ error: "login verification challenge already used" });
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return res
      .status(400)
      .json({ error: "verification code expired, request a new one" });
  }

  const currentAttempts = Number(challenge.attempt_count ?? 0);
  if (currentAttempts >= LOGIN_OTP_MAX_ATTEMPTS) {
    return res.status(429).json({
      error: "too many invalid attempts, request a new verification code",
    });
  }

  const expectedHash = hashLoginOtp(normalizedChallengeId, normalizedCode);
  if (expectedHash !== challenge.otp_hash) {
    const nextAttempts = currentAttempts + 1;
    await supabaseAdmin
      .from("login_otp_challenges")
      .update({
        attempt_count: nextAttempts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", normalizedChallengeId)
      .is("consumed_at", null);

    return res.status(nextAttempts >= LOGIN_OTP_MAX_ATTEMPTS ? 429 : 401).json({
      error:
        nextAttempts >= LOGIN_OTP_MAX_ATTEMPTS
          ? "too many invalid attempts, request a new verification code"
          : "invalid verification code",
    });
  }

  const { error: consumeError } = await supabaseAdmin
    .from("login_otp_challenges")
    .update({
      consumed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalizedChallengeId)
    .is("consumed_at", null);

  if (consumeError) {
    return res.status(500).json({
      error: formatSupabaseError(consumeError, "failed to finalize login 2FA"),
    });
  }

  let user = null;
  const { data: userRow, error: userRowError } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, full_name, promo_email_opt_in, promo_email_opt_in_at, created_at",
    )
    .eq("id", challenge.user_id)
    .single();

  if (!userRowError && userRow) {
    user = toPublicUser(userRow);
  }

  if (!user) {
    const { data: authUserData, error: authUserError } =
      await supabaseAuth.auth.getUser(challenge.access_token);

    if (authUserError || !authUserData.user) {
      return res.status(401).json({
        error: formatSupabaseError(
          authUserError,
          "failed to load user after verification",
        ),
      });
    }

    try {
      user = await ensureAppUser(authUserData.user);
    } catch (profileError) {
      return res.status(500).json({
        error: formatSupabaseError(profileError, "failed to load user profile"),
      });
    }
  }

  return res.json({
    token: challenge.access_token,
    refreshToken: challenge.refresh_token,
    user,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: normalizedEmail,
    password: String(password),
  });

  if (error || !data.user || !data.session) {
    return res.status(401).json({
      error: formatSupabaseError(error, "invalid credentials"),
    });
  }

  try {
    const user = await ensureAppUser(data.user);
    return res.json({ token: data.session.access_token, user });
  } catch (profileError) {
    return res.status(500).json({
      error: formatSupabaseError(profileError, "failed to load user profile"),
    });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/questions", async (_req, res) => {
  try {
    const payload = await getQuestionsPayload();
    return res.json(payload);
  } catch (error) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(error, "failed to fetch questions") });
  }
});

app.post("/api/assessment/start", requireAuth, async (req, res) => {
  try {
    const { data: sessions, error: inProgressError } = await supabaseAdmin
      .from("assessment_sessions")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1);

    if (inProgressError) {
      return res.status(500).json({
        error: formatSupabaseError(inProgressError, "failed to read sessions"),
      });
    }

    if (sessions?.length) {
      return res.json({ session: toSession(sessions[0]) });
    }

    const { data: created, error: createError } = await supabaseAdmin
      .from("assessment_sessions")
      .insert({ user_id: req.user.id, status: "in_progress", area_scores: {} })
      .select("*")
      .single();

    if (createError || !created) {
      return res.status(500).json({
        error: formatSupabaseError(createError, "failed to start assessment"),
      });
    }

    return res.status(201).json({ session: toSession(created) });
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to start assessment"),
    });
  }
});

app.post("/api/assessment/save", requireAuth, async (req, res) => {
  const { sessionId, answers } = req.body ?? {};
  const assessmentMeta = normalizeSessionMetadataInput(
    req.body?.assessmentMeta,
  );
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers must be array" });
  }

  try {
    const session = await getSessionById(String(sessionId));
    if (!session) return res.status(404).json({ error: "session not found" });
    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: "forbidden" });
    }
    if (session.status !== "in_progress") {
      return res.status(400).json({ error: "session is not in_progress" });
    }

    const validAnswers = answers
      .map((answer) => ({
        question_id: Number(answer?.question_id),
        score: Number(answer?.score),
      }))
      .filter(
        (answer) =>
          Number.isInteger(answer.question_id) &&
          Number.isInteger(answer.score) &&
          answer.score >= 1 &&
          answer.score <= 5,
      )
      .map((answer) => ({
        session_id: String(sessionId),
        question_id: answer.question_id,
        score: answer.score,
      }));

    if (validAnswers.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("answers")
        .upsert(validAnswers, { onConflict: "session_id,question_id" });

      if (upsertError) {
        return res.status(500).json({
          error: formatSupabaseError(upsertError, "failed to save answers"),
        });
      }
    }

    let persistedSession = session;
    if (assessmentMeta) {
      const { data: updatedSession, error: sessionUpdateError } =
        await supabaseAdmin
          .from("assessment_sessions")
          .update(assessmentMeta)
          .eq("id", String(sessionId))
          .select("*")
          .single();

      if (sessionUpdateError || !updatedSession) {
        return res.status(500).json({
          error: formatSupabaseError(
            sessionUpdateError,
            "failed to save assessment details",
          ),
        });
      }

      persistedSession = updatedSession;
    }

    const { count, error: countError } = await supabaseAdmin
      .from("answers")
      .select("id", { count: "exact", head: true })
      .eq("session_id", String(sessionId));

    if (countError) {
      return res.status(500).json({
        error: formatSupabaseError(countError, "failed to count answers"),
      });
    }

    return res.json({
      session: toSession(persistedSession),
      savedAnswers: count ?? 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(error, "failed to save assessment") });
  }
});

app.post("/api/assessment/submit", requireAuth, async (req, res) => {
  const { sessionId } = req.body ?? {};
  const assessmentMeta = normalizeSessionMetadataInput(
    req.body?.assessmentMeta,
  );
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  try {
    const session = await getSessionById(String(sessionId));
    if (!session) return res.status(404).json({ error: "session not found" });
    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: "forbidden" });
    }
    if (session.status !== "in_progress") {
      return res.status(400).json({ error: "session is not in_progress" });
    }

    const payload = await getQuestionsPayload();
    const answerRows = await getAnswersBySession(String(sessionId));

    if (answerRows.length !== payload.questions.length) {
      return res
        .status(400)
        .json({ error: "all questions must be answered before submit" });
    }

    const answers = Object.fromEntries(
      answerRows.map((answer) => [answer.question_id, answer.score]),
    );

    const areaScores = calculateAreaScores(payload.questions, answers);
    const overallScore = calculateOverallScore(areaScores);

    const { data: completed, error: updateError } = await supabaseAdmin
      .from("assessment_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        area_scores: areaScores,
        overall_score: overallScore,
        ...(assessmentMeta ?? {}),
      })
      .eq("id", String(sessionId))
      .select("*")
      .single();

    if (updateError || !completed) {
      return res.status(500).json({
        error: formatSupabaseError(updateError, "failed to submit assessment"),
      });
    }

    const weakestAreas = payload.lifeAreas
      .map((area) => ({
        id: area.id,
        name: area.name,
        score: Number(areaScores[area.id] ?? 0),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const { error: clearDraftError } = await supabaseAdmin
      .from("assessment_drafts")
      .delete()
      .eq("user_id", req.user.id);

    if (clearDraftError) {
      console.error(
        "Failed to clear assessment draft after completion:",
        formatSupabaseError(clearDraftError, "unknown error"),
      );
    }

    return res.json({ session: toSession(completed), weakestAreas });
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to submit assessment"),
    });
  }
});

app.get("/api/assessment/result/:sessionId", requireAuth, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "session not found" });
    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: "forbidden" });
    }

    const answerRows = await getAnswersBySession(session.id);
    const answers = Object.fromEntries(
      answerRows.map((answer) => [answer.question_id, answer.score]),
    );

    return res.json({
      session: toSession(session),
      answers,
    });
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to fetch assessment"),
    });
  }
});

app.get("/api/assessment/current", requireAuth, async (req, res) => {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from("assessment_sessions")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1);

    if (error) {
      return res
        .status(500)
        .json({ error: formatSupabaseError(error, "failed to fetch session") });
    }

    const session = sessions?.[0] ?? null;
    if (!session) return res.json({ session: null, answers: [] });

    const answerRows = await getAnswersBySession(session.id);
    const answers = answerRows.map((answer) => ({
      question_id: Number(answer.question_id),
      score: Number(answer.score),
    }));

    return res.json({ session: toSession(session), answers });
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to fetch current assessment"),
    });
  }
});

app.get("/api/assessment/draft", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("assessment_drafts")
    .select("step, route, draft, saved_at")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to load assessment draft"),
    });
  }

  if (!data) {
    return res.json({ draft: null });
  }

  const draftPayload =
    data.draft && typeof data.draft === "object" ? data.draft : {};

  return res.json({
    draft: {
      ...draftPayload,
      step: Number(data.step),
      route: String(data.route || "/assessment"),
      savedAt: data.saved_at,
    },
  });
});

app.put("/api/assessment/draft", requireAuth, async (req, res) => {
  const payload = req.body?.draft;

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "draft payload is required" });
  }

  const step = Number(payload.step);
  const route = String(payload.route ?? "").trim();
  const savedAt =
    typeof payload.savedAt === "string" && payload.savedAt.trim()
      ? payload.savedAt.trim()
      : new Date().toISOString();

  if (![1, 2, 3].includes(step)) {
    return res.status(400).json({ error: "draft step must be 1, 2, or 3" });
  }

  if (!route) {
    return res.status(400).json({ error: "draft route is required" });
  }

  const normalizedDraft = {
    step1:
      payload.step1 && typeof payload.step1 === "object" ? payload.step1 : {},
    step2:
      payload.step2 && typeof payload.step2 === "object" ? payload.step2 : {},
    step3:
      payload.step3 && typeof payload.step3 === "object" ? payload.step3 : {},
  };

  const { error } = await supabaseAdmin.from("assessment_drafts").upsert(
    {
      user_id: req.user.id,
      step,
      route,
      draft: normalizedDraft,
      saved_at: savedAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to save assessment draft"),
    });
  }

  return res.json({ ok: true });
});

app.delete("/api/assessment/draft", requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin
    .from("assessment_drafts")
    .delete()
    .eq("user_id", req.user.id);

  if (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to clear assessment draft"),
    });
  }

  return res.json({ ok: true });
});

app.get("/api/assessment/:id", requireAuth, async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: "session not found" });
    if (session.user_id !== req.user.id) {
      return res.status(403).json({ error: "forbidden" });
    }

    const answerRows = await getAnswersBySession(session.id);
    const answers = answerRows.map((answer) => ({
      question_id: Number(answer.question_id),
      score: Number(answer.score),
    }));

    return res.json({ session: toSession(session), answers });
  } catch (error) {
    return res.status(500).json({
      error: formatSupabaseError(error, "failed to fetch assessment"),
    });
  }
});

app.post("/api/habits", requireAuth, async (req, res) => {
  const {
    name,
    description = "",
    life_area_id,
    frequency = "daily",
  } = req.body ?? {};

  const normalizedName = String(name ?? "").trim();
  const normalizedDescription = String(description ?? "");
  const lifeAreaId = Number(life_area_id);

  if (!normalizedName) {
    return res.status(400).json({ error: "habit name is required" });
  }

  if (!Number.isInteger(lifeAreaId) || lifeAreaId < 1) {
    return res.status(400).json({ error: "valid life_area_id is required" });
  }

  if (!["daily", "weekly"].includes(String(frequency))) {
    return res.status(400).json({ error: "invalid frequency" });
  }

  const { data: habit, error } = await supabaseAdmin
    .from("habits")
    .insert({
      user_id: req.user.id,
      name: normalizedName,
      description: normalizedDescription,
      life_area_id: lifeAreaId,
      frequency,
    })
    .select("*")
    .single();

  if (error || !habit) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(error, "failed to create habit") });
  }

  return res.status(201).json({
    habit: {
      ...habit,
      streak: 0,
      weekly_consistency: 0,
    },
  });
});

app.get("/api/habits", requireAuth, async (req, res) => {
  const timezoneOffsetMinutes = Number(req.query.tzOffsetMinutes ?? 0);
  const { data: habits, error: habitsError } = await supabaseAdmin
    .from("habits")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (habitsError) {
    return res.status(500).json({
      error: formatSupabaseError(habitsError, "failed to fetch habits"),
    });
  }

  if (!habits || habits.length === 0) {
    return res.json({ habits: [] });
  }

  const habitIds = habits.map((habit) => habit.id);
  const { data: logs, error: logsError } = await supabaseAdmin
    .from("habit_logs")
    .select("habit_id, date, completed")
    .in("habit_id", habitIds);

  if (logsError) {
    return res.status(500).json({
      error: formatSupabaseError(logsError, "failed to fetch habit logs"),
    });
  }

  const logsByHabit = new Map();
  for (const log of logs ?? []) {
    const current = logsByHabit.get(log.habit_id) ?? [];
    current.push(log);
    logsByHabit.set(log.habit_id, current);
  }

  const today = getDateKeyForTimezoneOffset(timezoneOffsetMinutes);
  const recentDateKeys = getRecentDateKeysForTimezoneOffset(
    timezoneOffsetMinutes,
    7,
  );

  const enrichedHabits = habits.map((habit) => {
    const metrics = computeHabitMetrics(logsByHabit.get(habit.id) ?? [], {
      todayKey: today,
      recentDateKeys,
    });
    return {
      ...habit,
      streak: metrics.streak,
      weekly_consistency: Number(metrics.weeklyConsistency.toFixed(2)),
      completed_today: (logsByHabit.get(habit.id) ?? []).some(
        (l) => l.date === today && l.completed,
      ),
    };
  });
  const completedTodayCount = (logs ?? []).filter(
    (log) => log.date === today && log.completed,
  ).length;

  const weeklyActivity = recentDateKeys.map((dayKey) =>
    (logs ?? []).some((log) => log.date === dayKey && log.completed),
  );

  const streakValues = enrichedHabits.map((habit) => habit.streak ?? 0);
  const bestStreak = streakValues.length ? Math.max(...streakValues) : 0;

  return res.json({
    habits: enrichedHabits,
    summary: {
      totalHabits: enrichedHabits.length,
      completedTodayCount,
      currentStreak: bestStreak,
      bestStreak,
      weeklyActivity,
    },
  });
});

app.post("/api/habits/log", requireAuth, async (req, res) => {
  const { habitId, date, completed } = req.body ?? {};
  if (!habitId || !date || typeof completed !== "boolean") {
    return res.status(400).json({ error: "habitId, date, completed required" });
  }

  if (!isValidIsoDateOnly(date)) {
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
  }

  const { data: habit, error: habitError } = await supabaseAdmin
    .from("habits")
    .select("id, user_id")
    .eq("id", habitId)
    .single();

  if (isNoRowsError(habitError) || !habit) {
    return res.status(404).json({ error: "habit not found" });
  }

  if (habitError) {
    return res.status(500).json({
      error: formatSupabaseError(habitError, "failed to fetch habit"),
    });
  }

  if (habit.user_id !== req.user.id) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { error: upsertError } = await supabaseAdmin
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, date, completed },
      { onConflict: "habit_id,date" },
    );

  if (upsertError) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(upsertError, "failed to save log") });
  }

  return res.json({ ok: true });
});

app.put("/api/habits/:id", requireAuth, async (req, res) => {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("habits")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (isNoRowsError(existingError) || !existing) {
    return res.status(404).json({ error: "habit not found" });
  }

  if (existingError) {
    return res.status(500).json({
      error: formatSupabaseError(existingError, "failed to fetch habit"),
    });
  }

  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { name, description, life_area_id, frequency } = req.body ?? {};
  if (frequency && !["daily", "weekly"].includes(frequency)) {
    return res.status(400).json({ error: "invalid frequency" });
  }

  const updates = {};
  if (typeof name !== "undefined") {
    const normalizedName = String(name).trim();
    if (!normalizedName) {
      return res.status(400).json({ error: "habit name cannot be empty" });
    }
    updates.name = normalizedName;
  }
  if (typeof description !== "undefined") {
    updates.description = String(description);
  }
  if (typeof life_area_id !== "undefined") {
    const normalizedLifeAreaId = Number(life_area_id);
    if (!Number.isInteger(normalizedLifeAreaId) || normalizedLifeAreaId < 1) {
      return res.status(400).json({ error: "invalid life_area_id" });
    }
    updates.life_area_id = normalizedLifeAreaId;
  }
  if (typeof frequency !== "undefined") updates.frequency = frequency;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("habits")
    .update(updates)
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return res.status(500).json({
      error: formatSupabaseError(updateError, "failed to update habit"),
    });
  }

  const { data: logs, error: logsError } = await supabaseAdmin
    .from("habit_logs")
    .select("habit_id, date, completed")
    .eq("habit_id", req.params.id);

  if (logsError) {
    return res.status(500).json({
      error: formatSupabaseError(logsError, "failed to fetch habit metrics"),
    });
  }

  const metrics = computeHabitMetrics(logs ?? [], {
    todayKey: getDateKeyForTimezoneOffset(0),
    recentDateKeys: getRecentDateKeysForTimezoneOffset(0, 7),
  });

  return res.json({
    habit: {
      ...updated,
      streak: metrics.streak,
      weekly_consistency: Number(metrics.weeklyConsistency.toFixed(2)),
    },
  });
});

app.delete("/api/habits/:id", requireAuth, async (req, res) => {
  const { data: habit, error: habitError } = await supabaseAdmin
    .from("habits")
    .select("id, user_id")
    .eq("id", req.params.id)
    .single();

  if (isNoRowsError(habitError) || !habit) {
    return res.status(404).json({ error: "habit not found" });
  }

  if (habitError) {
    return res.status(500).json({
      error: formatSupabaseError(habitError, "failed to fetch habit"),
    });
  }

  if (habit.user_id !== req.user.id) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("habits")
    .delete()
    .eq("id", req.params.id);

  if (deleteError) {
    return res.status(500).json({
      error: formatSupabaseError(deleteError, "failed to delete habit"),
    });
  }

  return res.status(204).send();
});

app.get("/api/progress/comparison", requireAuth, async (req, res) => {
  const { data: completed, error: sessionsError } = await supabaseAdmin
    .from("assessment_sessions")
    .select("id, area_scores, completed_at")
    .eq("user_id", req.user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(2);

  if (sessionsError) {
    return res.status(500).json({
      error: formatSupabaseError(sessionsError, "failed to fetch progress"),
    });
  }

  if (!completed || completed.length < 2) {
    return res.json({ comparison: [] });
  }

  const [latest, previous] = completed;
  const { data: lifeAreas, error: lifeAreasError } = await supabaseAdmin
    .from("life_areas")
    .select("id, name")
    .order("id");

  if (lifeAreasError) {
    return res.status(500).json({
      error: formatSupabaseError(lifeAreasError, "failed to fetch life areas"),
    });
  }

  const areas = lifeAreas?.length ? lifeAreas : seedLifeAreas;
  const latestScores = normalizeAreaScores(latest.area_scores);
  const previousScores = normalizeAreaScores(previous.area_scores);

  const comparison = areas.map((area) => {
    const previousScore = Number(previousScores[area.id] ?? 0);
    const latestScore = Number(latestScores[area.id] ?? 0);
    return {
      life_area_id: area.id,
      life_area_name: area.name,
      previous_score: previousScore,
      latest_score: latestScore,
      change: latestScore - previousScore,
    };
  });

  return res.json({ comparison });
});

app.get("/api/recommendations", requireAuth, async (req, res) => {
  const { data: latestSessions, error: sessionError } = await supabaseAdmin
    .from("assessment_sessions")
    .select("area_scores, completed_at, selected_area_ids")
    .eq("user_id", req.user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1);

  if (sessionError) {
    return res.status(500).json({
      error: formatSupabaseError(sessionError, "failed to fetch assessment"),
    });
  }

  const latest = latestSessions?.[0] ?? null;
  if (!latest) {
    return res.json({ recommendations: [], library: recommendationLibrary });
  }

  const { data: lifeAreas, error: lifeAreasError } = await supabaseAdmin
    .from("life_areas")
    .select("id, name")
    .order("id");

  if (lifeAreasError) {
    return res.status(500).json({
      error: formatSupabaseError(lifeAreasError, "failed to fetch life areas"),
    });
  }

  const areas = lifeAreas?.length ? lifeAreas : seedLifeAreas;
  const areaScores = normalizeAreaScores(latest.area_scores);
  const selectedAreaIds = normalizeIntegerList(latest.selected_area_ids, {
    min: 1,
  });

  const scopedAreas = selectedAreaIds.length
    ? areas.filter((area) => selectedAreaIds.includes(area.id))
    : areas;

  const rankedAreas = scopedAreas
    .map((area) => ({
      ...area,
      score: Number(areaScores[area.id] ?? 0),
    }))
    .sort((a, b) => a.score - b.score);

  const lowestAreaIds = rankedAreas.slice(0, 2).map((area) => area.id);
  const areaNameById = new Map(areas.map((area) => [area.id, area.name]));

  let recommendations = recommendationLibrary.filter((item) =>
    lowestAreaIds.includes(item.life_area_id),
  );

  if (!recommendations.length) {
    recommendations = recommendationLibrary.filter(
      (item) => item.life_area_id === null,
    );
  }

  return res.json({
    recommendations: recommendations.map((item) => ({
      ...item,
      life_area_name: item.life_area_id
        ? (areaNameById.get(item.life_area_id) ?? null)
        : null,
    })),
    library: recommendationLibrary,
  });
});

// DEBUG: temporary endpoints to help local development and troubleshooting.
// These endpoints are intentionally unauthenticated to make local testing easy.
// Remove or protect them before deploying to any shared environment.
app.post("/api/debug/seed-habits", async (req, res) => {
  const { userId } = req.body ?? {};
  const normalizedUserId = String(userId ?? "").trim();
  if (!normalizedUserId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const sampleHabits = [
    {
      user_id: normalizedUserId,
      name: "Evening walk",
      description: "20-minute walk after dinner",
      life_area_id: 1,
      frequency: "daily",
    },
    {
      user_id: normalizedUserId,
      name: "Drink 2L water",
      description: "Track water intake",
      life_area_id: 1,
      frequency: "daily",
    },
    {
      user_id: normalizedUserId,
      name: "Weekly money review",
      description: "10-minute budget check",
      life_area_id: 7,
      frequency: "weekly",
    },
  ];

  try {
    const { data, error } = await supabaseAdmin
      .from("habits")
      .insert(sampleHabits)
      .select("*");
    if (error) {
      return res
        .status(500)
        .json({ error: formatSupabaseError(error, "failed to seed habits") });
    }
    return res.status(201).json({ habits: data ?? [] });
  } catch (err) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(err, "unknown error") });
  }
});

// Authenticated variant: seeds sample habits for the current authenticated user.
app.post("/api/debug/seed-habits/me", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId)
    return res
      .status(400)
      .json({ error: "authenticated user id not available" });

  const sampleHabits = [
    {
      user_id: userId,
      name: "Evening walk",
      description: "20-minute walk after dinner",
      life_area_id: 1,
      frequency: "daily",
    },
    {
      user_id: userId,
      name: "Drink 2L water",
      description: "Track water intake",
      life_area_id: 1,
      frequency: "daily",
    },
    {
      user_id: userId,
      name: "Weekly money review",
      description: "10-minute budget check",
      life_area_id: 7,
      frequency: "weekly",
    },
  ];

  try {
    const { data, error } = await supabaseAdmin
      .from("habits")
      .insert(sampleHabits)
      .select("*");
    if (error) {
      return res
        .status(500)
        .json({ error: formatSupabaseError(error, "failed to seed habits") });
    }
    return res.status(201).json({ habits: data ?? [] });
  } catch (err) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(err, "unknown error") });
  }
});

app.get("/api/debug/list-habits", async (req, res) => {
  const userId = String(req.query.userId ?? "").trim();
  if (!userId)
    return res.status(400).json({ error: "userId query param is required" });

  try {
    const { data, error } = await supabaseAdmin
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res
        .status(500)
        .json({ error: formatSupabaseError(error, "failed to fetch habits") });
    }

    return res.json({ habits: data ?? [] });
  } catch (err) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(err, "unknown error") });
  }
});

app.get("/api/progress/history", requireAuth, async (req, res) => {
  const { data: sessions, error } = await supabaseAdmin
    .from("assessment_sessions")
    .select("*")
    .eq("user_id", req.user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: true });

  if (error) {
    return res
      .status(500)
      .json({ error: formatSupabaseError(error, "failed to fetch history") });
  }

  return res.json({ sessions: (sessions ?? []).map(toSession) });
});

app.use("/api", (_req, res) => {
  return res.status(404).json({ error: "route not found" });
});

app.use(
  express.static(clientDistPath, {
    index: false,
    setHeaders: (res, servedFilePath) => {
      const relativePath = path.relative(clientDistPath, servedFilePath);
      if (relativePath.startsWith(`assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  const requestsHtml = Boolean(req.accepts("html"));
  const hasFileExtension = path.extname(req.path) !== "";
  if (!requestsHtml || hasFileExtension) {
    return res.status(404).send("Not found");
  }

  if (existsSync(clientIndexPath)) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.sendFile(clientIndexPath);
  }

  return res
    .status(404)
    .send("Client build not found. Run npm run build --prefix client.");
});

async function bootstrap() {
  try {
    await ensureReferenceData();
  } catch (error) {
    console.error(
      "Supabase reference seed skipped:",
      formatSupabaseError(error, "unknown error"),
    );
    console.error(
      "Apply SQL from server/supabase/schema.sql in your Supabase project, then restart the API.",
    );
  }

  if (!isMailtrapConfigured) {
    console.warn(
      "Mailtrap is not configured. Set MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL to enable transactional emails.",
    );
  }

  app.listen(PORT, () => {
    console.log(`CoreLife API running on http://localhost:${PORT}`);
  });
}

bootstrap();
