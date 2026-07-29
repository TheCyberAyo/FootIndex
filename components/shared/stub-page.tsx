import Link from "next/link";

import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import type { PageStubContent } from "@/types";

interface StubPageProps {
  content: PageStubContent;
  eyebrow?: string;
}

/**
 * Phase 1 placeholder page used until feature phases land.
 * Keeps routes SEO-ready and visually on-brand without fake data.
 */
export function StubPage({ content, eyebrow = "Coming soon" }: StubPageProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={content.title}
        description={content.description}
      />
      <Section
        title="What you’ll get"
        description="This route is wired for metadata, loading, and error states. Feature content lands in later phases."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.highlights.map((item) => (
            <GlassCard key={item} className="p-5" as="li" hover>
              <p className="text-sm font-medium text-white">{item}</p>
            </GlassCard>
          ))}
        </ul>
        <p className="mt-8 text-sm text-white/50">
          Explore the live shell:{" "}
          <Link href="/compare" className="text-brand hover:underline">
            Compare
          </Link>
          {" · "}
          <Link href="/" className="text-brand hover:underline">
            Home
          </Link>
        </p>
      </Section>
    </>
  );
}
