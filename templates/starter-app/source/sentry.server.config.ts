import * as Sentry from "@sentry/nextjs";

import { getServerSentryEnv } from "@/lib/env/server";

const sentryEnv = getServerSentryEnv();

if (sentryEnv) {
  Sentry.init({
    dsn: sentryEnv.NEXT_PUBLIC_SENTRY_DSN,
    environment: sentryEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
