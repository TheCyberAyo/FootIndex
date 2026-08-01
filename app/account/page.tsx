import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountDisplayNameForm } from "@/components/account/account-display-name-form";
import { AccountSignOutButton } from "@/components/account/account-sign-out-button";
import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/lib/auth/session";
import { loginPath } from "@/lib/auth/paths";
import { SITE_CONTACT_EMAIL } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { getAccountProfile } from "@/services/users/account-profile.service";
import { ensureUserProfile } from "@/services/users/ensure-profile";

export const metadata = createPageMetadata({
  title: "Your account",
  description: "Manage your FootIndex account, display name, and saved favorites.",
  path: "/account",
  noIndex: true,
});

export const dynamic = "force-dynamic";

function formatMemberSince(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default async function AccountPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect(loginPath("/account"));
  }

  await ensureUserProfile(user.id, user.email ?? null);
  const profile = await getAccountProfile(user.id);

  const displayName = profile?.displayName ?? user.email?.split("@")[0] ?? "Fan";
  const memberSince = profile?.memberSince
    ? formatMemberSince(profile.memberSince)
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={`Hi, ${displayName}`}
        description="Your FootIndex profile — update how you appear in comments and manage saved items."
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <GlassCard className="p-5 sm:p-6">
            <p className="text-xs tracking-[0.18em] text-brand uppercase">
              Profile
            </p>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {user.email ?? "—"}
                </dd>
              </div>
              {memberSince ? (
                <div>
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {memberSince}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 border-t border-border/60 pt-6">
              <AccountDisplayNameForm initialDisplayName={displayName} />
            </div>
          </GlassCard>

          <div className="grid gap-4">
            <GlassCard className="p-5 sm:p-6">
              <p className="text-xs tracking-[0.18em] text-brand uppercase">
                Saved items
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-foreground">
                {profile?.favoritesCount ?? 0}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Players, teams, and comparisons in your favorites.
              </p>
              <Button asChild variant="brand" className="mt-4 w-full">
                <Link href="/favorites">Open favorites</Link>
              </Button>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <p className="text-xs tracking-[0.18em] text-brand uppercase">
                Session
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign out on this device. Your votes, comments, and saves stay
                linked to your account.
              </p>
              <div className="mt-4">
                <AccountSignOutButton />
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <p className="text-xs tracking-[0.18em] text-brand uppercase">
                Privacy
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                To delete your account or export data, email{" "}
                <a
                  href={`mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent("[FootIndex] Account deletion request")}`}
                  className="text-brand hover:underline"
                >
                  {SITE_CONTACT_EMAIL}
                </a>
                . See our{" "}
                <Link href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </GlassCard>
          </div>
        </div>
      </Section>
    </>
  );
}
