import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Page not found",
  description: "The page you requested does not exist.",
  path: "/404",
  noIndex: true,
});

export default function NotFoundPage() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
        404
      </p>
      <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
        Offside
      </h1>
      <p className="mt-3 max-w-md text-white/60">
        That page doesn’t exist. Head back to the pitch.
      </p>
      <Button
        asChild
        className="mt-8 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        <Link href="/">Back home</Link>
      </Button>
    </Container>
  );
}
