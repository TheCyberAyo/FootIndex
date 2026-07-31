import { z } from "zod";

/**
 * Env validation with Zod.
 * Decision: public keys are optional at build-time so Vercel/CI can build
 * without secrets; runtime services check `isSupabaseConfigured()`.
 *
 * Empty strings from `.env.example` copies are treated as unset — otherwise
 * `z.string().url().optional()` rejects `""` and crashes the homepage.
 */

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  // Invalid optional URLs (typos / duplicated KEY=) → treat as unset, don't crash UI
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}, z.string().url().optional());

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalNonEmptyString,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalNonEmptyString,
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmptyString,
  API_FOOTBALL_KEY: optionalNonEmptyString,
  API_FOOTBALL_BASE_URL: optionalUrl,
  CRON_SECRET: optionalNonEmptyString,
  OPENAI_API_KEY: optionalNonEmptyString,
  GOOGLE_SITE_VERIFICATION: optionalNonEmptyString,
});

export interface PublicEnv {
  siteUrl: string;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  gaMeasurementId: string | undefined;
}

export interface ServerEnv extends PublicEnv {
  supabaseServiceRoleKey: string | undefined;
  apiFootballKey: string | undefined;
  apiFootballBaseUrl: string;
  cronSecret: string | undefined;
  openAiApiKey: string | undefined;
  googleSiteVerification: string | undefined;
}

function readPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  });

  if (!parsed.success) {
    throw new Error(`Invalid public env: ${parsed.error.message}`);
  }

  return {
    siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    gaMeasurementId: parsed.data.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };
}

export function getPublicEnv(): PublicEnv {
  return readPublicEnv();
}

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
    API_FOOTBALL_BASE_URL: process.env.API_FOOTBALL_BASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  });

  if (!parsed.success) {
    throw new Error(`Invalid server env: ${parsed.error.message}`);
  }

  const publicEnv = readPublicEnv();

  return {
    ...publicEnv,
    supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    apiFootballKey: parsed.data.API_FOOTBALL_KEY,
    apiFootballBaseUrl:
      parsed.data.API_FOOTBALL_BASE_URL ??
      "https://v3.football.api-sports.io",
    cronSecret: parsed.data.CRON_SECRET,
    openAiApiKey: parsed.data.OPENAI_API_KEY,
    googleSiteVerification: parsed.data.GOOGLE_SITE_VERIFICATION,
  };
}

export function isSupabaseConfigured(): boolean {
  const env = getPublicEnv();
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAdminConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.supabaseUrl &&
      env.supabaseAnonKey &&
      env.supabaseServiceRoleKey,
  );
}
