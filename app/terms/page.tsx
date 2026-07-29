import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { ProseSection } from "@/components/shared/prose-section";
import { Section } from "@/components/shared/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "Terms",
  description: `Terms of use for ${SITE_NAME} — acceptable use, stats disclaimers, and account rules.`,
  path: "/terms",
});

const UPDATED = "25 July 2026";

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Terms of Use",
            description: `Terms of use for ${SITE_NAME}.`,
            path: "/terms",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Terms", path: "/terms" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        description={`Last updated ${UPDATED}. By using ${SITE_NAME}, you agree to these terms.`}
      />
      <Section
        title="Using the site"
        description="Fan debate, stats, and community features — not official competition data."
      >
        <div className="grid gap-4">
          <ProseSection title="The service">
            <p>
              {SITE_NAME} provides football statistics and community features
              comparing Erling Haaland and Kylian Mbappé (career, club, country,
              season views, votes, predictions, and comments). The site is for
              informational and entertainment use.
            </p>
          </ProseSection>

          <ProseSection title="No affiliation">
            <p>
              We are an independent fan product. We are not affiliated with,
              endorsed by, or sponsored by FIFA, UEFA, any league, club, or the
              players named on this site. Club and competition names appear for
              identification only.
            </p>
          </ProseSection>

          <ProseSection title="Stats accuracy">
            <p>
              Career totals and season baselines are curated from public sources
              and may lag live matches. Season form and fixtures sync from
              API-Football where available. Numbers can be incomplete, delayed,
              or wrong. Do not rely on them for gambling, professional scouting,
              or legal decisions.
            </p>
          </ProseSection>

          <ProseSection title="Accounts & acceptable use">
            <p>
              You must provide a valid email (or Google account) if you sign in.
              Do not abuse votes, spam comments, harass others, attempt to break
              the service, or scrape the site in a way that harms availability.
              We may suspend accounts that violate these rules.
            </p>
          </ProseSection>

          <ProseSection title="Your content">
            <p>
              Comments and similar contributions remain yours, but you grant us
              a non-exclusive license to host, display, and moderate them on the
              site. We may remove content that is unlawful, abusive, or spam.
            </p>
          </ProseSection>

          <ProseSection title="Intellectual property">
            <p>
              Site design, branding, and original copy belong to {SITE_NAME}.
              Player names, images, and competition marks belong to their
              respective owners. Third-party data providers retain rights in
              their feeds.
            </p>
          </ProseSection>

          <ProseSection title="Disclaimer & liability">
            <p>
              The service is provided “as is” without warranties of any kind. To
              the fullest extent permitted by law, we are not liable for
              indirect or consequential damages arising from use of the site or
              reliance on statistics.
            </p>
          </ProseSection>

          <ProseSection title="Privacy">
            <p>
              How we handle personal data is described in our{" "}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </ProseSection>

          <ProseSection title="Changes">
            <p>
              We may update these terms. The “Last updated” date will change
              when we do. Continued use after changes constitutes acceptance.
            </p>
          </ProseSection>

          <ProseSection title="Contact">
            <p>
              Questions about these terms:{" "}
              <Link href="/contact" className="text-brand hover:underline">
                Contact
              </Link>
              .
            </p>
          </ProseSection>
        </div>
      </Section>
    </>
  );
}
