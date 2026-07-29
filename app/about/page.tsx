import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/seo";
import {
  ABOUT_FAQ,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "About Haaland vs Mbappé — compare Erling Haaland and Kylian Mbappé career achievements for club and country with goals, trophies, and season stats.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "About Haaland vs Mbappé",
            description:
              "About Haaland vs Mbappé — compare Erling Haaland and Kylian Mbappé career achievements for club and country.",
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
        title="About"
        description="A production-ready stats product: clean architecture, Supabase-backed data, and API-Football live feeds."
      />
      <Section
        title="Built for the debate"
        description="Next.js 15, TypeScript, Tailwind, Supabase, and Recharts — with SEO and Core Web Vitals treated as product features."
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
