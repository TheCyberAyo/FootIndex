/**
 * Shared service errors — keep UI free of vendor error shapes.
 */

export class ServiceError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code = "SERVICE_ERROR", cause?: unknown) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.cause = cause;
  }
}

export function assertNoError(
  error: { message: string } | null,
  fallbackMessage: string,
): void {
  if (error) {
    throw new ServiceError(error.message || fallbackMessage, "SUPABASE_ERROR", error);
  }
}
