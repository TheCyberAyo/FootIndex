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
  title: "Privacy",
  description: `Privacy policy for ${SITE_NAME} — how we handle accounts, votes, comments, and football stats.`,
  path: "/privacy",
});

const UPDATED = "25 July 2026";

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Privacy Policy",
            description: `Privacy policy for ${SITE_NAME}.`,
            path: "/privacy",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Privacy", path: "/privacy" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated ${UPDATED}. This policy explains what ${SITE_NAME} collects and how we use it.`}
      />
      <Section
        title="Your data on this site"
        description="We keep collection to what the product needs: accounts, engagement, and football statistics."
      >
        <div className="grid gap-4">
          <ProseSection title="Who we are">
            <p>
              {SITE_NAME} is an independent football statistics site comparing
              {SITE_NAME} compares football players using public statistics. We are not affiliated with FIFA,
              UEFA, Premier League, La Liga, Manchester City, Real Madrid, or
              either player.
            </p>
          </ProseSection>

          <ProseSection title="What we collect">
            <p>
              <strong className="text-white/85">Account data:</strong> If you
              sign in with email magic link or Google, we store your auth
              identity (via Supabase Auth), email, and a display name on your
              profile.
            </p>
            <p>
              <strong className="text-white/85">Engagement data:</strong> Votes
              (one per user), match predictions, comments you post, and likes on
              comments.
            </p>
            <p>
              <strong className="text-white/85">Technical data:</strong> Standard
              server logs and cookies needed for authentication and session
              refresh. We do not sell personal data.
            </p>
          </ProseSection>

          <ProseSection title="How we use it">
            <p>
              To operate the site: show your vote and predictions, display
              comments, keep you signed in, improve reliability, and prevent
              abuse. Football stats come from curated career baselines and
              API-Football sync into our database — not from scraping your
              device.
            </p>
          </ProseSection>

          <ProseSection title="Processors">
            <p>
              We use Supabase (authentication and PostgreSQL), Vercel (hosting),
              and API-Football (match/season sync on the server). Their
              processing is limited to providing those services.
            </p>
          </ProseSection>

          <ProseSection title="Cookies">
            <p>
              Essential cookies/storage support Supabase Auth sessions and theme
              preference. We do not run third-party advertising trackers on v1.
            </p>
          </ProseSection>

          <ProseSection title="Retention & your rights">
            <p>
              Account and engagement data persist while your account exists. You
              may request deletion or correction by contacting us via the{" "}
              <Link href="/contact" className="text-brand hover:underline">
                Contact
              </Link>{" "}
              page. Depending on your region, you may have rights to access,
              rectify, or erase personal data.
            </p>
          </ProseSection>

          <ProseSection title="Children">
            <p>
              The site is not directed at children under 13. Do not create an
              account if you are under the age required in your jurisdiction.
            </p>
          </ProseSection>

          <ProseSection title="Changes">
            <p>
              We may update this policy as the product evolves. The “Last
              updated” date at the top will change when we do. Continued use
              after changes means you accept the revised policy.
            </p>
          </ProseSection>
        </div>
      </Section>
    </>
  );
}
