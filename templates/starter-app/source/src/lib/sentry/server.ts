"server-only";

import * as Sentry from "@sentry/nextjs";

export function captureServerException(
  error: unknown,
  context?: Record<string, string | number | boolean | null | undefined>,
) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("safe_context", context);
    }

    Sentry.captureException(error);
  });
}
