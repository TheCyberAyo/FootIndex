import Link from "next/link";
import { redirect } from "next/navigation";

import { GlassCard } from "@/components/shared/glass-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listUserFavorites } from "@/services/favorites/favorites.service";

export const metadata = createPageMetadata({
  title: "Saved favorites",
  description: "Your saved players, teams, and head-to-head comparisons.",
  path: "/favorites",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader
          eyebrow="Account"
          title="Favorites"
          description="Sign in and configure Supabase to save players, teams, and comparisons."
        />
      </>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-up?next=/favorites");
  }

  const favorites = await listUserFavorites(user.id);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Favorites"
        description="Players, teams, and comparisons you saved for quick access."
      />
      <Section>
        {favorites.length === 0 ? (
          <GlassCard className="p-6 text-sm text-muted-foreground">
            Nothing saved yet. Use the Save button on a player profile, team page,
            or comparison.
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden">
            <ul className="divide-y divide-border">
              {favorites.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.entityType}
                    </p>
                    <Link
                      href={item.href}
                      className="font-medium text-foreground hover:text-brand"
                    >
                      {item.label}
                    </Link>
                    {item.meta ? (
                      <p className="text-xs text-muted-foreground">{item.meta}</p>
                    ) : null}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={item.href}>Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}
      </Section>
    </>
  );
}
