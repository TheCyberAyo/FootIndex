import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthBenefits } from "@/components/auth/auth-benefits";
import { AuthModeSwitch } from "@/components/auth/auth-mode-switch";
import { LoginForm } from "@/components/auth/login-form";
import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { getAuthUser } from "@/lib/auth/session";
import { getAuthPageCopy } from "@/lib/auth/copy";
import type { AuthMode } from "@/lib/auth/paths";
import { resolveAuthNextPath } from "@/lib/auth/paths";
import { isSupabaseConfigured } from "@/lib/env";

interface AuthRoutePageProps {
  mode: AuthMode;
  searchParams: Promise<{ error?: string; next?: string }>;
}

function formatAuthError(error: string | undefined): string | null {
  if (!error) {
    return null;
  }

  if (error === "config") {
    return "Authentication is not configured in this environment.";
  }

  return error;
}

export async function AuthRoutePage({ mode, searchParams }: AuthRoutePageProps) {
  const params = await searchParams;
  const nextPath = resolveAuthNextPath(params.next);
  const copy = getAuthPageCopy(mode);
  const errorMessage = formatAuthError(params.error);

  if (isSupabaseConfigured()) {
    const user = await getAuthUser();
    if (user) {
      redirect(nextPath);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <Section>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div className="hidden lg:block">
            <p className="mb-4 text-xs tracking-[0.18em] text-brand uppercase">
              With an account
            </p>
            <AuthBenefits />
          </div>

          <GlassCard className="p-5 sm:p-6">
            {!isSupabaseConfigured() ? (
              <p className="text-sm text-muted-foreground">
                Supabase is not configured. Add your project keys to enable sign
                in.
              </p>
            ) : (
              <div className="grid gap-5">
                <div className="lg:hidden">
                  <p className="text-xs tracking-[0.18em] text-brand uppercase">
                    Free account
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vote, save favorites, comment, and predict — all with one
                    passwordless sign-in.
                  </p>
                </div>

                {errorMessage ? (
                  <p
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                ) : null}

                <LoginForm nextPath={nextPath} />

                <AuthModeSwitch mode={mode} nextPath={nextPath} />

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {copy.formHint}{" "}
                  <Link href="/privacy" className="text-brand hover:underline">
                    Privacy Policy
                  </Link>
                  {" · "}
                  <Link href="/terms" className="text-brand hover:underline">
                    Terms
                  </Link>
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </Section>
    </>
  );
}
