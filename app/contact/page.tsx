import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { ProseSection } from "@/components/shared/prose-section";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "Contact",
  description: `Contact the ${SITE_NAME} team — partnerships, press, privacy requests, and bug reports.`,
  path: "/contact",
});

const TOPICS = [
  {
    title: "Partnerships & press",
    body: "Media, sponsorships, or collaboration ideas.",
    subject: "Partnership / press",
  },
  {
    title: "Bug reports",
    body: "Something broken on compare, sync, votes, or auth.",
    subject: "Bug report",
  },
  {
    title: "Privacy & accounts",
    body: "Data access, correction, or deletion requests.",
    subject: "Privacy request",
  },
] as const;

function mailtoHref(subject: string): string {
  const params = new URLSearchParams({
    subject: `[${SITE_NAME}] ${subject}`,
  });
  return `mailto:${SITE_CONTACT_EMAIL}?${params.toString()}`;
}

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Contact",
            description: `Contact the ${SITE_NAME} team.`,
            path: "/contact",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Support"
        title="Contact"
        description={`Reach the ${SITE_NAME} team by email. We read every message; replies may take a few days.`}
      />
      <Section
        title="Email us"
        description="Pick a topic or write freely. Include URLs and screenshots for bugs when you can."
      >
        <GlassCard className="mb-6 p-5 sm:p-6">
          <p className="text-xs tracking-[0.18em] text-white/45 uppercase">
            Direct email
          </p>
          <p className="mt-2 font-display text-xl font-bold text-white">
            {SITE_CONTACT_EMAIL}
          </p>
          <div className="mt-4">
            <Button
              asChild
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <a href={mailtoHref("General inquiry")}>Open mail app</a>
            </Button>
          </div>
        </GlassCard>

        <ul className="grid gap-4 sm:grid-cols-3">
          {TOPICS.map((topic) => (
            <GlassCard key={topic.title} className="p-5" as="li" hover>
              <h3 className="font-display text-lg font-bold text-white">
                {topic.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">{topic.body}</p>
              <a
                href={mailtoHref(topic.subject)}
                className="mt-4 inline-block text-sm text-brand hover:underline"
              >
                Email about this
              </a>
            </GlassCard>
          ))}
        </ul>

        <div className="mt-8 grid gap-4">
          <ProseSection title="What to include">
            <p>
              Your name, a clear subject, and enough detail to act (page URL,
              browser, steps to reproduce for bugs). For privacy requests, say
              which account email is involved.
            </p>
          </ProseSection>
          <ProseSection title="Also useful">
            <p>
              Read our{" "}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-brand hover:underline">
                Terms of Use
              </Link>{" "}
              first if your question is about data or site rules.
            </p>
          </ProseSection>
        </div>
      </Section>
    </>
  );
}
