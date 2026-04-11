import type {
  AnswerInput,
  AssessmentSession,
  AuthResponse,
  AuthUser,
  Habit,
  LifeArea,
  Question,
} from "./types";
import {
  getRememberSessionPreference,
  setRememberSessionPreference,
  supabase,
} from "./supabase";

const TOKEN_KEY = "corelife_token";

type RegisterOptions = {
  fullName?: string;
  promoEmailOptIn?: boolean;
  rememberMe?: boolean;
};

type LoginOptions = {
  rememberMe?: boolean;
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
}

export function clearStoredToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
}

export async function syncStoredTokenFromSession() {
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
}

async function getTokenForRequest() {
  try {
    return await syncStoredTokenFromSession();
  } catch {
    return getStoredToken();
  }
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
  return response.json() as Promise<T>;
}

export async function register(
  email: string,
  password: string,
  options: RegisterOptions = {},
) {
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

  if (!data.session) {
    throw new Error(
      "Registration succeeded, but no active session was created. Confirm your email and then sign in.",
    );
  }

  setStoredToken(data.session.access_token);

  return {
    token: data.session.access_token,
    user: normalizeAuthUser(data.user),
  } satisfies AuthResponse;
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

export function saveAssessment(sessionId: string, answers: AnswerInput[]) {
  return request<{ session: AssessmentSession; savedAnswers: number }>(
    "/api/assessment/save",
    {
      method: "POST",
      body: JSON.stringify({ sessionId, answers }),
    },
  );
}

export function submitAssessment(sessionId: string) {
  return request<{
    session: AssessmentSession;
    weakestAreas: Array<{ id: number; score: number; name: string }>;
  }>("/api/assessment/submit", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function getCurrentAssessment() {
  return request<{ session: AssessmentSession | null; answers: AnswerInput[] }>(
    "/api/assessment/current",
  );
}

export function getHabits() {
  return request<{ habits: Habit[] }>("/api/habits");
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
