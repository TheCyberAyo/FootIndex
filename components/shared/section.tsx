import type { ReactNode } from "react";

import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * One-job section primitive: optional eyebrow/title/description + content.
 * Keeps page composition consistent and under PROJECT_RULES line limits.
 */
export function Section({
  children,
  className,
  id,
  containerClassName,
  eyebrow,
  title,
  description,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-12 sm:py-16 lg:py-20", className)}>
      <Container className={containerClassName}>
        {(eyebrow || title || description) && (
          <header className="mb-8 max-w-3xl sm:mb-10">
            {eyebrow ? (
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-3 text-base text-white/65 sm:text-lg">
                {description}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
