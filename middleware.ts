import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh Supabase auth cookies on matched routes only.
 * Decision: explicit matcher (not catch-all) so metadata routes like
 * `/icon` are never intercepted during prerender.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Skip auth refresh when unset or malformed (e.g. duplicated KEY= in .env).
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return response;
    }
  } catch {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/",
    "/compare",
    "/compare/:path*",
    "/login",
    "/sign-up",
    "/favorites",
    "/search",
    "/player/:path*",
    "/stats",
    "/news",
    "/news/:path*",
    "/predict",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/api-docs",
    "/api/votes",
    "/api/predictions",
    "/api/comments",
    "/api/likes",
    "/auth/callback",
  ],
};
