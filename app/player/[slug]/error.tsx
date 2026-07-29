"use client";

import { ErrorReset } from "@/components/shared/error-reset";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <ErrorReset error={error} reset={reset} />;
}
