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

const UPDATED = "31 July 2026";

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
              {SITE_NAME} is an independent football statistics site. We compare
              football players using public statistics and are not affiliated
              with FIFA, UEFA, national leagues, clubs, or individual players.
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
              API-Football (match/season sync on the server), Google Analytics
              (optional usage analytics), and Google AdSense (advertising when
              enabled). Their processing is limited to providing those services.
            </p>
          </ProseSection>

          <ProseSection title="Advertising">
            <p>
              When AdSense is enabled, Google may set cookies and use similar
              technologies to serve and measure ads. Ads may be personalized
              based on your consent choice. You can manage ad personalization
              in{" "}
              <a
                href="https://adssettings.google.com"
                className="text-brand hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Ad Settings
              </a>{" "}
              or opt out of interest-based ads via the{" "}
              <a
                href="https://optout.aboutads.info"
                className="text-brand hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Digital Advertising Alliance
              </a>
              .
            </p>
          </ProseSection>

          <ProseSection title="Cookies">
            <p>
              Essential cookies/storage support Supabase Auth sessions, theme
              preference, search sessions, and first-party analytics. With your
              consent, we also allow advertising and analytics cookies from
              Google (AdSense and Google Analytics). You can change your choice
              anytime by clearing site data or using the cookie banner when it
              appears.
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
