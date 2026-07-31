"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

type PrefetchLinkProps = Omit<ComponentProps<typeof Link>, "prefetch"> & {
  children: ReactNode;
};

/**
 * Prefetches route JS/data on hover/focus (PROJECT_SPEC §104).
 */
export function PrefetchLink({
  href,
  children,
  onMouseEnter,
  onFocus,
  ...props
}: PrefetchLinkProps) {
  const router = useRouter();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";

  function prefetchRoute() {
    if (hrefString) {
      router.prefetch(hrefString);
    }
  }

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(event) => {
        prefetchRoute();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetchRoute();
        onFocus?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
