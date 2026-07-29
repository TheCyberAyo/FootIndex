import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}

/**
 * Reusable page intro for stub and future feature pages.
 * Server Component by default — no client JS required.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("border-b border-white/10 bg-surface-elevated/60", className)}>
      <Container className="py-14 sm:py-20">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/65 sm:text-lg">
          {description}
        </p>
      </Container>
    </div>
  );
}
