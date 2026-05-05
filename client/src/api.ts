import type {
  AnswerInput,
  AssessmentMetadataInput,
  AssessmentSession,
  AuthResponse,
  AuthUser,
  Habit,
  HabitSummary,
  LifeArea,
  Question,
  Recommendation,
} from "./types";
import {
  getRememberSessionPreference,
  setRememberSessionPreference,
  supabase,
} from "./supabase";
import { getBrowserTimezoneOffsetMinutes } from "./utils/dateTime";

const TOKEN_KEY = "corelife_token";
const TRUSTED_LOGIN_KEY = "corelife_trusted_login";
let hasCompletedAssessmentCache: boolean | null = null;
let hasCompletedAssessmentCacheToken: string | null = null;

type TrustedLoginRecord = {
  email: string;
  trustedAt: string;
};

type RegisterOptions = {
  fullName?: string;
  promoEmailOptIn?: boolean;
  rememberMe?: boolean;
};

type LoginOptions = {
  rememberMe?: boolean;
};

export type LoginOtpChallenge = {
  challengeId: string;
  destination: string;
  expiresInSeconds: number;
};

export type RegisterResult =
  | ({ requiresEmailVerification: false } & AuthResponse)
  | {
      requiresEmailVerification: true;
      email: string;
      message: string;
    };

function isBrowser() {
  return typeof window !== "undefined";
}

function getPrimaryTokenStorage() {
  if (!isBrowser()) return null;
  return getRememberSessionPreference()
    ? window.localStorage
    : window.sessionStorage;
}

function getSecondaryTokenStorage(primary: Storage) {
  return primary === window.localStorage
    ? window.sessionStorage
    : window.localStorage;
}

function formatAuthError(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function readTrustedLoginRecord(): TrustedLoginRecord | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(TRUSTED_LOGIN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as TrustedLoginRecord;
    if (!parsed?.email || typeof parsed.email !== "string") return null;
    return {
      email: normalizeEmail(parsed.email),
      trustedAt: parsed.trustedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function normalizeAuthUser(payload: {
  id: string;
  email?: string | null;
  full_name?: string | null;
  promo_email_opt_in?: boolean;
  promo_email_opt_in_at?: string | null;
  created_at?: string;
}): AuthUser {
  return {
    id: payload.id,
    email: payload.email ?? "",
    full_name: payload.full_name ?? null,
    promo_email_opt_in: Boolean(payload.promo_email_opt_in),
    promo_email_opt_in_at: payload.promo_email_opt_in_at ?? null,
    created_at: payload.created_at ?? new Date().toISOString(),
  };
}

export function getStoredToken() {
  if (!isBrowser()) return null;
  return (
    window.localStorage.getItem(TOKEN_KEY) ??
    window.sessionStorage.getItem(TOKEN_KEY)
  );
}

export function setStoredToken(token: string) {
  const primary = getPrimaryTokenStorage();
  if (!primary) return;

  const secondary = getSecondaryTokenStorage(primary);
  primary.setItem(TOKEN_KEY, token);
  secondary.removeItem(TOKEN_KEY);
  hasCompletedAssessmentCache = null;
  hasCompletedAssessmentCacheToken = null;
}

export function clearStoredToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  hasCompletedAssessmentCache = null;
  hasCompletedAssessmentCacheToken = null;
}

export function hasTrustedRememberedLogin(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  const record = readTrustedLoginRecord();
  return Boolean(record && record.email === normalizedEmail);
}

export function saveTrustedRememberedLogin(email: string) {
  if (!isBrowser()) return;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const record: TrustedLoginRecord = {
    email: normalizedEmail,
    trustedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(TRUSTED_LOGIN_KEY, JSON.stringify(record));
}

export function clearTrustedRememberedLogin(email?: string) {
  if (!isBrowser()) return;

  if (!email) {
    window.localStorage.removeItem(TRUSTED_LOGIN_KEY);
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const record = readTrustedLoginRecord();
  if (record && record.email === normalizedEmail) {
    window.localStorage.removeItem(TRUSTED_LOGIN_KEY);
  }
}

let sessionSyncPromise: Promise<string | null> | null = null;

export async function syncStoredTokenFromSession() {
  if (sessionSyncPromise) {
    return sessionSyncPromise;
  }

  sessionSyncPromise = (async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message || "Failed to read auth session");
    }

    const accessToken = data.session?.access_token ?? null;
    if (accessToken) {
      setStoredToken(accessToken);
    } else {
      clearStoredToken();
    }

    return accessToken;
  })();

  try {
    return await sessionSyncPromise;
  } finally {
    sessionSyncPromise = null;
  }
}

async function getTokenForRequest() {
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  return await syncStoredTokenFromSession();
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = await getTokenForRequest();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? (text as T) : (undefined as T);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

async function subscribeToPromotions(email: string, fullName?: string) {
  await request<{ ok: boolean }>("/api/promotions/subscribe", {
    method: "POST",
    body: JSON.stringify({
      email,
      fullName: fullName?.trim() || null,
      source: "register",
    }),
  });
}

export async function register(
  email: string,
  password: string,
  options: RegisterOptions = {},
): Promise<RegisterResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const fullName = options.fullName?.trim() ?? "";
  const promoEmailOptIn = Boolean(options.promoEmailOptIn);

  setRememberSessionPreference(options.rememberMe ?? true);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: fullName || null,
        promo_email_opt_in: promoEmailOptIn,
        promo_email_opt_in_at: promoEmailOptIn
          ? new Date().toISOString()
          : null,
      },
    },
  });

  if (error || !data.user) {
    throw new Error(formatAuthError(error, "Registration failed"));
  }

  if (promoEmailOptIn) {
    try {
      await subscribeToPromotions(normalizedEmail, fullName);
    } catch (subscriptionError) {
      // Marketing sync should not block successful account creation.
      console.error(
        "Failed to subscribe promotional messages:",
        subscriptionError,
      );
    }
  }

  if (!data.session) {
    return {
      requiresEmailVerification: true,
      email: normalizedEmail,
      message:
        "Account created. Enter the OTP sent to your email to verify your account.",
    };
  }

  setStoredToken(data.session.access_token);

  return {
    requiresEmailVerification: false,
    token: data.session.access_token,
    user: normalizeAuthUser(data.user),
  };
}

export async function verifyRegistrationOtp(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const token = otp.trim();

  if (!normalizedEmail) {
    throw new Error("Email is required for OTP verification");
  }

  if (!token) {
    throw new Error("OTP code is required");
  }

  const otpTypes: Array<"signup" | "email"> = ["signup", "email"];
  let lastError: unknown = null;

  for (const type of otpTypes) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type,
    });

    if (!error && data.user && data.session) {
      setStoredToken(data.session.access_token);

      return {
        token: data.session.access_token,
        user: normalizeAuthUser(data.user),
      } satisfies AuthResponse;
    }

    lastError = error ?? lastError;
  }

  throw new Error(formatAuthError(lastError, "Invalid or expired OTP code"));
}

export async function resendRegistrationOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required to resend OTP");
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
  });

  if (error) {
    throw new Error(formatAuthError(error, "Failed to resend OTP"));
  }
}

export async function login(
  email: string,
  password: string,
  options: LoginOptions = {},
) {
  const normalizedEmail = email.trim().toLowerCase();
  setRememberSessionPreference(options.rememberMe ?? true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(formatAuthError(error, "Login failed"));
  }

  setStoredToken(data.session.access_token);

  return {
    token: data.session.access_token,
    user: normalizeAuthUser(data.user),
  } satisfies AuthResponse;
}

export async function startLoginOtpChallenge(
  email: string,
  password: string,
  options: LoginOptions = {},
) {
  const normalizedEmail = email.trim().toLowerCase();
  setRememberSessionPreference(options.rememberMe ?? true);

  return request<LoginOtpChallenge>("/api/auth/login/2fa/start", {
    method: "POST",
    body: JSON.stringify({
      email: normalizedEmail,
      password,
    }),
  });
}

export type RecommendationsResponse = {
  recommendations: Recommendation[];
  library: Recommendation[];
};

export async function getRecommendations() {
  return request<RecommendationsResponse>("/api/recommendations");
}

export async function verifyLoginOtpChallenge(
  challengeId: string,
  code: string,
) {
  const normalizedChallengeId = challengeId.trim();
  const normalizedCode = code.trim();

  if (!normalizedChallengeId) {
    throw new Error("Missing login challenge id");
  }

  if (!normalizedCode) {
    throw new Error("Verification code is required");
  }

  const data = await request<
    AuthResponse & {
      refreshToken: string;
    }
  >("/api/auth/login/2fa/verify", {
    method: "POST",
    body: JSON.stringify({
      challengeId: normalizedChallengeId,
      code: normalizedCode,
    }),
  });

  const { error } = await supabase.auth.setSession({
    access_token: data.token,
    refresh_token: data.refreshToken,
  });

  if (error) {
    throw new Error(formatAuthError(error, "Failed to persist auth session"));
  }

  setStoredToken(data.token);

  return {
    token: data.token,
    user: data.user,
  } satisfies AuthResponse;
}

export async function resendLoginOtpChallenge(challengeId: string) {
  const normalizedChallengeId = challengeId.trim();

  if (!normalizedChallengeId) {
    throw new Error("Missing login challenge id");
  }

  return request<{
    ok: boolean;
    destination: string;
    expiresInSeconds: number;
  }>("/api/auth/login/2fa/resend", {
    method: "POST",
    body: JSON.stringify({
      challengeId: normalizedChallengeId,
    }),
  });
}

export async function signOutUser() {
  await supabase.auth.signOut();
  clearStoredToken();
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  const redirectTo = isBrowser()
    ? `${window.location.origin}/reset-password`
    : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (error) {
    throw new Error(formatAuthError(error, "Failed to request password reset"));
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(formatAuthError(error, "Failed to load session"));
  }
  return data.session;
}

export async function resetPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(formatAuthError(error, "Failed to reset password"));
  }

  await syncStoredTokenFromSession();
}

export function getMe() {
  return request<{ user: AuthUser }>("/api/auth/me");
}

export function getQuestions() {
  return request<{ lifeAreas: LifeArea[]; questions: Question[] }>(
    "/api/questions",
  );
}

export function startAssessment() {
  return request<{ session: AssessmentSession }>("/api/assessment/start", {
    method: "POST",
  });
}

export function saveAssessment(
  sessionId: string,
  answers: AnswerInput[],
  assessmentMeta?: AssessmentMetadataInput,
) {
  return request<{ session: AssessmentSession; savedAnswers: number }>(
    "/api/assessment/save",
    {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        answers,
        ...(assessmentMeta ? { assessmentMeta } : {}),
      }),
    },
  );
}

export function submitAssessment(
  sessionId: string,
  assessmentMeta?: AssessmentMetadataInput,
) {
  return request<{
    session: AssessmentSession;
    weakestAreas: Array<{ id: number; score: number; name: string }>;
  }>("/api/assessment/submit", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      ...(assessmentMeta ? { assessmentMeta } : {}),
    }),
  }).then((result) => {
    hasCompletedAssessmentCache = true;
    hasCompletedAssessmentCacheToken = getStoredToken();
    return result;
  });
}

export function getAssessmentDraftCloud() {
  return request<{ draft: Record<string, unknown> | null }>(
    "/api/assessment/draft",
  );
}

export function saveAssessmentDraftCloud(draft: Record<string, unknown>) {
  return request<{ ok: boolean }>("/api/assessment/draft", {
    method: "PUT",
    body: JSON.stringify({ draft }),
  });
}

export function clearAssessmentDraftCloud() {
  return request<{ ok: boolean }>("/api/assessment/draft", {
    method: "DELETE",
  });
}

export function getCurrentAssessment() {
  return request<{ session: AssessmentSession | null; answers: AnswerInput[] }>(
    "/api/assessment/current",
  );
}

export function getHabits() {
  const params = new URLSearchParams({
    tzOffsetMinutes: String(getBrowserTimezoneOffsetMinutes()),
  });
  return request<{ habits: Habit[]; summary: HabitSummary }>(
    `/api/habits?${params.toString()}`,
  );
}

export function createHabit(payload: {
  name: string;
  description: string;
  life_area_id: number;
  frequency: "daily" | "weekly";
}) {
  return request<{ habit: Habit }>("/api/habits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logHabit(habitId: string, date: string, completed: boolean) {
  return request<{ ok: true }>("/api/habits/log", {
    method: "POST",
    body: JSON.stringify({ habitId, date, completed }),
  });
}

export function updateHabit(
  id: string,
  payload: {
    name?: string;
    description?: string;
    life_area_id?: number;
    frequency?: "daily" | "weekly";
  },
) {
  return request<{ habit: Habit }>(`/api/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteHabit(id: string) {
  return request<{ ok: boolean }>(`/api/habits/${id}`, {
    method: "DELETE",
  });
}

export function getComparison() {
  return request<{
    comparison: Array<{
      life_area_id: number;
      life_area_name: string;
      previous_score: number;
      latest_score: number;
      change: number;
    }>;
  }>("/api/progress/comparison");
}

export function getProgressHistory() {
  return request<{ sessions: AssessmentSession[] }>("/api/progress/history");
}

export async function hasCompletedAssessment(forceRefresh = false) {
  const activeToken = getStoredToken();
  const cachedToken = hasCompletedAssessmentCacheToken;

  if (
    !forceRefresh &&
    hasCompletedAssessmentCache !== null &&
    cachedToken !== null &&
    activeToken === cachedToken
  ) {
    return hasCompletedAssessmentCache;
  }

  const { sessions } = await request<{ sessions: AssessmentSession[] }>(
    "/api/progress/history",
  );

  const hasCompleted = Array.isArray(sessions) && sessions.length > 0;
  hasCompletedAssessmentCache = hasCompleted;
  hasCompletedAssessmentCacheToken = activeToken;
  return hasCompleted;
}
