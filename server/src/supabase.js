import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY in server environment",
  );
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

const adminKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseServiceRoleKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not configured. Falling back to anon key for server client.",
  );
}

export const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
  clientOptions,
);

export const supabaseAdmin = createClient(supabaseUrl, adminKey, clientOptions);

export const isServiceRoleConfigured = Boolean(supabaseServiceRoleKey);
