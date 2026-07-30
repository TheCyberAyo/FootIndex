import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import {
  ABOUT_FAQ,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "About",
  description: `About ${SITE_NAME} — ${SITE_DESCRIPTION}`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: `About ${SITE_NAME}`,
            description: SITE_DESCRIPTION,
            path: "/about",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          createFaqJsonLd(ABOUT_FAQ),
        ]}
      />
      <PageHeader
        eyebrow="Project"
        title="About FootIndex"
        description="A football player search engine — profiles, comparisons, rankings, and synced stats with modern UX and SEO."
      />
      <Section
        title="Platform"
        description="Next.js 15, TypeScript, Tailwind, Supabase, and Recharts — built to scale from a featured rivalry to a full player database."
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            "Next.js 15 App Router",
            "Supabase + PostgreSQL + RLS",
            "API-Football sync jobs",
            "Charts, votes, predictions, comments",
          ].map((item) => (
            <GlassCard key={item} className="p-5" as="li" hover>
              <p className="text-sm font-medium text-foreground">{item}</p>
            </GlassCard>
          ))}
        </ul>
      </Section>
      <Section
        title="FAQ"
        description="Straight answers about the product and data."
      >
        <div className="grid gap-4">
          {ABOUT_FAQ.map((item) => (
            <GlassCard key={item.question} className="p-5" as="article">
              <h3 className="font-display text-lg font-bold text-foreground">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-foreground/60">{item.answer}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
    </>
  );
}
