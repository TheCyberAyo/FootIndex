import { LoginForm } from "@/components/auth/login-form";
import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign in",
  description:
    "Sign in with email magic link or Google to vote, predict, and comment on FootIndex.",
  path: "/login",
  noIndex: true,
});

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/")
    ? params.next
    : "/compare#vote";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Sign in"
        description="Magic link or Google — required to cast and change your vote."
      />
      <Section>
        <GlassCard className="mx-auto max-w-md p-6">
          {params.error ? (
            <p className="mb-4 text-sm text-red-400">{params.error}</p>
          ) : null}
          <LoginForm nextPath={nextPath} />
        </GlassCard>
      </Section>
    </>
  );
}
