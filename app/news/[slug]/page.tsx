import { notFound } from "next/navigation";
import { format } from "date-fns";

import { CommentsSection } from "@/components/comments/comments-section";
import { AdPlacement } from "@/components/ads/ad-placement";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import {
  CURATED_NEWS,
  getCuratedNewsBySlug,
} from "@/lib/data/news";
import { createPageMetadata } from "@/lib/seo";
import {
  createBreadcrumbJsonLd,
  createNewsArticleJsonLd,
} from "@/lib/seo/json-ld";

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CURATED_NEWS.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = getCuratedNewsBySlug(slug);
  if (!article) {
    return createPageMetadata({
      title: "Article not found",
      description: "This news article does not exist.",
      path: `/news/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    ogType: "article",
  });
}

export default async function NewsArticlePage({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;
  const article = getCuratedNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          createNewsArticleJsonLd(article),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: article.title, path: `/news/${article.slug}` },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="News"
        title={article.title}
        description={`${format(new Date(article.publishedAt), "d MMMM yyyy")} · ${article.tags.join(" · ")}`}
      />
      <Section>
        <article className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
          {article.body.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </article>
      </Section>
      <Section containerClassName="py-6 sm:py-8">
        <AdPlacement slotKey="news" format="rectangle" minHeight={250} />
      </Section>
      <CommentsSection
        entityType="news"
        entityId={article.id}
        nextPath={`/news/${article.slug}#comments`}
        title="Discussion"
        description="React to the piece — signed-in fans can comment and like."
      />
    </>
  );
}
