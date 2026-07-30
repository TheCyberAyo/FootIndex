import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { FOOTER_NAV, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

/**
 * Server Component footer — static links, no client JS.
 * Matches required footer destinations from the product brief.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-glass-border bg-surface-black">
      <Container className="py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-xl font-extrabold text-white">
              {SITE_NAME}
              <span className="text-brand">.</span>
            </p>
            <p className="mt-3 text-sm text-white/55">{SITE_DESCRIPTION}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/65 transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="my-8 bg-white/10" />

        <p className="text-xs text-white/40">
          © {year} {SITE_NAME}. Stats powered by API-Football. Not affiliated
          with FIFA, UEFA, or any club.
        </p>
      </Container>
    </footer>
  );
}
