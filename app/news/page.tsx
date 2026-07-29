import Link from "next/link";
import { format } from "date-fns";

import { JsonLd } from "@/components/seo/json-ld";
import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { listCuratedNews } from "@/lib/data/news";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/json-ld";

export const metadata = createPageMetadata({
  title: "News",
  description:
    "Curated football news and analysis around Erling Haaland and Kylian Mbappé.",
  path: "/news",
});

export default function NewsPage() {
  const articles = listCuratedNews();

  return (
    <>
      <JsonLd
        data={[
          createWebPageJsonLd({
            title: "Latest News",
            description:
              "Curated football news and analysis around Erling Haaland and Kylian Mbappé.",
            path: "/news",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Newsroom"
        title="Latest News"
        description="Curated headlines for the rivalry — no third-party news API in v1."
      />
      <Section>
        <div className="grid gap-4">
          {articles.map((article) => (
            <GlassCard key={article.id} className="p-5 sm:p-6" hover as="article">
              <p className="text-xs tracking-[0.18em] text-foreground/40 uppercase">
                {format(new Date(article.publishedAt), "d MMM yyyy")}
                {article.tags.length > 0 ? ` · ${article.tags.join(" · ")}` : ""}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                <Link
                  href={`/news/${article.slug}`}
                  className="hover:text-brand"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-foreground/60 sm:text-base">
                {article.excerpt}
              </p>
              <Link
                href={`/news/${article.slug}`}
                className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
              >
                Read article
              </Link>
            </GlassCard>
          ))}
        </div>
      </Section>
    </>
  );
}
