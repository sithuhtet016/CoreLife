import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
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

connectSrc.add("https://*.supabase.co");
connectSrc.add("wss://*.supabase.co");
if (supabaseOrigin) {
  connectSrc.add(supabaseOrigin);
}

imgSrc.add("https://images.unsplash.com");
imgSrc.add("https://storage.googleapis.com");

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        connectSrc: [...connectSrc],
        imgSrc: [...imgSrc],
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

function toSession(session) {
  return {
    ...session,
    area_scores: normalizeAreaScores(session.area_scores),
  };
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

function computeHabitMetrics(logs) {
  const sorted = [...logs].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (!sorted[i].completed) break;
    streak += 1;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const recent = sorted.filter((log) => new Date(log.date) >= sevenDaysAgo);
  const completedRecent = recent.filter((log) => log.completed).length;
  const weeklyConsistency = recent.length
    ? (completedRecent / recent.length) * 100
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
    return res.status(400).json({
      error:
        "Registration succeeded, but no active session returned. Confirm your email and then log in.",
    });
  }

  try {
    const user = await ensureAppUser(data.user);

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
      session: toSession(session),
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

  if (!normalizedName || !Number.isInteger(lifeAreaId)) {
    return res.status(400).json({ error: "missing required fields" });
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

  const enrichedHabits = habits.map((habit) => {
    const metrics = computeHabitMetrics(logsByHabit.get(habit.id) ?? []);
    return {
      ...habit,
      streak: metrics.streak,
      weekly_consistency: Number(metrics.weeklyConsistency.toFixed(2)),
    };
  });

  return res.json({ habits: enrichedHabits });
});

app.post("/api/habits/log", requireAuth, async (req, res) => {
  const { habitId, date, completed } = req.body ?? {};
  if (!habitId || !date || typeof completed !== "boolean") {
    return res.status(400).json({ error: "habitId, date, completed required" });
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
  if (typeof name !== "undefined") updates.name = String(name).trim();
  if (typeof description !== "undefined") {
    updates.description = String(description);
  }
  if (typeof life_area_id !== "undefined") {
    updates.life_area_id = Number(life_area_id);
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

  const metrics = computeHabitMetrics(logs ?? []);

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
