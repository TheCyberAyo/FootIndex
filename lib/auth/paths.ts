export type AuthMode = "sign-in" | "sign-up";

const DEFAULT_NEXT = "/account";

/** Safe internal redirect target from ?next= query param. */
export function resolveAuthNextPath(next: string | undefined | null): string {
  if (next?.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return DEFAULT_NEXT;
}

export function loginPath(nextPath?: string): string {
  if (!nextPath || nextPath === DEFAULT_NEXT) {
    return "/login";
  }
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function signUpPath(nextPath?: string): string {
  if (!nextPath || nextPath === DEFAULT_NEXT) {
    return "/sign-up";
  }
  return `/sign-up?next=${encodeURIComponent(nextPath)}`;
}

export function authPathForMode(mode: AuthMode, nextPath?: string): string {
  return mode === "sign-up" ? signUpPath(nextPath) : loginPath(nextPath);
}
