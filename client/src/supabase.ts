import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const STORAGE_MODE_KEY = "corelife_auth_storage_mode";

type StorageMode = "local" | "session";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorageMode(): StorageMode {
  if (!isBrowser()) return "local";
  return window.localStorage.getItem(STORAGE_MODE_KEY) === "session"
    ? "session"
    : "local";
}

function getPreferredStorage(mode: StorageMode): Storage {
  return mode === "session" ? window.sessionStorage : window.localStorage;
}

function getFallbackStorage(mode: StorageMode): Storage {
  return mode === "session" ? window.localStorage : window.sessionStorage;
}

export function setRememberSessionPreference(rememberMe: boolean) {
  if (!isBrowser()) return;
  const mode: StorageMode = rememberMe ? "local" : "session";
  window.localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export function getRememberSessionPreference() {
  return readStorageMode() === "local";
}

const dynamicSessionStorage = {
  getItem(key: string) {
    if (!isBrowser()) return null;

    const mode = readStorageMode();
    const preferred = getPreferredStorage(mode);
    const fallback = getFallbackStorage(mode);

    const preferredValue = preferred.getItem(key);
    if (preferredValue !== null) {
      return preferredValue;
    }

    const fallbackValue = fallback.getItem(key);
    if (fallbackValue !== null) {
      preferred.setItem(key, fallbackValue);
      fallback.removeItem(key);
    }

    return fallbackValue;
  },
  setItem(key: string, value: string) {
    if (!isBrowser()) return;

    const mode = readStorageMode();
    const preferred = getPreferredStorage(mode);
    const fallback = getFallbackStorage(mode);

    preferred.setItem(key, value);
    fallback.removeItem(key);
  },
  removeItem(key: string) {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: dynamicSessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
