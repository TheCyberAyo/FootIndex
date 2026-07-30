import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
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
    <ErrorState
      variant="notFound"
      message="That page doesn't exist. Head back to the pitch."
      action={
        <Button asChild variant="brand">
          <Link href="/">Back home</Link>
        </Button>
      }
    />
  );
}
