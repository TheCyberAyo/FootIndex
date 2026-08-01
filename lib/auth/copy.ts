import type { AuthMode } from "@/lib/auth/paths";
import { isGoogleAuthEnabled } from "@/lib/env";

export type AuthIntent =
  | "default"
  | "vote"
  | "comment"
  | "predict"
  | "favorite";

export interface AuthPageCopy {
  eyebrow: string;
  title: string;
  description: string;
  formHint: string;
}

export interface AuthDialogCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export function getAuthPageCopy(mode: AuthMode): AuthPageCopy {
  const google = isGoogleAuthEnabled();
  const methods = google ? "email or Google" : "email magic link";

  if (mode === "sign-up") {
    return {
      eyebrow: "Create account",
      title: "Join FootIndex",
      description: `No password needed. Sign in with ${methods} — we create your account on first use.`,
      formHint:
        "By continuing you agree to our terms. We only use your email for sign-in and account features.",
    };
  }

  return {
    eyebrow: "Sign in",
    title: "Welcome back",
    description: `Sign in with ${methods} to vote, comment, save favorites, and submit match predictions.`,
    formHint:
      "First time here? Use the same form — we will create your account automatically.",
  };
}

export function getAuthDialogCopy(intent: AuthIntent): AuthDialogCopy {
  switch (intent) {
    case "vote":
      return {
        eyebrow: "Sign in",
        title: "Vote as yourself",
        description: "One vote per account. You can change your pick later.",
      };
    case "comment":
      return {
        eyebrow: "Sign in",
        title: "Join the conversation",
        description: "Comment on players and head-to-head matchups.",
      };
    case "predict":
      return {
        eyebrow: "Sign in",
        title: "Save your predictions",
        description: "Track picks across fixtures with your account.",
      };
    case "favorite":
      return {
        eyebrow: "Sign in",
        title: "Save to favorites",
        description: "Keep players, teams, and comparisons in one place.",
      };
    default:
      return {
        eyebrow: "Account",
        title: "Sign in to FootIndex",
        description: isGoogleAuthEnabled()
          ? "Magic link or Google — no password required."
          : "We will email you a magic link — no password required.",
      };
  }
}
