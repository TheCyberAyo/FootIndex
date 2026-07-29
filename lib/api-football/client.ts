import { getServerEnv } from "@/lib/env";
import type {
  ApiFootballEnvelope,
  ApiFootballRateLimitInfo,
} from "@/lib/api-football/types";
import { ServiceError } from "@/services/errors";

export function isApiFootballConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.apiFootballKey);
}

function hasEnvelopeErrors(
  errors: ApiFootballEnvelope<unknown>["errors"],
): boolean {
  if (Array.isArray(errors)) {
    return errors.length > 0;
  }
  return Object.keys(errors).length > 0;
}

function formatEnvelopeErrors(
  errors: ApiFootballEnvelope<unknown>["errors"],
): string {
  if (Array.isArray(errors)) {
    return errors.join("; ");
  }
  return Object.entries(errors)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function parseRateLimit(headers: Headers): ApiFootballRateLimitInfo {
  const read = (name: string) => {
    const raw = headers.get(name);
    if (!raw) {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };

  return {
    dailyRemaining: read("x-ratelimit-requests-remaining"),
    dailyLimit: read("x-ratelimit-requests-limit"),
    minuteRemaining: read("x-ratelimit-remaining"),
    minuteLimit: read("x-ratelimit-limit"),
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface ApiFootballRequestResult<T> {
  data: T;
  rateLimit: ApiFootballRateLimitInfo;
}

/**
 * Typed API-Football HTTP client.
 * Decision: server-only; retries on 429/5xx; never called from React components.
 */
export async function apiFootballFetch<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
  options: { retries?: number } = {},
): Promise<ApiFootballRequestResult<T>> {
  const env = getServerEnv();
  if (!env.apiFootballKey) {
    throw new ServiceError(
      "API_FOOTBALL_KEY is not configured.",
      "API_FOOTBALL_NOT_CONFIGURED",
    );
  }

  const retries = options.retries ?? 2;
  const base = env.apiFootballBaseUrl.replace(/\/$/, "");
  const url = new URL(`${base}/${path.replace(/^\//, "")}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": env.apiFootballKey,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const rateLimit = parseRateLimit(response.headers);

      if (response.status === 429 || response.status >= 500) {
        if (attempt < retries) {
          await sleep(400 * 2 ** attempt);
          continue;
        }
        throw new ServiceError(
          `API-Football HTTP ${response.status}`,
          "API_FOOTBALL_HTTP",
          { status: response.status, rateLimit },
        );
      }

      if (!response.ok) {
        throw new ServiceError(
          `API-Football HTTP ${response.status}`,
          "API_FOOTBALL_HTTP",
          { status: response.status, rateLimit },
        );
      }

      const envelope = (await response.json()) as ApiFootballEnvelope<T>;

      if (hasEnvelopeErrors(envelope.errors)) {
        throw new ServiceError(
          formatEnvelopeErrors(envelope.errors),
          "API_FOOTBALL_ERROR",
          { errors: envelope.errors, rateLimit },
        );
      }

      return { data: envelope.response, rateLimit };
    } catch (error) {
      lastError = error;
      if (error instanceof ServiceError) {
        throw error;
      }
      if (attempt < retries) {
        await sleep(400 * 2 ** attempt);
        continue;
      }
    }
  }

  throw new ServiceError(
    "API-Football request failed after retries.",
    "API_FOOTBALL_NETWORK",
    lastError,
  );
}
