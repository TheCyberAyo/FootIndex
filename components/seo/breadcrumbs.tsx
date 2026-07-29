import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/seo/json-ld";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Visible breadcrumb trail (PROJECT_SPECIFICATION §91).
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("border-b border-white/10 py-4", className)}>
      <Container>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight
                    className="size-3.5 shrink-0 text-white/35"
                    aria-hidden
                  />
                ) : null}
                {isLast ? (
                  <span className="font-medium text-white/90" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
