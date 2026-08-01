import Link from "next/link";

import type { AuthMode } from "@/lib/auth/paths";
import { loginPath, signUpPath } from "@/lib/auth/paths";

interface AuthModeSwitchProps {
  mode: AuthMode;
  nextPath: string;
}

export function AuthModeSwitch({ mode, nextPath }: AuthModeSwitchProps) {
  if (mode === "sign-up") {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={loginPath(nextPath)}
          className="font-medium text-brand hover:underline"
        >
          Sign in
        </Link>
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-muted-foreground">
      New to FootIndex?{" "}
      <Link
        href={signUpPath(nextPath)}
        className="font-medium text-brand hover:underline"
      >
        Create an account
      </Link>
    </p>
  );
}
